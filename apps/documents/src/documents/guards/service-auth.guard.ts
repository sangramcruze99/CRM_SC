import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ServiceAuthGuard implements CanActivate {
  private readonly logger = new Logger(ServiceAuthGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user || {};
    const tenantIdHeader = request.headers['x-tenant-id'];

    // 1. Multi-Tenant Boundary Enforcement
    const effectiveTenantId = user.tenantId || tenantIdHeader || 'default-tenant';

    // If user has a verified tenant in JWT, it must strictly match the tenant being accessed
    if (user.tenantId && tenantIdHeader && user.tenantId !== tenantIdHeader) {
      this.logger.warn(
        `Cross-tenant access attempt blocked: JWT tenant ${user.tenantId} tried accessing ${tenantIdHeader}`,
      );
      await this.logSecurityIncident({
        tenantId: user.tenantId,
        userId: user.sub || user.id,
        action: 'CROSS_TENANT_ACCESS_BLOCKED',
        targetTenant: tenantIdHeader,
        path: request.url,
      });
      throw new ForbiddenException('Cross-tenant document access is strictly prohibited');
    }

    request.effectiveTenantId = effectiveTenantId;

    // 2. Service-Level Authorization
    const serviceName = (
      request.query.service ||
      request.body?.service ||
      request.params?.service ||
      ''
    ).toLowerCase();

    if (serviceName && !this.isUserAuthorizedForService(user, serviceName)) {
      this.logger.warn(
        `Service authorization failure: User ${user.email || user.sub} denied access to service '${serviceName}'`,
      );
      await this.logSecurityIncident({
        tenantId: effectiveTenantId,
        userId: user.sub || user.id,
        action: 'SERVICE_PERMISSION_DENIED',
        service: serviceName,
        path: request.url,
      });
      throw new ForbiddenException(
        `You do not have permission to access '${serviceName}' documents`,
      );
    }

    return true;
  }

  private isUserAuthorizedForService(user: any, service: string): boolean {
    // Admin, System, API Key have full platform access
    if (
      !user.role ||
      user.role === 'ADMIN' ||
      user.role === 'SUPERADMIN' ||
      user.sub === 'system-api-key'
    ) {
      return true;
    }

    // Explicit service access restrictions if defined on user profile
    if (Array.isArray(user.allowedServices) && user.allowedServices.length > 0) {
      return user.allowedServices.includes(service);
    }

    // Role-specific matching
    const role = (user.role || '').toUpperCase();
    if (service === 'finance' && role.includes('FINANCE')) return true;
    if (service === 'hr' && role.includes('HR')) return true;
    if (service === 'sales' && role.includes('SALES')) return true;
    if (service === 'crm' && (role.includes('CRM') || role.includes('SALES'))) return true;

    // By default, standard USER can access general documents, crm, helpdesk, projects
    const generalServices = ['documents', 'crm', 'helpdesk', 'projects', 'inventory'];
    if (generalServices.includes(service)) {
      return true;
    }

    // Restricted services require explicit roles
    const restrictedServices = ['finance', 'admin', 'hr', 'compliance'];
    if (restrictedServices.includes(service) && user.role === 'USER') {
      return false;
    }

    return true;
  }

  private async logSecurityIncident(details: {
    tenantId: string;
    userId?: string;
    action: string;
    targetTenant?: string;
    service?: string;
    path: string;
  }) {
    if (this.prisma.isConnected) {
      try {
        await this.prisma.auditLog.create({
          data: {
            tenantId: details.tenantId,
            action: `SECURITY_${details.action}`,
            entityType: 'DocumentVault',
            userId: details.userId || null,
            metadata: JSON.stringify({
              incident: details.action,
              targetTenant: details.targetTenant,
              service: details.service,
              path: details.path,
              timestamp: new Date().toISOString(),
            }),
          },
        });
      } catch {
        // safe fallback
      }
    }
  }
}
