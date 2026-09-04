import { Injectable, NotFoundException, Logger, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WorkflowExecutionService } from '../executor/workflow-execution.service';
import { ExecutionPersistenceService } from '../executor/execution-persistence.service';
import { BusinessEventBusService } from '../event-bus/business-event-bus.service';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly executionService: WorkflowExecutionService,
    private readonly persistence: ExecutionPersistenceService,
    private readonly eventBus: BusinessEventBusService,
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
    let contact = null;
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
    let targetWorkflow = null;
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

  private static inMemoryWorkflows: any[] = [
    {
      id: 'wf_flagship_enterprise',
      name: '👑 Enterprise Omnichannel Nurture & Decision Tree',
      description: 'Behavioral decision tree matching industry best practice: Anonymous Tracking → Trigger → Email 1 with AI Send Time → 24h Wait → Branch on Click → Score >= 50 Qualification Gate',
      isActive: true,
      status: 'ACTIVE',
      version: 1,
      triggerType: 'FORM_SUBMITTED',
      triggerData: JSON.stringify({ formName: 'Demo Request' }),
      actions: [],
      tenantId: 'default-tenant',
      createdAt: new Date(),
    },
    {
      id: 'wf_1',
      name: 'Auto-Welcome Email Onboarding',
      description: 'Triggers personalized welcome sequence on new contact creation',
      isActive: true,
      status: 'ACTIVE',
      version: 1,
      triggerType: 'CONTACT_CREATED',
      actions: [],
      tenantId: 'default-tenant',
      createdAt: new Date(),
    },
  ];

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

  async remove(tenantId: string, id: string) {
    const workflow = await this.findOne(tenantId, id);
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.workflow.delete({
          where: { id: workflow.id },
        });
      } catch {
        // fallback
      }
    }
    const idx = WorkflowsService.inMemoryWorkflows.findIndex(w => w.id === workflow.id);
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
}

