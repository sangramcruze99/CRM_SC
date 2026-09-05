import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateApprovalDto {
  workflowExecutionId?: string;
  workflowId?: string;
  agentId?: string;
  actionType: string;
  targetEntity?: string;
  targetId?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  payload?: any;
  reason: string;
}

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);
  private resumeCallback?: (executionId: string, approved: boolean, approverData: any) => Promise<any>;

  constructor(private readonly prisma: PrismaService) {}

  setResumeCallback(cb: (executionId: string, approved: boolean, approverData: any) => Promise<any>) {
    this.resumeCallback = cb;
  }

  async createApproval(tenantId: string, dto: CreateApprovalDto) {
    this.logger.log(`Creating HITL Approval Request [${dto.riskLevel || 'HIGH'}]: ${dto.actionType} for Tenant ${tenantId}`);

    const approval = await this.prisma.approvalRequest.create({
      data: {
        tenantId,
        workflowExecutionId: dto.workflowExecutionId,
        workflowId: dto.workflowId,
        agentId: dto.agentId,
        actionType: dto.actionType,
        targetEntity: dto.targetEntity,
        targetId: dto.targetId,
        riskLevel: dto.riskLevel || 'HIGH',
        payload: JSON.stringify(dto.payload || {}),
        reason: dto.reason,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h default expiration
      },
    });

    // Update execution status if workflow is bound
    if (dto.workflowExecutionId) {
      await this.prisma.workflowExecution.update({
        where: { id: dto.workflowExecutionId },
        data: { status: 'APPROVAL_REQUIRED' },
      }).catch((err) => this.logger.warn(`Could not update execution status: ${err.message}`));
    }

    return approval;
  }

  async getApprovals(tenantId: string, status?: string) {
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }

    const approvals = await this.prisma.approvalRequest.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      include: {
        workflowExecution: {
          select: { id: true, workflowName: true, triggerType: true },
        },
        agent: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return approvals.map((a) => ({
      ...a,
      payload: a.payload ? JSON.parse(a.payload) : {},
    }));
  }

  async getApprovalById(tenantId: string, id: string) {
    const approval = await this.prisma.approvalRequest.findFirst({
      where: { id, tenantId },
      include: {
        workflowExecution: true,
        agent: true,
      },
    });

    if (!approval) {
      throw new NotFoundException(`Approval request ${id} not found`);
    }

    return {
      ...approval,
      payload: approval.payload ? JSON.parse(approval.payload) : {},
    };
  }

  async approve(tenantId: string, id: string, reviewedBy: string = 'Authorized Admin', comments?: string) {
    const approval = await this.getApprovalById(tenantId, id);

    this.logger.log(`HITL Approval APPROVED: ${id} by ${reviewedBy}`);

    const updated = await this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy,
        reviewedAt: new Date(),
        comments: comments || 'Approved via Human-in-the-Loop Console',
        executionResult: JSON.stringify({ status: 'EXECUTED_UPON_APPROVAL', timestamp: new Date().toISOString() }),
      },
    });

    // Resume execution if connected to a paused workflow execution
    if (approval.workflowExecutionId && this.resumeCallback) {
      try {
        await this.resumeCallback(approval.workflowExecutionId, true, { reviewedBy, comments });
      } catch (err: any) {
        this.logger.error(`Failed to trigger workflow resume callback: ${err.message}`);
      }
    }

    return {
      ...updated,
      payload: updated.payload ? JSON.parse(updated.payload) : {},
    };
  }

  async reject(tenantId: string, id: string, reviewedBy: string = 'Authorized Admin', comments?: string) {
    const approval = await this.getApprovalById(tenantId, id);

    this.logger.warn(`HITL Approval REJECTED: ${id} by ${reviewedBy}`);

    const updated = await this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy,
        reviewedAt: new Date(),
        comments: comments || 'Rejected by human operator',
        executionResult: JSON.stringify({ status: 'BLOCKED_BY_POLICY', timestamp: new Date().toISOString() }),
      },
    });

    if (approval.workflowExecutionId) {
      await this.prisma.workflowExecution.update({
        where: { id: approval.workflowExecutionId },
        data: {
          status: 'CANCELLED',
          error: `Execution terminated: action rejected by ${reviewedBy}. Reason: ${comments || 'Action denied'}`,
          completedAt: new Date(),
        },
      }).catch(() => {});

      if (this.resumeCallback) {
        try {
          await this.resumeCallback(approval.workflowExecutionId, false, { reviewedBy, comments });
        } catch (err: any) {
          this.logger.warn(`Resume callback handling rejection: ${err.message}`);
        }
      }
    }

    return {
      ...updated,
      payload: updated.payload ? JSON.parse(updated.payload) : {},
    };
  }
}
