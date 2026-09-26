# Task: System Cleansing & Monochrome Minimalist Rework

**Goal**: Delete all demo and mock synthetic data, remove all emojis across the entire platform, eliminate all colorful/rainbow gradient text, and implement clean Linear/Vercel-style monochrome typography and refined empty states.

---

## 1. Database & Synthetic Demo Data Cleansing
- [x] Backup `packages/database/prisma/dev.db` to `dev.db.bak`.
- [x] Clear synthetic transactional data tables:
  - CRM: `Contact`, `Company`, `Deal`, `Activity`
  - Finance & Treasury: `Invoice`, `InvoiceLineItem`, `BankAccount`, `JournalEntry`, `JournalLineItem`, `PaymentLink`, `DailyBusinessRecord`, `BillingInvoice`, `BillingCustomer`, `EnterpriseContract`, `CreditLedger`
  - Helpdesk & Support: `Ticket`, `TicketMessage`
  - Inventory: `Product`, `StockMovement`, `Supplier`, `Category`
  - Projects: `Project`, `Task`
  - Documents: `Document`, `DocumentReference`
  - HR & Screenings: `CandidateScreeningResult`, `ScreeningProfile`
  - System logs: `AuditLog`, `ApprovalRequest`, `WorkflowExecution`, `WorkflowExecutionStep`, `UsageEvent`, `UsageDailyAggregate`, `AgentExecution`
  - Preserve core infrastructure: `Tenant` (`default-tenant`), `User` (`admin@gmail.com`), `Plan` (canonical tiers), `ModelRegistry`, `ToolDefinition`, `WorkflowTemplate`.

## 2. Frontend Emoji Removal & SVG Icon Replacement
- [x] `apps/web-core/src/components/industry/IndustryContext.tsx`:
  - Replace emoji icons (`🌐`, `🏥`, `🏡`, `🍽️`, `🛍️`, `🏭`, `🎨`, `⚡`) with clean Lucide icons (`Globe`, `Building2`, `Home`, `UtensilsCrossed`, `ShoppingBag`, `Factory`, `Palette`, `Layers`).
  - Remove all emoji characters in section titles (`✨ AI Intelligence` -> `AI Intelligence`).
- [x] `apps/web-core/src/components/industry/IndustrySwitcher.tsx`:
  - Render crisp Lucide icon instead of emoji string.
- [x] `apps/web-core/src/components/platform/LanguageContext.tsx` & `LanguageSwitcher.tsx`:
  - Replace emoji flags (`🇺🇸`, `🇪🇸`, `🇫🇷`, `🇦🇪`, `🇩🇪`, `🇮🇳`) with clean ISO text pills (`EN`, `ES`, `FR`, `AR`, `DE`, `HI`).
- [x] `apps/web-core/src/lib/navigation.config.ts`:
  - Audit and strip any emoji characters from navigation labels, badges, or domain descriptions.
- [x] `apps/web-core/src/components/platform/AIActionHub.tsx` & `WorkspaceShell.tsx`:
  - Ensure 100% SVG line icons (Lucide), zero emojis.

## 3. Colorful Text & Rainbow Gradients Cleansing
- [x] Replace flashy rainbow text gradients (`bg-gradient-to-r ... bg-clip-text text-transparent`) across core layouts, headers, and hero banners with crisp monochrome typography:
  - Dark mode: `text-white font-bold tracking-tight`
  - Light mode: `text-slate-900 font-bold tracking-tight`
  - Subtitles: `text-slate-400 dark:text-zinc-400 font-normal`
- [x] Neutralize aggressive multi-colored neon borders and bright pastel badge arrays into understated, minimalist zinc/slate tags.

## 4. Refined Production Empty States
- [x] Provide clean, elegant empty-state views for:
  - Invoices table
  - Contacts / Deals pipeline
  - Helpdesk tickets
  - Document vault
  - Project tasks
  - Each featuring a subtle line icon, clean typography ("No records yet"), and a single primary action button.

## 5. Verification & Validation
- [x] Run `tsc --noEmit` on `@repo/web-core`.
- [x] Verify dev server health and API status.
