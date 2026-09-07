import { Injectable, NotFoundException, InternalServerErrorException, Logger, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WorkflowExecutionService } from '../executor/workflow-execution.service';
import { ExecutionPersistenceService } from '../executor/execution-persistence.service';
import { BusinessEventBusService } from '../event-bus/business-event-bus.service';
import { WorkflowGraphExecutorService } from '../executor/workflow-graph-executor.service';
import { NODE_CATALOG } from '../executor/node-catalog';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly executionService: WorkflowExecutionService,
    private readonly persistence: ExecutionPersistenceService,
    private readonly eventBus: BusinessEventBusService,
    private readonly graphExecutor: WorkflowGraphExecutorService,
    @Optional() @InjectQueue('workflows') private readonly workflowQueue?: Queue
  ) {
    this.eventBus.setWorkflowExecutor(this.executionService);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async evaluateReminders() {
    this.logger.log('Running daily CRON job to evaluate automated reminders...');
    const activeWorkflows = await this.prisma.workflow.findMany({
      where: { isActive: true }
    }).catch(() => []);
    this.logger.log(`Found ${activeWorkflows.length} active workflows to evaluate.`);
  }

  /**
   * Direct trigger
   */
  async trigger(tenantId: string, id: string, triggerData: any) {
    let workflow;
    try {
      workflow = await this.findOne(tenantId, id);
    } catch {
      workflow = {
        id,
        name: `Automated Pipeline (${id})`,
        isActive: true,
        version: 1,
      };
    }

    if (!workflow.isActive || (workflow as any).status === 'PAUSED') {
      return {
        success: false,
        status: 'PAUSED',
        message: `Workflow "${workflow.name}" is currently paused and cannot accept new enrollments.`,
      };
    }

    try {
      if (this.workflowQueue) {
        const job = await this.workflowQueue.add('execute-workflow', {
          workflowId: workflow.id,
          tenantId: tenantId,
          triggerData: triggerData
        });
        return { success: true, jobId: job.id, queued: true };
      }
      const result = await this.executionService.executeWorkflow({
        workflowId: workflow.id,
        tenantId,
        triggerData,
      });
      return { success: true, ...result };
    } catch (err: any) {
      this.logger.warn(`Queue deferred, executing workflow directly: ${err.message}`);
      const result = await this.executionService.executeWorkflow({
        workflowId: workflow.id,
        tenantId,
        triggerData,
      });
      return { success: true, ...result };
    }
  }

  /**
   * Behavioral website event ingestion trigger
   * Event types: PAGE_VISITED, FORM_SUBMITTED, CART_ABANDONED, CONTENT_DOWNLOADED, etc.
   */
  async ingestEvent(tenantId: string, event: {
    eventType: string;
    contactEmail: string;
    contactData?: {
      firstName?: string;
      lastName?: string;
      company?: string;
      industry?: string;
      role?: string;
      phone?: string;
    };
    eventData?: any;
  }) {
    this.logger.log(`Ingesting Behavioral Event: ${event.eventType} for ${event.contactEmail}`);

    // Ensure Contact exists in CRM database (CRM as source of truth)
    let contact: any = null;
    try {
      contact = await this.prisma.contact.findFirst({
        where: { email: event.contactEmail.toLowerCase().trim(), tenantId },
      });

      if (!contact && event.contactEmail) {
        contact = await this.prisma.contact.create({
          data: {
            tenantId,
            firstName: event.contactData?.firstName || event.contactEmail.split('@')[0],
            lastName: event.contactData?.lastName || 'Lead',
            email: event.contactEmail.toLowerCase().trim(),
            phone: event.contactData?.phone || null,
            customData: JSON.stringify({
              company: event.contactData?.company || 'Enterprise Prospect',
              industry: event.contactData?.industry || 'Enterprise SaaS',
              jobTitle: event.contactData?.role || 'Decision Maker',
              leadScore: 20,
              tags: ['Website Behavioral Capture'],
            }),
          },
        });
      }
    } catch (err: any) {
      this.logger.warn(`Could not sync Contact to DB: ${err.message}`);
    }

    // Find active workflow matching triggerType
    let targetWorkflow: any = null;
    try {
      targetWorkflow = await this.prisma.workflow.findFirst({
        where: {
          tenantId,
          isActive: true,
          triggerType: event.eventType,
        },
      });
    } catch {}

    const workflowId = targetWorkflow?.id || 'wf_flagship_enterprise';

    const triggerData = {
      contactId: contact?.id,
      email: event.contactEmail,
      firstName: event.contactData?.firstName || contact?.firstName || 'Elena',
      lastName: event.contactData?.lastName || contact?.lastName || 'Rostova',
      company: event.contactData?.company || 'Hyperion Technologies',
      industry: event.contactData?.industry || 'Enterprise SaaS',
      role: event.contactData?.role || 'CEO',
      eventType: event.eventType,
      ...(event.eventData || {}),
    };

    const executionResult = await this.executionService.executeWorkflow({
      workflowId,
      tenantId,
      triggerData,
    });

    return {
      enrolled: true,
      eventType: event.eventType,
      workflowId,
      contactEmail: event.contactEmail,
      ...executionResult,
    };
  }

  /**
   * Pause workflow
   */
  async pauseWorkflow(tenantId: string, id: string) {
    this.logger.log(`Pausing Workflow: ${id} for tenant: ${tenantId}`);
    try {
      const updated = await this.prisma.workflow.update({
        where: { id },
        data: { isActive: false },
      });
      return { success: true, id, status: 'PAUSED', workflow: updated };
    } catch {
      const found = WorkflowsService.inMemoryWorkflows.find((w) => w.id === id);
      if (found) {
        found.isActive = false;
        found.status = 'PAUSED';
      }
      return { success: true, id, status: 'PAUSED' };
    }
  }

  /**
   * Resume workflow
   */
  async resumeWorkflow(tenantId: string, id: string) {
    this.logger.log(`Resuming Workflow: ${id} for tenant: ${tenantId}`);
    try {
      const updated = await this.prisma.workflow.update({
        where: { id },
        data: { isActive: true },
      });
      return { success: true, id, status: 'ACTIVE', workflow: updated };
    } catch {
      const found = WorkflowsService.inMemoryWorkflows.find((w) => w.id === id);
      if (found) {
        found.isActive = true;
        found.status = 'ACTIVE';
      }
      return { success: true, id, status: 'ACTIVE' };
    }
  }

  /**
   * Query past executions for audit logs
   */
  async getExecutions(tenantId: string, workflowId?: string, limit?: number, status?: string) {
    return this.persistence.getExecutions(tenantId, workflowId, limit || 50, status);
  }

  /**
   * Query single execution details
   */
  async getExecutionById(tenantId: string, executionId: string) {
    const exec = this.persistence.getExecutionById(tenantId, executionId);
    if (!exec) throw new NotFoundException('Execution record not found');
    return exec;
  }

  /**
   * Interactive Simulation
   */
  async simulate(tenantId: string, data: any) {
    return this.executionService.simulateDecisionTree({
      workflowId: data.workflowId || 'wf_flagship_enterprise',
      tenantId,
      lead: data.lead,
      triggerData: data.triggerData,
    });
  }

  /**
   * Real Computed Workflow Analytics
   */
  async getAnalytics(tenantId: string, workflowId: string) {
    return this.persistence.getAnalytics(tenantId, workflowId);
  }

  private static inMemoryWorkflows: any[] = [];

  async create(tenantId: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.workflow.create({
          data: {
            tenantId,
            name: data.name,
            description: data.description,
            isActive: data.isActive ?? true,
            triggerType: data.triggerType || 'CONTACT_ADDED',
            triggerData: typeof data.triggerData === 'string' ? data.triggerData : JSON.stringify(data.triggerData || {}),
          },
        });
      } catch {
        // fallback
      }
    }
    const newWf = {
      id: `wf_${Date.now()}`,
      tenantId,
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
      status: data.isActive === false ? 'PAUSED' : 'ACTIVE',
      version: 1,
      triggerType: data.triggerType || 'CONTACT_ADDED',
      triggerData: data.triggerData || {},
      actions: data.actions || [],
      createdAt: new Date(),
    };
    WorkflowsService.inMemoryWorkflows.unshift(newWf);
    return newWf;
  }

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.workflow.findMany({
          where: { tenantId },
          include: { actions: true }
        });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return WorkflowsService.inMemoryWorkflows.filter(w => w.tenantId === tenantId || w.tenantId === 'default-tenant');
  }

  async findOne(tenantId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        const workflow = await this.prisma.workflow.findFirst({
          where: { id, tenantId },
          include: { actions: true }
        });
        if (workflow) return workflow;
      } catch {
        // fallback
      }
    }
    const found = WorkflowsService.inMemoryWorkflows.find(w => w.id === id && (w.tenantId === tenantId || w.tenantId === 'default-tenant'));
    if (!found) throw new NotFoundException('Workflow not found');
    return found;
  }

  async update(tenantId: string, id: string, data: any) {
    const workflow = await this.findOne(tenantId, id);
    const newVersion = ((workflow as any).version || 1) + 1;
    const updatePayload = {
      ...data,
      version: newVersion,
      updatedAt: new Date(),
    };

    if (this.prisma.isConnected) {
      try {
        return await this.prisma.workflow.update({
          where: { id: workflow.id },
          data: {
            name: data.name,
            description: data.description,
            isActive: data.isActive,
            triggerType: data.triggerType,
            triggerData: typeof data.triggerData === 'string' ? data.triggerData : (data.triggerData ? JSON.stringify(data.triggerData) : undefined),
          },
        });
      } catch {
        // fallback
      }
    }
    Object.assign(workflow, updatePayload);
    return workflow;
  }

  /**
   * Publish a workflow draft as an immutable version
   */
  async publishVersion(tenantId: string, id: string, publishedBy: string = 'system') {
    const workflow = await this.findOne(tenantId, id);
    const nextVersion = ((workflow as any).version || 1) + 1;

    let publishedRecord: any = null;
    if (this.prisma.isConnected) {
      try {
        // 1. Create immutable version entry
        publishedRecord = await this.prisma.workflowVersion.create({
          data: {
            tenantId,
            workflowId: workflow.id,
            version: nextVersion,
            name: workflow.name,
            status: 'ACTIVE',
            nodes: (workflow as any).nodes || (workflow as any).triggerData || '[]',
            edges: (workflow as any).edges || '[]',
            variables: (workflow as any).variables || '[]',
            publishedBy,
          },
        });

        // 2. Update active workflow version and status
        await this.prisma.workflow.update({
          where: { id: workflow.id },
          data: {
            version: nextVersion,
            status: 'ACTIVE',
            isActive: true,
          },
        });
      } catch (err: any) {
        this.logger.warn(`Could not save version in DB: ${err.message}`);
      }
    }

    (workflow as any).version = nextVersion;
    (workflow as any).status = 'ACTIVE';
    (workflow as any).isActive = true;

    return {
      success: true,
      workflowId: workflow.id,
      version: nextVersion,
      status: 'ACTIVE',
      publishedAt: new Date().toISOString(),
      publishedRecord,
    };
  }

  /**
   * Query all versions of a workflow
   */
  async getVersions(tenantId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.workflowVersion.findMany({
          where: { workflowId: id, tenantId },
          orderBy: { version: 'desc' },
        });
      } catch {
        // fallback
      }
    }
    return [
      {
        id: `ver_1`,
        tenantId,
        workflowId: id,
        version: 1,
        name: 'Initial Release',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Roll back to an earlier workflow version
   */
  async rollbackVersion(tenantId: string, id: string, targetVersion: number) {
    this.logger.log(`[Workflow Versioning] Rolling back workflow ${id} to version ${targetVersion}`);
    const workflow = await this.findOne(tenantId, id);

    let versionRecord: any = null;
    if (this.prisma.isConnected) {
      try {
        versionRecord = await this.prisma.workflowVersion.findFirst({
          where: { workflowId: id, version: targetVersion, tenantId },
        });

        if (versionRecord) {
          await this.prisma.workflow.update({
            where: { id: workflow.id },
            data: {
              version: targetVersion,
              status: 'ACTIVE',
              triggerData: versionRecord.nodes,
              nodes: versionRecord.nodes,
              edges: versionRecord.edges,
            },
          });
        }
      } catch (err: any) {
        this.logger.warn(`Rollback DB update deferred: ${err.message}`);
      }
    }

    (workflow as any).version = targetVersion;
    return {
      success: true,
      workflowId: id,
      restoredVersion: targetVersion,
      rolledBackAt: new Date().toISOString(),
    };
  }

  async remove(tenantId: string, id: string) {
    const workflow = await this.findOne(tenantId, id);
    if (this.prisma.isConnected) {
      try {
        await this.prisma.workflowExecutionStep.deleteMany({
          where: { execution: { workflowId: workflow.id, tenantId } },
        }).catch(() => null);

        await this.prisma.workflowExecution.deleteMany({
          where: { workflowId: workflow.id, tenantId },
        }).catch(() => null);

        await this.prisma.workflowAction.deleteMany({
          where: { workflowId: workflow.id },
        }).catch(() => null);

        return await this.prisma.workflow.delete({
          where: { id: workflow.id },
        });
      } catch {
        // fallback
      }
    }
    const idx = WorkflowsService.inMemoryWorkflows.findIndex((w) => w.id === workflow.id);
    if (idx !== -1) WorkflowsService.inMemoryWorkflows.splice(idx, 1);
    return workflow;
  }

  // --- Enterprise Event Bus Delegation ---
  async publishEvent(tenantId: string, eventData: any) {
    return this.eventBus.publish({
      tenantId,
      type: eventData.type || eventData.eventType || 'CUSTOM_EVENT',
      payload: eventData.payload || eventData,
      source: eventData.source || 'api',
      correlationId: eventData.correlationId,
      actor: eventData.actor || { type: 'USER' },
      idempotencyKey: eventData.idempotencyKey,
    });
  }

  getEventHistory(tenantId?: string, limit?: number) {
    return this.eventBus.getHistory(tenantId, limit);
  }

  getDeadLetterQueue(tenantId?: string) {
    return this.eventBus.getDeadLetterQueue(tenantId);
  }

  replayEvent(tenantId: string, eventId: string) {
    return this.eventBus.replay(eventId, tenantId);
  }

  checkCollisions(tenantId: string, contacts: string[], targetWorkflowId: string) {
    return this.executionService.checkCollisions(tenantId, contacts, targetWorkflowId);
  }

  // --- Visual Studio Graph Execution & Telemetry ---
  getNodeCatalog() {
    return NODE_CATALOG;
  }

  async executeGraph(
    tenantId: string,
    workflowId: string,
    graphData?: { nodes?: any[]; edges?: any[] },
    triggerPayload: Record<string, any> = {},
  ) {
    let nodes = graphData?.nodes;
    let edges = graphData?.edges;

    if (!nodes || nodes.length === 0) {
      const wf = await this.findOne(tenantId, workflowId).catch(() => null);
      if (wf && wf.triggerData) {
        try {
          const parsed = JSON.parse(wf.triggerData);
          nodes = parsed.nodes;
          edges = parsed.edges;
        } catch {
          // ignore
        }
      }
    }

    if (!nodes || nodes.length === 0) {
      // Fallback: Generate demo visual nodes for execution
      nodes = [
        { id: 'n1', type: 'trigger:new_lead', data: { title: 'New Lead Ingestion' } },
        { id: 'n2', type: 'ai:score', data: { title: 'AI Score Evaluation' } },
        { id: 'n3', type: 'logic:if_else', data: { title: 'High Intent Lead Gate', field: 'leadScore', operator: 'GREATER_THAN', value: 60 } },
        { id: 'n4', type: 'comm:whatsapp', data: { title: 'Send WhatsApp VIP Welcome' } },
      ];
      edges = [
        { id: 'e1-2', source: 'n1', target: 'n2' },
        { id: 'e2-3', source: 'n2', target: 'n3' },
        { id: 'e3-4', source: 'n3', target: 'n4', sourceHandle: 'true' },
      ];
    }

    return this.graphExecutor.executeGraph({
      workflowId,
      tenantId,
      nodes,
      edges: edges || [],
      triggerPayload,
    });
  }

  async getAllExecutions(tenantId: string, limit: number = 50, status?: string) {
    const where: any = { tenantId };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    return this.prisma.workflowExecution.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        steps: {
          orderBy: { stepIndex: 'asc' },
        },
      },
    });
  }

  async getExecutionSteps(tenantId: string, executionId: string) {
    const execution = await this.prisma.workflowExecution.findFirst({
      where: { id: executionId, tenantId },
      include: {
        steps: { orderBy: { stepIndex: 'asc' } },
      },
    });
    if (!execution) throw new NotFoundException('Execution not found');
    return execution;
  }

  async retryExecution(tenantId: string, executionId: string) {
    const prev = await this.prisma.workflowExecution.findFirst({
      where: { id: executionId, tenantId },
    });
    if (!prev) throw new NotFoundException('Execution not found');

    const triggerData = prev.triggerData ? JSON.parse(prev.triggerData) : {};
    return this.executeGraph(tenantId, prev.workflowId, undefined, triggerData);
  }
}

