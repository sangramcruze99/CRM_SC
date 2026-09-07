# Operational Runbook: Payment Failure & Dunning Lifecycle

## 1. Purpose
Defines the standard operating procedures for handling failed customer subscription payments, dunning sequences, grace period enforcement, and access restriction.

## 2. Failed-Payment State Flow
```
1. Payment Attempt Fails (Stripe Webhook: invoice.payment_failed)
       │
       ▼
2. Transition to PAST_DUE
   - Retain full feature access for 24h.
   - Dispatch courtesy notification to billing contact.
       │
       ▼
3. Transition to GRACE_PERIOD (Day 2 – Day 5)
   - Throttle high-frequency AI background tasks.
   - Display prominent amber banner in Billing UI with Stripe update link.
   - Automated retries by Stripe Smart Retries.
       │
       ▼
4. Transition to RESTRICTED (Day 6+)
   - Read-only access enabled for core CRM data.
   - Paid executions (AI agents, bulk automations) disabled.
   - Billing portal access preserved.
       │
       ▼
5. Transition to SUSPENDED / CANCELLED (Day 14+)
   - Workspace login disabled except for billing settlement screen.
```

## 3. Operator Investigation Steps
1. **Locate Invoice Failure Code**:
   Query failed invoice record:
   ```bash
   curl -X GET "http://localhost:3027/billing/invoices" -H "x-tenant-id: ${TENANT_ID}"
   ```
   Common failure reasons:
   - `card_declined` / `insufficient_funds`.
   - `expired_card`.
   - `authentication_required` (3D Secure step-up needed).
2. **Review Midas (AI Finance Agent) Dunning Recommendation**:
   Query Finance Department AR Sentinel:
   ```bash
   curl -X GET "http://localhost:3015/finance/dunning/recommendation/${TENANT_ID}"
   ```
   - Tone calibration: `COURTESY_NUDGE`, `FIRM_REMINDER`, `FINAL_NOTICE`.

## 4. Remediation Actions
1. **Send Instant Stripe Hosted Invoice Link**:
   Provide the customer with the authenticated payment link:
   ```bash
   # URL retrieved from invoice.hostedInvoiceUrl
   https://pay.stripe.com/invoice/inv_...
   ```
2. **Grant Temporary Grace Extension (Customer Support Approval)**:
   If an enterprise customer is awaiting PO processing:
   ```bash
   curl -X POST "http://localhost:3027/billing/subscription/transition" \
     -H "x-tenant-id: ${TENANT_ID}" \
     -H "Content-Type: application/json" \
     -d '{"nextState": "GRACE_PERIOD", "reason": "Authorized 5-day PO processing extension"}'
   ```
3. **Restore Full Access on Payment**:
   Upon successful settlement, `invoice.payment_succeeded` webhook automatically transitions subscription back to `ACTIVE` and invalidates caches.
