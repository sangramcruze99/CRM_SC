import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { publishTicketEscalated, publishBusinessEvent } from '@repo/core-types';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private static inMemoryTickets: any[] = [];

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.ticket.findMany({
          where: { tenantId },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        return records;
      } catch {
        // fallback
      }
    }
    return TicketsService.inMemoryTickets.filter(t => t.tenantId === tenantId);
  }

  async create(tenantId: string, data: { title: string, description: string, priority?: string }) {
    let created: any = null;
    const priority = (data.priority || 'MEDIUM').toUpperCase();

    if (this.prisma.isConnected) {
      try {
        created = await this.prisma.ticket.create({
          data: {
            tenantId,
            title: data.title,
            description: data.description,
            priority,
            status: 'OPEN',
            messages: {
              create: {
                content: data.description,
                isStaff: false
              }
            }
          },
          include: { messages: true }
        });
      } catch {
        // fallback
      }
    }

    if (!created) {
      created = {
        id: `tkt_${Date.now()}`,
        tenantId,
        title: data.title,
        description: data.description,
        priority,
        status: 'OPEN',
        createdAt: new Date(),
        messages: [
          { id: `msg_${Date.now()}`, content: data.description, isStaff: false, createdAt: new Date() }
        ]
      };
      TicketsService.inMemoryTickets.unshift(created);
    }

    // Emit event: if HIGH or URGENT, emit TICKET_ESCALATED directly to trigger Customer Support Agent
    if (priority === 'HIGH' || priority === 'URGENT') {
      publishTicketEscalated(tenantId, {
        id: created.id,
        title: created.title,
        priority: created.priority,
        status: created.status,
      }).catch((e) => this.logger.warn(`Failed to publish TICKET_ESCALATED: ${e.message}`));
    } else {
      publishBusinessEvent({
        tenantId,
        type: 'TICKET_CREATED',
        source: 'helpdesk',
        payload: { ticketId: created.id, title: created.title, priority: created.priority },
      }).catch(() => null);
    }

    return created;
  }


  async addMessage(ticketId: string, content: string, isStaff: boolean = false) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.ticketMessage.create({
          data: {
            ticketId,
            content,
            isStaff
          }
        });
      } catch {
        // fallback
      }
    }

    const newMsg = { id: `msg_${Date.now()}`, content, isStaff, createdAt: new Date() };
    const t = TicketsService.inMemoryTickets.find(t => t.id === ticketId);
    if (t) {
      t.messages.push(newMsg);
    }
    return newMsg;
  }

  async updateStatus(tenantId: string, ticketId: string, status: string) {
    if (this.prisma.isConnected) {
      try {
        const existing = await this.prisma.ticket.findFirst({
          where: { id: ticketId, tenantId }
        });
        if (!existing) return null;

        return await this.prisma.ticket.update({
          where: { id: ticketId },
          data: { status }
        });
      } catch {
        // fallback
      }
    }

    const t = TicketsService.inMemoryTickets.find(t => t.id === ticketId && t.tenantId === tenantId);
    if (t) {
      t.status = status;
      return t;
    }
    return { id: ticketId, status };
  }

  async delete(tenantId: string, ticketId: string) {
    if (this.prisma.isConnected) {
      try {
        const existing = await this.prisma.ticket.findFirst({
          where: { id: ticketId, tenantId }
        });
        if (!existing) return { success: false, id: ticketId };

        return await this.prisma.ticket.delete({
          where: { id: ticketId }
        });
      } catch {
        // fallback
      }
    }

    TicketsService.inMemoryTickets = TicketsService.inMemoryTickets.filter(t => !(t.id === ticketId && t.tenantId === tenantId));
    return { success: true, id: ticketId };
  }
}
