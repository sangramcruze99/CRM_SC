export interface MetricComparisonItem {
  key: string;
  label: string;
  current: number;
  previous: number;
  absoluteDelta: number;
  percentDelta: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
  isPositive: boolean; // whether an increase is good for this metric (e.g. revenue up is good, expenses up is not)
}

export class ComparisonEngine {
  /**
   * Calculates comparison item
   */
  static compareMetric(
    key: string,
    label: string,
    current: number,
    previous: number,
    higherIsBetter: boolean = true
  ): MetricComparisonItem {
    const cur = current || 0;
    const prev = previous || 0;
    const absoluteDelta = Math.round((cur - prev) * 100) / 100;
    
    let percentDelta = 0;
    if (prev === 0) {
      percentDelta = cur > 0 ? 100 : 0;
    } else {
      percentDelta = Math.round(((cur - prev) / Math.abs(prev)) * 1000) / 10;
    }

    let trend: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
    if (absoluteDelta > 0.001) trend = 'UP';
    else if (absoluteDelta < -0.001) trend = 'DOWN';

    const isPositive = higherIsBetter ? trend === 'UP' : trend === 'DOWN';

    return {
      key,
      label,
      current: cur,
      previous: prev,
      absoluteDelta,
      percentDelta,
      trend,
      isPositive,
    };
  }

  /**
   * Computes full comparative scorecard across all departments
   */
  static computeScorecard(current: any, previous: any): Record<string, MetricComparisonItem> {
    const curSales = current.sales || {};
    const prevSales = previous.sales || {};

    const curFin = current.finance || {};
    const prevFin = previous.finance || {};

    const curHd = current.helpdesk || {};
    const prevHd = previous.helpdesk || {};

    const curProj = current.projects || {};
    const prevProj = previous.projects || {};

    const curAi = current.ai || {};
    const prevAi = previous.ai || {};

    return {
      revenue: this.compareMetric(
        'revenue',
        'Revenue Won',
        curSales.revenueWon || curFin.paymentsReceived || 0,
        prevSales.revenueWon || prevFin.paymentsReceived || 0,
        true
      ),
      dealsWon: this.compareMetric(
        'dealsWon',
        'Deals Closed Won',
        curSales.dealsWon || 0,
        prevSales.dealsWon || 0,
        true
      ),
      paymentsReceived: this.compareMetric(
        'paymentsReceived',
        'Payments Received',
        curFin.paymentsReceived || 0,
        prevFin.paymentsReceived || 0,
        true
      ),
      expenses: this.compareMetric(
        'expenses',
        'Total Expenses',
        curFin.expenses || 0,
        prevFin.expenses || 0,
        false // higher expenses is not positive
      ),
      netCashFlow: this.compareMetric(
        'netCashFlow',
        'Net Cash Flow',
        curFin.netCashFlow || 0,
        prevFin.netCashFlow || 0,
        true
      ),
      ticketsResolved: this.compareMetric(
        'ticketsResolved',
        'Tickets Resolved',
        curHd.ticketsResolved || 0,
        prevHd.ticketsResolved || 0,
        true
      ),
      slaBreaches: this.compareMetric(
        'slaBreaches',
        'SLA Breaches',
        curHd.slaBreaches || 0,
        prevHd.slaBreaches || 0,
        false // higher breaches is bad
      ),
      tasksCompleted: this.compareMetric(
        'tasksCompleted',
        'Tasks Completed',
        curProj.tasksCompleted || 0,
        prevProj.tasksCompleted || 0,
        true
      ),
      aiExecutions: this.compareMetric(
        'aiExecutions',
        'Autonomous AI Executions',
        curAi.agentRuns || 0,
        prevAi.agentRuns || 0,
        true
      ),
    };
  }
}
