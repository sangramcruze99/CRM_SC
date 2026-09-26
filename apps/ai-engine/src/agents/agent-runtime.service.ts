import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PromptsService } from '../prompts/prompts.service';
import { AgentToolRegistryService } from './agent-tool-registry.service';
import { AgentMemoryService } from './agent-memory.service';
import { AgentExecutionContext } from '@repo/core-types';

export interface RunAgentOptions {
  agentId: string;
  tenantId: string;
  inputPrompt: string;
  targetEntity?: string;
  targetId?: string;
  workflowExecutionId?: string;
  allowAutonomousTools?: boolean;
  workspaceId?: string;
  executionContext?: AgentExecutionContext;
}

export interface AgentStepTrace {
  step: number;
  thought: string;
  action?: { tool: string; params: any };
  observation?: any;
}

@Injectable()
export class AgentRuntimeService {
  private readonly logger = new Logger(AgentRuntimeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly promptsService: PromptsService,
    private readonly toolRegistry: AgentToolRegistryService,
    private readonly memoryService: AgentMemoryService,
  ) {}

  async runAgent(options: RunAgentOptions) {
    const { agentId, tenantId, inputPrompt, workflowExecutionId } = options;
    const startTime = Date.now();

    this.logger.log(`[Agent Runtime] Initializing ReAct reasoning run for Agent ${agentId} on Tenant ${tenantId}`);

    // 1. Resolve Agent definition
    let agent = await this.prisma.agent.findFirst({
      where: { id: agentId, tenantId },
    });

    if (!agent) {
      // Find or create default enterprise agent
      agent = await this.prisma.agent.findFirst({ where: { tenantId } });
      if (!agent) {
        agent = await this.prisma.agent.create({
          data: {
            id: agentId,
            tenantId,
            name: 'Ares Autonomous Sales Sentinel',
            role: 'Enterprise Account Executive & Pipeline Closer',
            domain: 'Sales & Growth',
            model: 'groq/compound',
            systemPrompt: `You are Ares, the autonomous AI Sales Sentinel for Business OS.
You research prospects, qualify ICP fit, identify pain points, and draft multi-channel outreach.
Use your tools to query CRM contacts, check deals, and log activities.`,
            autonomyMode: 'HYBRID',
            allowedTools: JSON.stringify(['search_crm_contacts', 'create_crm_deal', 'book_calendar', 'add_crm_activity']),
          },
        });
      }
    }

    // 2. Build Context from Live CRM and Memories
    const allowedToolsList: string[] = agent.allowedTools ? JSON.parse(agent.allowedTools) : [];
    const memories = await this.memoryService.getMemories(tenantId, agent.id);
    const memoryContext = memories.map((m) => `- [${m.memoryType}] ${m.key}: ${m.value}`).join('\n');

    // 3. ReAct Reasoning Loop
    const traces: AgentStepTrace[] = [];
    let currentInput = inputPrompt;
    let finalResponse = '';
    let totalTokens = 0;
    let iteration = 0;
    const maxIterations = Math.min(agent.maxIterations || 8, 5);

    while (iteration < maxIterations) {
      iteration++;
      this.logger.log(`[Agent ${agent.name}] Loop iteration ${iteration}/${maxIterations}`);

      // Compose tools description using workspace context if available
      let toolDescriptions = '';
      if (options.executionContext) {
        toolDescriptions = options.executionContext.availableTools
          .map((t) => `- ${t.name}: ${t.description} (Risk: ${t.riskLevel}, Status: ${t.status}${t.requiresApproval ? ', REQUIRES APPROVAL' : ''})`)
          .join('\n');
      } else {
        toolDescriptions = this.toolRegistry
          .getTools()
          .filter((t) => allowedToolsList.length === 0 || allowedToolsList.includes(t.name))
          .map((t) => `- ${t.name}: ${t.description} (Risk: ${t.riskLevel})`)
          .join('\n');
      }

      // Compose dynamic workspace context preamble if present
      let contextPreamble = '';
      if (options.executionContext) {
        const ctx = options.executionContext;
        const enabledNames = ctx.enabledServices.join(', ');
        const disabledNames = ctx.disabledServices.slice(0, 10).join(', ');
        contextPreamble = `Operating Environment:
Workspace: ${ctx.workspace.name} (Industry: ${ctx.industry}, Business Type: ${ctx.businessType}, Config Version: v${ctx.configurationVersion})
Active Terminology:
- Customer is strictly called: "${ctx.terminology.customer?.displayTerm || 'Customer'}"
- Opportunities are called: "${ctx.terminology.deal?.displayTerm || 'Deal'}"
- Invoices are called: "${ctx.terminology.invoice?.displayTerm || 'Invoice'}"

Enabled Capabilities: ${enabledNames}
Disabled Services: ${disabledNames}

CRITICAL SERVICE REFUSAL DIRECTIVE:
If the user asks for a capability belonging to a DISABLED service, you MUST NOT hallucinate or pretend to execute it.
Directly and politely answer:
"<Service Name> is not enabled for this workspace."

Authoritative Business Rules (NEVER OVERRIDE):
${ctx.businessRules.map((r) => `- ${r.name}: ${r.description}`).join('\n') || 'None'}
`;
      }

      const reasoningPrompt = `${contextPreamble}Task: ${currentInput}

Available Tools:
${toolDescriptions}

Past Memories & Facts:
${memoryContext || 'No past memories logged.'}

Instructions:
Respond using ReAct format:
Thought: <what I need to do>
Action: <tool_name> | <json_params>
OR
Final Answer: <your comprehensive answer>`;

      // Invoke LLM via PromptsService — always 'auto' so Ollama Gemma is tried first;
      // API keys activate only as failsafe if Ollama is unreachable.
      const aiResponse = await this.promptsService.askAI(
        tenantId,
        reasoningPrompt,
        undefined,
        'auto',
        agent.model,
      );

      const reply = aiResponse.reply || '';
      totalTokens += ((aiResponse as any).usage?.total_tokens || 200);

      // Parse Thought & Action
      const thoughtMatch = reply.match(/Thought:\s*(.*?)(?=\nAction:|\nFinal Answer:|$)/s);
      const thought = thoughtMatch ? thoughtMatch[1].trim() : reply.substring(0, 150);

      const actionMatch = reply.match(/Action:\s*([a-zA-Z0-9_]+)\s*\|\s*(\{.*?\})/s);
      const finalMatch = reply.match(/Final Answer:\s*(.*)/s);

      if (finalMatch || !actionMatch) {
        finalResponse = finalMatch ? finalMatch[1].trim() : reply;
        traces.push({
          step: iteration,
          thought,
          observation: 'Reached final answer or task resolution.',
        });
        break;
      }

      // Action selected by LLM
      const toolName = actionMatch[1].trim();
      let toolParams: any = {};
      try {
        toolParams = JSON.parse(actionMatch[2].trim());
      } catch {
        toolParams = {};
      }

      this.logger.log(`[Agent Action] Tool: ${toolName} with params: ${JSON.stringify(toolParams)}`);

      // Check risk & tool existence & execute with workspace context gating
      let observation: any = null;
      try {
        const toolResult = await this.toolRegistry.executeTool(tenantId, toolName, toolParams, options.executionContext);
        observation = toolResult.output || (toolResult as any).error;
      } catch (err: any) {
        observation = `Execution rejected: ${err.message}`;
      }

      traces.push({
        step: iteration,
        thought,
        action: { tool: toolName, params: toolParams },
        observation,
      });

      // Update current prompt with observation for next loop iteration
      currentInput = `${inputPrompt}\n\nObservation from previous action (${toolName}): ${JSON.stringify(observation)}`;
    }

    if (!finalResponse) {
      finalResponse = `Agent ${agent.name} executed ${traces.length} steps and concluded operations for: "${inputPrompt}".`;
    }

    const latencyMs = Date.now() - startTime;

    // 4. Record to Prisma AgentExecution with configuration audit
    const execution = await this.prisma.agentExecution.create({
      data: {
        tenantId,
        agentId: agent.id,
        workflowExecutionId,
        triggerEvent: 'USER_PROMPT_OR_WORKFLOW',
        status: 'SUCCESS',
        outcomeCode: 'COMPLETED',
        outcomeSummary: finalResponse.substring(0, 200),
        resultData: JSON.stringify({
          configurationVersion: options.executionContext?.configurationVersion || 1,
          workspaceId: options.executionContext?.workspace.id || options.workspaceId || 'default',
          industry: options.executionContext?.industry || 'GLOBAL',
          businessType: options.executionContext?.businessType || 'standard',
        }),
        inputPrompt,
        reasoningLog: JSON.stringify(traces),
        toolCalls: JSON.stringify(traces.filter((t) => t.action).map((t) => t.action)),
        finalResponse,
        tokensUsed: totalTokens,
        latencyMs,
      },
    });

    return {
      executionId: execution.id,
      agentId: agent.id,
      agentName: agent.name,
      finalResponse,
      stepsCount: traces.length,
      traces,
      tokensUsed: totalTokens,
      latencyMs,
      configurationVersion: options.executionContext?.configurationVersion || 1,
      workspaceId: options.executionContext?.workspace.id || options.workspaceId || 'default',
      industry: options.executionContext?.industry || 'GLOBAL',
      businessType: options.executionContext?.businessType || 'standard',
    };
  }
}
