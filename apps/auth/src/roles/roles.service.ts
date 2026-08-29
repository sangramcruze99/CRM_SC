import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export const SYSTEM_ROLES: Record<string, RoleDefinition> = {
  SUPERADMIN: {
    name: 'SUPERADMIN',
    description: 'Full unrestricted platform & multi-tenant access',
    permissions: ['*'],
    isSystem: true,
  },
  ADMIN: {
    name: 'ADMIN',
    description: 'Tenant administrator with full control over tenant settings, billing, and users',
    permissions: [
      'tenant:manage',
      'users:read',
      'users:write',
      'users:delete',
      'contacts:*',
      'deals:*',
      'invoices:*',
      'projects:*',
      'helpdesk:*',
      'automations:*',
      'settings:*',
      'ai:*',
      'marketplace:*',
      'audit:*',
    ],
    isSystem: true,
  },
  MANAGER: {
    name: 'MANAGER',
    description: 'Team lead with management access over CRM, Sales, Projects, and Helpdesk',
    permissions: [
      'users:read',
      'contacts:*',
      'deals:*',
      'invoices:read',
      'invoices:write',
      'projects:*',
      'helpdesk:*',
      'automations:read',
      'automations:trigger',
      'reports:read',
      'ai:access',
    ],
    isSystem: true,
  },
  AGENT: {
    name: 'AGENT',
    description: 'Standard operator for sales, CRM, and support activities',
    permissions: [
      'contacts:read',
      'contacts:write',
      'deals:read',
      'deals:write',
      'projects:read',
      'projects:write',
      'helpdesk:read',
      'helpdesk:write',
      'chat:access',
      'documents:read',
      'ai:access',
    ],
    isSystem: true,
  },
  USER: {
    name: 'USER',
    description: 'Default user with standard read and basic collaborative access',
    permissions: [
      'contacts:read',
      'deals:read',
      'projects:read',
      'chat:access',
      'documents:read',
    ],
    isSystem: true,
  },
  VIEWER: {
    name: 'VIEWER',
    description: 'Read-only access across platform records',
    permissions: [
      'contacts:read',
      'deals:read',
      'invoices:read',
      'projects:read',
      'reports:read',
    ],
    isSystem: true,
  },
};

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllRoles(): RoleDefinition[] {
    return Object.values(SYSTEM_ROLES);
  }

  getRole(roleName: string): RoleDefinition {
    const role = SYSTEM_ROLES[roleName.toUpperCase()];
    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }
    return role;
  }

  async getUserRole(tenantId: string, userId: string): Promise<{ role: string; permissions: string[] }> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found in tenant`);
    }

    const roleDef = SYSTEM_ROLES[user.role?.toUpperCase()] || SYSTEM_ROLES.USER;
    return {
      role: user.role,
      permissions: roleDef.permissions,
    };
  }

  async assignUserRole(tenantId: string, userId: string, roleName: string) {
    const upperRole = roleName.toUpperCase();
    if (!SYSTEM_ROLES[upperRole]) {
      throw new NotFoundException(`Invalid role: ${roleName}`);
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: { role: upperRole },
      select: { id: true, email: true, role: true, updatedAt: true },
    });
  }

  hasPermission(roleName: string, requiredPermission: string): boolean {
    const role = SYSTEM_ROLES[roleName.toUpperCase()];
    if (!role) return false;
    if (role.permissions.includes('*')) return true;

    // Check direct match
    if (role.permissions.includes(requiredPermission)) return true;

    // Check wildcard match e.g. "contacts:*" matches "contacts:read"
    const [domain] = requiredPermission.split(':');
    if (role.permissions.includes(`${domain}:*`)) return true;

    return false;
  }
}
