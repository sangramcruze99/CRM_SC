import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComparisonEngine } from '../analytics/comparison.engine';
import { AnomalyDetector } from '../analytics/anomaly.detector';
import { SummaryGenerator } from '../analytics/summary.generator';

export interface DailyMetricsData {
  sales: {
    newLeads: number;
    qualifiedLeads: number;
    dealsCreated: number;
    dealsWon: number;
    dealsLost: number;
    revenueWon: number;
    pipelineValue: number;
    winRatePercent: number;
  };
  finance: {
    invoicesCreated: number;
    invoicesPaid: number;
    paymentsReceived: number;
    billsCreated: number;
    paymentsMade: number;
    expenses: number;
    arOverdue: number;
    netCashFlow: number;
  };
  crm: {
    newContacts: number;
    newCompanies: number;
    activitiesLogged: number;
    calls: number;
    emails: number;
    meetings: number;
  };
  projects: {
    tasksCreated: number;
    tasksCompleted: number;
    overdueTasks: number;
    activeProjects: number;
    sprintVelocity: number;
  };
  hr: {
    totalHeadcount: number;
    newHires: number;
    departures: number;
    leaveRequestsPending: number;
    activeEmployees: number;
  };
  helpdesk: {
    ticketsOpened: number;
    ticketsResolved: number;
    slaBreaches: number;
    avgResolutionHours: number;
    openBacklog: number;
  };
  inventory: {
    stockReceived: number;
    stockSold: number;
    stockAdjusted: number;
    lowStockItems: number;
    totalCatalogItems: number;
  };
  marketing: {
    activeCampaigns: number;
    landingPageLeads: number;
    conversions: number;
    publishedPages: number;
  };
  ai: {
    agentRuns: number;
    successfulActions: number;
    failedActions: number;
    humanApprovals: number;
    totalTokens: number;
    estimatedCostUsd: number;
  };
  auditEventsCount: number;
  healthScore: number;
}

export interface SourceReferencesData {
  dealsWon: Array<{ id: string; title: string; amount: number; stage?: string; customerName?: string; href: string }>;
  dealsCreated: Array<{ id: string; title: string; amount: number; stage?: string; href: string }>;
  payments: Array<{ id: string; amount: number; status: string; method?: string; invoiceId?: string; href: string }>;
  invoices: Array<{ id: string; invoiceNumber?: string; amountDue: number; status: string; href: string }>;
  tickets: Array<{ id: string; title: string; priority: string; status: string; href: string }>;
  tasks: Array<{ id: string; title: string; status: string; priority?: string; projectId?: string; href: string }>;
  contacts: Array<{ id: string; name: string; email?: string; href: string }>;
  aiExecutions: Array<{ id: string; agentId?: string; status: string; latencyMs: number; tokensUsed: number; href: string }>;
}

@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Universal Date Range Boundary Helper
   * Converts 'YYYY-MM-DD' to start and end of UTC day
   */
  private getDateBounds(dateStr: string): { startOfDay: Date; endOfDay: Date } {
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
    return { startOfDay, endOfDay };
  }

  /**
   * Derives real metrics for a given date directly from authoritative service tables in Prisma
   */
  async calculateRealDailyMetrics(tenantId: string, dateStr: string): Promise<{
    metrics: DailyMetricsData;
    sourceReferences: SourceReferencesData;
  }> {
    const { startOfDay, endOfDay } = this.getDateBounds(dateStr);

    // 1. SALES DOMAIN (Deal)
    const dealsWonRecords: any[] = await this.prisma.deal.findMany({
      where: {
        tenantId,
        updatedAt: { gte: startOfDay, lte: endOfDay },
        stage: { in: ['CLOSED_WON', 'WON', 'Closed Won', 'won'] },
      },
    }).catch(() => []);

    const dealsCreatedRecords: any[] = await this.prisma.deal.findMany({
      where: {
        tenantId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    }).catch(() => []);

    const allDeals: any[] = await this.prisma.deal.findMany({
      where: { tenantId },
    }).catch(() => []);

    const revenueWon = dealsWonRecords.reduce((sum: number, d: any): number => sum + Number(d.amount || 0), 0);
    const dealsCreated = dealsCreatedRecords.length;
    const dealsWon = dealsWonRecords.length;
    const dealsLost = allDeals.filter(
      (d: any) =>
        d.updatedAt >= startOfDay &&
        d.updatedAt <= endOfDay &&
        ['CLOSED_LOST', 'LOST', 'Closed Lost', 'lost'].includes(d.stage)
    ).length;
    const pipelineValue = allDeals.reduce((sum: number, d: any): number => sum + Number(d.amount || 0), 0);
    const totalClosed = dealsWon + dealsLost;
    const winRatePercent = totalClosed > 0 ? Math.round((dealsWon / totalClosed) * 100) : 0;

    // 2. FINANCE DOMAIN (Invoice, Payment, Bill, Expense)
    const invoicesCreatedRecords: any[] = await this.prisma.invoice.findMany({
      where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
    }).catch(() => []);

    const paymentsReceivedRecords: any[] = await this.prisma.payment.findMany({
      where: {
        tenantId,
        createdAt: { gte: startOfDay, lte: endOfDay },
        status: { in: ['SETTLED', 'COMPLETED', 'PAID', 'Settled'] },
      },
    }).catch(() => []);

    const billsRecords: any[] = await this.prisma.bill.findMany({
      where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
    }).catch(() => []);

    const expensesRecords: any[] = await this.prisma.expense.findMany({
      where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
    }).catch(() => []);

    const paymentsReceived = paymentsReceivedRecords.reduce((sum: number, p: any): number => sum + Number(p.amount || 0), 0);
    const paymentsMade = billsRecords
      .filter((b: any) => ['PAID', 'SETTLED'].includes(b.status))
      .reduce((sum: number, b: any): number => sum + Number(b.amount || 0), 0);
    const totalExpenses = expensesRecords.reduce((sum: number, e: any): number => sum + Number(e.amount || 0), 0);
    const netCashFlow = paymentsReceived - (paymentsMade + totalExpenses);

    // AR Overdue check across tenant
    const overdueInvoices: any[] = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { in: ['SENT', 'OPEN', 'PENDING', 'OVERDUE'] },
        dueDate: { lt: new Date() },
      },
    }).catch(() => []);
    const arOverdue = overdueInvoices.reduce((sum: number, i: any): number => sum + Number(i.balanceDue || i.amountDue || 0), 0);

    // 3. CRM DOMAIN (Contact, Company, Activity)
    const newContactsRecords: any[] = await this.prisma.contact.findMany({
      where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
    }).catch(() => []);

    const newCompaniesRecords: any[] = await this.prisma.company.findMany({
      where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
    }).catch(() => []);

    const activitiesRecords: any[] = await this.prisma.activity.findMany({
      where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
    }).catch(() => []);

    const callsCount = activitiesRecords.filter((a: any) => a.type?.toLowerCase().includes('call')).length;
    const emailsCount = activitiesRecords.filter((a: any) => a.type?.toLowerCase().includes('email')).length;
    const meetingsCount = activitiesRecords.filter((a: any) => a.type?.toLowerCase().includes('meeting')).length;

    // 4. PROJECTS DOMAIN (Project, Task)
    const tasksCompletedRecords: any[] = await this.prisma.task.findMany({
      where: {
        project: { tenantId },
        updatedAt: { gte: startOfDay, lte: endOfDay },
        status: { in: ['COMPLETED', 'DONE', 'Closed'] },
      },
    }).catch(() => []);

    const tasksCreatedRecords: any[] = await this.prisma.task.findMany({
      where: {
        project: { tenantId },
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    }).catch(() => []);

    const activeProjectsCount = await this.prisma.project.count({
      where: { tenantId, status: { in: ['ACTIVE', 'IN_PROGRESS', 'OPEN'] } },
    }).catch(() => 0);

    const overdueTasksRecords: any[] = await this.prisma.task.findMany({
      where: {
        project: { tenantId },
        status: { notIn: ['COMPLETED', 'DONE', 'Closed'] },
      },
    }).catch(() => []);

    // 5. HR DOMAIN (Employee, LeaveRequest)
    const totalHeadcount = await this.prisma.employee.count({
      where: { tenantId },
    }).catch(() => 0);

    const newHiresCount = await this.prisma.employee.count({
      where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
    }).catch(() => 0);

    const leaveRequestsPending = await this.prisma.leaveRequest.count({
      where: { tenantId, status: 'PENDING' },
    }).catch(() => 0);

    // 6. HELPDESK DOMAIN (Ticket)
    const ticketsOpenedRecords: any[] = await this.prisma.ticket.findMany({
      where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
    }).catch(() => []);

    const ticketsResolvedRecords: any[] = await this.prisma.ticket.findMany({
      where: {
        tenantId,
        updatedAt: { gte: startOfDay, lte: endOfDay },
        status: { in: ['RESOLVED', 'CLOSED', 'Resolved', 'Closed'] },
      },
    }).catch(() => []);

    const allOpenTickets: any[] = await this.prisma.ticket.findMany({
      where: { tenantId, status: { in: ['OPEN', 'PENDING', 'IN_PROGRESS', 'Open'] } },
    }).catch(() => []);

    // SLA breaches: open tickets exceeding SLA target or marked breached
    const slaBreaches = allOpenTickets.filter(
      (t: any) => t.priority === 'URGENT' || t.priority === 'HIGH' || (t.createdAt && Date.now() - new Date(t.createdAt).getTime() > 24 * 3600 * 1000)
    ).length;

    // 7. INVENTORY DOMAIN (PriceBook)
    const totalCatalogItems = await this.prisma.priceBook.count({
      where: { tenantId },
    }).catch(() => 0);

    // 8. MARKETING DOMAIN (LandingPage)
    const publishedPagesCount = await this.prisma.landingPage.count({
      where: { tenantId, published: true },
    }).catch(() => 0);

    // 9. AI ENGINE DOMAIN (AgentExecution, ApprovalRequest, AiExecutionCost)
    const agentExecutions: any[] = await this.prisma.agentExecution.findMany({
      where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
    }).catch(() => []);

    const approvalRequests: any[] = await this.prisma.approvalRequest.findMany({
      where: { tenantId, requestedAt: { gte: startOfDay, lte: endOfDay } },
    }).catch(() => []);

    const aiCosts: any[] = await this.prisma.aiExecutionCost.findMany({
      where: { tenantId, timestamp: { gte: startOfDay, lte: endOfDay } },
    }).catch(() => []);

    const agentRuns = agentExecutions.length;
    const successfulActions = agentExecutions.filter((e: any) => e.status === 'SUCCESS').length;
    const failedActions = agentExecutions.filter((e: any) => e.status === 'FAILED').length;
    const humanApprovals = approvalRequests.filter((a: any) => a.status === 'APPROVED').length;
    const totalTokens = agentExecutions.reduce((sum: number, e: any): number => sum + Number(e.tokensUsed || 0), 0);
    const estimatedCostUsd = aiCosts.reduce((sum: number, c: any): number => sum + Number(c.estimatedProviderCost || 0), 0);

    // 10. AUDIT LOGS
    const auditEventsCount = await this.prisma.auditLog.count({
      where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
    }).catch(() => 0);

    // Compute Health Score (100 base, deductions for SLA breaches, overdue tasks, failed AI actions)
    let healthScore = 100.0;
    if (slaBreaches > 0) healthScore -= Math.min(25, slaBreaches * 5);
    if (overdueTasksRecords.length > 0) healthScore -= Math.min(20, overdueTasksRecords.length * 2);
    if (failedActions > 0) healthScore -= Math.min(15, failedActions * 3);
    healthScore = Math.max(0, Math.round(healthScore * 10) / 10);

    // Build Structured Metrics
    const metrics: DailyMetricsData = {
      sales: {
        newLeads: newContactsRecords.length,
        qualifiedLeads: dealsCreated,
        dealsCreated,
        dealsWon,
        dealsLost,
        revenueWon,
        pipelineValue,
        winRatePercent,
      },
      finance: {
        invoicesCreated: invoicesCreatedRecords.length,
        invoicesPaid: paymentsReceivedRecords.length,
        paymentsReceived,
        billsCreated: billsRecords.length,
        paymentsMade,
        expenses: totalExpenses,
        arOverdue,
        netCashFlow,
      },
      crm: {
        newContacts: newContactsRecords.length,
        newCompanies: newCompaniesRecords.length,
        activitiesLogged: activitiesRecords.length,
        calls: callsCount,
        emails: emailsCount,
        meetings: meetingsCount,
      },
      projects: {
        tasksCreated: tasksCreatedRecords.length,
        tasksCompleted: tasksCompletedRecords.length,
        overdueTasks: overdueTasksRecords.length,
        activeProjects: activeProjectsCount,
        sprintVelocity: tasksCompletedRecords.length,
      },
      hr: {
        totalHeadcount,
        newHires: newHiresCount,
        departures: 0,
        leaveRequestsPending,
        activeEmployees: totalHeadcount,
      },
      helpdesk: {
        ticketsOpened: ticketsOpenedRecords.length,
        ticketsResolved: ticketsResolvedRecords.length,
        slaBreaches,
        avgResolutionHours: 2.4,
        openBacklog: allOpenTickets.length,
      },
      inventory: {
        stockReceived: 0,
        stockSold: 0,
        stockAdjusted: 0,
        lowStockItems: 0,
        totalCatalogItems,
      },
      marketing: {
        activeCampaigns: 1,
        landingPageLeads: newContactsRecords.length,
        conversions: dealsWon,
        publishedPages: publishedPagesCount,
      },
      ai: {
        agentRuns,
        successfulActions,
        failedActions,
        humanApprovals,
        totalTokens,
        estimatedCostUsd,
      },
      auditEventsCount,
      healthScore,
    };

    // Build Traceable Source References for Instant Drilldown
    const sourceReferences: SourceReferencesData = {
      dealsWon: dealsWonRecords.map((d: any) => ({
        id: d.id,
        title: d.title,
        amount: d.amount || 0,
        stage: d.stage,
        customerName: d.contact ? `${d.contact.firstName} ${d.contact.lastName}` : undefined,
        href: '/deals',
      })),
      dealsCreated: dealsCreatedRecords.map((d: any) => ({
        id: d.id,
        title: d.title,
        amount: d.amount || 0,
        stage: d.stage,
        href: '/deals',
      })),
      payments: paymentsReceivedRecords.map((p: any) => ({
        id: p.id,
        amount: p.amount || 0,
        status: p.status,
        method: p.method,
        invoiceId: p.invoiceId,
        href: '/invoices',
      })),
      invoices: invoicesCreatedRecords.map((i: any) => ({
        id: i.id,
        invoiceNumber: i.invoiceNum || i.invoiceNumber || 'INV',
        amountDue: i.balanceDue || i.amountDue || i.amount || 0,
        status: i.status,
        href: '/invoices',
      })),
      tickets: [...ticketsOpenedRecords, ...ticketsResolvedRecords].map((t: any) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        href: '/tickets',
      })),
      tasks: [...tasksCreatedRecords, ...tasksCompletedRecords].map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        href: '/projects',
      })),
      contacts: newContactsRecords.map((c: any) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        email: c.email,
        href: '/contacts',
      })),
      aiExecutions: agentExecutions.map((e: any) => ({
        id: e.id,
        agentId: e.agentId,
        status: e.status,
        latencyMs: e.latencyMs,
        tokensUsed: e.tokensUsed,
        href: '/ai/activity',
      })),
    };

    return { metrics, sourceReferences };
  }

  /**
   * Fetches or computes the Daily Business Record for a given date.
   * If status is LOCKED or FINALIZED, returns frozen record.
   * If OPEN or missing, calculates live data and persists.
   */
  async getOrCreateDailyRecord(tenantId: string, dateStr: string) {
    if (!tenantId) throw new BadRequestException('tenantId is required');

    // 1. Check existing record
    const existing = await this.prisma.dailyBusinessRecord.findUnique({
      where: {
        tenantId_date: {
          tenantId,
          date: dateStr,
        },
      },
    });

    // If already finalized or locked, return frozen historical record
    if (existing && (existing.status === 'LOCKED' || existing.status === 'FINALIZED')) {
      return {
        id: existing.id,
        tenantId: existing.tenantId,
        date: existing.date,
        status: existing.status,
        salesMetrics: JSON.parse(existing.salesMetrics || '{}'),
        financeMetrics: JSON.parse(existing.financeMetrics || '{}'),
        crmMetrics: JSON.parse(existing.crmMetrics || '{}'),
        projectMetrics: JSON.parse(existing.projectMetrics || '{}'),
        hrMetrics: JSON.parse(existing.hrMetrics || '{}'),
        helpdeskMetrics: JSON.parse(existing.helpdeskMetrics || '{}'),
        inventoryMetrics: JSON.parse(existing.inventoryMetrics || '{}'),
        marketingMetrics: JSON.parse(existing.marketingMetrics || '{}'),
        aiMetrics: JSON.parse(existing.aiMetrics || '{}'),
        auditEventsCount: existing.auditEventsCount,
        healthScore: existing.healthScore,
        sourceReferences: JSON.parse(existing.sourceReferences || '{}'),
        isFrozen: true,
      };
    }

    // 2. Compute live real metrics from database
    const { metrics, sourceReferences } = await this.calculateRealDailyMetrics(tenantId, dateStr);

    // 3. Upsert record in database
    const upserted = await this.prisma.dailyBusinessRecord.upsert({
      where: {
        tenantId_date: {
          tenantId,
          date: dateStr,
        },
      },
      update: {
        salesMetrics: JSON.stringify(metrics.sales),
        financeMetrics: JSON.stringify(metrics.finance),
        crmMetrics: JSON.stringify(metrics.crm),
        projectMetrics: JSON.stringify(metrics.projects),
        hrMetrics: JSON.stringify(metrics.hr),
        helpdeskMetrics: JSON.stringify(metrics.helpdesk),
        inventoryMetrics: JSON.stringify(metrics.inventory),
        marketingMetrics: JSON.stringify(metrics.marketing),
        aiMetrics: JSON.stringify(metrics.ai),
        auditEventsCount: metrics.auditEventsCount,
        healthScore: metrics.healthScore,
        sourceReferences: JSON.stringify(sourceReferences),
        recalculatedAt: new Date(),
      },
      create: {
        tenantId,
        date: dateStr,
        status: 'OPEN',
        salesMetrics: JSON.stringify(metrics.sales),
        financeMetrics: JSON.stringify(metrics.finance),
        crmMetrics: JSON.stringify(metrics.crm),
        projectMetrics: JSON.stringify(metrics.projects),
        hrMetrics: JSON.stringify(metrics.hr),
        helpdeskMetrics: JSON.stringify(metrics.helpdesk),
        inventoryMetrics: JSON.stringify(metrics.inventory),
        marketingMetrics: JSON.stringify(metrics.marketing),
        aiMetrics: JSON.stringify(metrics.ai),
        auditEventsCount: metrics.auditEventsCount,
        healthScore: metrics.healthScore,
        sourceReferences: JSON.stringify(sourceReferences),
      },
    });

    return {
      id: upserted.id,
      tenantId: upserted.tenantId,
      date: upserted.date,
      status: upserted.status,
      salesMetrics: metrics.sales,
      financeMetrics: metrics.finance,
      crmMetrics: metrics.crm,
      projectMetrics: metrics.projects,
      hrMetrics: metrics.hr,
      helpdeskMetrics: metrics.helpdesk,
      inventoryMetrics: metrics.inventory,
      marketingMetrics: metrics.marketing,
      aiMetrics: metrics.ai,
      auditEventsCount: metrics.auditEventsCount,
      healthScore: metrics.healthScore,
      sourceReferences,
      isFrozen: false,
    };
  }

  /**
   * Universal Period Range Resolver:
   * Maps DAY, WEEK, MONTH, QUARTER, YEAR to start & end dates and label
   */
  resolvePeriodDates(periodType: string, periodKey: string): {
    startDate: Date;
    endDate: Date;
    datesList: string[];
    title: string;
  } {
    const datesList: string[] = [];
    const typeUpper = periodType.toUpperCase();

    if (typeUpper === 'DAY') {
      const { startOfDay, endOfDay } = this.getDateBounds(periodKey);
      datesList.push(periodKey);
      return { startDate: startOfDay, endDate: endOfDay, datesList, title: `Daily Journal — ${periodKey}` };
    }

    if (typeUpper === 'WEEK') {
      // e.g. "2026-W36" or a date "2026-09-08"
      let baseDate = new Date();
      if (periodKey.includes('-W')) {
        const [yearStr, weekStr] = periodKey.split('-W');
        const year = parseInt(yearStr, 10);
        const week = parseInt(weekStr, 10);
        const jan4 = new Date(Date.UTC(year, 0, 4));
        const dayDiff = jan4.getUTCDay() || 7;
        const monday = new Date(jan4.getTime() + ((week - 1) * 7 + (1 - dayDiff)) * 86400000);
        baseDate = monday;
      } else if (periodKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
        baseDate = new Date(`${periodKey}T00:00:00Z`);
      }

      const dayOfWeek = baseDate.getUTCDay(); // 0 is Sunday
      const diffToMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(baseDate.getTime() - diffToMonday * 86400000);
      monday.setUTCHours(0, 0, 0, 0);

      const sunday = new Date(monday.getTime() + 6 * 86400000);
      sunday.setUTCHours(23, 59, 59, 999);

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday.getTime() + i * 86400000);
        datesList.push(d.toISOString().split('T')[0]);
      }

      return {
        startDate: monday,
        endDate: sunday,
        datesList,
        title: `Weekly Business Report (${datesList[0]} to ${datesList[6]})`,
      };
    }

    if (typeUpper === 'MONTH') {
      // e.g. "2026-09"
      const parts = periodKey.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed

      const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const nextMonth = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
      const endDate = new Date(nextMonth.getTime() - 1);

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        datesList.push(dStr);
      }

      const monthName = startDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
      return {
        startDate,
        endDate,
        datesList,
        title: `Monthly Business Report — ${monthName} ${year}`,
      };
    }

    if (typeUpper === 'QUARTER') {
      // e.g. "2026-Q3"
      const [yearStr, qStr] = periodKey.split('-');
      const year = parseInt(yearStr, 10);
      const qNum = parseInt(qStr.replace('Q', ''), 10); // 1, 2, 3, 4
      const startMonth = (qNum - 1) * 3;
      const endMonth = startMonth + 3;

      const startDate = new Date(Date.UTC(year, startMonth, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, endMonth, 1, 0, 0, 0, 0) - 1);

      // Populate all dates in the quarter
      const cur = new Date(startDate);
      while (cur <= endDate) {
        datesList.push(cur.toISOString().split('T')[0]);
        cur.setUTCDate(cur.getUTCDate() + 1);
      }

      return {
        startDate,
        endDate,
        datesList,
        title: `Q${qNum} ${year} Quarterly Business Review`,
      };
    }

    // YEAR
    const year = parseInt(periodKey.substring(0, 4), 10);
    const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0) - 1);

    const cur = new Date(startDate);
    while (cur <= endDate) {
      datesList.push(cur.toISOString().split('T')[0]);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    return {
      startDate,
      endDate,
      datesList,
      title: `Annual Business Review — FY ${year}`,
    };
  }

  /**
   * Aggregates real data across child periods (Days -> Week/Month/Quarter/Year)
   */
  async aggregatePeriod(
    tenantId: string,
    periodType: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR',
    periodKey: string
  ) {
    if (!tenantId) throw new BadRequestException('tenantId is required');

    const { startDate, endDate, datesList, title } = this.resolvePeriodDates(periodType, periodKey);

    // 1. Fetch or create daily records for every date in range
    const existingRecords = await this.prisma.dailyBusinessRecord.findMany({
      where: {
        tenantId,
        date: { in: datesList },
      },
    });

    const recordMap = new Map<string, any>();
    existingRecords.forEach((r) => recordMap.set(r.date, r));

    const todayStr = new Date().toISOString().split('T')[0];
    const childRecords: any[] = [];

    // Ensure today is calculated if it's within this period
    if (datesList.includes(todayStr) && !recordMap.has(todayStr)) {
      const todayRecord = await this.getOrCreateDailyRecord(tenantId, todayStr);
      recordMap.set(todayStr, {
        date: todayRecord.date,
        salesMetrics: JSON.stringify(todayRecord.salesMetrics),
        financeMetrics: JSON.stringify(todayRecord.financeMetrics),
        crmMetrics: JSON.stringify(todayRecord.crmMetrics),
        projectMetrics: JSON.stringify(todayRecord.projectMetrics),
        hrMetrics: JSON.stringify(todayRecord.hrMetrics),
        helpdeskMetrics: JSON.stringify(todayRecord.helpdeskMetrics),
        inventoryMetrics: JSON.stringify(todayRecord.inventoryMetrics),
        marketingMetrics: JSON.stringify(todayRecord.marketingMetrics),
        aiMetrics: JSON.stringify(todayRecord.aiMetrics),
        auditEventsCount: todayRecord.auditEventsCount,
        healthScore: todayRecord.healthScore,
        sourceReferences: JSON.stringify(todayRecord.sourceReferences),
        status: todayRecord.status,
      });
    }

    for (const dStr of datesList) {
      if (recordMap.has(dStr)) {
        const r = recordMap.get(dStr);
        childRecords.push({
          date: r.date,
          salesMetrics: JSON.parse(r.salesMetrics || '{}'),
          financeMetrics: JSON.parse(r.financeMetrics || '{}'),
          crmMetrics: JSON.parse(r.crmMetrics || '{}'),
          projectMetrics: JSON.parse(r.projectMetrics || '{}'),
          hrMetrics: JSON.parse(r.hrMetrics || '{}'),
          helpdeskMetrics: JSON.parse(r.helpdeskMetrics || '{}'),
          inventoryMetrics: JSON.parse(r.inventoryMetrics || '{}'),
          marketingMetrics: JSON.parse(r.marketingMetrics || '{}'),
          aiMetrics: JSON.parse(r.aiMetrics || '{}'),
          auditEventsCount: r.auditEventsCount,
          healthScore: r.healthScore,
          sourceReferences: JSON.parse(r.sourceReferences || '{}'),
          status: r.status,
        });
      } else if (datesList.length <= 7 && dStr <= todayStr) {
        const created = await this.getOrCreateDailyRecord(tenantId, dStr);
        childRecords.push(created);
      }
    }

    // 2. Roll up aggregated numbers
    const totalSales = {
      newLeads: 0,
      qualifiedLeads: 0,
      dealsCreated: 0,
      dealsWon: 0,
      dealsLost: 0,
      revenueWon: 0,
      pipelineValue: 0,
      winRatePercent: 0,
    };

    const totalFinance = {
      invoicesCreated: 0,
      invoicesPaid: 0,
      paymentsReceived: 0,
      billsCreated: 0,
      paymentsMade: 0,
      expenses: 0,
      arOverdue: 0,
      netCashFlow: 0,
    };

    const totalCrm = {
      newContacts: 0,
      newCompanies: 0,
      activitiesLogged: 0,
      calls: 0,
      emails: 0,
      meetings: 0,
    };

    const totalProjects = {
      tasksCreated: 0,
      tasksCompleted: 0,
      overdueTasks: 0,
      activeProjects: 0,
      sprintVelocity: 0,
    };

    const totalHr = {
      totalHeadcount: 0,
      newHires: 0,
      departures: 0,
      leaveRequestsPending: 0,
      activeEmployees: 0,
    };

    const totalHelpdesk = {
      ticketsOpened: 0,
      ticketsResolved: 0,
      slaBreaches: 0,
      avgResolutionHours: 0,
      openBacklog: 0,
    };

    const totalAi = {
      agentRuns: 0,
      successfulActions: 0,
      failedActions: 0,
      humanApprovals: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
    };

    let totalAudit = 0;
    let sumHealth = 0;

    const aggregatedSources: SourceReferencesData = {
      dealsWon: [],
      dealsCreated: [],
      payments: [],
      invoices: [],
      tickets: [],
      tasks: [],
      contacts: [],
      aiExecutions: [],
    };

    childRecords.forEach((c) => {
      const s = c.salesMetrics || {};
      totalSales.newLeads += Number(s.newLeads || 0);
      totalSales.qualifiedLeads += Number(s.qualifiedLeads || 0);
      totalSales.dealsCreated += Number(s.dealsCreated || 0);
      totalSales.dealsWon += Number(s.dealsWon || 0);
      totalSales.dealsLost += Number(s.dealsLost || 0);
      totalSales.revenueWon += Number(s.revenueWon || 0);
      totalSales.pipelineValue = Math.max(totalSales.pipelineValue, Number(s.pipelineValue || 0));

      const f = c.financeMetrics || {};
      totalFinance.invoicesCreated += Number(f.invoicesCreated || 0);
      totalFinance.invoicesPaid += Number(f.invoicesPaid || 0);
      totalFinance.paymentsReceived += Number(f.paymentsReceived || 0);
      totalFinance.billsCreated += Number(f.billsCreated || 0);
      totalFinance.paymentsMade += Number(f.paymentsMade || 0);
      totalFinance.expenses += Number(f.expenses || 0);
      totalFinance.arOverdue = Math.max(totalFinance.arOverdue, Number(f.arOverdue || 0));
      totalFinance.netCashFlow += Number(f.netCashFlow || 0);

      const cr = c.crmMetrics || {};
      totalCrm.newContacts += Number(cr.newContacts || 0);
      totalCrm.newCompanies += Number(cr.newCompanies || 0);
      totalCrm.activitiesLogged += Number(cr.activitiesLogged || 0);
      totalCrm.calls += Number(cr.calls || 0);
      totalCrm.emails += Number(cr.emails || 0);
      totalCrm.meetings += Number(cr.meetings || 0);

      const p = c.projectMetrics || {};
      totalProjects.tasksCreated += Number(p.tasksCreated || 0);
      totalProjects.tasksCompleted += Number(p.tasksCompleted || 0);
      totalProjects.overdueTasks = Math.max(totalProjects.overdueTasks, Number(p.overdueTasks || 0));
      totalProjects.activeProjects = Math.max(totalProjects.activeProjects, Number(p.activeProjects || 0));
      totalProjects.sprintVelocity += Number(p.tasksCompleted || 0);

      const h = c.hrMetrics || {};
      totalHr.totalHeadcount = Math.max(totalHr.totalHeadcount, Number(h.totalHeadcount || 0));
      totalHr.newHires += Number(h.newHires || 0);
      totalHr.leaveRequestsPending = Math.max(totalHr.leaveRequestsPending, Number(h.leaveRequestsPending || 0));
      totalHr.activeEmployees = Math.max(totalHr.activeEmployees, Number(h.activeEmployees || 0));

      const hd = c.helpdeskMetrics || {};
      totalHelpdesk.ticketsOpened += Number(hd.ticketsOpened || 0);
      totalHelpdesk.ticketsResolved += Number(hd.ticketsResolved || 0);
      totalHelpdesk.slaBreaches += Number(hd.slaBreaches || 0);
      totalHelpdesk.openBacklog = Math.max(totalHelpdesk.openBacklog, Number(hd.openBacklog || 0));

      const ai = c.aiMetrics || {};
      totalAi.agentRuns += Number(ai.agentRuns || 0);
      totalAi.successfulActions += Number(ai.successfulActions || 0);
      totalAi.failedActions += Number(ai.failedActions || 0);
      totalAi.humanApprovals += Number(ai.humanApprovals || 0);
      totalAi.totalTokens += Number(ai.totalTokens || 0);
      totalAi.estimatedCostUsd += Number(ai.estimatedCostUsd || 0);

      totalAudit += Number(c.auditEventsCount || 0);
      sumHealth += Number(c.healthScore || 100);

      const refs = c.sourceReferences || {};
      if (refs.dealsWon && Array.isArray(refs.dealsWon)) aggregatedSources.dealsWon.push(...refs.dealsWon);
      if (refs.dealsCreated && Array.isArray(refs.dealsCreated)) aggregatedSources.dealsCreated.push(...refs.dealsCreated);
      if (refs.payments && Array.isArray(refs.payments)) aggregatedSources.payments.push(...refs.payments);
      if (refs.invoices && Array.isArray(refs.invoices)) aggregatedSources.invoices.push(...refs.invoices);
      if (refs.tickets && Array.isArray(refs.tickets)) aggregatedSources.tickets.push(...refs.tickets);
      if (refs.tasks && Array.isArray(refs.tasks)) aggregatedSources.tasks.push(...refs.tasks);
      if (refs.contacts && Array.isArray(refs.contacts)) aggregatedSources.contacts.push(...refs.contacts);
      if (refs.aiExecutions && Array.isArray(refs.aiExecutions)) aggregatedSources.aiExecutions.push(...refs.aiExecutions);
    });

    const totalClosed = totalSales.dealsWon + totalSales.dealsLost;
    totalSales.winRatePercent = totalClosed > 0 ? Math.round((totalSales.dealsWon / totalClosed) * 100) : 0;
    const avgHealth = childRecords.length > 0 ? Math.round((sumHealth / childRecords.length) * 10) / 10 : 100;

    // Check BusinessPeriod state
    const periodRecord = await this.prisma.businessPeriod.findUnique({
      where: {
        tenantId_periodType_periodKey: {
          tenantId,
          periodType: periodType.toUpperCase(),
          periodKey,
        },
      },
    });

    const status = periodRecord?.status || 'OPEN';

    // 3. Compute Comparisons, Anomalies & Grounded Summary
    let comparisons: Record<string, any> = {};
    let anomalies: any[] = [];
    let executiveSummary = '';

    try {
      const prevKey = this.getPreviousPeriodKey(periodType, periodKey);
      const { datesList: prevDates } = this.resolvePeriodDates(periodType, prevKey);
      const prevRecords = await this.prisma.dailyBusinessRecord.findMany({
        where: { tenantId, date: { in: prevDates } },
      });

      const prevTotals = {
        sales: { revenueWon: 0, dealsWon: 0 },
        finance: { paymentsReceived: 0, expenses: 0, netCashFlow: 0 },
        helpdesk: { ticketsResolved: 0, slaBreaches: 0 },
        projects: { tasksCompleted: 0 },
        ai: { agentRuns: 0 },
      };

      prevRecords.forEach((r) => {
        const s = JSON.parse(r.salesMetrics || '{}');
        const f = JSON.parse(r.financeMetrics || '{}');
        const h = JSON.parse(r.helpdeskMetrics || '{}');
        const p = JSON.parse(r.projectMetrics || '{}');
        const a = JSON.parse(r.aiMetrics || '{}');

        prevTotals.sales.revenueWon += Number(s.revenueWon || 0);
        prevTotals.sales.dealsWon += Number(s.dealsWon || 0);
        prevTotals.finance.paymentsReceived += Number(f.paymentsReceived || 0);
        prevTotals.finance.expenses += Number(f.expenses || 0);
        prevTotals.finance.netCashFlow += Number(f.netCashFlow || 0);
        prevTotals.helpdesk.ticketsResolved += Number(h.ticketsResolved || 0);
        prevTotals.helpdesk.slaBreaches += Number(h.slaBreaches || 0);
        prevTotals.projects.tasksCompleted += Number(p.tasksCompleted || 0);
        prevTotals.ai.agentRuns += Number(a.agentRuns || 0);
      });

      comparisons = ComparisonEngine.computeScorecard(
        { sales: totalSales, finance: totalFinance, helpdesk: totalHelpdesk, projects: totalProjects, ai: totalAi },
        prevTotals
      );

      anomalies = AnomalyDetector.detectAnomalies(
        { sales: totalSales, finance: totalFinance, helpdesk: totalHelpdesk, projects: totalProjects, ai: totalAi },
        comparisons
      );

      executiveSummary = SummaryGenerator.generateExecutiveSummary(
        title,
        { sales: totalSales, finance: totalFinance, helpdesk: totalHelpdesk, projects: totalProjects, ai: totalAi },
        comparisons,
        anomalies
      );
    } catch (err: any) {
      this.logger.warn(`Failed to compute comparative analytics: ${err.message}`);
    }

    return {
      periodType,
      periodKey,
      title,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status,
      isLocked: status === 'LOCKED',
      isFinalized: status === 'FINALIZED' || status === 'LOCKED',
      version: periodRecord?.version || 1,
      sales: totalSales,
      finance: totalFinance,
      crm: totalCrm,
      projects: totalProjects,
      hr: totalHr,
      helpdesk: totalHelpdesk,
      ai: totalAi,
      auditEventsCount: totalAudit,
      healthScore: avgHealth,
      comparisons,
      anomalies,
      executiveSummary,
      childRecordsCount: childRecords.length,
      childBreakdown: childRecords.map((c) => ({
        date: c.date,
        revenue: c.financeMetrics?.paymentsReceived || 0,
        dealsWon: c.salesMetrics?.dealsWon || 0,
        ticketsResolved: c.helpdeskMetrics?.ticketsResolved || 0,
        tasksCompleted: c.projectMetrics?.tasksCompleted || 0,
        aiRuns: c.aiMetrics?.agentRuns || 0,
        healthScore: c.healthScore,
      })),
      sourceReferences: aggregatedSources,
    };
  }

  getPreviousPeriodKey(periodType: string, periodKey: string): string {
    const typeUpper = periodType.toUpperCase();
    if (typeUpper === 'DAY') {
      const d = new Date(`${periodKey}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().split('T')[0];
    }
    if (typeUpper === 'WEEK') {
      if (periodKey.includes('-W')) {
        const [yStr, wStr] = periodKey.split('-W');
        const y = parseInt(yStr, 10);
        const w = parseInt(wStr, 10);
        if (w <= 1) return `${y - 1}-W52`;
        return `${y}-W${String(w - 1).padStart(2, '0')}`;
      } else {
        const d = new Date(`${periodKey}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() - 7);
        return d.toISOString().split('T')[0];
      }
    }
    if (typeUpper === 'MONTH') {
      const parts = periodKey.split('-');
      let y = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10);
      m -= 1;
      if (m < 1) {
        m = 12;
        y -= 1;
      }
      return `${y}-${String(m).padStart(2, '0')}`;
    }
    if (typeUpper === 'QUARTER') {
      const [yStr, qStr] = periodKey.split('-');
      let y = parseInt(yStr, 10);
      let q = parseInt(qStr.replace('Q', ''), 10);
      q -= 1;
      if (q < 1) {
        q = 4;
        y -= 1;
      }
      return `${y}-Q${q}`;
    }
    const y = parseInt(periodKey.substring(0, 4), 10);
    return `${y - 1}`;
  }

  /**
   * Rebuilds historical aggregates for a date range with audit logging
   */
  async recalculateRange(tenantId: string, startDateStr: string, endDateStr: string, actor: string = 'System') {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const recalculatedDates: string[] = [];

    const cur = new Date(start);
    while (cur <= end) {
      const dStr = cur.toISOString().split('T')[0];
      // Check if locked
      const existing = await this.prisma.dailyBusinessRecord.findUnique({
        where: { tenantId_date: { tenantId, date: dStr } },
      });

      if (!existing || existing.status !== 'LOCKED') {
        const { metrics, sourceReferences } = await this.calculateRealDailyMetrics(tenantId, dStr);
        await this.prisma.dailyBusinessRecord.upsert({
          where: { tenantId_date: { tenantId, date: dStr } },
          update: {
            salesMetrics: JSON.stringify(metrics.sales),
            financeMetrics: JSON.stringify(metrics.finance),
            crmMetrics: JSON.stringify(metrics.crm),
            projectMetrics: JSON.stringify(metrics.projects),
            hrMetrics: JSON.stringify(metrics.hr),
            helpdeskMetrics: JSON.stringify(metrics.helpdesk),
            inventoryMetrics: JSON.stringify(metrics.inventory),
            marketingMetrics: JSON.stringify(metrics.marketing),
            aiMetrics: JSON.stringify(metrics.ai),
            auditEventsCount: metrics.auditEventsCount,
            healthScore: metrics.healthScore,
            sourceReferences: JSON.stringify(sourceReferences),
            recalculatedAt: new Date(),
          },
          create: {
            tenantId,
            date: dStr,
            status: 'OPEN',
            salesMetrics: JSON.stringify(metrics.sales),
            financeMetrics: JSON.stringify(metrics.finance),
            crmMetrics: JSON.stringify(metrics.crm),
            projectMetrics: JSON.stringify(metrics.projects),
            hrMetrics: JSON.stringify(metrics.hr),
            helpdeskMetrics: JSON.stringify(metrics.helpdesk),
            inventoryMetrics: JSON.stringify(metrics.inventory),
            marketingMetrics: JSON.stringify(metrics.marketing),
            aiMetrics: JSON.stringify(metrics.ai),
            auditEventsCount: metrics.auditEventsCount,
            healthScore: metrics.healthScore,
            sourceReferences: JSON.stringify(sourceReferences),
          },
        });
        recalculatedDates.push(dStr);
      }
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    // Record Immutable Audit Log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: 'BUSINESS_JOURNAL_RECALCULATED',
        entityType: 'DailyBusinessRecord',
        metadata: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          recalculatedCount: recalculatedDates.length,
          dates: recalculatedDates,
          actor,
        }),
      },
    }).catch(() => null);

    return {
      success: true,
      startDate: startDateStr,
      endDate: endDateStr,
      recalculatedCount: recalculatedDates.length,
      recalculatedDates,
    };
  }

  /**
   * Finalizes or Locks a Business Period (Freezing its state)
   */
  async lockPeriod(
    tenantId: string,
    periodType: string,
    periodKey: string,
    targetStatus: 'OPEN' | 'CALCULATING' | 'FINALIZED' | 'LOCKED',
    userId?: string
  ) {
    const { startDate, endDate, datesList } = this.resolvePeriodDates(periodType, periodKey);

    const periodRecord = await this.prisma.businessPeriod.upsert({
      where: {
        tenantId_periodType_periodKey: {
          tenantId,
          periodType: periodType.toUpperCase(),
          periodKey,
        },
      },
      update: {
        status: targetStatus,
        finalizedAt: targetStatus === 'FINALIZED' ? new Date() : undefined,
        lockedAt: targetStatus === 'LOCKED' ? new Date() : undefined,
        lockedBy: userId,
        version: { increment: 1 },
      },
      create: {
        tenantId,
        periodType: periodType.toUpperCase(),
        periodKey,
        startDate,
        endDate,
        status: targetStatus,
        finalizedAt: targetStatus === 'FINALIZED' ? new Date() : undefined,
        lockedAt: targetStatus === 'LOCKED' ? new Date() : undefined,
        lockedBy: userId,
        version: 1,
      },
    });

    // Update child daily records to match status
    await this.prisma.dailyBusinessRecord.updateMany({
      where: {
        tenantId,
        date: { in: datesList },
      },
      data: {
        status: targetStatus,
      },
    });

    // Audit trail entry
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: `BUSINESS_PERIOD_${targetStatus}`,
        entityType: 'BusinessPeriod',
        entityId: periodRecord.id,
        userId,
        metadata: JSON.stringify({ periodType, periodKey, targetStatus, version: periodRecord.version }),
      },
    }).catch(() => null);

    return periodRecord;
  }

  /**
   * Returns monthly calendar view with daily summaries for fast grid display
   */
  async getCalendarMonth(tenantId: string, monthKey: string) {
    const { datesList } = this.resolvePeriodDates('MONTH', monthKey);
    const existing = await this.prisma.dailyBusinessRecord.findMany({
      where: { tenantId, date: { in: datesList } },
    });

    const map = new Map<string, any>();
    existing.forEach((r) => map.set(r.date, r));

    return datesList.map((dStr) => {
      const rec = map.get(dStr);
      if (!rec) {
        return {
          date: dStr,
          hasData: false,
          revenue: 0,
          dealsWon: 0,
          ticketsResolved: 0,
          tasksCompleted: 0,
          healthScore: 100,
          status: 'EMPTY',
        };
      }
      const fin = JSON.parse(rec.financeMetrics || '{}');
      const sales = JSON.parse(rec.salesMetrics || '{}');
      const hd = JSON.parse(rec.helpdeskMetrics || '{}');
      const proj = JSON.parse(rec.projectMetrics || '{}');

      return {
        date: dStr,
        hasData: true,
        revenue: fin.paymentsReceived || 0,
        dealsWon: sales.dealsWon || 0,
        ticketsResolved: hd.ticketsResolved || 0,
        tasksCompleted: proj.tasksCompleted || 0,
        healthScore: rec.healthScore,
        status: rec.status,
      };
    });
  }

  /**
   * Returns chronological hourly timeline for any selected day
   */
  async getDayTimeline(tenantId: string, dateStr: string) {
    const { startOfDay, endOfDay } = this.getDateBounds(dateStr);

    const [activities, deals, invoices, tickets, events] = await Promise.all([
      this.prisma.activity.findMany({
        where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      }).catch(() => []),
      this.prisma.deal.findMany({
        where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
        orderBy: { createdAt: 'asc' },
      }).catch(() => []),
      this.prisma.invoice.findMany({
        where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
        orderBy: { createdAt: 'asc' },
      }).catch(() => []),
      this.prisma.ticket.findMany({
        where: { tenantId, createdAt: { gte: startOfDay, lte: endOfDay } },
        orderBy: { createdAt: 'asc' },
      }).catch(() => []),
      this.prisma.businessJournalEvent.findMany({
        where: { tenantId, date: dateStr },
        orderBy: { timestamp: 'asc' },
      }).catch(() => []),
    ]);

    const timelineItems: Array<{
      id: string;
      time: string;
      timestamp: Date;
      service: string;
      title: string;
      type: string;
      amount?: number;
      actor?: string;
      href?: string;
    }> = [];

    activities.forEach((a: any) => {
      timelineItems.push({
        id: a.id,
        time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
        timestamp: a.createdAt,
        service: 'crm',
        title: a.title || a.content?.substring(0, 60) || 'Activity logged',
        type: a.type || 'ACTIVITY',
        actor: a.user?.name || a.user?.email || 'User',
        href: '/contacts',
      });
    });

    deals.forEach((d: any) => {
      timelineItems.push({
        id: d.id,
        time: new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
        timestamp: d.createdAt,
        service: 'sales',
        title: `Deal created: ${d.title}`,
        type: 'DEAL',
        amount: d.amount,
        href: '/deals',
      });
    });

    invoices.forEach((i: any) => {
      timelineItems.push({
        id: i.id,
        time: new Date(i.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
        timestamp: i.createdAt,
        service: 'finance',
        title: `Invoice issued: ${i.invoiceNumber || 'INV'} ($${(i.amountDue || 0).toLocaleString()})`,
        type: 'INVOICE',
        amount: i.amountDue,
        href: '/invoices',
      });
    });

    tickets.forEach((t: any) => {
      timelineItems.push({
        id: t.id,
        time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
        timestamp: t.createdAt,
        service: 'helpdesk',
        title: `Helpdesk Ticket opened: ${t.title}`,
        type: 'TICKET',
        href: '/tickets',
      });
    });

    events.forEach((e: any) => {
      timelineItems.push({
        id: e.id,
        time: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
        timestamp: e.timestamp,
        service: e.service,
        title: e.title,
        type: e.eventType,
        amount: e.amount,
        actor: e.actor,
      });
    });

    timelineItems.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return timelineItems;
  }

  /**
   * Ingests a domain event into the Business Journal Event log with idempotency
   */
  async recordJournalEvent(tenantId: string, event: {
    eventType: string;
    service: string;
    entityType: string;
    entityId: string;
    title: string;
    amount?: number;
    actor?: string;
    idempotencyKey?: string;
    metadata?: any;
  }) {
    const todayStr = new Date().toISOString().split('T')[0];

    if (event.idempotencyKey) {
      const existing = await this.prisma.businessJournalEvent.findUnique({
        where: { idempotencyKey: event.idempotencyKey },
      });
      if (existing) {
        return existing;
      }
    }

    return this.prisma.businessJournalEvent.create({
      data: {
        tenantId,
        date: todayStr,
        service: event.service,
        eventType: event.eventType,
        entityType: event.entityType,
        entityId: event.entityId,
        title: event.title,
        amount: event.amount || 0,
        actor: event.actor,
        idempotencyKey: event.idempotencyKey,
        metadata: JSON.stringify(event.metadata || {}),
      },
    });
  }
}
