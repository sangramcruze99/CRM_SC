# Operational Runbook: Billing Reconciliation & Discrepancy Auditing

## 1. Purpose
This runbook provides step-by-step procedures for investigating and resolving discrepancies between Stripe's subscription records and the local Business OS billing database.

## 2. Trigger Conditions
- Alert: `BillingReconciliationDiscrepancyDetected` in Prometheus/Datadog.
- Automated reconciliation job logs `STATUS_MISMATCH`, `PLAN_MISMATCH`, or `ORPHAN_SUBSCRIPTION`.
- Customer reports access issues or plan mismatch after checkout.

## 3. Immediate Diagnostic Steps
1. **Trigger Manual Reconciliation Audit**:
   Execute via billing administrative endpoint:
   ```bash
   curl -X GET "http://localhost:3027/admin/billing/reconciliation" \
     -H "x-admin-key: ${ADMIN_SECRET_KEY}"
   ```
2. **Inspect Reconciliation Output**:
   Check the discrepancy array:
   - `STATUS_MISMATCH`: Local DB subscription status differs from Stripe status.
   - `PLAN_MISMATCH`: Local planId does not match Stripe Price/Product metadata.
   - `ORPHAN_SUBSCRIPTION`: Subscription exists in Stripe without local mapping.
3. **Verify Webhook Delivery Logs**:
   Check if Stripe webhooks failed to deliver:
   ```bash
   # Check recent webhook events
   curl -X GET "http://localhost:3027/billing/webhook/events?status=FAILED"
   ```

## 4. Resolution Procedures
### Scenario A: Missing Webhook Delivery
If a webhook was dropped during a network partition:
1. Locate the Stripe Event ID (e.g. `evt_...`) in the Stripe Dashboard.
2. Trigger manual webhook replay:
   ```bash
   curl -X POST "http://localhost:3027/billing/webhook/replay" \
     -H "Content-Type: application/json" \
     -d '{"stripeEventId": "evt_..."}'
   ```
3. Verify the event status transitions from `PENDING` to `PROCESSED`.

### Scenario B: Status Mismatch (Stripe Active, Local Past Due)
1. If the customer has successfully paid in Stripe but local status remained `PAST_DUE`:
   ```bash
   curl -X POST "http://localhost:3027/billing/subscription/transition" \
     -H "x-tenant-id: ${TENANT_ID}" \
     -H "Content-Type: application/json" \
     -d '{"nextState": "ACTIVE", "reason": "Operator manual reconciliation with Stripe payment verified"}'
   ```
2. Invalidate tenant entitlement cache:
   ```bash
   curl -X POST "http://localhost:3027/billing/cache/invalidate" \
     -H "x-tenant-id: ${TENANT_ID}"
   ```

## 5. Post-Resolution Verification
1. Query tenant entitlements:
   ```bash
   curl -X GET "http://localhost:3027/billing/entitlements" -H "x-tenant-id: ${TENANT_ID}"
   ```
2. Ensure `status: "ACTIVE"` and full plan limits are restored.
3. Close incident ticket with root cause analysis.
