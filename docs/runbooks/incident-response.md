# Operational Runbook: Production Incident Response & AI Containment

## 1. Severity Levels & SLA
- **SEV-1 (Critical)**: Platform-wide outage, data breach, payment failure cascade, runaway unbounded AI spend (> $1,000/hr anomalous). **Response SLA: < 5 minutes**.
- **SEV-2 (High)**: Single microservice down (e.g. AI Engine degraded, Search mesh unresponsive), CRM core still functioning. **Response SLA: < 15 minutes**.
- **SEV-3 (Medium)**: Non-critical feature impairment (e.g. analytics report delay, coupon validation latency). **Response SLA: < 1 hour**.

## 2. Emergency AI Containment (Runaway Loop / Security Breach)
If an autonomous agent (Ares, Athena, Midas, Hermes, Vesta) exhibits runaway recursive loops or anomalous spend:
1. **Trigger Master AI Kill Switch Immediately**:
   ```bash
   curl -X POST "http://localhost:3027/billing/kill-switches" \
     -H "Content-Type: application/json" \
     -d '{"scope": "GLOBAL", "target": "GLOBAL_AI", "isEnabled": false, "reason": "Emergency containment incident"}'
   ```
2. **Or Target Specific Runaway Agent**:
   ```bash
   curl -X POST "http://localhost:3027/billing/kill-switches" \
     -H "Content-Type: application/json" \
     -d '{"scope": "AGENT", "target": "ares", "isEnabled": false, "reason": "Contained high-frequency SDR queue"}'
   ```
3. **Verify AI Execution is Halted**:
   All subsequent agent prompts will immediately reject with `403 Forbidden` and log containment markers.

## 3. External Provider Failure Containment (Stripe / Groq / OpenRouter)
If an upstream vendor suffers a major outage:
1. **Check Circuit Breaker Status**:
   ```bash
   curl -X GET "http://localhost:3027/billing/resilience/circuits"
   ```
2. **Verify Automated Failover**:
   - For AI: Groq circuit trips to `OPEN` after 3 consecutive failures. Traffic automatically fails over to OpenRouter (Claude-3.5 or Llama-3.3 fallback).
   - For Stripe: Billing operations fall back to cached entitlements with local queued events; users are notified gracefully without app crashes.
3. **Manual Half-Open Probe**:
   Once upstream vendor confirms recovery on status page, circuit transitions to `HALF_OPEN` to test probe requests before closing.

## 4. Post-Incident Review & Root Cause Analysis (RCA)
Within 24 hours of incident resolution:
1. Document chronological timeline of events.
2. Identify Root Cause (code defect, external vendor, configuration mismatch, human error).
3. Log preventative action items with assigned owners and Jira/Linear tracking tickets.
