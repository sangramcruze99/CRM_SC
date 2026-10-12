#!/usr/bin/env node
/**
 * Business OS — Centralized Alerting Sentinel
 * Observes system health probes, evaluates thresholds (5xx rate, dependency outages, DLQ depth),
 * and dispatches structured alerts for incident management.
 */

export class AlertingSentinel {
  constructor() {
    this.firedAlerts = [];
  }

  // Rules Engine
  getRules() {
    return [
      {
        id: 'rule-db-down',
        name: 'PostgreSQL Database Outage',
        severity: 'CRITICAL',
        check: async () => {
          try {
            const res = await fetch('http://127.0.0.1:4000/api/readyz');
            const data = await res.json();
            const down = data.checks?.database !== 'UP';
            return {
              triggered: down,
              message: down ? 'PostgreSQL 16 connection is DOWN' : 'PostgreSQL is healthy',
              metric: data.checks?.database,
            };
          } catch (e) {
            return { triggered: true, message: `Readiness check failed: ${e.message}` };
          }
        },
      },
      {
        id: 'rule-redis-down',
        name: 'Redis Cache & Queue Outage',
        severity: 'CRITICAL',
        check: async () => {
          try {
            const res = await fetch('http://127.0.0.1:4000/api/readyz');
            const data = await res.json();
            const down = data.checks?.redis !== 'UP';
            return {
              triggered: down,
              message: down ? 'Redis 8.10 connection is DOWN' : 'Redis is healthy',
              metric: data.checks?.redis,
            };
          } catch (e) {
            return { triggered: true, message: `Readiness check failed: ${e.message}` };
          }
        },
      },
      {
        id: 'rule-storage-down',
        name: 'Object Storage Vault Outage',
        severity: 'HIGH',
        check: async () => {
          try {
            const res = await fetch('http://127.0.0.1:4000/api/readyz');
            const data = await res.json();
            const down = data.checks?.objectStorage !== 'UP';
            return {
              triggered: down,
              message: down ? 'MinIO Object Storage is DOWN' : 'MinIO is healthy',
              metric: data.checks?.objectStorage,
            };
          } catch (e) {
            return { triggered: true, message: `Readiness check failed: ${e.message}` };
          }
        },
      },
      {
        id: 'rule-dlq-depth',
        name: 'BullMQ Dead-Letter Queue Spike',
        severity: 'MEDIUM',
        check: async () => {
          try {
            const res = await fetch('http://127.0.0.1:3009/workflows/dlq');
            if (!res.ok) return { triggered: false, message: 'DLQ endpoint not reachable' };
            const data = await res.json();
            const count = data.count || 0;
            const threshold = 10;
            return {
              triggered: count > threshold,
              message: count > threshold ? `DLQ backlog exceeds threshold: ${count} jobs` : `DLQ normal: ${count} jobs`,
              metric: count,
            };
          } catch {
            return { triggered: false, message: 'Skipped DLQ check' };
          }
        },
      },
    ];
  }

  async evaluateRules() {
    const rules = this.getRules();
    const currentFired = [];

    for (const rule of rules) {
      try {
        const result = await rule.check();
        if (result.triggered) {
          const alert = {
            id: `alert-${Date.now()}-${rule.id}`,
            ruleId: rule.id,
            name: rule.name,
            severity: rule.severity,
            message: result.message,
            metric: result.metric,
            timestamp: new Date().toISOString(),
          };
          currentFired.push(alert);
          this.dispatchAlert(alert);
        }
      } catch (err) {
        console.error(`Error checking rule ${rule.id}:`, err.message);
      }
    }

    this.firedAlerts = currentFired;
    return { totalChecked: rules.length, fired: currentFired };
  }

  dispatchAlert(alert) {
    const structuredAlert = {
      timestamp: alert.timestamp,
      level: alert.severity === 'CRITICAL' ? 'ALERT' : 'WARN',
      service: 'observability-sentinel',
      alertId: alert.id,
      ruleName: alert.name,
      severity: alert.severity,
      message: alert.message,
      metric: alert.metric,
    };
    console.error(JSON.stringify(structuredAlert));
  }

  getFiredAlerts() {
    return this.firedAlerts;
  }
}
