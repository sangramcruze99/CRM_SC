# Durable Usage Metering & Immutable Ledger

## 1. Metering Architecture
The usage metering pipeline guarantees high-throughput ingestion with zero double-counting:

```
Incoming Telemetry / Microservice Action
     │
     ▼
Idempotency Key Check (Unique Index)
     │
     ▼
Append to UsageEvent (Raw Event Store)
     │
     ▼
Atomic Increment in UsageLedgerDaily (Composite Key: tenantId + metric + date)
     │
     ▼
Quota Evaluation & Threshold Check (50%, 75%, 80%, 90%, 100%)
     │
     ▼
Monthly Aggregation → Invoice / Usage Charge
```

## 2. Telemetry Schema (`UsageEvent`)
Every usage event recorded across the 21 services contains:
- `id`: CUID identifier.
- `tenantId`: Cryptographically isolated workspace id.
- `metric`: Metered dimension (e.g. `ai.tokens.total`, `workflow.execution`, `api.request`, `storage.bytes`).
- `quantity`: Positive numeric magnitude.
- `source`: Reporting service (e.g. `ai-engine`, `automation`, `developer-gateway`).
- `sourceId`: Execution or task identifier.
- `idempotencyKey`: SHA256 or caller-provided unique token.
- `metadata`: JSON payload containing provider, model, latency, and agent attributions.
- `timestamp`: UTC timestamp.

## 3. Quota Evaluation & Threshold Alerts
The usage service tracks quota status against periodic limits:
- **NOMINAL (<50%)**: Green status. Normal operation.
- **THRESHOLD_50 (50% - 74%)**: Early advisory notification emitted.
- **THRESHOLD_75 (75% - 79%)**: System warning advisory logged.
- **THRESHOLD_80 (80% - 89%)**: High-usage alert dispatched to tenant admins.
- **THRESHOLD_90 (90% - 99%)**: Urgent warning; recommendations to upgrade or purchase credit add-ons.
- **EXHAUSTED (>=100%)**:
  - **Free / Starter Tiers**: Strictly enforced `BLOCK` action rejecting additional execution with 403 Forbidden.
  - **Business / Pro / Enterprise Tiers**: Metered overage billing triggered. Operations continue uninterrupted with overage line items generated on subsequent invoices.

## 4. Double-Entry Credit Ledger (`CreditLedger`)
To support prepaid credits, promotional trial rewards, and enterprise commitments, Business OS implements an immutable double-entry credit ledger:
- **Ledger Types**:
  - `INCLUDED`: Monthly plan quota replenishment.
  - `PURCHASED`: Stripe-purchased add-on packs.
  - `PROMOTIONAL`: Referral or trial incentives.
  - `ENTERPRISE`: Bespoke contract allowances.
  - `ROLLOVER`: Unused balances rolled forward.
  - `CONSUMED`: Negative delta entries debiting agent or workflow executions.
- **Invariant Guarantee**:
  - Net balance = `SUM(amount)` where `amount > 0` minus `SUM(ABS(amount))` where `amount < 0`.
  - Every grant and debit writes an auditable record with previous balance and `balanceAfter`.
  - Overdraft attempts (consuming more than total balance) are rejected atomically at the database layer.
