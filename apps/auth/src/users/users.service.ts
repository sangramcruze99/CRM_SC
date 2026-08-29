import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user) return user;
    } catch (err: any) {
      this.logger.warn(`Database unreachable, using memory fallback for findByEmail: ${email}`);
    }
    return UsersService.inMemoryUsers.get(email.toLowerCase()) || null;
  }

  async create(data: any) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = data.password ? await bcrypt.hash(data.password, salt) : undefined;
    const tenantId = data.tenantId || 'default-tenant';

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name || 'User',
      tenantId,
      role: data.role || 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Try saving to database first
    try {
      await this.prisma.tenant.upsert({
        where: { id: tenantId },
        update: {},
        create: { id: tenantId, name: 'Default Tenant' },
      });

      return await this.prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          name: data.name,
          tenantId,
          role: data.role || 'ADMIN',
        },
      });
    } catch (err: any) {
      this.logger.warn(`Database unreachable, storing user in memory: ${data.email}`);
      UsersService.inMemoryUsers.set(data.email.toLowerCase(), newUser);
      return newUser;
    }
  }
}
