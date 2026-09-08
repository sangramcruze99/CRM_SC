import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JournalService } from '../journal/journal.service';
import { ComparisonEngine } from '../analytics/comparison.engine';
import { AnomalyDetector } from '../analytics/anomaly.detector';
import { SummaryGenerator } from '../analytics/summary.generator';

export interface GenerateReportInput {
  title?: string;
  periodType: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  periodKey?: string;
  startDate?: string;
  endDate?: string;
  format?: 'JSON' | 'PDF' | 'XLSX' | 'CSV';
  autoArchiveVault?: boolean;
  generatedBy?: string;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly journalService: JournalService
  ) {}

  /**
   * Helper to resolve prior period key for comparison
   */
  private resolvePriorPeriodKey(periodType: string, periodKey: string): string {
    const typeUpper = periodType.toUpperCase();
    if (typeUpper === 'MONTH') {
      const [yearStr, monthStr] = periodKey.split('-');
      let year = parseInt(yearStr, 10);
      let month = parseInt(monthStr, 10) - 1;
      if (month < 1) {
        month = 12;
        year -= 1;
      }
      return `${year}-${String(month).padStart(2, '0')}`;
    }
    if (typeUpper === 'QUARTER') {
      const [yearStr, qStr] = periodKey.split('-');
      let year = parseInt(yearStr, 10);
      let q = parseInt(qStr.replace('Q', ''), 10) - 1;
      if (q < 1) {
        q = 4;
        year -= 1;
      }
      return `${year}-Q${q}`;
    }
    if (typeUpper === 'YEAR') {
      const year = parseInt(periodKey.substring(0, 4), 10);
      return String(year - 1);
    }
    if (typeUpper === 'DAY') {
      const d = new Date(periodKey);
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().split('T')[0];
    }
    return periodKey;
  }

  /**
   * Generates and freezes an official ReportRun record
   */
  async generateReport(tenantId: string, input: GenerateReportInput) {
    if (!tenantId) throw new BadRequestException('tenantId is required');

    const periodType = input.periodType.toUpperCase() as any;
    let periodKey = input.periodKey;
    if (!periodKey && input.startDate) {
      const dStr = input.startDate.split('T')[0];
      if (periodType === 'DAY' || periodType === 'WEEK') periodKey = dStr;
      else if (periodType === 'MONTH') periodKey = dStr.substring(0, 7);
      else if (periodType === 'QUARTER') {
        const [y, mStr] = dStr.split('-');
        const q = Math.ceil(parseInt(mStr, 10) / 3);
        periodKey = `${y}-Q${q}`;
      } else {
        periodKey = dStr.substring(0, 4);
      }
    }
    if (!periodKey) {
      periodKey = new Date().toISOString().substring(0, 7);
    }
    const format = input.format || 'JSON';
    const generatedBy = input.generatedBy || 'Executive System';

    // 1. Fetch current period real metrics
    const currentPeriodData = await this.journalService.aggregatePeriod(tenantId, periodType, periodKey);

    // 2. Fetch prior period metrics for comparative intelligence
    const priorPeriodKey = this.resolvePriorPeriodKey(periodType, periodKey);
    let priorPeriodData: any = {};
    try {
      priorPeriodData = await this.journalService.aggregatePeriod(tenantId, periodType, priorPeriodKey);
    } catch {
      // no prior data
    }

    // 3. Compute comparisons
    const comparisons = ComparisonEngine.computeScorecard(currentPeriodData, priorPeriodData);

    // 4. Detect anomalies
    const anomalies = AnomalyDetector.detectAnomalies(currentPeriodData, comparisons);

    // 5. Generate grounded executive summary
    const executiveSummary = SummaryGenerator.generateExecutiveSummary(
      currentPeriodData.title,
      currentPeriodData,
      comparisons,
      anomalies
    );

    const reportTitle = input.title || `${currentPeriodData.title} Official Audit Report`;

    // 6. Check existing report runs for versioning
    const existingRuns = await this.prisma.reportRun.findMany({
      where: {
        tenantId,
        periodType,
        periodKey,
      },
      orderBy: { version: 'desc' },
      take: 1,
    });

    const nextVersion = existingRuns.length > 0 ? existingRuns[0].version + 1 : 1;

    // 7. Persist official ReportRun snapshot
    const reportRun = await this.prisma.reportRun.create({
      data: {
        tenantId,
        title: reportTitle,
        periodType,
        periodKey,
        startDate: new Date(currentPeriodData.startDate),
        endDate: new Date(currentPeriodData.endDate),
        format,
        status: 'COMPLETED',
        executiveSummary,
        anomalies: JSON.stringify(anomalies),
        metricsSnapshot: JSON.stringify(currentPeriodData),
        comparisons: JSON.stringify(comparisons),
        version: nextVersion,
        generatedBy,
      },
    });

    // 8. Central Document Vault Archival
    if (input.autoArchiveVault !== false) {
      try {
        const vaultDoc = await this.archiveToDocumentVault(tenantId, reportRun, currentPeriodData, comparisons, executiveSummary);
        if (vaultDoc) {
          await this.prisma.reportRun.update({
            where: { id: reportRun.id },
            data: {
              documentVaultId: vaultDoc.id,
              vaultStorageKey: vaultDoc.storageKey,
            },
          });
          (reportRun as any).documentVaultId = vaultDoc.id;
        }
      } catch (err: any) {
        this.logger.warn(`Failed auto-archiving report to Document Vault: ${err.message}`);
      }
    }

    // 9. Record Immutable Audit Trail
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: 'BUSINESS_REPORT_GENERATED',
        entityType: 'ReportRun',
        entityId: reportRun.id,
        metadata: JSON.stringify({
          periodType,
          periodKey,
          version: nextVersion,
          format,
          generatedBy,
        }),
      },
    }).catch(() => null);

    return {
      id: reportRun.id,
      title: reportRun.title,
      periodType: reportRun.periodType,
      periodKey: reportRun.periodKey,
      startDate: reportRun.startDate,
      endDate: reportRun.endDate,
      format: reportRun.format,
      status: reportRun.status,
      documentVaultId: reportRun.documentVaultId,
      executiveSummary,
      anomalies,
      comparisons,
      metrics: currentPeriodData,
      version: reportRun.version,
      generatedBy: reportRun.generatedBy,
      createdAt: reportRun.createdAt,
    };
  }

  /**
   * Registers and archives the generated report directly into the Central Document Vault
   */
  private async archiveToDocumentVault(
    tenantId: string,
    reportRun: any,
    periodData: any,
    comparisons: any,
    summary: string
  ) {
    const filename = `Report_${reportRun.periodKey}_v${reportRun.version}.json`;
    const storageKey = `tenant/${tenantId}/reports/${reportRun.periodType.toLowerCase()}/${filename}`;
    const payload = JSON.stringify({
      reportId: reportRun.id,
      title: reportRun.title,
      period: reportRun.periodKey,
      generatedAt: reportRun.createdAt,
      summary,
      metrics: periodData,
      comparisons,
    }, null, 2);

    const doc = await this.prisma.document.create({
      data: {
        tenantId,
        name: `${reportRun.title} (v${reportRun.version})`,
        originalName: filename,
        mimeType: 'application/json',
        size: Buffer.byteLength(payload),
        url: `/api/documents/vault/${reportRun.id}`,
        storageKey,
        service: 'bi-engine',
        module: 'reports',
        category: 'report',
        entityType: 'ReportRun',
        entityId: reportRun.id,
        source: 'BI_REPORTING_SYSTEM',
        status: 'ACTIVE',
        processingStatus: 'COMPLETED',
      },
    });

    // Create DocumentReference linking to the report entity
    await this.prisma.documentReference.create({
      data: {
        tenantId,
        documentId: doc.id,
        service: 'bi-engine',
        module: 'reports',
        entityType: 'ReportRun',
        entityId: reportRun.id,
        category: 'report',
        notes: `Official frozen business report snapshot version ${reportRun.version}`,
      },
    });

    return doc;
  }

  /**
   * Lists all historical reports for a tenant
   */
  async listReports(tenantId: string, filters: { periodType?: string; status?: string } = {}) {
    const where: any = { tenantId };
    if (filters.periodType && filters.periodType !== 'ALL') {
      where.periodType = filters.periodType.toUpperCase();
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const reports = await this.prisma.reportRun.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return reports.map((r) => ({
      id: r.id,
      title: r.title,
      periodType: r.periodType,
      periodKey: r.periodKey,
      startDate: r.startDate,
      endDate: r.endDate,
      format: r.format,
      status: r.status,
      documentVaultId: r.documentVaultId,
      executiveSummary: r.executiveSummary,
      anomaliesCount: (JSON.parse(r.anomalies || '[]') as any[]).length,
      version: r.version,
      generatedBy: r.generatedBy,
      createdAt: r.createdAt,
    }));
  }

  /**
   * Retrieves single report run with full snapshot and source records
   */
  async getReport(tenantId: string, reportId: string) {
    const report = await this.prisma.reportRun.findFirst({
      where: { id: reportId, tenantId },
    });

    if (!report) {
      throw new NotFoundException(`Report with id ${reportId} not found`);
    }

    return {
      id: report.id,
      title: report.title,
      periodType: report.periodType,
      periodKey: report.periodKey,
      startDate: report.startDate,
      endDate: report.endDate,
      format: report.format,
      status: report.status,
      documentVaultId: report.documentVaultId,
      vaultStorageKey: report.vaultStorageKey,
      executiveSummary: report.executiveSummary,
      anomalies: JSON.parse(report.anomalies || '[]'),
      metrics: JSON.parse(report.metricsSnapshot || '{}'),
      comparisons: JSON.parse(report.comparisons || '{}'),
      version: report.version,
      generatedBy: report.generatedBy,
      createdAt: report.createdAt,
    };
  }

  /**
   * Exports report data in CSV format
   */
  async exportCsv(tenantId: string, reportId: string): Promise<string> {
    const report = await this.getReport(tenantId, reportId);
    const m = report.metrics || {};
    const sales = m.sales || {};
    const fin = m.finance || {};
    const hd = m.helpdesk || {};
    const proj = m.projects || {};
    const ai = m.ai || {};

    const rows = [
      ['BUSINESS OS — OFFICIAL AUDIT REPORT', report.title],
      ['Period', `${report.periodType} (${report.periodKey})`],
      ['Generated At', new Date(report.createdAt).toISOString()],
      ['Generated By', report.generatedBy],
      ['Version', `v${report.version}`],
      [''],
      ['EXECUTIVE SUMMARY'],
      [report.executiveSummary || 'N/A'],
      [''],
      ['DOMAIN', 'METRIC', 'VALUE'],
      ['Sales', 'Revenue Won', `$${(sales.revenueWon || 0).toLocaleString()}`],
      ['Sales', 'Deals Won', sales.dealsWon || 0],
      ['Sales', 'Deals Created', sales.dealsCreated || 0],
      ['Sales', 'Win Rate', `${sales.winRatePercent || 0}%`],
      ['Finance', 'Payments Received', `$${(fin.paymentsReceived || 0).toLocaleString()}`],
      ['Finance', 'Invoices Created', fin.invoicesCreated || 0],
      ['Finance', 'Operating Expenses', `$${(fin.expenses || 0).toLocaleString()}`],
      ['Finance', 'Net Cash Flow', `$${(fin.netCashFlow || 0).toLocaleString()}`],
      ['Finance', 'AR Overdue', `$${(fin.arOverdue || 0).toLocaleString()}`],
      ['Support', 'Tickets Resolved', hd.ticketsResolved || 0],
      ['Support', 'Tickets Opened', hd.ticketsOpened || 0],
      ['Support', 'SLA Breaches', hd.slaBreaches || 0],
      ['Projects', 'Tasks Completed', proj.tasksCompleted || 0],
      ['Projects', 'Overdue Tasks', proj.overdueTasks || 0],
      ['AI Fleet', 'Executions', ai.agentRuns || 0],
      ['AI Fleet', 'Successful Actions', ai.successfulActions || 0],
      ['AI Fleet', 'Failed Actions', ai.failedActions || 0],
      ['AI Fleet', 'Total Tokens', ai.totalTokens || 0],
      [''],
      ['CHILD PERIOD BREAKDOWN'],
      ['Date', 'Revenue ($)', 'Deals Won', 'Tickets Resolved', 'Tasks Completed', 'Health Score'],
    ];

    (m.childBreakdown || []).forEach((b: any) => {
      rows.push([
        b.date,
        b.revenue || 0,
        b.dealsWon || 0,
        b.ticketsResolved || 0,
        b.tasksCompleted || 0,
        b.healthScore || 100,
      ]);
    });

    if (m.sourceReferences?.dealsWon && m.sourceReferences.dealsWon.length > 0) {
      rows.push(['']);
      rows.push(['CLOSED WON DEALS AUDIT TRAIL']);
      rows.push(['Deal ID', 'Title', 'Amount ($)', 'Stage']);
      m.sourceReferences.dealsWon.forEach((d: any) => {
        rows.push([d.id, d.title, d.amount, d.stage || 'WON']);
      });
    }

    return rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  }
}
