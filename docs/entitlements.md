# Central Entitlement Engine & Server-Side Enforcement

## 1. Principles
- **Centralized Authority**: No microservice independently verifies tier limits or hardcodes pricing logic. All access evaluations route to `EntitlementService` in `apps/billing`.
- **Defense in Depth**: Frontend navigation hiding is purely UX. Backend middleware and service guards enforce the canonical pipeline:
  ```
  Authentication → Tenant Extraction → RBAC Role → Subscription Status → Entitlement Check → Usage Headroom → Risk Policy Gate → Execution
  ```

## 2. Entitlement Dimensions
The entitlement engine evaluates 6 core dimensions:
1. **BOOLEAN (Feature Flags)**: e.g., `can(tenant, 'workflows.advanced')`, `can(tenant, 'enterprise.sso')`.
2. **LIMIT (Hard Quotas)**: e.g., `max_users`, `storage_bytes`.
3. **USAGE (Metered Quantities)**: e.g., current monthly tokens consumed.
4. **RATE (Velocity Caps)**: e.g., API requests per minute.
5. **QUOTA (Periodic Windows)**: e.g., monthly workflow runs.
6. **TIER (Plan Capabilities)**: `FREE`, `STARTER`, `BUSINESS`, `PRO`, `ENTERPRISE`.

## 3. Plan Catalog Limits
| Feature / Limit | FREE | STARTER | BUSINESS | PRO | ENTERPRISE |
|---|:---:|:---:|:---:|:---:|:---:|
| **Monthly Price (USD)** | $0 | $29 | $149 | $399 | Custom ($4,999+) |
| **Team Seats** | 2 | 5 | 25 | 100 | Unlimited / 500+ |
| **Monthly AI Tokens** | 100,000 | 1,000,000 | 5,000,000 | 25,000,000 | 100,000,000+ |
| **Monthly Workflows** | 100 | 1,000 | 10,000 | 50,000 | Custom |
| **Storage Capacity** | 1 GB | 10 GB | 100 GB | 500 GB | Custom / Unlimited |
| **Advanced Workflows** | No | No | Yes | Yes | Yes |
| **Autonomous Swarms** | No | No | Yes | Yes | Yes |
| **Audit Logs (SOC2)** | 7 Days | 30 Days | 90 Days | 1 Year | 7 Years Immutable |
| **SAML SSO / SCIM** | No | No | No | Yes | Yes |
| **Overage Protection** | Hard Block | Hard Block | Elastic Metered | Elastic Metered | Elastic Committed |

## 4. Enterprise Contract Overrides
Enterprise tenants with negotiated SLAs bypass standard tier constraints via `EnterpriseContract` overrides stored in the database:
- `customPrice`: Negotiated ARR/MRR.
- `customEntitlements`: JSON key-value feature overrides (e.g. enabling bespoke fine-tuned models).
- `customLimits`: Scaled limits (e.g. 500 seats, 100M tokens).
- `billingMethod`: `INVOICE_PO` (Purchase order billing with 30-day net terms).
- Automatically recognized by `getSafeEntitlements(tenantId)` with flag `hasEnterpriseContract: true`.

## 5. Invalidation & Caching Strategy
- Entitlements are cached in Redis / in-memory cache with a 60-second TTL.
- Immediate cache invalidation triggers on:
  1. Stripe subscription webhook delivery (`checkout.session.completed`, `customer.subscription.updated`).
  2. Manual plan upgrade / downgrade.
  3. Administrative entitlement override.
  4. Quota exhaustion transition.
