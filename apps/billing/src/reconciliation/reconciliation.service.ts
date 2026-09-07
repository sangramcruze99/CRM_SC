import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntitlementService } from '../entitlements/entitlement.service';

export interface ReconciliationReport {
  timestamp: string;
  totalAudited: number;
  syncedCount: number;
  discrepanciesCount: number;
  discrepancies: Array<{
    tenantId: string;
    subscriptionId: string;
    issue: string;
    remedy: string;
    resolved: boolean;
  }>;
}

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlementService: EntitlementService,
  ) {}

  /**
   * Run comprehensive reconciliation audit
   */
  async runReconciliationAudit(autoHeal: boolean = true): Promise<ReconciliationReport> {
    this.logger.log('[Reconciliation] Starting subscription & billing state audit...');
    const now = new Date();

    const subscriptions = await this.prisma.subscription.findMany();
    const discrepancies: Array<any> = [];
    let syncedCount = 0;

    for (const sub of subscriptions) {
      let hasIssue = false;

      // Check 1: Past Due / Expired Current Period
      if (sub.status === 'ACTIVE' && sub.currentPeriodEnd < now) {
        hasIssue = true;
        const remedy = 'Transitioned expired active period to PAST_DUE';
        if (autoHeal) {
          await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'PAST_DUE' },
          });
          this.entitlementService.invalidateCache(sub.tenantId);
        }
        discrepancies.push({
          tenantId: sub.tenantId,
          subscriptionId: sub.id,
          issue: `Subscription active but billing period expired on ${sub.currentPeriodEnd.toISOString()}`,
          remedy,
          resolved: autoHeal,
        });
      }

      // Check 2: Canceled at period end passed
      if (sub.cancelAtPeriodEnd && sub.currentPeriodEnd <= now && sub.status !== 'CANCELED') {
        hasIssue = true;
        const remedy = 'Executed scheduled period-end cancellation';
        if (autoHeal) {
          await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'CANCELED', canceledAt: now },
          });
          this.entitlementService.invalidateCache(sub.tenantId);
        }
        discrepancies.push({
          tenantId: sub.tenantId,
          subscriptionId: sub.id,
          issue: 'Scheduled period-end reached with pending cancellation',
          remedy,
          resolved: autoHeal,
        });
      }

      if (!hasIssue) {
        syncedCount++;
      }
    }

    this.logger.log(
      `[Reconciliation] Finished: ${syncedCount} synced, ${discrepancies.length} discrepancies found.`,
    );

    return {
      timestamp: now.toISOString(),
      totalAudited: subscriptions.length,
      syncedCount,
      discrepanciesCount: discrepancies.length,
      discrepancies,
    };
  }
}
