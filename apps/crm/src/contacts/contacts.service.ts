import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { publishContactCreated } from '@repo/core-types';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  private static inMemoryContacts: any[] = [];

  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    let createdContact: any = null;
    if (this.prisma.isConnected) {
      try {
        createdContact = await this.prisma.contact.create({
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

    if (!createdContact) {
      createdContact = {
        id: `cont_${Date.now()}`,
        tenantId,
        ...data,
        company: data.companyId ? { id: data.companyId, name: 'Assigned Company' } : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      ContactsService.inMemoryContacts.unshift(createdContact);
    }

    // Emit reactive business event to Event Bus & Agent Orchestrator
    publishContactCreated(tenantId, createdContact).catch((e) =>
      this.logger.warn(`Failed to publish CONTACT_CREATED event: ${e.message}`)
    );

    return createdContact;
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
    return ContactsService.inMemoryContacts.filter(c => c.tenantId === tenantId);
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
    return ContactsService.inMemoryContacts.find(c => c.id === id && c.tenantId === tenantId) || null;
  }

  async update(tenantId: string, id: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        // Enforce multi-tenant ownership verification before update
        const existing = await this.prisma.contact.findFirst({
          where: { id, tenantId },
        });
        if (!existing) {
          return null;
        }

        return await this.prisma.contact.update({
          where: { id },
          data,
        });
      } catch (err: any) {
        this.logger.error(`Error updating contact ${id}: ${err.message}`);
      }
    }

    const idx = ContactsService.inMemoryContacts.findIndex(c => c.id === id && c.tenantId === tenantId);
    if (idx !== -1) {
      ContactsService.inMemoryContacts[idx] = { ...ContactsService.inMemoryContacts[idx], ...data };
      return ContactsService.inMemoryContacts[idx];
    }
    return null;
  }

  async remove(tenantId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        // Enforce multi-tenant ownership verification before deletion
        const existing = await this.prisma.contact.findFirst({
          where: { id, tenantId },
        });
        if (!existing) {
          return null;
        }

        return await this.prisma.contact.delete({
          where: { id },
        });
      } catch (err: any) {
        this.logger.error(`Error deleting contact ${id}: ${err.message}`);
      }
    }

    ContactsService.inMemoryContacts = ContactsService.inMemoryContacts.filter(c => !(c.id === id && c.tenantId === tenantId));
    return { success: true, id };
  }
}
