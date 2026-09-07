# Stripe Integration Architecture & Webhook Store

## 1. Security & Credentials
- **Server-Side Isolation**: Stripe secret keys and webhook signing secrets are accessible **only** to `apps/billing`. No client application, frontend bundle, or public API receives secret credentials.
- **Environment Variables**:
  - `STRIPE_SECRET_KEY`: Secret API key (`sk_live_...` or `sk_test_...`).
  - `STRIPE_WEBHOOK_SECRET`: Webhook signing secret (`whsec_...`).
  - `STRIPE_PUBLISHABLE_KEY`: Public key (`pk_live_...` or `pk_test_...`).
  - `STRIPE_ENVIRONMENT`: `production` or `sandbox`.

## 2. Server-Authoritative Checkout & Portal
- **Checkout Sessions (`POST /billing/checkout`)**:
  - The client **never** specifies the price, discount, or subscription tier amount.
  - The client only passes `planKey` (e.g. `BUSINESS`) and `interval` (`monthly` or `annual`).
  - The server queries `Plan` and `PlanPrice`, computes applicable coupon discounts, resolves Stripe Customer ID, and creates an authenticated `stripe.checkout.sessions.create` object.
- **Customer Portal (`POST /billing/portal`)**:
  - Authoritative session generator allowing self-serve payment method updates, invoice downloads, and subscription cancel/resume.

## 3. Webhook Ingestion & Idempotency Store
Webhook endpoints receive asynchronous events from Stripe. Out-of-order delivery, network drops, and retries are natively handled by the `StripeWebhookEvent` store:

```
Stripe HTTP POST Request
     │
     ▼
Raw Request Body & HMAC Signature Extraction
     │
     ▼
Verify Signature (Stripe SDK constructEvent)
     │
     ▼
Check Idempotency: `findUnique(where: { stripeEventId })`
     │
 ┌───┴───────────────────────┐
 │ Duplicate / Processed     │ New Event
 ▼                           ▼
Skip with IGNORED_DUPLICATE  Record PENDING in DB
                             │
                             ▼
                    Process Event Transactionally
                    (checkout.session.completed,
                     customer.subscription.updated,
                     invoice.payment_succeeded, etc.)
                             │
                             ▼
                    Mark PROCESSED with timestamp
```

### Handled Webhook Events
1. `checkout.session.completed`: Upgrades tenant subscription to paid plan, allocates initial credits, provisions seats.
2. `customer.subscription.updated`: Reconciles renewal dates, billing intervals, cancellations, and status changes.
3. `customer.subscription.deleted`: Reverts tenant to `FREE` tier, dispatches warning emails, initiates data retention countdown.
4. `invoice.payment_succeeded`: Persists synchronized `BillingInvoice` in local database, records amount paid, grants monthly token credits.
5. `invoice.payment_failed`: Transitions subscription to `PAST_DUE`, triggers automated dunning lifecycle, notifies billing administrators.

## 4. Discrepancy Auditing & Reconciliation
- Scheduled cron reconciliation (`AdminBillingService.reconcileSubscriptions`) runs periodically.
- It compares Stripe's authoritative subscriptions against local database rows.
- Flags mismatches (`STATUS_MISMATCH`, `PLAN_MISMATCH`, `SEATS_MISMATCH`, `ORPHAN_SUBSCRIPTION`) without performing dangerous destructive deletes.
- Discrepancies generate actionable audit logs for manual review or safe auto-repair.
