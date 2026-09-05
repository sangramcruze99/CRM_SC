import { Controller, Get, Post, Param, Body, Headers, Query } from '@nestjs/common';
import { ApprovalService } from './approval.service';

@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  private getTenant(tenantIdHeader?: string) {
    return tenantIdHeader || 'default-tenant';
  }

  @Get()
  getApprovals(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('status') status?: string,
  ) {
    return this.approvalService.getApprovals(this.getTenant(tenantIdHeader), status);
  }

  @Get(':id')
  getApprovalById(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    return this.approvalService.getApprovalById(this.getTenant(tenantIdHeader), id);
  }

  @Post(':id/approve')
  approve(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() body: { reviewedBy?: string; comments?: string },
  ) {
    return this.approvalService.approve(
      this.getTenant(tenantIdHeader),
      id,
      body.reviewedBy || 'Authorized Operator',
      body.comments,
    );
  }

  @Post(':id/reject')
  reject(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() body: { reviewedBy?: string; comments?: string },
  ) {
    return this.approvalService.reject(
      this.getTenant(tenantIdHeader),
      id,
      body.reviewedBy || 'Authorized Operator',
      body.comments,
    );
  }
}
