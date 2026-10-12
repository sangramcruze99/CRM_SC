# Redis 8+ & BullMQ Distributed Execution Runbook

**Document Version:** 1.0.0  
**Target Environment:** Business OS Production / Staging  
**Component:** Distributed Queues, Job Workers & Real-Time Clustering  
**Status:** Operational (Verified)

---

## 1. Architecture Overview

Business OS utilizes a distributed Redis 8.10+ layer to provide:
1. **BullMQ Workflow Ingestion & Worker Execution (`apps/automation`)**: Asynchronous, guaranteed-delivery job processing with multi-tenant isolation, automatic backoff retry, and dead-letter queue (DLQ) retention.
2. **Socket.IO Horizontal Clustering (`apps/chat`)**: Multi-node WebSocket broadcast synchronization via Redis pub/sub channels (`@socket.io/redis-adapter`).
3. **Fail-Closed Production Posture**: When `NODE_ENV === 'production'`, all in-memory mock queue fallbacks are strictly prohibited; missing Redis credentials or an offline Redis server causes immediate process termination.

```
                           ┌────────────────────────────┐
                           │      Client / Ingress      │
                           └──────────────┬─────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌────────────────────────┐                      ┌────────────────────────┐
     │ apps/automation (:3009)│                      │   apps/chat (:3014)    │
     └────────────┬───────────┘                      └────────────┬───────────┘
                  │ [BullMQ Queue: 'workflows']                   │ [@socket.io/redis-adapter]
                  ▼                                               ▼
    ┌───────────────────────────────────────────────────────────────────────────┐
    │                       Redis 8.10 Server (:6379)                           │
    │  - Password Auth (requirepass)                                            │
    │  - AOF Persistence (appendonly yes, appendfsync everysec)                 │
    │  - Memory Eviction: noeviction                                            │
    │  - Loopback Binding: 127.0.0.1                                            │
    └───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Security & Operational Hardening Configuration

The production Redis instance is configured via `E:\tools\redis\redis-prod.conf`:

```ini
# Network & Security
bind 127.0.0.1 -::1
protected-mode yes
port 6379
requirepass "business_os_redis_secure_pass_2026"

# Durability & Persistence
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Memory & Eviction Strategy
maxmemory 512mb
maxmemory-policy noeviction
```

---

## 3. Environment Configuration

The following variables are required across `.env` and all container definitions:

| Variable | Staging / Development | Production | Description |
| :--- | :--- | :--- | :--- |
| `ENABLE_BULLMQ` | `"true"` | `"true"` | Enables distributed BullMQ processing |
| `REDIS_HOST` | `127.0.0.1` | Private VPC Host | Redis host / cluster endpoint |
| `REDIS_PORT` | `6379` | `6379` | Redis TCP port |
| `REDIS_PASSWORD` | Secure secret | Vault/Secret Manager | Redis authentication password |
| `REDIS_URL` | `redis://:...@127.0.0.1:6379` | `rediss://:...` (TLS) | Standard connection URI |

---

## 4. BullMQ Idempotency, Redaction & Retry Policy

### Idempotency & Deduplication
To prevent race conditions, webhook duplicate triggers, or parallel double-charging:
- Every job submitted via `POST /workflows/trigger` computes a deterministic `jobId`:
  ```typescript
  const dedupKey = eventId ? `${tenantId}:${workflow.id}:${eventId}` : undefined;
  ```
- BullMQ natively drops duplicate job submissions sharing the same `jobId` within the queue window.

### Sensitive Data Redaction
Before payloads enter Redis persistence, all sensitive attributes (passwords, tokens, credit card CVVs, and raw secrets) are stripped via `@repo/database/redactSensitiveData`.

### Retry & Exponential Backoff
Jobs that fail during execution are retried automatically up to **3 attempts**:
- Strategy: Exponential backoff
- Initial delay: 2,000 ms (`delay * 2^(attempt - 1)`)
- Removal on failure: `removeOnFail: false` (preserved for Dead-Letter Queue inspection)

---

## 5. Dead-Letter Queue (DLQ) Operational Runbook

When a workflow fails all 3 retry attempts, it is quarantined in the DLQ (`bull:workflows:failed`).

### 1. View Quarantined Dead-Letter Jobs
```bash
curl -X GET "http://localhost:3009/workflows/dlq" \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "x-tenant-id: default-tenant"
```

Response:
```json
{
  "dlq": [
    {
      "id": "default-tenant:wf_flagship_enterprise:evt_001",
      "name": "execute-workflow",
      "workflowId": "wf_flagship_enterprise",
      "tenantId": "default-tenant",
      "failedReason": "Workflow wf_flagship_enterprise not found",
      "attemptsMade": 3,
      "timestamp": 1791824065166,
      "processedOn": 1791824071229,
      "finishedOn": 1791824071232
    }
  ],
  "count": 1,
  "tenantId": "default-tenant"
}
```

### 2. Re-queue / Retry a Quarantined Job
```bash
curl -X POST "http://localhost:3009/workflows/dlq/<JOB_ID>/retry" \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "x-tenant-id: default-tenant"
```

### 3. Permanently Purge a Dead-Letter Job
```bash
curl -X DELETE "http://localhost:3009/workflows/dlq/<JOB_ID>" \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "x-tenant-id: default-tenant"
```

---

## 6. Verification & Automated Test Suite

Run the full end-to-end verification suite:
```bash
node scripts/verify-redis-bullmq.mjs
```

### Verified Test Matrix (12/12 Passing):
1. `Redis Auth: Authenticated client receives PONG`
2. `Redis Auth: Unauthenticated connection is rejected (NOAUTH)`
3. `Redis Auth: Incorrect password is rejected (WRONGPASS)`
4. `Redis Config: Append-Only File (AOF) persistence is active`
5. `Redis Config: Memory eviction policy is strict noeviction`
6. `BullMQ Enqueue: Ingestion triggers asynchronous job submission`
7. `BullMQ Deduplication: Identical eventId is rejected/deduped`
8. `BullMQ Storage: Redis stores Bull queue state & metadata`
9. `DLQ Query: GET /workflows/dlq lists dead-lettered jobs with metadata`
10. `DLQ Replay: POST /workflows/dlq/:jobId/retry returns 404 for invalid job`
11. `DLQ Purge: DELETE /workflows/dlq/:jobId returns 404 for invalid job`
12. `Socket.IO Clustering: Redis subscriber client active in client list`
