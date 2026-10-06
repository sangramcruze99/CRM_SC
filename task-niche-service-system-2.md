# Niche Service System 2.0: Deep Service & Module Adaptation Plan

## Executive Summary
This document establishes the architecture, audit findings, and phased implementation plan for **Niche Service System 2.0**.
Rather than treating an industry niche as a superficial skin with cosmetic label changes, Niche Service System 2.0 dynamically adapts the entire Business Operating System experience upon workspace activation: services, service dependency graphs, navigation hierarchy, records, dashboards, quick actions, workflows, templates, custom fields, and empty states.

---

## Part 1: Comprehensive System Audit (Sections A - L)

### A. Existing Niche Architecture
- **State Layer (`IndustryContext.tsx`):**
  - Manages `currentNiche` (`'all' | 'hospital' | 'realestate' | 'restaurant' | 'retail' | 'sme' | 'agency' | 'custom'`).
  - Stores user preferences in `localStorage` under `business_os_niche` and `business_os_niche_features`.
  - Holds `NICHE_CONFIGS` with basic fields: `id`, `name`, `shortName`, `tagline`, `icon`, `terminology`, `navigationSections`.
  - Currently exposes generic toggle functions: `toggleFeature`, `setNicheFeatures`, `resetToNicheDefaults`.
- **Presentation Layer:**
  - `IndustryHubClient.tsx`: Renders 8 cards with activation button and modal trigger.
  - `IndustrySwitcher.tsx`: Dropdown pill in the top header.
  - `NicheFeaturePickerModal.tsx`: Matrix picker for 67 features across 12 categories.
  - `DashboardClient.tsx`: Top header pill + `<NicheSectionContainer />` rendering 8 custom operational components.

### B. Existing Service / Module Catalog
- **Feature Catalog (`featureCatalog.ts`):**
  - Contains 67 discrete features (`ALL_67_FEATURES`) across 12 categories (`FEATURE_CATEGORIES`):
    1. Core CRM & Operations
    2. AI & Neural Autonomy
    3. Financials, Salary & Dual Khata
    4. Multi-Industry Niche Hubs
    5. Marketing & Social Media
    6. B2B Lead Prospector
    7. OCR Neural Document Vision
    8. Real-Time Communication
    9. Legal, E-Sign & Contracts
    10. Low-Code Platform Engine
    11. Security, RBAC & Admin
    12. Glassmorphism UX & Pricing
  - Each item specifies: `id`, `name`, `shortDesc`, `category`, `categoryName`, `iconName`, `route`, `defaultInNiches`.

### C. Existing Routes (71 Application Subdirectories)
- **Shared Core Routes:**
  - CRM: `/contacts`, `/deals`, `/customer-360`, `/lead-prospector`, `/sales-department`, `/lead-qualification`, `/migration`
  - Finance: `/invoices`, `/banking`, `/qr-payments`, `/payment-links`, `/subscriptions`, `/billing`, `/forecast`, `/quotes`, `/price-books`, `/finance-department`, `/taxes`, `/ocr-invoice`
  - Operations & Projects: `/projects`, `/tasks`, `/inventory`, `/data-sync`
  - Documents & Legal: `/documents`, `/e-signatures`, `/ndas`, `/offer-letters`, `/s3-uploads`
  - People & HR: `/directory`, `/onboarding`, `/recruitment`
  - Support: `/tickets`, `/slas`, `/chat`, `/chat-widgets`, `/ai-support`
  - Marketing: `/email-marketing`, `/social`, `/site-builder`, `/branding`, `/content-repurpose`
  - Automation & AI: `/automation`, `/automations`, `/ai`, `/ai-agents`, `/ai-studio`
  - Analytics & Governance: `/dashboard`, `/reports`, `/observability`, `/audit-logs`, `/compliance`, `/settings`, `/super-admin`, `/customization`, `/marketplace`
- **Industry Routes:**
  - `/industry` (Hub)
  - `/industry/hospital` (Hospital Patient & Bed Management)
  - `/industry/realestate` (Real Estate MLS & Escrow Pipeline)
  - `/industry/restaurant` (Restaurant Floor Plan & KDS)
  - `/industry/retail` (Retail POS Cashier & Barcode Scanner)

### D. Existing Database Models (Prisma SQLite Schema)
- Total 115 Prisma models providing core business infrastructure:
  - Multi-tenant foundation: `Tenant`, `User`, `Role`, `Permission`, `WorkspaceSettings`
  - CRM & Relations: `Contact`, `Company`, `Deal`, `Activity`
  - Custom Entity & Schema Engine: `CustomObject`, `CustomField`, `CustomRecord`
  - Financial Ledger & Billing: `Invoice`, `InvoiceLineItem`, `Bill`, `BillLineItem`, `Payment`, `PaymentAllocation`, `BankAccount`, `BankTransaction`, `ChartOfAccount`, `JournalEntry`, `JournalLineItem`, `FinancialPeriod`, `Expense`, `CreditLedger`
  - Retail & Inventory: `Product`, `Category`, `Supplier`, `StockMovement`
  - Operations & Documents: `Project`, `Task`, `Ticket`, `Folder`, `Document`, `OfferLetter`, `NDA`, `ESignature`, `ReportTemplate`, `ReportRun`, `ReportSchedule`
  - Universal Automation: `Workflow`, `WorkflowVersion`, `WorkflowAction`, `WorkflowExecution`, `WorkflowTemplate`, `WorkflowTrigger`, `WorkflowVariable`

### E. Existing Navigation System (`navigation.config.ts`)
- `BUSINESS_DOMAINS` grouping 15 domains (`niche_hub`, `ai`, `automation`, `sales_crm`, `marketing`, `finance`, `customer_service`, `operations`, `projects`, `people`, `inventory`, `documents`, `analytics`, `administration`, `developer`).
- `MASTER_NAV_ITEMS` (140+ navigation item configurations).
- `NICHE_COMMAND_HUBS` defining custom operational tabs for specific niches.
- `resolveNavigationSections()` filters items via `isPathVisible` and applies dynamic terminology.
- **Audit Defect:** Current navigation displays almost all 15 business domains simultaneously even when a niche is active, leading to overwhelming generic navigation menus rather than an industry-tailored sidebar.

### F. Existing Terminology System
- Dynamic terminology dictionary in `IndustryContext.tsx`:
  - `contacts`, `deals`, `projects`, `invoices`, `products`, `tickets`.
- Applied via `resolveItemLabel()` in `navigation.config.ts`.
- **Audit Defect:** Limited to 6 string keys. Does not extend to actions ("Book Appointment", "Create Listing", "New Order"), records ("Patient", "Property", "Table", "Guest"), metrics ("Bed Occupancy", "Cap Rate", "Table Turnover", "MRR Churn"), or form titles.

### G. Existing Dashboard Configuration
- Single `DashboardClient.tsx` rendering two layouts:
  1. `BotanicalGlassCockpit` (Executive metrics & velocity)
  2. `classic_grid` (Executive ribbon, AI agent row, `<NicheSectionContainer />`, financial telemetry, quick dropzones, activity feed).
- We reworked `<NicheSectionContainer />` with 8 specialized operational sections.
- **Audit Defect:** The surrounding cockpit metrics (e.g. ARR, Gross Margin, Burn Velocity) and quick dropzones remain generic conglomerate metrics instead of adapting primary KPIs (e.g., Hospital Beds Occupancy, Real Estate MLS Escrow, Restaurant Covers, Retail Daily Register).

### H. Existing Feature Flags (`FeatureFlagContext.tsx`)
- 10 static flags (`khataLedger`, `neuralVisionOcr`, `socialStudio`, `emailMarketing`, `leadProspector`, `cpqQuotes`, `customObjects`, `eSignatures`, `complianceAuditing`, `multiLanguage`).
- Saved in `localStorage.business_os_feature_flags`.
- Disconnected from the 67 features in `featureCatalog.ts` and the active niche configuration.

### I. Existing Workflow & Template Connections
- `apps/automation/src/templates/workflow-templates.service.ts` seeds 12 canonical enterprise templates into `WorkflowTemplate`.
- Disconnected from industry niche profiles (e.g., Healthcare has no direct links to "Patient Intake Follow-up", Real Estate has no links to "Buyer Viewing Schedule", Restaurant has no links to "Low Stock Par Level Alert").

### J. Existing Niche-Specific Functionality
- Specialized industry views exist under `apps/web-core/src/app/industry/`:
  - `hospital/HospitalClient.tsx` (Patients, Triage, Rooms, DigitalRx modal)
  - `realestate/RealEstateClient.tsx` (MLS listings, Escrow, Mortgage calculator)
  - `restaurant/RestaurantClient.tsx` (Floor plan, Tables, KDS)
  - `retail/RetailPosClient.tsx` (Cashier POS, Barcode printer, Receipt)
- Specialized widgets:
  - `DigitalRxPrescriptionMaker.tsx`
  - `MortgageAmortizationCalculator.tsx`
  - `KitchenDisplaySystem.tsx`
  - `BarcodeLabelGenerator.tsx`
- Specialized dashboard operational telemetry components:
  - `HospitalSection.tsx`, `RealEstateSection.tsx`, `RestaurantSection.tsx`, `RetailSection.tsx`, `SmeSection.tsx`, `AgencySection.tsx`, `CustomSection.tsx`, `MasterEnterpriseSection.tsx`.

### K. Missing Service Connections
- **SME SaaS:** Lacks a dedicated `/industry/sme` route (currently points back to `/dashboard`).
- **Creative Agency:** Lacks a dedicated `/industry/agency` route (currently points to generic `/contacts`).
- **Custom Enterprise:** Lacks a dynamic compose-your-own workspace wizard.
- Missing service dependency validation (e.g., Medical Billing requiring Patient Management + Appointments).
- Missing Niche-Specific Quick Actions (e.g., "Add Patient", "Book Appointment", "New Property Listing").
- Missing Niche-Specific Empty States across records and tables.
- Missing Niche-Specific Curated Reports Catalog.

### L. Duplicate or Unused Services
- Overlapping routes: `/automation` vs `/automations`, `/reports` vs `/forecast`, `/deals` vs `/quotes`.
- Redundant feature arrays between `featureCatalog.ts` and `NICHE_COMMAND_HUBS` in `navigation.config.ts`.
- Redundant icon maps in `IndustrySwitcher` vs `IndustryContext`.

---

## Part 2: Architecture for Niche Service System 2.0

### 1. Universal Service Catalog (`apps/web-core/src/lib/services/serviceCatalog.ts`)
Authoritative registry of 50+ business and vertical services. Each service contains:
- `id`, `name`, `shortDesc`, `description`
- `category` (`CRM`, `SALES`, `FINANCE`, `OPERATIONS`, `DOCUMENTS`, `PEOPLE`, `MARKETING`, `SERVICE`, `ANALYTICS`, `AUTOMATION`, `HEALTHCARE`, `REAL_ESTATE`, `HOSPITALITY`, `RETAIL`)
- `iconName`, `route`
- `supportedNiches`
- `dependencies` (service IDs)
- `records` (record entity names)
- `quickActions`, `reports`, `workflowTemplates`, `aiCapabilities`

### 2. Centralized Niche Configuration 2.0 (`apps/web-core/src/lib/industry/nicheRegistry2.ts`)
Rich configurations for all 8 niches specifying:
- `coreServiceIds` (Primary mandatory domain services)
- `recommendedServiceIds` (Turnkey industry accelerators)
- `optionalServiceIds` (Cross-domain business services like HR, Marketing, Docs)
- `recordTypes` (Industry records with singular, plural, routes, icons)
- `customFields` (Specific custom fields mapped to standard objects)
- `dashboardKpis` (Industry-specific real-time metrics)
- `quickActions` (One-click modals and creation flows)
- `emptyStates` (Contextual guidance when data is empty)
- `reportCatalog` (Industry report templates)
- `workflowTemplates` (Industry automation templates)
- `aiPersona` (Niche AI advisor persona and prompt instructions)

### 3. Navigation Adaptation 2.0
Replaces generic 15-domain flat navigation with:
1. **Industry Operational Command Hub** (Core industry functions)
2. **Enabled Industry Services** (Appointments, Inventory, POS, Escrow, etc.)
3. **Essential Business Operations** (Finances, Documents, Team)
4. **Platform Extensions** (Collapsible "More Business Services")

### 4. Interactive Activation & Configuration Wizard
- Step 1: Choose Business Type & Template
- Step 2: Review & Customize Services (with real-time dependency auto-resolution)
- Step 3: Configure Terminology & Organization Details
- Step 4: Preview Workspace (Navigation, Dashboard, Quick Actions)
- Step 5: Activate Workspace with instant reload and persistence

---

## Part 3: Phased Implementation Roadmap

- [x] **Phase 1: Foundation Services & Registry**
  - Implement `serviceCatalog.ts` (Universal catalog of 50+ services with dependencies).
  - Implement `nicheRegistry2.ts` (Deep configuration profiles for all 8 niches).
- [x] **Phase 2: Service Dependency Engine & IndustryContext 2.0**
  - Add dependency resolution utilities (`validateDependencies`, `getRequiredDependencies`).
  - Upgrade `IndustryContext.tsx` to expose `activeServices`, `enableService`, `disableService`, `nicheConfig2`.
- [x] **Phase 3: Hierarchical Navigation Engine 2.0**
  - Upgrade `navigation.config.ts` to intelligently prioritize active industry services and group background capabilities.
- [x] **Phase 4: Marketplace & Interactive Activation Wizard**
  - Redesign `IndustryHubClient.tsx` into an Executive Marketplace & Configuration Studio with Service Explorer and guided 5-step Activation Wizard.
- [x] **Phase 5: SME & Creative Agency Vertical Views**
  - Build `apps/web-core/src/app/industry/sme/SmeClient.tsx`.
  - Build `apps/web-core/src/app/industry/agency/AgencyClient.tsx`.
- [x] **Phase 6: Reusable Niche Components**
  - Build `NicheQuickActions.tsx`.
  - Build `NicheEmptyState.tsx`.
- [x] **Phase 7: Dashboard Adaptation & Verification**
  - Connect dynamic KPI telemetry and quick actions into `DashboardClient.tsx`.
  - Run full TypeScript compilation check and test all 8 niches.
