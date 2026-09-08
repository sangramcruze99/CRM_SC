import { MetricComparisonItem } from './comparison.engine';

export interface AnomalyReport {
  id: string;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  metricKey: string;
  evidence: string;
}

export class AnomalyDetector {
  /**
   * Scans metrics and comparisons to flag statistically notable deviations
   */
  static detectAnomalies(metrics: any, comparisons: Record<string, MetricComparisonItem> = {}): AnomalyReport[] {
    const anomalies: AnomalyReport[] = [];

    // 1. Revenue Drop Anomaly (> 25% drop compared to prior period)
    const revComp = comparisons.revenue;
    if (revComp && revComp.previous > 1000 && revComp.percentDelta <= -25) {
      anomalies.push({
        id: `anom_rev_${Date.now()}`,
        type: 'REVENUE_DECLINE',
        severity: revComp.percentDelta <= -50 ? 'HIGH' : 'MEDIUM',
        title: 'Unusual Revenue Contraction Detected',
        description: `Revenue contracted by ${Math.abs(revComp.percentDelta)}% compared to the previous period ($${revComp.current.toLocaleString()} vs $${revComp.previous.toLocaleString()}).`,
        metricKey: 'revenue',
        evidence: `Previous: $${revComp.previous.toLocaleString()} | Current: $${revComp.current.toLocaleString()} | Delta: -$${Math.abs(revComp.absoluteDelta).toLocaleString()}`,
      });
    }

    // 2. Expense Surge Anomaly (> 30% increase)
    const expComp = comparisons.expenses;
    if (expComp && expComp.previous > 500 && expComp.percentDelta >= 30) {
      anomalies.push({
        id: `anom_exp_${Date.now()}`,
        type: 'EXPENSE_SURGE',
        severity: 'MEDIUM',
        title: 'Unusual Expense Increase Detected',
        description: `Operating expenses increased by ${expComp.percentDelta}% compared to baseline ($${expComp.current.toLocaleString()} vs $${expComp.previous.toLocaleString()}).`,
        metricKey: 'expenses',
        evidence: `Delta: +$${expComp.absoluteDelta.toLocaleString()}`,
      });
    }

    // 3. Helpdesk SLA Breach Anomaly
    const hd = metrics.helpdesk || {};
    if (hd.slaBreaches && hd.slaBreaches > 3) {
      anomalies.push({
        id: `anom_sla_${Date.now()}`,
        type: 'SLA_BREACH_SPIKE',
        severity: 'HIGH',
        title: 'Elevated Support SLA Breaches Detected',
        description: `${hd.slaBreaches} support tickets breached their SLA commitment threshold during this period.`,
        metricKey: 'slaBreaches',
        evidence: `Total open backlog: ${hd.openBacklog || 0} tickets | SLA breaches: ${hd.slaBreaches}`,
      });
    }

    // 4. Overdue Tasks Spike
    const proj = metrics.projects || {};
    if (proj.overdueTasks && proj.tasksCreated && (proj.overdueTasks / Math.max(1, proj.tasksCreated)) > 0.3) {
      anomalies.push({
        id: `anom_tasks_${Date.now()}`,
        type: 'TASK_BOTTLENECK',
        severity: 'MEDIUM',
        title: 'Sprint Delivery Delay Detected',
        description: `${proj.overdueTasks} tasks are currently overdue, representing over 30% of sprint capacity.`,
        metricKey: 'overdueTasks',
        evidence: `Overdue: ${proj.overdueTasks} | Completed: ${proj.tasksCompleted || 0}`,
      });
    }

    // 5. AI Agent Failure Rate (> 10% failures)
    const ai = metrics.ai || {};
    if (ai.agentRuns && ai.agentRuns > 5) {
      const failureRate = (ai.failedActions || 0) / ai.agentRuns;
      if (failureRate >= 0.1) {
        anomalies.push({
          id: `anom_ai_${Date.now()}`,
          type: 'AI_EXECUTION_DEGRADATION',
          severity: 'HIGH',
          title: 'Autonomous AI Failure Rate Threshold Exceeded',
          description: `AI agent execution failure rate is ${Math.round(failureRate * 100)}% (${ai.failedActions} failures out of ${ai.agentRuns} total runs).`,
          metricKey: 'aiExecutions',
          evidence: `Success: ${ai.successfulActions || 0} | Failures: ${ai.failedActions || 0}`,
        });
      }
    }

    return anomalies;
  }
}
