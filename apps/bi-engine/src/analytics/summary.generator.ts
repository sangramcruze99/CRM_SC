import { MetricComparisonItem } from './comparison.engine';
import { AnomalyReport } from './anomaly.detector';

export class SummaryGenerator {
  /**
   * Generates a grounded, factual executive summary using strictly verified data
   */
  static generateExecutiveSummary(
    periodTitle: string,
    metrics: any,
    comparisons: Record<string, MetricComparisonItem> = {},
    anomalies: AnomalyReport[] = []
  ): string {
    const sales = metrics.sales || {};
    const fin = metrics.finance || {};
    const hd = metrics.helpdesk || {};
    const proj = metrics.projects || {};
    const ai = metrics.ai || {};

    const sentences: string[] = [];

    // Financial & Sales Narrative
    const revComp = comparisons.revenue;
    const revTotal = (fin.paymentsReceived || sales.revenueWon || 0).toLocaleString();

    if (revComp && revComp.previous > 0) {
      const growthWord = revComp.percentDelta >= 0 ? 'increased' : 'decreased';
      sentences.push(
        `${periodTitle}: Revenue ${growthWord} by ${Math.abs(revComp.percentDelta)}% ($${revTotal} vs $${revComp.previous.toLocaleString()} in previous period).`
      );
    } else {
      sentences.push(
        `${periodTitle}: Recorded $${revTotal} in total settled payments and revenue.`
      );
    }

    if (sales.dealsWon && sales.dealsWon > 0) {
      sentences.push(
        `Sales closed ${sales.dealsWon} won ${sales.dealsWon === 1 ? 'deal' : 'deals'} totaling $${(sales.revenueWon || 0).toLocaleString()} with a ${sales.winRatePercent || 0}% close rate.`
      );
    }

    if (fin.netCashFlow !== undefined) {
      const cashFlowStatus = fin.netCashFlow >= 0 ? 'positive' : 'negative';
      sentences.push(
        `Net cash flow was ${cashFlowStatus} at $${fin.netCashFlow.toLocaleString()} (payments received: $${(fin.paymentsReceived || 0).toLocaleString()}, expenses: $${(fin.expenses || 0).toLocaleString()}).`
      );
    }

    // Support & Projects Narrative
    if (hd.ticketsResolved !== undefined) {
      sentences.push(
        `Customer support successfully resolved ${hd.ticketsResolved} tickets (${hd.ticketsOpened || 0} opened, ${hd.slaBreaches || 0} SLA breaches).`
      );
    }

    if (proj.tasksCompleted !== undefined) {
      sentences.push(
        `Product engineering completed ${proj.tasksCompleted} tasks across ${proj.activeProjects || 0} active projects.`
      );
    }

    // AI Automation Narrative
    if (ai.agentRuns && ai.agentRuns > 0) {
      const successRate = Math.round(((ai.successfulActions || 0) / ai.agentRuns) * 100);
      sentences.push(
        `Autonomous AI agents completed ${ai.agentRuns} executions with a ${successRate}% success rate (${ai.humanApprovals || 0} human approvals).`
      );
    }

    // Anomaly callout
    if (anomalies.length > 0) {
      sentences.push(
        `Key operational note: ${anomalies[0].title} — ${anomalies[0].description}`
      );
    }

    return sentences.join(' ');
  }
}
