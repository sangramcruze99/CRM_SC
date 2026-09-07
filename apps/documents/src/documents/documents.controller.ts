import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  Headers,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentServiceRegistry } from './document-service.registry';
import { ServiceAuthGuard } from './guards/service-auth.guard';

@Controller('documents')
@UseGuards(ServiceAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Get all registered services and their modules from the centralized registry
   */
  @Get('services')
  getServices() {
    return DocumentServiceRegistry.getAllServices();
  }

  /**
   * List documents with tenant isolation and service-aware namespace filtering
   */
  @Get()
  findAll(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Req() req: any,
    @Query('folderId') folderId?: string,
    @Query('service') service?: string,
    @Query('module') module?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('parentDocumentId') parentDocumentId?: string,
    @Query('search') search?: string,
  ) {
    const tenant = req.user?.tenantId || tenantIdHeader || 'default-tenant';
    return this.documentsService.findAll(tenant, {
      folderId,
      service,
      module,
      entityType,
      entityId,
      category,
      status,
      parentDocumentId,
      search,
    });
  }

  /**
   * Get document by ID with tenant isolation
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Req() req: any,
  ) {
    const tenant = req.user?.tenantId || tenantIdHeader || 'default-tenant';
    return this.documentsService.findOne(id, tenant);
  }

  /**
   * Get document with complete lineage (receipts, outputs, and cross-service references)
   */
  @Get(':id/lineage')
  findWithLineage(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Req() req: any,
  ) {
    const tenant = req.user?.tenantId || tenantIdHeader || 'default-tenant';
    return this.documentsService.findWithLineage(id, tenant);
  }

  /**
   * Ingest / Upload Document into Vault with Service Namespace
   */
  @Post()
  create(
    @Body() data: any,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Req() req: any,
  ) {
    const tenant = req.user?.tenantId || tenantIdHeader || 'default-tenant';
    const userId = req.user?.sub || req.user?.id;
    return this.documentsService.create({ ...data, createdBy: userId }, tenant);
  }

  /**
   * Attach Cross-Service Reference (Canonical document shared across CRM, Sales, Finance, etc.)
   */
  @Post(':id/references')
  addReference(
    @Param('id') id: string,
    @Body() data: any,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Req() req: any,
  ) {
    const tenant = req.user?.tenantId || tenantIdHeader || 'default-tenant';
    const userId = req.user?.sub || req.user?.id;
    return this.documentsService.addReference(id, tenant, { ...data, userId });
  }

  /**
   * Update Document Processing Status (Real state transitions)
   */
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: any; error?: string },
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Req() req: any,
  ) {
    const tenant = req.user?.tenantId || tenantIdHeader || 'default-tenant';
    return this.documentsService.updateProcessingStatus(id, tenant, body.status, body.error);
  }

  /**
   * Delete Document
   */
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Req() req: any,
  ) {
    const tenant = req.user?.tenantId || tenantIdHeader || 'default-tenant';
    const userId = req.user?.sub || req.user?.id;
    return this.documentsService.delete(id, tenant, userId);
  }
}
