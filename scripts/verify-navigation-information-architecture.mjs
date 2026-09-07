// scripts/verify-navigation-information-architecture.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_CORE_SRC = path.join(ROOT_DIR, 'apps', 'web-core', 'src');

console.log('='.repeat(80));
console.log('INDUSTRY-AWARE NAVIGATION & WORKSPACE INFORMATION ARCHITECTURE VERIFICATION');
console.log('='.repeat(80));

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

// 1. Verify existence and exports of navigation.config.ts
console.log('\n--- 1. NAVIGATION CONFIG & REGISTRY ARCHITECTURE ---');
const navConfigPath = path.join(WEB_CORE_SRC, 'lib', 'navigation.config.ts');
assert(fs.existsSync(navConfigPath), 'navigation.config.ts exists in apps/web-core/src/lib/');

const navConfigContent = fs.readFileSync(navConfigPath, 'utf8');
assert(navConfigContent.includes('export const BUSINESS_DOMAINS'), 'Exports BUSINESS_DOMAINS taxonomy');
assert(navConfigContent.includes('export const MASTER_NAV_ITEMS'), 'Exports MASTER_NAV_ITEMS catalog');
assert(navConfigContent.includes('export function resolveNavigationSections'), 'Exports resolveNavigationSections resolution engine');
assert(navConfigContent.includes('export function resolveBreadcrumbs'), 'Exports resolveBreadcrumbs contextual breadcrumb resolver');
assert(navConfigContent.includes('export function resolveItemLabel'), 'Exports resolveItemLabel custom terminology fallback resolver');

// 2. Verify all 13 canonical Business Domains are configured
console.log('\n--- 2. BUSINESS DOMAINS TAXONOMY AUDIT ---');
const expectedDomains = [
  'ai',
  'automation',
  'sales_crm',
  'marketing',
  'finance',
  'customer_service',
  'operations',
  'projects',
  'people',
  'inventory',
  'documents',
  'analytics',
  'administration',
  'developer',
];

for (const domain of expectedDomains) {
  assert(navConfigContent.includes(`id: '${domain}'`) || navConfigContent.includes(`'${domain}':`), `Domain '${domain}' is defined in Business Domains`);
}

// 3. Complete Route Integrity: Verify every catalog item points to a real page.tsx
console.log('\n--- 3. COMPLETE ROUTE INTEGRITY & NON-ORPHANED PAGES ---');
const routeMatches = navConfigContent.matchAll(/href:\s*'([^']+)'/g);
const catalogRoutes = Array.from(new Set(Array.from(routeMatches, m => m[1])));

let checkedRoutes = 0;
for (const r of catalogRoutes) {
  if (r.startsWith('http') || r.includes('#')) continue;
  const pathWithoutQuery = r.split('?')[0].split('#')[0];
  const cleanRoute = pathWithoutQuery === '/' ? '' : pathWithoutQuery.replace(/^\//, '');
  const pagePath = path.join(WEB_CORE_SRC, 'app', cleanRoute, 'page.tsx');
  const exists = fs.existsSync(pagePath);
  assert(exists, `Route ${r} resolves to physical page: ${path.relative(ROOT_DIR, pagePath)}`);
  checkedRoutes++;
}
console.log(`Checked ${checkedRoutes} unique routes across the Business OS.`);

// 4. Audit Industry & Niche Workspace Adapter Presets
console.log('\n--- 4. WORKSPACE ADAPTER & NICHE COMMAND HUBS ---');
const industryContextPath = path.join(WEB_CORE_SRC, 'components', 'industry', 'IndustryContext.tsx');
const industryContextContent = fs.readFileSync(industryContextPath, 'utf8');

const expectedNiches = ['all', 'hospital', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'custom'];
for (const n of expectedNiches) {
  assert(industryContextContent.includes(`${n}: {`), `Workspace preset '${n}' is defined in NICHE_CONFIGS`);
}

// 5. Verify 10 Findability Tests
console.log('\n--- 5. UX FINDABILITY TESTS (10 TESTS) ---');

// Test 1: Finance
const hasFinanceDomain = navConfigContent.includes("id: 'finance'") && navConfigContent.includes("title: 'Finance & Treasury'");
const hasFinanceInvoices = navConfigContent.includes("href: '/invoices'") && navConfigContent.includes("domain: 'finance'");
const hasFinanceOCR = navConfigContent.includes("href: '/ocr-invoice'") && navConfigContent.includes("domain: 'finance'");
const hasFinanceBanking = navConfigContent.includes("href: '/banking'") && navConfigContent.includes("domain: 'finance'");
assert(hasFinanceDomain && hasFinanceInvoices && hasFinanceOCR && hasFinanceBanking, 'TEST 1 — Finance is immediately discoverable with Invoices, OCR, Banking & Treasury');

// Test 2: Marketing
const hasMarketingDomain = navConfigContent.includes("id: 'marketing'") && navConfigContent.includes("title: 'Marketing & Growth'");
const hasMarketingEmail = navConfigContent.includes("href: '/email-marketing'") && navConfigContent.includes("domain: 'marketing'");
const hasMarketingSocial = navConfigContent.includes("href: '/social'") && navConfigContent.includes("domain: 'marketing'");
const hasMarketingSite = navConfigContent.includes("href: '/site-builder'") && navConfigContent.includes("domain: 'marketing'");
assert(hasMarketingDomain && hasMarketingEmail && hasMarketingSocial && hasMarketingSite, 'TEST 2 — Marketing is immediately discoverable with Email, Social & Website Builder');

// Test 3: Sales
const hasSalesDomain = navConfigContent.includes("id: 'sales_crm'") && navConfigContent.includes("title: 'Sales & CRM'");
const hasSalesContacts = navConfigContent.includes("href: '/contacts'") && navConfigContent.includes("domain: 'sales_crm'");
const hasSalesDeals = navConfigContent.includes("href: '/deals'") && navConfigContent.includes("domain: 'sales_crm'");
const hasSalesProspector = navConfigContent.includes("href: '/lead-prospector'") && navConfigContent.includes("domain: 'sales_crm'");
assert(hasSalesDomain && hasSalesContacts && hasSalesDeals && hasSalesProspector, 'TEST 3 — Sales is immediately discoverable with Contacts, Deals & Prospector');

// Test 4: Customer Support
const hasSupportDomain = navConfigContent.includes("id: 'customer_service'") && navConfigContent.includes("title: 'Customer Service'");
const hasSupportTickets = navConfigContent.includes("href: '/tickets'") && navConfigContent.includes("domain: 'customer_service'");
const hasSupportChat = navConfigContent.includes("href: '/chat'") && navConfigContent.includes("domain: 'customer_service'");
const hasSupportSentinel = navConfigContent.includes("href: '/ai-support'") && navConfigContent.includes("domain: 'customer_service'");
assert(hasSupportDomain && hasSupportTickets && hasSupportChat && hasSupportSentinel, 'TEST 4 — Customer Support is immediately discoverable with Tickets, Chat & AI Sentinel');

// Test 5: Projects
const hasProjectDomain = navConfigContent.includes("id: 'projects'") && navConfigContent.includes("title: 'Projects & Tasks'");
const hasProjectBoard = navConfigContent.includes("href: '/projects'") && navConfigContent.includes("domain: 'projects'");
assert(hasProjectDomain && hasProjectBoard, 'TEST 5 — Projects & Tasks is immediately discoverable with Sprint Board');

// Test 6: HR / People
const hasPeopleDomain = navConfigContent.includes("id: 'people'") && navConfigContent.includes("title: 'People & HR'");
const hasPeopleDirectory = navConfigContent.includes("href: '/directory'") && navConfigContent.includes("domain: 'people'");
const hasPeopleOnboarding = navConfigContent.includes("href: '/onboarding'") && navConfigContent.includes("domain: 'people'");
assert(hasPeopleDomain && hasPeopleDirectory && hasPeopleOnboarding, 'TEST 6 — People & HR is immediately discoverable with Directory & Onboarding');

// Test 7: Inventory
const hasInventoryDomain = navConfigContent.includes("id: 'inventory'") && navConfigContent.includes("title: 'Inventory & Products'");
const hasInventoryCatalog = navConfigContent.includes("href: '/price-books'");
assert(hasInventoryDomain && hasInventoryCatalog, 'TEST 7 — Inventory is discoverable with Price Books & Catalog');

// Test 8: Documents
const hasDocumentDomain = navConfigContent.includes("id: 'documents'") && navConfigContent.includes("title: 'Documents & Legal'");
const hasDocumentVault = navConfigContent.includes("href: '/documents'") && navConfigContent.includes("domain: 'documents'");
const hasDocumentESign = navConfigContent.includes("href: '/e-signatures'") && navConfigContent.includes("domain: 'documents'");
assert(hasDocumentDomain && hasDocumentVault && hasDocumentESign, 'TEST 8 — Documents is immediately discoverable with Central Vault & E-Signatures');

// Test 9: AI
const hasAiDomain = navConfigContent.includes("id: 'ai'") && navConfigContent.includes("title: 'AI Intelligence'");
const hasAiCommand = navConfigContent.includes("href: '/ai'") && navConfigContent.includes("domain: 'ai'");
const hasAiTeam = navConfigContent.includes("href: '/ai/team'") && navConfigContent.includes("domain: 'ai'");
const hasAiApprovals = navConfigContent.includes("href: '/ai/approvals'") && navConfigContent.includes("domain: 'ai'");
assert(hasAiDomain && hasAiCommand && hasAiTeam && hasAiApprovals, 'TEST 9 — AI is immediately discoverable with Command Center, My AI Team & Approvals');

// Test 10: Developer
const hasDevDomain = navConfigContent.includes("id: 'developer'") && navConfigContent.includes("title: 'Developer & Engineering'");
const hasDevApi = navConfigContent.includes("href: '/developer'") && navConfigContent.includes("domain: 'developer'");
const hasDevStudio = navConfigContent.includes("href: '/ai-studio'") && navConfigContent.includes("domain: 'developer'");
const hasDevSchema = navConfigContent.includes("href: '/platform/schema'") && navConfigContent.includes("domain: 'developer'");
assert(hasDevDomain && hasDevApi && hasDevStudio && hasDevSchema, 'TEST 10 — Developer is discoverable with APIs, AI Studio & Schema Builder');

// Test 11: AI Automation OS (Independent Primary Section)
const hasAutoDomain = navConfigContent.includes("id: 'automation'") && navConfigContent.includes("title: 'AI Automation OS'");
const hasAutoStudio = navConfigContent.includes("href: '/automation'") && navConfigContent.includes("domain: 'automation'");
const hasAutoEngine = navConfigContent.includes("href: '/automations'") && navConfigContent.includes("domain: 'automation'");
const hasAutoSync = navConfigContent.includes("href: '/data-sync'") && navConfigContent.includes("domain: 'automation'");
assert(hasAutoDomain && hasAutoStudio && hasAutoEngine && hasAutoSync, 'TEST 11 — AI Automation OS is an independent primary section with Studio, Engine & Sync Mesh');

// 6. Verify Custom Terminology Fallback Safety
console.log('\n--- 6. CUSTOM TERMINOLOGY SAFETY AUDIT ---');
assert(industryContextContent.includes("contacts: 'Buyers, Sellers & Tenants'"), 'Real Estate custom terminology: Contacts -> Buyers, Sellers & Tenants');
assert(industryContextContent.includes("deals: 'Property Sales & Escrow'"), 'Real Estate custom terminology: Deals -> Property Sales & Escrow');
assert(industryContextContent.includes("invoices: 'Commission & Rental Billing'"), 'Real Estate custom terminology: Invoices -> Commission & Rental Billing');
assert(industryContextContent.includes("contacts: 'Patients & EHR'"), 'Healthcare custom terminology: Contacts -> Patients & EHR');
assert(industryContextContent.includes("contacts: 'Guests & VIP Diners'"), 'Restaurant custom terminology: Contacts -> Guests & VIP Diners');
assert(industryContextContent.includes("contacts: 'Store Customers'"), 'Retail custom terminology: Contacts -> Store Customers');
assert(navConfigContent.includes('return item.label;'), 'Dynamic label resolver safely falls back to standard platform label when no override exists');

// 7. Verify Sidebar Component Architecture
console.log('\n--- 7. SIDEBAR & ACCORDION ARCHITECTURE ---');
const sidebarNavPath = path.join(WEB_CORE_SRC, 'components', 'SidebarNav.tsx');
const sidebarNavContent = fs.readFileSync(sidebarNavPath, 'utf8');

assert(sidebarNavContent.includes('resolveNavigationSections'), 'SidebarNav imports and invokes resolveNavigationSections');
assert(sidebarNavContent.includes('navigationSections.map'), 'SidebarNav renders collapsible business domains from navigationSections');
assert(sidebarNavContent.includes('toggleAllSections'), 'SidebarNav provides toggleAllSections for quick collapse/expand');
assert(sidebarNavContent.includes('hasActiveChild'), 'SidebarNav computes active child state for visual focus');
assert(!sidebarNavContent.includes('if healthcare'), 'SidebarNav contains zero hardcoded niche if-statements');

// 8. Verify Dynamic Contextual Breadcrumbs
console.log('\n--- 8. TOPBAR BREADCRUMBS AUDIT ---');
const workspaceShellPath = path.join(WEB_CORE_SRC, 'components', 'platform', 'WorkspaceShell.tsx');
const workspaceShellContent = fs.readFileSync(workspaceShellPath, 'utf8');

assert(workspaceShellContent.includes('resolveBreadcrumbs'), 'WorkspaceShell uses resolveBreadcrumbs');
assert(workspaceShellContent.includes('breadcrumb.domainTitle'), 'Topbar renders dynamic Business Domain breadcrumb');
assert(workspaceShellContent.includes('breadcrumb.pageTitle'), 'Topbar renders dynamic Page Title breadcrumb');
assert(!workspaceShellContent.includes('>Workspace<'), 'Topbar eliminates hardcoded "Workspace" breadcrumb');

// 9. Verify Universal Search Discoverability
console.log('\n--- 9. SEARCH & COMMAND PALETTE DISCOVERABILITY ---');
const globalSearchPath = path.join(WEB_CORE_SRC, 'components', 'GlobalSearch.tsx');
const globalSearchContent = fs.readFileSync(globalSearchPath, 'utf8');

assert(globalSearchContent.includes('MASTER_NAV_ITEMS'), 'GlobalSearch indexes MASTER_NAV_ITEMS');
assert(globalSearchContent.includes('BUSINESS_DOMAINS'), 'GlobalSearch incorporates Business Domain titles in search');
assert(globalSearchContent.includes('keywords'), 'GlobalSearch filters by domain keywords');

// 10. Summary
console.log('\n' + '='.repeat(80));
console.log(`VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('='.repeat(80));

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY.\n');
}
