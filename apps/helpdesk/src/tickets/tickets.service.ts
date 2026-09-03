import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  private static inMemoryTickets: any[] = [];

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
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return TicketsService.inMemoryTickets.filter(t => t.tenantId === tenantId || t.tenantId === 'default-tenant');
  }

  async create(tenantId: string, data: { title: string, description: string, priority?: string }) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.ticket.create({
          data: {
            tenantId,
            title: data.title,
            description: data.description,
            priority: data.priority || 'MEDIUM',
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

    const newTicket = {
      id: `tkt_${Date.now()}`,
      tenantId,
      title: data.title,
      description: data.description,
      priority: data.priority || 'MEDIUM',
      status: 'OPEN',
      createdAt: new Date(),
      messages: [
        { id: `msg_${Date.now()}`, content: data.description, isStaff: false, createdAt: new Date() }
      ]
    };
    TicketsService.inMemoryTickets.unshift(newTicket);
    return newTicket;
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

  async updateStatus(ticketId: string, status: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.ticket.update({
          where: { id: ticketId },
          data: { status }
        });
      } catch {
        // fallback
      }
    }

    const t = TicketsService.inMemoryTickets.find(t => t.id === ticketId);
    if (t) {
      t.status = status;
      return t;
    }
    return { id: ticketId, status };
  }

  async delete(ticketId: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.ticket.delete({
          where: { id: ticketId }
        });
      } catch {
        // fallback
      }
    }

    TicketsService.inMemoryTickets = TicketsService.inMemoryTickets.filter(t => t.id !== ticketId);
    return { success: true, id: ticketId };
  }
}
