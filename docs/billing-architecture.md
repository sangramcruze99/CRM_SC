# Business OS SaaS Billing Architecture

## 1. Overview
The **Business OS Commercial Control Plane** serves as the authoritative monetization, entitlement, and lifecycle management domain for the platform. It bridges commercial subscriptions, metered usage, AI unit economics, and multi-tenant isolation across all 21 microservices.

```
                    BUSINESS OS
                         │
              ┌──────────┴──────────┐
              │                     │
        BUSINESS PLANE         CONTROL PLANE
              │                     │
        21 Services          Identity / Tenants
              │               Billing / Stripe
        CRM / Sales           Plans & Versions
        Finance              Entitlements Engine
        Projects             Usage & Metering
        Support              Double-Entry Credits
        HR                   AI Budgets & Caps
        Inventory            Feature Flags
        CMS                  Security & Governance
              │                     │
              └──────────┬──────────┘
                         │
                    AI CONTROL
                         │
              Agents / Tools / RAG
                         │
                  AI Economics (COGS vs Revenue)
                         │
                  Observability & Kill Switches
                         │
                  Audit / Reconciliation
```

## 2. Service Ownership & Boundaries
- **Billing Microservice (`apps/billing` on `:3027`)**:
  - Owns customer billing accounts (`BillingCustomer`), subscriptions (`Subscription`), plan definitions (`Plan`, `PlanVersion`, `PlanPrice`), entitlement checks, usage metering (`UsageEvent`, `UsageLedgerDaily`), double-entry credits (`CreditLedger`), AI cost records (`AiExecutionCost`), AI budgets (`AiBudget`), coupons (`Coupon`), and emergency AI kill switches (`AiKillSwitch`).
  - Implements Stripe integration (Checkout, Customer Portal, Webhooks, Reconciliation).
- **Finance Microservice (`apps/finance` on `:3015`)**:
  - Owns business-level ledger accounting, dual-khata reconciliation, accounts receivable aging, and invoice generation for CRM customers.
- **AI Engine (`apps/ai-engine` on `:3010`)**:
  - Executes autonomous agent loops (Ares, Athena, Midas, Hermes, Vesta), streams prompts, and reports token and latency telemetry to Billing via durable outbox / HTTP endpoints.
- **Web Core Gateway (`apps/web-core` on `:4000`)**:
  - Next.js reverse proxy (`/api/billing/*` -> `http://localhost:3027/billing/*`) injecting tenant contexts and authorization tokens.

## 3. Strict 10-State Subscription Lifecycle Machine
Subscriptions transition through a formal finite state machine governed by `SubscriptionStateMachineService`:

```
           ┌────────────┐
           │  TRIALING  ├─────────────┐
           └──────┬─────┘             │
                  │                   ▼
                  │             ┌───────────┐
                  ├────────────►│  EXPIRED  │
                  ▼             └───────────┘
           ┌────────────┐
      ┌───►│   ACTIVE   │◄─────────────────────────┐
      │    └──────┬─────┘                          │
      │           │                                │
      │           ▼                                │
      │    ┌────────────┐                          │
      ├────┤  PAST_DUE  │                          │
      │    └──────┬─────┘                          │
      │           │                                │
      │           ▼                                │
      │    ┌──────────────┐                        │
      ├────┤ GRACE_PERIOD │                        │
      │    └──────┬───────┘                        │
      │           │                                │
      │           ▼                                │
      │    ┌────────────┐                          │
      ├────┤ RESTRICTED ├────────►┌───────────┐    │
      │    └──────┬─────┘         │ CANCELLED ├────┘
      │           │               └─────┬─────┘
      │           ▼                     │
      │    ┌────────────┐               ▼
      └────┤ SUSPENDED  │         ┌───────────┐
           └──────┬─────┘         │  EXPIRED  │
                  │               └─────┬─────┘
                  ▼                     ▼
           ┌────────────────┐     ┌───────────┐
           │ DELETED_PENDING├────►│  DELETED  │ (Terminal)
           └────────────────┘     └───────────┘
```

### State Privilege Matrix
| State | Login Allowed | Read Only | Mutations | AI Execution | Billing Mgmt | Retention Warning |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **TRIALING** | Yes | No | Yes | Yes | Yes | No |
| **ACTIVE** | Yes | No | Yes | Yes | Yes | No |
| **PAST_DUE** | Yes | No | Yes | Yes | Yes | Yes |
| **GRACE_PERIOD** | Yes | No | Yes | Throttled | Yes | Yes |
| **RESTRICTED** | Yes | Yes | No | No | Yes | Yes |
| **SUSPENDED** | Yes | Yes | No | No | Yes | Yes |
| **CANCELLED** | Yes | Yes | No | No | Yes | Yes |
| **EXPIRED** | Yes | Yes | No | No | Yes | Yes |
| **DELETED_PENDING** | No | Yes | No | No | No | Yes |
| **DELETED** | No | No | No | No | No | No |

## 4. Multi-Currency Engine
- Supported ISO Currencies: `USD`, `EUR`, `GBP`, `BDT`.
- All financial conversions produce auditable records:
  - `originalAmount`, `originalCurrency`, `convertedAmount`, `convertedCurrency`, `exchangeRate`, `exchangeRateTimestamp`.
- Currency conversions are provider-backed and never performed implicitly without audit trails.
