import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchResult {
  id: string;
  type: 'CONTACT' | 'DEAL' | 'TICKET' | 'EMPLOYEE' | 'PROJECT';
  title: string;
  subtitle?: string;
  url: string;
}

@Injectable()
export class GlobalSearchService {
  constructor(private prisma: PrismaService) {}

  async search(tenantId: string, query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const results: SearchResult[] = [];

    if (this.prisma.isConnected) {
      try {
        const [contacts, deals, tickets] = await Promise.all([
          this.prisma.contact.findMany({
            where: {
              tenantId,
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ]
            },
            take: 5
          }),
          this.prisma.deal.findMany({
            where: {
              tenantId,
              title: { contains: query, mode: 'insensitive' }
            },
            take: 5
          }),
          this.prisma.ticket.findMany({
            where: {
              tenantId,
              title: { contains: query, mode: 'insensitive' }
            },
            take: 5
          })
        ]);

        results.push(
          ...contacts.map(c => ({
            id: c.id,
            type: 'CONTACT' as const,
            title: `${c.firstName} ${c.lastName}`,
            subtitle: c.email || undefined,
            url: `/contacts/${c.id}`
          })),
          ...deals.map(d => ({
            id: d.id,
            type: 'DEAL' as const,
            title: d.title,
            subtitle: `Value: $${d.amount}`,
            url: `/deals`
          })),
          ...tickets.map(t => ({
            id: t.id,
            type: 'TICKET' as const,
            title: t.title,
            subtitle: `Status: ${t.status}`,
            url: `/tickets`
          }))
        );
      } catch {
        // fallback
      }
    }

    return results;
  }
}
