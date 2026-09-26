# Task: Rework All 8 Industry Niche Dashboard Sections

**Goal**: Transform the main executive dashboard (`DashboardClient.tsx`) to deliver tailored, highly lucrative, specialized operational sections for all 8 industry niches:
1. **Master Enterprise (`all`)** — Cross-Department Conglomerate Throughput & Governance
2. **Hospital & Healthcare (`hospital`)** — Inpatient Bed Capacity, Emergency Triage, Doctor Roster & Digital Rx
3. **Real Estate & Property (`realestate`)** — MLS Portfolio, Escrow & Closing Vault, Leases & Commission
4. **Restaurant & F&B (`restaurant`)** — Kitchen Display System (KDS), Table Utilization, Covers & Food Cost
5. **Retail & E-Commerce (`retail`)** — Point-of-Sale (POS) Registers, Barcode Scanner, SKU Velocity & Reorder Alerts
6. **SME & Professional Services (`sme`)** — Client Retainer Burn, Billable Hours Tracking, WIP & Dual Khata
7. **Digital Agency & Media (`agency`)** — Client Ad Campaigns, Blended ROAS, Creative Sprints & Retainer Capacity
8. **Custom Enterprise (`custom`)** — Dynamic Schema Objects, Webhook Event Mesh, Microservice Registry

---

## Architecture & Implementation Plan

### 1. Niche Dashboard Section Component Architecture
- Create modular specialized niche section renderers inside `apps/web-core/src/components/industry/dashboard/`:
  - `MasterEnterpriseSection.tsx`
  - `HospitalSection.tsx`
  - `RealEstateSection.tsx`
  - `RestaurantSection.tsx`
  - `RetailSection.tsx`
  - `SmeSection.tsx`
  - `AgencySection.tsx`
  - `CustomSection.tsx`
  - `NicheSectionContainer.tsx` (Handles active niche selection, tab switching, and seamless integration into `DashboardClient.tsx`)

### 2. Rich Interactive Features for Each Niche
- **Hospital**: Live Bed Occupancy (ICU/Ward), Emergency Triage Queue, On-Call Doctor Roster, Digital Rx quick action.
- **Real Estate**: MLS Portfolio ($48.6M), Active Closings in Escrow, Lease Expirations (30d), Mortgage Calculator quick action.
- **Restaurant**: Live KDS active order states (Prep, Plated, Out for Delivery), Table utilization map, Daily Covers & Average Ticket.
- **Retail**: POS Register drawer status, Barcode labeling trigger, Low-stock SKU reorder alarms, Omnichannel sales breakdown.
- **SME**: Monthly Retainer hours burn rate, Billable vs Non-Billable breakdown, WIP accrual, Receivables Aging.
- **Agency**: Active Client Campaigns, ROAS tracker across Meta/Google/LinkedIn, Creative production pipeline, Retainer utilization.
- **Master Enterprise**: 360 Conglomerate Multi-Department Throughput, Autonomous Sentinel Fleet, Treasury & S3 Vault.
- **Custom Enterprise**: Custom Object Entities, Dynamic Field Mapping, Event-driven Webhook Mesh, Microservice Gateway.

### 3. Dashboard Integration
- Update `apps/web-core/src/app/dashboard/DashboardClient.tsx` to replace the static generic bento box with `NicheSectionContainer`, allowing immediate live preview and switching across all 8 niches.

### 4. Verification & Validation
- Run `pnpm --filter @repo/web-core exec tsc --noEmit` to verify 100% clean compilation.
- Verify HTTP 200 on `http://localhost:4000/dashboard`.
