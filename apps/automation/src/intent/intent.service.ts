// apps/automation/src/intent/intent.service.ts
// Intent Orchestration Service: Coordinates parsing, compiling, simulating, and saving

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DOMAIN_PACKS, DomainPack } from './domain-packs';
import { IntentParserService, StructuredIntent } from './intent-parser.service';
import { IntentCompilerService, CompiledWorkflow } from './intent-compiler.service';
import { IntentSimulatorService, SimulationResult } from './intent-simulator.service';

@Injectable()
export class IntentService {
  private readonly logger = new Logger(IntentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: IntentParserService,
    private readonly compiler: IntentCompilerService,
    private readonly simulator: IntentSimulatorService,
  ) {}

  /**
   * Return all domain configuration packs
   */
  getDomains(): DomainPack[] {
    return Object.values(DOMAIN_PACKS);
  }

  /**
   * Return specific domain configuration pack
   */
  getDomain(id: string): DomainPack | null {
    return DOMAIN_PACKS[id] || null;
  }

  /**
   * Parse natural language requirement into StructuredIntent
   */
  async parse(prompt: string, domain?: string): Promise<StructuredIntent> {
    return this.parser.parseIntent(prompt, domain);
  }

  /**
   * Compile StructuredIntent into universal workflow definition
   */
  compile(intent: StructuredIntent): CompiledWorkflow {
    return this.compiler.compile(intent);
  }

  /**
   * Simulate StructuredIntent execution against mock data
   */
  async simulate(intent: StructuredIntent, mockInput: Record<string, any>): Promise<SimulationResult> {
    return this.simulator.simulate(intent, mockInput);
  }

  /**
   * Validate StructuredIntent with human-readable health check
   */
  validate(intent: StructuredIntent): {
    healthy: boolean;
    status: 'READY' | 'NEEDS_SETUP' | 'HAS_WARNINGS' | 'ERROR';
    summary: string;
    checks: { name: string; passed: boolean; message: string }[];
  } {
    const checks: { name: string; passed: boolean; message: string }[] = [];

    const hasGoal = Boolean(intent.goal && intent.goal.length > 5);
    checks.push({
      name: 'Business Goal',
      passed: hasGoal,
      message: hasGoal ? 'Clear automation outcome defined' : 'Please provide a clear outcome description',
    });

    const hasActions = Boolean(intent.actions && intent.actions.length > 0);
    checks.push({
      name: 'Configured Actions',
      passed: hasActions,
      message: hasActions
        ? `${intent.actions.length} action(s) defined`
        : 'At least one action step must be configured',
    });

    const hasDestination = Boolean(intent.resultDestination?.name);
    checks.push({
      name: 'Result Destination',
      passed: hasDestination,
      message: hasDestination
        ? `Results will be delivered to: ${intent.resultDestination.name}`
        : 'Please specify where results should be delivered',
    });

    const hasApprovals = !intent.approvalPolicy?.required || Boolean(intent.approvalPolicy?.reviewerRole);
    checks.push({
      name: 'Human Reviewer Policy',
      passed: hasApprovals,
      message: hasApprovals
        ? intent.approvalPolicy?.required
          ? `Review assigned to: ${intent.approvalPolicy.reviewerRole}`
          : 'Runs autonomously without blocking approvals'
        : 'Please assign a reviewer role for human approval steps',
    });

    const allPassed = checks.every((c) => c.passed);
    const hasWarnings = checks.some((c) => !c.passed);

    return {
      healthy: allPassed,
      status: allPassed ? 'READY' : hasWarnings ? 'HAS_WARNINGS' : 'NEEDS_SETUP',
      summary: allPassed
        ? 'Automation is verified and ready for activation.'
        : 'Please review configuration checks before activating.',
      checks,
    };
  }

  /**
   * Save compiled workflow into the database
   */
  async saveCompiledWorkflow(tenantId: string, compiled: CompiledWorkflow, userId?: string): Promise<any> {
    this.logger.log(`[IntentService] Persisting compiled workflow "${compiled.name}" for tenant ${tenantId}`);

    return this.prisma.workflow.upsert({
      where: { id: compiled.id },
      create: {
        id: compiled.id,
        tenantId,
        name: compiled.name,
        description: compiled.description,
        status: compiled.status,
        version: compiled.version,
        triggerType: compiled.triggerType,
        nodes: JSON.stringify(compiled.nodes),
        edges: JSON.stringify(compiled.edges),
      },
      update: {
        name: compiled.name,
        description: compiled.description,
        triggerType: compiled.triggerType,
        nodes: JSON.stringify(compiled.nodes),
        edges: JSON.stringify(compiled.edges),
        version: { increment: 1 },
      },
    });
  }
}
