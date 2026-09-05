import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PromptsService } from '../prompts/prompts.service';
import { AgentToolRegistryService } from './agent-tool-registry.service';
import { AgentMemoryService } from './agent-memory.service';

export interface RunAgentOptions {
  agentId: string;
  tenantId: string;
  inputPrompt: string;
  targetEntity?: string;
  targetId?: string;
  workflowExecutionId?: string;
  allowAutonomousTools?: boolean;
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

      // Compose agent prompt with tools & memories
      const toolDescriptions = this.toolRegistry
        .getTools()
        .filter((t) => allowedToolsList.length === 0 || allowedToolsList.includes(t.name))
        .map((t) => `- ${t.name}: ${t.description} (Risk: ${t.riskLevel})`)
        .join('\n');

      const reasoningPrompt = `Task: ${currentInput}

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

      // Invoke LLM via PromptsService
      const aiResponse = await this.promptsService.askAI(
        tenantId,
        reasoningPrompt,
        undefined,
        agent.model?.includes('groq') ? 'groq' : 'openrouter',
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

      // Check risk & tool existence
      const toolDef = this.toolRegistry.getTool(toolName);
      let observation: any = null;

      if (!toolDef) {
        observation = `Tool "${toolName}" is not available in registry.`;
      } else {
        // Execute tool
        const toolResult = await this.toolRegistry.executeTool(tenantId, toolName, toolParams);
        observation = toolResult.output || toolResult.error;
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

    // 4. Record to Prisma AgentExecution
    const execution = await this.prisma.agentExecution.create({
      data: {
        tenantId,
        agentId: agent.id,
        workflowExecutionId,
        triggerEvent: 'USER_PROMPT_OR_WORKFLOW',
        status: 'SUCCESS',
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
    };
  }
}
