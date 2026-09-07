# Enterprise SaaS Billing & Bespoke Contracts

## 1. Overview
Enterprise customers operate under commercial terms distinct from self-serve credit card subscriptions. The Business OS enterprise billing domain supports custom pricing, committed usage pools, purchase order invoicing (PO), SLA credits, and administrative seat provisions.

## 2. Enterprise Contract Architecture (`EnterpriseContract`)
Enterprise agreements are captured in the authoritative database table:
```prisma
model EnterpriseContract {
  id                 String    @id @default(cuid())
  tenantId           String    @unique
  contractNumber     String    @unique
  planId             String    @default("ENTERPRISE")
  customPrice        Float
  currency           String    @default("USD")
  billingMethod      String    @default("INVOICE_PO")
  customEntitlements String    // JSON of negotiated features
  customLimits       String    // JSON of seat/token allowances
  startDate          DateTime
  endDate            DateTime
  renewalDate        DateTime?
  status             String    @default("ACTIVE")
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
}
```

## 3. Dedicated Enterprise Capabilities
1. **Invoice & Purchase Order Billing**:
   - Generates B2B downloadable PDF invoices with Net-30 / Net-60 payment terms.
   - Attaches PO numbers and corporate VAT/Tax IDs.
2. **Annual Committed AI Usage Pools**:
   - Upfront committed token allowances (e.g. 100M - 1B tokens) with volume discount tiering.
   - Rollover credits for unused committed capacity into adjacent billing quarters.
3. **Advanced Governance & Security Entitlements**:
   - Dedicated Single Sign-On (`enterprise.sso`) via SAML 2.0 and OIDC.
   - Immutable SOC2 Type II audit log retention (`enterprise.audit`).
   - Custom Model Fine-Tuning & Private LoRA deployments (`ai.custom_fine_tune`).
   - Bring-Your-Own-Key (BYOK) AI provider routing.
4. **Administrative Overrides (`AdminBillingController`)**:
   - Allows platform operators to apply bespoke entitlement overrides and contract renewals via authenticated API:
     - `POST /admin/billing/enterprise/contract`
     - `POST /admin/billing/entitlements/override`
