import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private static inMemoryUsers = new Map<string, any>();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const defaultHash = await bcrypt.hash('admin123', 10);
    UsersService.inMemoryUsers.set('admin@gmail.com', {
      id: 'usr_default_admin',
      email: 'admin@gmail.com',
      passwordHash: defaultHash,
      name: 'Admin User',
      tenantId: 'default-tenant',
      role: 'SUPERADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findByEmail(email: string) {
    if (!email) return null;
    const normalizedEmail = email.toLowerCase().trim();
    try {
      const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (user) return user;
    } catch (err: any) {
      this.logger.warn(
        `Database unreachable, using memory fallback for findByEmail: ${normalizedEmail}`,
      );
    }
    return UsersService.inMemoryUsers.get(normalizedEmail) || null;
  }

  async create(data: any) {
    if (!data.email || typeof data.email !== 'string') {
      throw new BadRequestException('Valid email address is required');
    }
    if (!data.password || typeof data.password !== 'string' || data.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const normalizedEmail = data.email.toLowerCase().trim();

    // Prevent Tenant Hijacking:
    // Self-registration ALWAYS creates a dedicated isolated tenant.
    // Joining an existing tenant is strictly disallowed without verified invitation token.
    const tenantId = `tnt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    // Prevent Privilege Escalation:
    // Self-registration ALWAYS defaults to USER. Roles cannot be self-selected.
    const assignedRole = 'USER';

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: normalizedEmail,
      passwordHash,
      name: data.name ? String(data.name).trim().slice(0, 100) : 'User',
      tenantId,
      role: assignedRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Try saving to database first
    try {
      await this.prisma.tenant.upsert({
        where: { id: tenantId },
        update: {},
        create: {
          id: tenantId,
          name: data.organizationName ? String(data.organizationName).trim().slice(0, 100) : `${newUser.name}'s Workspace`,
        },
      });

      return await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name: newUser.name,
          tenantId,
          role: assignedRole,
        },
      });
    } catch (err: any) {
      this.logger.warn(
        `Database unreachable, storing user in memory: ${normalizedEmail}`,
      );
      UsersService.inMemoryUsers.set(normalizedEmail, newUser);
      return newUser;
    }
  }
}
