# Business OS — Phase 7: Observability & Alerting Runbook

## Overview
Phase 7 upgrades Business OS from console-only logging to an enterprise observability, distributed tracing, and automated alerting system. Every HTTP request, inter-service call, database transaction, and asynchronous queue event carries a deterministic `X-Correlation-ID` for end-to-end distributed tracing. Centralized structured JSON logging formats are consumable by Vector, FluentBit, Promtail, Datadog, or Elastic, while automated `/healthz` and `/readyz` probes verify deep backing infrastructure dependencies in real time.

---

## 1. Distributed Tracing & Correlation ID Architecture

```
[ Client Request ]
       │  (Injects or Auto-generates X-Correlation-ID)
       ▼
┌──────────────────┐
│  Ingress Proxy   │ (Propagates X-Correlation-ID & emits structured access log)
└────────┬─────────┘
         │
    ┌────┴───────────────────────────┐
    ▼                                ▼
┌──────────────────┐        ┌──────────────────┐
│  Next.js Shell   │        │   API Gateway    │ (Forwards to 28 microservices)
│    (Port 4000)   │        │   (Port 3000)    │
└────────┬─────────┘        └────────┬─────────┘
         │                           │
         ▼                           ▼
┌──────────────────────────────────────────────┐
│  PostgreSQL 16 + Redis 8.10 + MinIO Vault    │
│  (Audit logs & event buses tag Correlation)  │
└──────────────────────────────────────────────┘
```

### Propagation Protocol:
1. **Header Name:** `X-Correlation-ID` (case-insensitive standard).
2. **Ingress Auto-Generation:** If the client does not provide a correlation ID, Ingress automatically provisions a random UUIDv4.
3. **Response Reflection:** Ingress, API Gateway, and Web-Core echo `X-Correlation-ID` back to client HTTP response headers.
4. **Context Carry-Over:** Forwarded in `fetch()` headers across microservices and attached to BullMQ job payloads (`jobId` / `correlationId`).

---

## 2. Structured JSON Logging Schema

All access and application logs follow a standardized JSON structure:

```json
{
  "timestamp": "2026-10-12T17:29:21.533Z",
  "level": "INFO",
  "service": "gateway",
  "correlationId": "6c25643f-f9a9-4d9a-8996-ff488770045f",
  "tenantId": "default-tenant",
  "method": "GET",
  "path": "/api/v1/crm/contacts",
  "statusCode": 200,
  "durationMs": 14
}
```

| Field | Type | Description |
|---|---|---|
| `timestamp` | ISO-8601 String | UTC timestamp when event occurred |
| `level` | String | `INFO`, `WARN`, `ERROR`, `ALERT` |
| `service` | String | Originating microservice (`ingress`, `gateway`, `web-core`, etc.) |
| `correlationId` | UUID String | Distributed trace identifier |
| `tenantId` | String | Authenticated multi-tenant identifier |
| `path` | String | Request URI or resource path |
| `statusCode` | Number | HTTP response status code |
| `durationMs` | Number | Execution latency in milliseconds |

---

## 3. Health & Readiness Probes

### Liveness Probe (`/healthz`)
- **Endpoints:** `https://127.0.0.1:8443/healthz`, `http://127.0.0.1:3000/api/healthz`, `http://127.0.0.1:4000/api/healthz`
- **Purpose:** Fast container liveness check. Confirms the node event loop is responsive.
- **Payload:**
  ```json
  {
    "status": "UP",
    "service": "api-gateway",
    "timestamp": "2026-10-12T17:29:21.000Z"
  }
  ```

### Deep Readiness Probe (`/readyz`)
- **Endpoints:** `https://127.0.0.1:8443/readyz`, `http://127.0.0.1:3000/api/readyz`, `http://127.0.0.1:4000/api/readyz`
- **Purpose:** Verifies that backing operational dependencies are active before routing traffic:
  - PostgreSQL database connection (`SELECT 1`)
  - Redis 8.10 memory cache & queue connection (`PING`)
  - Object Storage MinIO S3 Vault (`live`)
  - Upstream Gateway & Web-Core nodes
- **Success Response (HTTP 200):**
  ```json
  {
    "status": "READY",
    "checks": {
      "ingress": "UP",
      "database": "UP",
      "redis": "UP",
      "objectStorage": "UP",
      "gateway": "UP",
      "webcore": "UP"
    },
    "latencyMs": 2,
    "timestamp": "2026-10-12T17:29:21.000Z",
    "correlationId": "6c25643f-f9a9-4d9a-8996-ff488770045f"
  }
  ```
- **Failure Response (HTTP 503 Service Unavailable):**
  Triggered automatically if any backing service reports `DOWN`.

---

## 4. Alerting Sentinel & Incident Automation

The Alerting Sentinel (`scripts/alerting-sentinel.mjs`) evaluates critical health thresholds:

1. **Database Outage (`rule-db-down`):**
   - Condition: PostgreSQL returns `DOWN`.
   - Severity: `CRITICAL`.
2. **Redis Outage (`rule-redis-down`):**
   - Condition: Redis returns `DOWN`.
   - Severity: `CRITICAL`.
3. **Object Storage Outage (`rule-storage-down`):**
   - Condition: MinIO returns `DOWN`.
   - Severity: `HIGH`.
4. **Queue DLQ Spike (`rule-dlq-depth`):**
   - Condition: Dead-letter queue backlog > 10 messages.
   - Severity: `MEDIUM`.

### Verification Suite
Execute:
```bash
node scripts/verify-observability.mjs
```
Validates:
- Ingress Correlation ID auto-generation.
- End-to-end Correlation ID header propagation.
- API Gateway and Web-Core reflection.
- Deep `/readyz` probes across DB, Redis, MinIO, Gateway, and Web-Core.
- Structured APM JSON format compliance.
- Alerting Sentinel rules evaluation and synthetic outage detection.
