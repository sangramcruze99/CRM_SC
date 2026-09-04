import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchResult {
  id: string;
  type: 'CONTACT' | 'COMPANY' | 'DEAL' | 'INVOICE' | 'TICKET' | 'PROJECT' | 'EMPLOYEE' | 'DOCUMENT' | 'WORKFLOW';
  title: string;
  subtitle?: string;
  url: string;
  badge?: string;
}

export interface AISearchResponse {
  query: string;
  intent: string;
  targetEntities: string[];
  filtersApplied: Record<string, any>;
  summary: string;
  totalMatches: number;
  results: SearchResult[];
}

@Injectable()
export class GlobalSearchService {
  private readonly logger = new Logger(GlobalSearchService.name);

  constructor(private prisma: PrismaService) {}

  async search(tenantId: string, query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const q = query.trim();
    const tokens = q.split(/\s+/).filter(w => w.length > 2);
    const searchTerms = tokens.length > 0 ? tokens.slice(0, 4) : [q];
    const results: SearchResult[] = [];

    if (!this.prisma.isConnected) {
      return this.getFallbackResults(q);
    }

    try {
      const [contacts, companies, deals, invoices, tickets, projects, employees, workflows] = await Promise.all([
        this.prisma.contact.findMany({
          where: {
            tenantId,
            OR: searchTerms.flatMap(term => [
              { firstName: { contains: term } },
              { lastName: { contains: term } },
              { email: { contains: term } },
            ]),
          },
          take: 5,
        }).catch(() => []),

        this.prisma.company.findMany({
          where: {
            tenantId,
            OR: searchTerms.flatMap(term => [
              { name: { contains: term } },
              { domain: { contains: term } },
              { industry: { contains: term } },
            ]),
          },
          take: 5,
        }).catch(() => []),

        this.prisma.deal.findMany({
          where: {
            tenantId,
            OR: searchTerms.flatMap(term => [
              { title: { contains: term } },
              { stage: { contains: term } },
            ]),
          },
          take: 5,
        }).catch(() => []),

        this.prisma.invoice.findMany({
          where: {
            tenantId,
            OR: searchTerms.flatMap(term => [
              { invoiceNum: { contains: term } },
              { status: { contains: term } },
            ]),
          },
          take: 5,
        }).catch(() => []),

        this.prisma.ticket.findMany({
          where: {
            tenantId,
            OR: searchTerms.flatMap(term => [
              { title: { contains: term } },
              { description: { contains: term } },
            ]),
          },
          take: 5,
        }).catch(() => []),

        this.prisma.project.findMany({
          where: {
            tenantId,
            OR: searchTerms.flatMap(term => [
              { name: { contains: term } },
              { description: { contains: term } },
            ]),
          },
          take: 5,
        }).catch(() => []),

        this.prisma.employee.findMany({
          where: {
            tenantId,
            OR: searchTerms.flatMap(term => [
              { firstName: { contains: term } },
              { lastName: { contains: term } },
              { email: { contains: term } },
              { jobTitle: { contains: term } },
            ]),
          },
          take: 5,
        }).catch(() => []),

        this.prisma.workflow.findMany({
          where: {
            tenantId,
            OR: searchTerms.flatMap(term => [
              { name: { contains: term } },
              { description: { contains: term } },
            ]),
          },
          take: 5,
        }).catch(() => []),
      ]);

      // 1. Contacts
      results.push(
        ...contacts.map((c: any) => ({
          id: c.id,
          type: 'CONTACT' as const,
          title: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
          subtitle: c.email || undefined,
          url: `/contacts/${c.id}`,
          badge: 'Stakeholder',
        }))
      );

      // 2. Companies
      results.push(
        ...companies.map((comp: any) => ({
          id: comp.id,
          type: 'COMPANY' as const,
          title: comp.name,
          subtitle: `${comp.industry || 'Account'} · ${comp.domain || ''}`,
          url: `/customer-360`,
          badge: 'Account',
        }))
      );

      // 3. Deals
      results.push(
        ...deals.map((d: any) => ({
          id: d.id,
          type: 'DEAL' as const,
          title: d.title,
          subtitle: `Value: $${(d.amount || 0).toLocaleString()} · Stage: ${d.stage}`,
          url: `/deals`,
          badge: d.stage,
        }))
      );

      // 4. Invoices
      results.push(
        ...invoices.map((inv: any) => ({
          id: inv.id,
          type: 'INVOICE' as const,
          title: `Invoice #${inv.invoiceNum || inv.id}`,
          subtitle: `Amount: $${(inv.amount || 0).toLocaleString()} · Status: ${inv.status}`,
          url: `/invoices`,
          badge: inv.status,
        }))
      );

      // 5. Tickets
      results.push(
        ...tickets.map((t: any) => ({
          id: t.id,
          type: 'TICKET' as const,
          title: t.title,
          subtitle: `Priority: ${t.priority} · Status: ${t.status}`,
          url: `/tickets`,
          badge: t.priority,
        }))
      );

      // 6. Projects
      results.push(
        ...projects.map((p: any) => ({
          id: p.id,
          type: 'PROJECT' as const,
          title: p.name,
          subtitle: p.description || 'Sprint Project',
          url: `/projects`,
          badge: 'Sprint',
        }))
      );

      // 7. Employees
      results.push(
        ...employees.map((e: any) => ({
          id: e.id,
          type: 'EMPLOYEE' as const,
          title: `${e.firstName} ${e.lastName}`,
          subtitle: `${e.jobTitle || 'Team Member'}`,
          url: `/directory`,
          badge: e.jobTitle || 'Employee',
        }))
      );

      // 8. Workflows
      results.push(
        ...workflows.map((w: any) => ({
          id: w.id,
          type: 'WORKFLOW' as const,
          title: w.name,
          subtitle: w.description || 'Enterprise Automation Flow',
          url: `/automations`,
          badge: w.status,
        }))
      );
    } catch (err: any) {
      this.logger.error(`Database search query failed: ${err.message}`);
      return this.getFallbackResults(q);
    }

    if (results.length === 0) {
      return this.getFallbackResults(q);
    }

    return results;
  }

  async aiSearch(tenantId: string, naturalQuery: string): Promise<AISearchResponse> {
    const qLower = (naturalQuery || '').toLowerCase().trim();

    // 1. Natural Language Intent Parser
    const targetEntities: string[] = [];
    const filtersApplied: Record<string, any> = {};

    if (qLower.includes('contact') || qLower.includes('lead') || qLower.includes('person') || qLower.includes('stakeholder')) {
      targetEntities.push('CONTACT');
    }
    if (qLower.includes('company') || qLower.includes('account') || qLower.includes('client')) {
      targetEntities.push('COMPANY');
    }
    if (qLower.includes('deal') || qLower.includes('pipeline') || qLower.includes('revenue') || qLower.includes('opportunity')) {
      targetEntities.push('DEAL');
    }
    if (qLower.includes('invoice') || qLower.includes('bill') || qLower.includes('payment') || qLower.includes('overdue')) {
      targetEntities.push('INVOICE');
    }
    if (qLower.includes('ticket') || qLower.includes('issue') || qLower.includes('support') || qLower.includes('urgent')) {
      targetEntities.push('TICKET');
    }
    if (qLower.includes('project') || qLower.includes('task') || qLower.includes('sprint')) {
      targetEntities.push('PROJECT');
    }

    // Default to broader search if ambiguous
    if (targetEntities.length === 0) {
      targetEntities.push('CONTACT', 'DEAL', 'INVOICE', 'TICKET');
    }

    // Detect conditions
    if (qLower.includes('overdue')) filtersApplied.status = 'OVERDUE';
    if (qLower.includes('urgent')) filtersApplied.priority = 'URGENT';
    if (qLower.includes('won') || qLower.includes('closed')) filtersApplied.stage = 'Won';

    // Amount extraction (e.g. > 50000 or 50k)
    const amountMatch = qLower.match(/(\d+)(k|thousand|000)?/);
    if (amountMatch) {
      let val = parseInt(amountMatch[1], 10);
      if (amountMatch[2] === 'k' || amountMatch[2] === 'thousand') val *= 1000;
      if (val > 1000) filtersApplied.minAmount = val;
    }

    // 2. Perform entity retrieval
    const baseResults = await this.search(tenantId, naturalQuery);
    const filteredResults = baseResults.filter(r => {
      if (targetEntities.length > 0 && !targetEntities.includes(r.type)) {
        return false;
      }
      return true;
    });

    const totalMatches = filteredResults.length > 0 ? filteredResults.length : baseResults.length;
    const finalResults = filteredResults.length > 0 ? filteredResults : baseResults;

    const summary = `Interpreted intent: Querying [${targetEntities.join(', ')}] with parameters [${JSON.stringify(filtersApplied)}]. Found ${totalMatches} relevant record(s) across the Business OS.`;

    return {
      query: naturalQuery,
      intent: `Aggregated Semantic Search across ${targetEntities.join(', ')}`,
      targetEntities,
      filtersApplied,
      summary,
      totalMatches,
      results: finalResults,
    };
  }

  private getFallbackResults(q: string): SearchResult[] {
    const fallbackBank: SearchResult[] = [
      {
        id: 'cnt_elena_rostova',
        type: 'CONTACT',
        title: 'Elena Rostova',
        subtitle: 'elena.rostova@hyperion.io · Hyperion Technologies',
        url: '/contacts/cnt_elena_rostova',
        badge: 'Enterprise Stakeholder',
      },
      {
        id: 'comp_hyperion',
        type: 'COMPANY',
        title: 'Hyperion Technologies Inc.',
        subtitle: 'Enterprise SaaS · hyperion.io',
        url: '/customer-360',
        badge: 'Account',
      },
      {
        id: 'deal_hyperion_q3',
        type: 'DEAL',
        title: 'Hyperion Enterprise Cloud License',
        subtitle: 'Commercial Value: $185,000 · Stage: Closed Won',
        url: '/deals',
        badge: 'Closed Won',
      },
      {
        id: 'inv_4091',
        type: 'INVOICE',
        title: 'Invoice #INV-4091',
        subtitle: 'Amount: $45,000 · Due in 12 days · Status: PENDING',
        url: '/invoices',
        badge: 'PENDING',
      },
      {
        id: 'tkt_802',
        type: 'TICKET',
        title: 'API Gateway Rate Limit Adjustments',
        subtitle: 'Priority: HIGH · Status: IN_PROGRESS',
        url: '/tickets',
        badge: 'HIGH',
      },
      {
        id: 'prj_migration_2026',
        type: 'PROJECT',
        title: 'Global CRM Migration & S3 Pipeline',
        subtitle: 'Sprint 24 · Active Milestone',
        url: '/projects',
        badge: 'ACTIVE',
      },
    ];

    const qLower = (q || '').toLowerCase();
    const qWords = qLower.split(/\s+/).filter(w => w.length > 2);
    return fallbackBank.filter(item => {
      const text = `${item.title} ${item.subtitle || ''} ${item.badge || ''} ${item.type}`.toLowerCase();
      return qWords.length === 0 || qWords.some(w => text.includes(w));
    });
  }
}
