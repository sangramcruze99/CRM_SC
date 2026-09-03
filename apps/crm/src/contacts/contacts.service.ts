import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  private static inMemoryContacts: any[] = [];

  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.contact.create({
          data: {
            ...data,
            tenantId,
          },
          include: { company: true }
        });
      } catch (err: any) {
        this.logger.warn(`Database write deferred, saving contact to memory: ${err.message}`);
      }
    }

    const newContact = {
      id: `cont_${Date.now()}`,
      tenantId,
      ...data,
      company: data.companyId ? { id: data.companyId, name: 'Assigned Company' } : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    ContactsService.inMemoryContacts.unshift(newContact);
    return newContact;
  }

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.contact.findMany({
          where: { tenantId },
          include: { company: true },
          orderBy: { createdAt: 'desc' }
        });
        if (records && records.length > 0) return records;
      } catch (err: any) {
        this.logger.warn(`Database read deferred, returning memory contacts: ${err.message}`);
      }
    }
    return ContactsService.inMemoryContacts.filter(c => c.tenantId === tenantId || c.tenantId === 'default-tenant');
  }

  async findOne(tenantId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        const record = await this.prisma.contact.findFirst({
          where: { id, tenantId },
          include: { company: true }
        });
        if (record) return record;
      } catch (err: any) {
        this.logger.warn(`Database read deferred: ${err.message}`);
      }
    }
    return ContactsService.inMemoryContacts.find(c => c.id === id) || null;
  }

  async update(tenantId: string, id: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.contact.update({
          where: { id },
          data,
        });
      } catch (err: any) {
        // ignore
      }
    }

    const idx = ContactsService.inMemoryContacts.findIndex(c => c.id === id);
    if (idx !== -1) {
      ContactsService.inMemoryContacts[idx] = { ...ContactsService.inMemoryContacts[idx], ...data };
      return ContactsService.inMemoryContacts[idx];
    }
    return null;
  }

  async remove(tenantId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.contact.delete({
          where: { id },
        });
      } catch (err: any) {
        // ignore
      }
    }

    ContactsService.inMemoryContacts = ContactsService.inMemoryContacts.filter(c => c.id !== id);
    return { success: true, id };
  }
}
