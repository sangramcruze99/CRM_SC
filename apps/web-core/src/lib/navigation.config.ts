// apps/web-core/src/lib/navigation.config.ts
import { IndustryNiche, NicheMetadata } from '@/components/industry/IndustryContext';

export type BusinessDomainId =
  | 'niche_hub'
  | 'ai'
  | 'automation'
  | 'sales_crm'
  | 'marketing'
  | 'finance'
  | 'customer_service'
  | 'operations'
  | 'projects'
  | 'people'
  | 'inventory'
  | 'documents'
  | 'analytics'
  | 'administration'
  | 'developer';

export interface BusinessDomainMetadata {
  id: BusinessDomainId;
  title: string;
  shortTitle: string;
  iconName: string;
  description: string;
  defaultExpanded?: boolean;
}

export const BUSINESS_DOMAINS: Record<BusinessDomainId, BusinessDomainMetadata> = {
  niche_hub: {
    id: 'niche_hub',
    title: 'Operational Command Hub',
    shortTitle: 'Operations Hub',
    iconName: 'Sparkles',
    description: 'Specialized niche command center and core workflows.',
    defaultExpanded: true,
  },
  ai: {
    id: 'ai',
    title: 'AI Intelligence',
    shortTitle: 'AI',
    iconName: 'Sparkles',
    description: 'Autonomous AI agents, approvals, activity feed and usage controls.',
    defaultExpanded: false,
  },
  automation: {
    id: 'automation',
    title: 'AI Automation OS',
    shortTitle: 'Automation OS',
    iconName: 'Workflow',
    description: 'Visual DAG pipelines, trigger rules, cross-service event mesh and automated execution.',
    defaultExpanded: false,
  },
  sales_crm: {
    id: 'sales_crm',
    title: 'Sales & CRM',
    shortTitle: 'Sales & CRM',
    iconName: 'Briefcase',
    description: 'Pipeline velocity, contacts, accounts, deals and prospecting.',
    defaultExpanded: true,
  },
  marketing: {
    id: 'marketing',
    title: 'Marketing & Growth',
    shortTitle: 'Marketing',
    iconName: 'TrendingUp',
    description: 'Campaigns, newsletters, visual email studio, social media and website builder.',
    defaultExpanded: false,
  },
  finance: {
    id: 'finance',
    title: 'Finance & Treasury',
    shortTitle: 'Finance',
    iconName: 'Landmark',
    description: 'Commercial invoicing, OCR scanner, banking, QR payments, billing and subscriptions.',
    defaultExpanded: false,
  },
  customer_service: {
    id: 'customer_service',
    title: 'Customer Service',
    shortTitle: 'Support',
    iconName: 'Ticket',
    description: 'Helpdesk tickets, customer success, unified inbox and live chat.',
    defaultExpanded: false,
  },
  operations: {
    id: 'operations',
    title: 'Operations & Comms',
    shortTitle: 'Operations',
    iconName: 'Phone',
    description: 'AI softphone, SIM gateway, telephony and client extranet portal.',
    defaultExpanded: false,
  },
  projects: {
    id: 'projects',
    title: 'Projects & Tasks',
    shortTitle: 'Projects',
    iconName: 'ClipboardList',
    description: 'Sprint boards, kitchen orders queue, inspections and milestone tracking.',
    defaultExpanded: false,
  },
  people: {
    id: 'people',
    title: 'People & HR',
    shortTitle: 'People',
    iconName: 'Users',
    description: 'Employee directory, leadership hierarchy tree and onboarding pipeline.',
    defaultExpanded: false,
  },
  inventory: {
    id: 'inventory',
    title: 'Inventory & Products',
    shortTitle: 'Inventory',
    iconName: 'Layers',
    description: 'Price books, SKU barcodes, pharmacy formulary and property catalog.',
    defaultExpanded: false,
  },
  documents: {
    id: 'documents',
    title: 'Documents & Legal',
    shortTitle: 'Documents',
    iconName: 'Folder',
    description: 'Centralized document vault, e-signatures, NDAs, offer letters and IDP.',
    defaultExpanded: false,
  },
  analytics: {
    id: 'analytics',
    title: 'Analytics & BI',
    shortTitle: 'Analytics',
    iconName: 'Activity',
    description: 'Revenue forecasts, rep leaderboards, system observability and reports.',
    defaultExpanded: false,
  },
  administration: {
    id: 'administration',
    title: 'Administration & Security',
    shortTitle: 'Admin',
    iconName: 'Shield',
    description: 'Tenant management, audit logs, compliance, branding and customizer.',
    defaultExpanded: false,
  },
  developer: {
    id: 'developer',
    title: 'Developer & Engineering',
    shortTitle: 'Developer',
    iconName: 'Code2',
    description: 'API keys, webhooks, schema builder, AI studio and search indexer.',
    defaultExpanded: false,
  },
};

export type TerminologyKey = 'contacts' | 'deals' | 'projects' | 'invoices' | 'products' | 'tickets';

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  iconName: string;
  badge?: string;
  domain: BusinessDomainId;
  terminologyKey?: TerminologyKey;
  keywords?: string[];
  requiredPermission?: string;
  isAiAutomation?: boolean;
  agentId?: string;
}

export interface NavResolvedItem {
  id: string;
  label: string;
  href: string;
  iconName: string;
  badge?: string;
  domain: BusinessDomainId;
  isAiAutomation?: boolean;
  agentId?: string;
}

export interface ResolvedNavSection {
  domainId: BusinessDomainId;
  sectionTitle: string;
  iconName: string;
  defaultExpanded: boolean;
  items: NavResolvedItem[];
  aiItems?: NavResolvedItem[];
}

// Master authoritative navigation catalog items
export const MASTER_NAV_ITEMS: NavItemConfig[] = [
  // --- AI Intelligence ---
  { id: 'ai-center', label: 'AI Command Center', href: '/ai', iconName: 'Sparkles', badge: 'Command', domain: 'ai', keywords: ['ai', 'copilot', 'assistant', 'chat'] },
  { id: 'ai-team', label: 'My AI Team', href: '/ai/team', iconName: 'Users', badge: '6 Roles', domain: 'ai', keywords: ['ai', 'team', 'agents', 'roles'] },
  { id: 'ai-approvals', label: 'AI Approvals', href: '/ai/approvals', iconName: 'CheckCircle2', badge: 'Review', domain: 'ai', keywords: ['ai', 'approvals', 'human in the loop'] },
  { id: 'ai-activity', label: 'AI Activity Feed', href: '/ai/activity', iconName: 'Activity', domain: 'ai', keywords: ['ai', 'feed', 'logs', 'audit'] },
  { id: 'ai-automations', label: 'AI Automations', href: '/ai/automations', iconName: 'Workflow', badge: 'Auto', domain: 'ai', keywords: ['ai', 'automations', 'triggers'] },
  { id: 'ai-usage', label: 'AI Usage & Limits', href: '/ai/usage', iconName: 'DollarSign', domain: 'ai', keywords: ['ai', 'usage', 'tokens', 'credits', 'cost'] },
  { id: 'ai-trust', label: 'AI Trust & Privacy', href: '/ai/trust', iconName: 'Shield', domain: 'ai', keywords: ['ai', 'trust', 'privacy', 'safety', 'guardrails'] },

  // --- Sales & CRM ---
  { id: 'crm-dashboard', label: 'Executive Dashboard', href: '/dashboard', iconName: 'LayoutDashboard', domain: 'sales_crm', keywords: ['dashboard', 'home', 'overview', 'metrics'] },
  { id: 'crm-contacts', label: 'Contacts & Accounts', href: '/contacts', iconName: 'Users', domain: 'sales_crm', terminologyKey: 'contacts', keywords: ['contacts', 'accounts', 'leads', 'customers', 'clients', 'crm'] },
  { id: 'crm-customer-360', label: 'Customer 360 Graph', href: '/customer-360', iconName: 'Users', badge: '360°', domain: 'sales_crm', keywords: ['customer', '360', 'graph', 'relationship'] },
  { id: 'crm-deals', label: 'Deals Pipeline', href: '/deals', iconName: 'Briefcase', domain: 'sales_crm', terminologyKey: 'deals', keywords: ['deals', 'pipeline', 'opportunities', 'sales', 'stages'] },
  { id: 'crm-prospector', label: 'Lead Prospector', href: '/lead-prospector', iconName: 'Database', badge: '275M+', domain: 'sales_crm', keywords: ['prospector', 'leads', 'b2b', 'apollo', 'zoominfo'] },
  { id: 'crm-sales-dept', label: 'AI Sales Department', href: '/sales-department', iconName: 'TrendingUp', badge: 'Autonomous', domain: 'sales_crm', keywords: ['sales', 'department', 'autonomous', 'reps'] },
  { id: 'crm-migration', label: 'CRM Migration Studio', href: '/migration', iconName: 'ArrowRightLeft', badge: 'Import', domain: 'sales_crm', keywords: ['migration', 'import', 'hubspot', 'salesforce'] },

  // --- Marketing & Growth ---
  { id: 'mkt-email', label: 'Email Marketing', href: '/email-marketing', iconName: 'Mail', badge: 'Campaigns', domain: 'marketing', keywords: ['marketing', 'email', 'campaigns', 'newsletter', 'broadcast', 'sequences'] },
  { id: 'mkt-email-builder', label: 'Visual Email Builder', href: '/platform/templates/email', iconName: 'Palette', badge: 'Studio', domain: 'marketing', keywords: ['marketing', 'email builder', 'template', 'drag and drop'] },
  { id: 'mkt-social', label: 'Social Media Studio', href: '/social', iconName: 'Share2', badge: 'AI', domain: 'marketing', keywords: ['marketing', 'social', 'twitter', 'linkedin', 'facebook', 'instagram', 'posts'] },
  { id: 'mkt-site-builder', label: 'Website & Landing Builder', href: '/site-builder', iconName: 'Layout', badge: 'No-Code', domain: 'marketing', keywords: ['marketing', 'website', 'landing page', 'builder', 'cms'] },

  // --- Finance & Treasury ---
  { id: 'fin-invoices', label: 'Commercial Invoices', href: '/invoices', iconName: 'Receipt', domain: 'finance', terminologyKey: 'invoices', keywords: ['finance', 'invoices', 'billing', 'accounts receivable', 'payments'] },
  { id: 'fin-ocr', label: 'AI OCR Invoice Scanner', href: '/ocr-invoice', iconName: 'Scan', badge: 'OCR', domain: 'finance', keywords: ['finance', 'ocr', 'invoice', 'receipt', 'scan', 'extraction'] },
  { id: 'fin-banking', label: 'Bank & Forex Accounts', href: '/banking', iconName: 'Landmark', badge: 'Reconcile', domain: 'finance', keywords: ['finance', 'banking', 'forex', 'reconciliation', 'cash'] },
  { id: 'fin-qr', label: 'QR Payments POS', href: '/qr-payments', iconName: 'Scan', badge: 'POS', domain: 'finance', keywords: ['finance', 'qr', 'payments', 'pos', 'instant'] },
  { id: 'fin-links', label: 'Instant Payment Links', href: '/payment-links', iconName: 'Zap', domain: 'finance', keywords: ['finance', 'payment links', 'checkout', 'stripe'] },
  { id: 'fin-subscriptions', label: 'SaaS Subscriptions & MRR', href: '/subscriptions', iconName: 'DollarSign', badge: 'MRR', domain: 'finance', keywords: ['finance', 'subscriptions', 'mrr', 'recurring', 'saas'] },
  { id: 'fin-billing', label: 'SaaS Billing & Plans', href: '/settings/billing', iconName: 'CreditCard', badge: 'Tiers', domain: 'finance', keywords: ['finance', 'billing', 'plans', 'packaging', 'seats'] },
  { id: 'fin-forecast', label: 'Boardroom Deck & Forecast', href: '/forecast', iconName: 'Presentation', badge: 'Forecast', domain: 'finance', keywords: ['finance', 'forecast', 'revenue', 'boardroom', 'deck'] },
  { id: 'fin-quotes', label: 'Commercial CPQ Quotes', href: '/quotes', iconName: 'FileBadge', domain: 'finance', keywords: ['finance', 'quotes', 'cpq', 'proposals', 'pricing'] },
  { id: 'fin-pricebooks', label: 'Price Books & Catalog', href: '/price-books', iconName: 'Layers', domain: 'finance', terminologyKey: 'products', keywords: ['finance', 'products', 'price books', 'catalog', 'items', 'services'] },
  { id: 'fin-dept', label: 'AI Finance Department', href: '/finance-department', iconName: 'Landmark', badge: 'Autonomous', domain: 'finance', keywords: ['finance', 'ai finance', 'autonomous', 'ledger'] },
  { id: 'fin-taxes', label: 'Tax & GST Settings', href: '/taxes', iconName: 'Receipt', domain: 'finance', keywords: ['finance', 'taxes', 'vat', 'gst', 'rates'] },

  // --- Customer Service & Helpdesk ---
  { id: 'cs-tickets', label: 'Helpdesk Tickets', href: '/tickets', iconName: 'Ticket', domain: 'customer_service', terminologyKey: 'tickets', keywords: ['support', 'tickets', 'helpdesk', 'customer service', 'triage'] },
  { id: 'cs-dept', label: 'AI Customer Success Dept', href: '/customer-success', iconName: 'ShieldCheck', badge: 'Autonomous', domain: 'customer_service', keywords: ['support', 'customer success', 'autonomous', 'cs'] },
  { id: 'cs-slas', label: 'SLA Escalation Policies', href: '/slas', iconName: 'Clock', domain: 'customer_service', keywords: ['support', 'sla', 'escalation', 'policies', 'timers'] },
  { id: 'cs-inbox', label: 'Unified Inbox', href: '/inbox', iconName: 'MessageSquare', badge: '6-in-1', domain: 'customer_service', keywords: ['support', 'inbox', 'messages', 'omnichannel', 'email', 'chat'] },
  { id: 'cs-chat', label: 'Team Chat Channels', href: '/chat', iconName: 'MessageSquare', domain: 'customer_service', keywords: ['support', 'team chat', 'slack', 'channels'] },
  { id: 'cs-chat-widgets', label: 'Embeddable Chat Widgets', href: '/chat-widgets', iconName: 'Globe', domain: 'customer_service', keywords: ['support', 'chat widgets', 'live chat', 'website'] },

  // --- AI Automation OS ---
  { id: 'auto-studio', label: 'AI Automation OS Studio', href: '/automation', iconName: 'Sparkles', badge: 'v2.5', domain: 'automation', keywords: ['automation', 'workflows', 'studio', 'dag', 'ai automation os', 'pipeline'] },
  { id: 'auto-engine', label: 'Automations Engine & Rules', href: '/automations', iconName: 'Workflow', badge: 'Zapier', domain: 'automation', keywords: ['automation', 'automations', 'triggers', 'connectors', 'webhooks'] },
  { id: 'auto-sync', label: 'Cross-Service Data Sync Mesh', href: '/data-sync', iconName: 'ArrowRightLeft', badge: 'Mesh', domain: 'automation', keywords: ['automation', 'sync', 'integration', 'mesh', 'etl'] },

  // --- Operations & Comms ---
  { id: 'ops-voice', label: 'AI Softphone & VoIP', href: '/voice', iconName: 'Phone', badge: 'VoIP', domain: 'operations', keywords: ['operations', 'phone', 'voip', 'calls', 'softphone'] },
  { id: 'ops-sim', label: 'SIM Gateway & SMS', href: '/sim-gateway', iconName: 'Smartphone', badge: 'Dual-SIM', domain: 'operations', keywords: ['operations', 'sim', 'sms', 'gateway', 'telephony'] },
  { id: 'ops-portal', label: 'Client Extranet Portal', href: '/portal', iconName: 'Globe', badge: 'Portal', domain: 'operations', keywords: ['operations', 'client portal', 'extranet', 'customers'] },

  // --- Projects & Tasks ---
  { id: 'proj-board', label: 'Sprint Kanban Board', href: '/projects', iconName: 'LayoutGrid', domain: 'projects', terminologyKey: 'projects', keywords: ['projects', 'tasks', 'sprints', 'kanban', 'milestones'] },
  { id: 'proj-todo', label: 'To-Do & Task List', href: '/projects?view=list', iconName: 'CheckSquare', domain: 'projects', keywords: ['to-do', 'tasks', 'todo', 'task list', 'checklist', 'milestones'] },

  // --- People & HR ---
  { id: 'hr-directory', label: 'Employee Directory & Org Tree', href: '/directory', iconName: 'Contact', badge: 'Org', domain: 'people', keywords: ['people', 'hr', 'employees', 'directory', 'org tree', 'hierarchy', 'staff'] },
  { id: 'hr-onboarding', label: 'Employee Onboarding', href: '/onboarding', iconName: 'Users', domain: 'people', keywords: ['people', 'hr', 'onboarding', 'hiring', 'recruitment'] },

  // --- Documents & Legal ---
  { id: 'doc-vault', label: 'Central Document Vault', href: '/documents', iconName: 'Folder', domain: 'documents', keywords: ['documents', 'vault', 'files', 'storage', 'attachments'] },
  { id: 'doc-esign', label: 'Digital E-Signatures', href: '/e-signatures', iconName: 'FileSignature', domain: 'documents', keywords: ['documents', 'e-signatures', 'sign', 'contracts'] },
  { id: 'doc-ndas', label: 'Confidentiality NDAs', href: '/ndas', iconName: 'FileCheck', domain: 'documents', keywords: ['documents', 'ndas', 'legal', 'agreements'] },
  { id: 'doc-offers', label: 'Employment Offer Letters', href: '/offer-letters', iconName: 'FileCheck', domain: 'documents', keywords: ['documents', 'offer letters', 'employment', 'hr'] },
  { id: 'doc-s3', label: 'Cloud Direct Storage', href: '/s3-uploads', iconName: 'CloudUpload', domain: 'documents', keywords: ['documents', 's3', 'cloud', 'uploads', 'storage'] },

  // --- Analytics & BI ---
  { id: 'analytics-reports', label: 'Business Journal & Reports', href: '/reports', iconName: 'Activity', badge: 'Journal', domain: 'analytics', keywords: ['business journal', 'journal', 'daily journal', 'analytics', 'reports', 'bi', 'metrics', 'exports', 'calendar', 'periods'] },
  { id: 'analytics-observability', label: 'Platform Observability', href: '/observability', iconName: 'Activity', badge: 'Mesh', domain: 'analytics', keywords: ['analytics', 'observability', 'traces', 'telemetry', 'health'] },
  { id: 'analytics-leaderboard', label: 'Sales Leaderboards', href: '/leaderboard', iconName: 'Trophy', badge: 'Reps', domain: 'analytics', keywords: ['analytics', 'leaderboard', 'sales', 'reps', 'gamification'] },

  // --- Administration & Security ---
  { id: 'adm-super', label: 'Super Admin Console', href: '/super-admin', iconName: 'Building', domain: 'administration', keywords: ['admin', 'super admin', 'tenants', 'organizations'] },
  { id: 'adm-branding', label: 'White-Label & Branding', href: '/branding', iconName: 'Palette', badge: 'CNAME', domain: 'administration', keywords: ['admin', 'branding', 'white-label', 'cname', 'logo'] },
  { id: 'adm-customization', label: 'Customization Studio', href: '/customization', iconName: 'Sliders', badge: 'Studio', domain: 'administration', keywords: ['admin', 'customization', 'theme', 'layout', 'styling'] },
  { id: 'adm-compliance', label: 'SOC2 & HIPAA Compliance', href: '/compliance', iconName: 'ShieldAlert', badge: 'Audit', domain: 'administration', keywords: ['admin', 'compliance', 'soc2', 'hipaa', 'security'] },
  { id: 'adm-audit', label: 'Tamper-Evident Audit Logs', href: '/audit-logs', iconName: 'ShieldCheck', domain: 'administration', keywords: ['admin', 'audit logs', 'security', 'events'] },
  { id: 'adm-roles', label: 'Roles & RBAC Permissions', href: '/platform/roles', iconName: 'Shield', domain: 'administration', keywords: ['admin', 'roles', 'permissions', 'rbac', 'access'] },
  { id: 'adm-nav', label: 'Navigation Builder', href: '/platform/navigation', iconName: 'FolderTree', domain: 'administration', keywords: ['admin', 'navigation', 'builder', 'sidebar', 'menu'] },
  { id: 'adm-marketplace', label: 'Marketplace & Integrations', href: '/marketplace', iconName: 'ShoppingBag', domain: 'administration', keywords: ['admin', 'marketplace', 'integrations', 'plugins', 'apps'] },

  // --- Developer & Engineering ---
  { id: 'dev-api', label: 'Developer APIs & Webhooks', href: '/developer', iconName: 'Code2', badge: 'REST', domain: 'developer', keywords: ['developer', 'api', 'keys', 'webhooks', 'docs'] },
  { id: 'dev-ai-studio', label: 'Enterprise AI Studio', href: '/ai-studio', iconName: 'Brain', badge: 'v4.8', domain: 'developer', keywords: ['developer', 'ai studio', 'models', 'prompt engineering', 'llm'] },
  { id: 'dev-ai-agents', label: 'Governed AI Fleet (OODA)', href: '/ai-agents', iconName: 'Bot', badge: 'Fleet', domain: 'developer', keywords: ['developer', 'ai agents', 'fleet', 'runtime', 'ooda'] },
  { id: 'dev-schema', label: 'Low-Code Schema Builder', href: '/platform/schema', iconName: 'Database', domain: 'developer', keywords: ['developer', 'schema', 'entities', 'database', 'builder'] },
  { id: 'dev-objects', label: 'Custom Objects Studio', href: '/platform/objects', iconName: 'Layers', domain: 'developer', keywords: ['developer', 'objects', 'custom entities', 'records'] },
  { id: 'dev-pages', label: 'Dynamic Page Builder', href: '/platform/pages', iconName: 'Layout', domain: 'developer', keywords: ['developer', 'page builder', 'forms', 'views'] },
  { id: 'dev-vector', label: 'Vector AI Knowledge Base', href: '/platform/ai', iconName: 'Database', domain: 'developer', keywords: ['developer', 'vector', 'rag', 'embeddings', 'knowledge base'] },
  { id: 'dev-search-index', label: 'Full-Text Search Indexer', href: '/search-index', iconName: 'SearchCheck', domain: 'developer', keywords: ['developer', 'search', 'indexer', 'elasticsearch', 'meilisearch'] },
  { id: 'dev-localization', label: 'Localization & i18n Studio', href: '/localization', iconName: 'Globe2', domain: 'developer', keywords: ['developer', 'localization', 'i18n', 'translations', 'languages'] },
];

/**
 * Master Authoritative Contextual AI Automation Items.
 * Every business domain exposes dedicated, discoverable AI agents and automations.
 */
export const MASTER_AI_AUTOMATION_ITEMS: NavItemConfig[] = [
  // --- People & HR AI Automation ---
  { id: 'hr-recruitment-agent', label: 'Recruitment Agent', href: '/onboarding?agent=recruitment', iconName: 'Bot', badge: 'AI', domain: 'people', isAiAutomation: true, agentId: 'recruitment', keywords: ['hr', 'recruitment', 'agent', 'hiring', 'candidates'] },
  { id: 'hr-onboarding-agent', label: 'Employee Onboarding Agent', href: '/onboarding?agent=onboarding', iconName: 'Bot', badge: 'AI', domain: 'people', isAiAutomation: true, agentId: 'onboarding', keywords: ['hr', 'onboarding', 'agent', 'new hire'] },
  { id: 'hr-assistant', label: 'HR Assistant', href: '/directory?agent=hr_assistant', iconName: 'Bot', badge: 'AI', domain: 'people', isAiAutomation: true, agentId: 'hr_assistant', keywords: ['hr', 'assistant', 'policy', 'pto'] },

  // --- Finance & Treasury AI Automation ---
  { id: 'fin-midas', label: 'Midas — Finance AI', href: '/finance-department', iconName: 'Bot', badge: 'Agent', domain: 'finance', isAiAutomation: true, agentId: 'midas', keywords: ['finance', 'midas', 'ar', 'collections', 'agent'] },
  { id: 'fin-invoice-followup', label: 'Invoice Follow-up', href: '/ai/approvals?dept=finance', iconName: 'Zap', badge: 'Auto', domain: 'finance', isAiAutomation: true, keywords: ['finance', 'invoice', 'follow up', 'reminders'] },
  { id: 'fin-payment-risk', label: 'Payment Risk Detection', href: '/finance-department#risk', iconName: 'ShieldCheck', badge: 'Sentinel', domain: 'finance', isAiAutomation: true, keywords: ['finance', 'risk', 'detection', 'debtor'] },

  // --- Sales & CRM AI Automation ---
  { id: 'sales-ares', label: 'Ares — Deal Velocity Agent', href: '/sales-department', iconName: 'Bot', badge: 'Agent', domain: 'sales_crm', isAiAutomation: true, agentId: 'ares', keywords: ['sales', 'ares', 'deal velocity', 'agent'] },
  { id: 'sales-lead-qualification', label: 'Lead Qualification AI', href: '/lead-qualification', iconName: 'Zap', badge: 'Hot', domain: 'sales_crm', isAiAutomation: true, keywords: ['sales', 'qualification', 'leads', 'scoring'] },
  { id: 'sales-followup', label: 'Sales Follow-up Sentinel', href: '/sales-department#followup', iconName: 'Sparkles', badge: 'Auto', domain: 'sales_crm', isAiAutomation: true, keywords: ['sales', 'follow-up', 'pipeline', 'stalled'] },

  // --- Marketing & Growth AI Automation ---
  { id: 'mkt-content-opt', label: 'Content Optimization Agent', href: '/content-repurpose', iconName: 'Bot', badge: '5-in-1', domain: 'marketing', isAiAutomation: true, keywords: ['marketing', 'content', 'optimization', 'repurpose'] },
  { id: 'mkt-social-copilot', label: 'Social Growth Copilot', href: '/social?agent=marketing', iconName: 'Sparkles', badge: 'AI', domain: 'marketing', isAiAutomation: true, agentId: 'marketing', keywords: ['marketing', 'social', 'growth'] },

  // --- Customer Service AI Automation ---
  { id: 'cs-athena', label: 'Athena — Retention Sentinel', href: '/customer-success', iconName: 'Bot', badge: 'Sentinel', domain: 'customer_service', isAiAutomation: true, agentId: 'athena', keywords: ['support', 'athena', 'retention', 'churn'] },
  { id: 'cs-support-agent', label: 'Customer Support Agent', href: '/ai-support', iconName: 'Bot', badge: '24/7', domain: 'customer_service', isAiAutomation: true, agentId: 'support', keywords: ['support', 'care', 'agent', 'helpdesk'] },

  // --- AI Automation OS AI Automation ---
  { id: 'auto-hermes', label: 'Hermes — Workflow Conductor', href: '/automation?agent=hermes', iconName: 'Bot', badge: 'Agent', domain: 'automation', isAiAutomation: true, agentId: 'hermes', keywords: ['automation', 'hermes', 'workflows', 'dag', 'conductor'] },
  { id: 'auto-flow-builder', label: 'Workflow Flow Builder AI', href: '/automation#builder', iconName: 'Sparkles', badge: 'Auto', domain: 'automation', isAiAutomation: true, keywords: ['automation', 'builder', 'generator'] },
  { id: 'auto-trigger-sentinel', label: 'Event Trigger Sentinel', href: '/automations#triggers', iconName: 'Zap', badge: 'Sentinel', domain: 'automation', isAiAutomation: true, keywords: ['automation', 'triggers', 'sentinel'] },

  // --- Operations & Comms AI Automation ---
  { id: 'ops-voice-copilot', label: 'Softphone Voice Copilot', href: '/voice?agent=copilot', iconName: 'Bot', badge: 'AI', domain: 'operations', isAiAutomation: true, keywords: ['operations', 'voice', 'copilot', 'telephony'] },

  // --- Projects & Tasks AI Automation ---
  { id: 'proj-copilot', label: 'Sprint Copilot & Task Sentinel', href: '/projects?agent=hermes', iconName: 'Bot', badge: 'AI', domain: 'projects', isAiAutomation: true, agentId: 'hermes', keywords: ['projects', 'sprint', 'copilot', 'tasks'] },

  // --- Documents & Legal AI Automation ---
  { id: 'doc-intelligence', label: 'Document Intelligence & OCR', href: '/ocr-invoice', iconName: 'Scan', badge: 'OCR', domain: 'documents', isAiAutomation: true, agentId: 'documents', keywords: ['documents', 'intelligence', 'ocr'] },
  { id: 'doc-idp-extract', label: 'Intelligent IDP Extraction', href: '/idp', iconName: 'Bot', badge: 'IDP', domain: 'documents', isAiAutomation: true, keywords: ['documents', 'idp', 'extraction'] },

  // --- Analytics & BI AI Automation ---
  { id: 'analytics-copilot', label: 'Analytics Copilot', href: '/reports#copilot', iconName: 'Sparkles', badge: 'AI', domain: 'analytics', isAiAutomation: true, keywords: ['analytics', 'copilot', 'bi', 'insights'] },
];

/**
 * Niche-specific operational command hubs displayed prominently when an industry niche is active.
 */
const NICHE_COMMAND_HUBS: Record<string, { sectionTitle: string; iconName: string; items: NavItemConfig[]; aiItems?: NavItemConfig[] }> = {
  hospital: {
    sectionTitle: 'Clinical Operations',
    iconName: 'Stethoscope',
    items: [
      { id: 'hosp-hub', label: 'Clinical Command Hub', href: '/industry/hospital', iconName: 'Stethoscope', badge: 'Live', domain: 'niche_hub', keywords: ['hospital', 'clinical', 'command hub', 'patients'] },
      { id: 'hosp-patients', label: 'Patients Directory (EHR)', href: '/contacts', iconName: 'Users', badge: 'EHR', domain: 'niche_hub', terminologyKey: 'contacts', keywords: ['patients', 'ehr', 'records'] },
      { id: 'hosp-appointments', label: 'Doctor Appointment Queue', href: '/industry/hospital#appointments', iconName: 'Calendar', domain: 'niche_hub', keywords: ['doctor', 'appointments', 'schedule'] },
      { id: 'hosp-triage', label: 'Patient Triage & Inquiries', href: '/tickets', iconName: 'Ticket', domain: 'niche_hub', terminologyKey: 'tickets', keywords: ['triage', 'patient', 'inquiries', 'helpdesk'] },
    ],
  },
  realestate: {
    sectionTitle: 'Real Estate & Property Hub',
    iconName: 'Home',
    items: [
      { id: 're-hub', label: 'Property Command Center', href: '/industry/realestate', iconName: 'Home', badge: 'MLS', domain: 'niche_hub', keywords: ['real estate', 'property', 'mls', 'brokerage'] },
      { id: 're-buyers', label: 'Buyer & Seller Directory', href: '/contacts', iconName: 'Users', domain: 'niche_hub', terminologyKey: 'contacts', keywords: ['buyers', 'sellers', 'tenants', 'landlords'] },
      { id: 're-deals', label: 'Sales & Escrow Pipeline', href: '/deals', iconName: 'Briefcase', domain: 'niche_hub', terminologyKey: 'deals', keywords: ['escrow', 'property deals', 'sales pipeline'] },
      { id: 're-showings', label: 'Property Showings & Tasks', href: '/projects', iconName: 'ClipboardList', domain: 'niche_hub', terminologyKey: 'projects', keywords: ['showings', 'inspections', 'site visits'] },
      { id: 're-listings', label: 'Property Inventory Catalog', href: '/price-books', iconName: 'Layers', domain: 'niche_hub', terminologyKey: 'products', keywords: ['property listings', 'units', 'catalog'] },
    ],
    aiItems: [
      { id: 're-vesta', label: 'Vesta — Property Sentinel', href: '/industry/realestate?agent=vesta', iconName: 'Bot', badge: 'Agent', domain: 'niche_hub', isAiAutomation: true, agentId: 'vesta', keywords: ['real estate', 'vesta', 'property', 'escrow'] },
    ],
  },
  restaurant: {
    sectionTitle: 'Floor & Kitchen Operations',
    iconName: 'UtensilsCrossed',
    items: [
      { id: 'rest-hub', label: 'Table Floor Plan & Host Desk', href: '/industry/restaurant', iconName: 'UtensilsCrossed', badge: 'Live', domain: 'niche_hub', keywords: ['restaurant', 'floor plan', 'host desk', 'tables'] },
      { id: 'rest-kitchen', label: 'Kitchen Orders Queue (KOT)', href: '/projects', iconName: 'ClipboardList', domain: 'niche_hub', terminologyKey: 'projects', keywords: ['kitchen', 'orders', 'kot', 'tickets'] },
      { id: 'rest-guests', label: 'VIP Guests & Diners', href: '/contacts', iconName: 'Users', domain: 'niche_hub', terminologyKey: 'contacts', keywords: ['guests', 'vip', 'diners', 'customers'] },
      { id: 'rest-menu', label: 'Food & Beverage Menu', href: '/price-books', iconName: 'Layers', domain: 'niche_hub', terminologyKey: 'products', keywords: ['menu', 'food', 'beverage', 'drinks', 'prices'] },
    ],
  },
  retail: {
    sectionTitle: 'Point of Sale & Shop Counter',
    iconName: 'ShoppingBag',
    items: [
      { id: 'ret-hub', label: 'Cashier POS & Register', href: '/industry/retail', iconName: 'ShoppingBag', badge: 'POS', domain: 'niche_hub', keywords: ['retail', 'pos', 'cashier', 'register', 'counter'] },
      { id: 'ret-khata', label: 'Customer Khata Credit Book', href: '/contacts', iconName: 'Users', domain: 'niche_hub', terminologyKey: 'contacts', keywords: ['khata', 'store customers', 'credit book', 'dues'] },
      { id: 'ret-ledger', label: 'Retail Sales Receipts', href: '/invoices', iconName: 'Receipt', domain: 'niche_hub', terminologyKey: 'invoices', keywords: ['sales', 'receipts', 'invoices', 'bills'] },
      { id: 'ret-skus', label: 'Barcode Inventory SKUs', href: '/price-books', iconName: 'Layers', domain: 'niche_hub', terminologyKey: 'products', keywords: ['inventory', 'skus', 'barcodes', 'stock'] },
    ],
  },
  sme: {
    sectionTitle: 'Revenue & SaaS Platform',
    iconName: 'Briefcase',
    items: [
      { id: 'sme-rev', label: 'Executive Revenue Dashboard', href: '/dashboard', iconName: 'LayoutDashboard', domain: 'niche_hub', keywords: ['revenue', 'dashboard', 'mrr'] },
      { id: 'sme-contacts', label: 'Accounts & Key Contacts', href: '/contacts', iconName: 'Users', domain: 'niche_hub', terminologyKey: 'contacts', keywords: ['accounts', 'contacts', 'leads'] },
      { id: 'sme-pipeline', label: 'Multi-Stage Deals Pipeline', href: '/deals', iconName: 'Briefcase', domain: 'niche_hub', terminologyKey: 'deals', keywords: ['deals', 'pipeline', 'sales'] },
      { id: 'sme-subs', label: 'MRR SaaS Subscriptions', href: '/subscriptions', iconName: 'DollarSign', badge: 'MRR', domain: 'niche_hub', keywords: ['saas', 'subscriptions', 'mrr'] },
    ],
  },
  agency: {
    sectionTitle: 'Client & Agency Operations',
    iconName: 'Users',
    items: [
      { id: 'agn-clients', label: 'Client Accounts & Stakeholders', href: '/contacts', iconName: 'Users', domain: 'niche_hub', terminologyKey: 'contacts', keywords: ['clients', 'accounts', 'stakeholders'] },
      { id: 'agn-pitches', label: 'Pitch & Retainer Proposals', href: '/deals', iconName: 'Briefcase', domain: 'niche_hub', terminologyKey: 'deals', keywords: ['pitches', 'retainers', 'proposals', 'deals'] },
      { id: 'agn-deliverables', label: 'Client Sprints & Deliverables', href: '/projects', iconName: 'ClipboardList', domain: 'niche_hub', terminologyKey: 'projects', keywords: ['sprints', 'deliverables', 'tasks'] },
      { id: 'agn-rates', label: 'Agency Service Rate Cards', href: '/price-books', iconName: 'Layers', domain: 'niche_hub', terminologyKey: 'products', keywords: ['rate cards', 'pricing', 'services'] },
    ],
  },
};

/**
 * Resolves the user-facing label applying dynamic custom terminology from the active workspace.
 */
export function resolveItemLabel(item: NavItemConfig, terminology?: NicheMetadata['terminology']): string {
  if (item.terminologyKey && terminology && terminology[item.terminologyKey]) {
    const custom = terminology[item.terminologyKey];
    if (custom && custom.trim().length > 0) {
      return custom;
    }
  }
  return item.label;
}

export interface ResolveNavigationOptions {
  niche: IndustryNiche;
  nicheConfig: NicheMetadata;
  activeFeatureIds: string[];
  isPathVisible: (path: string) => boolean;
  pathname?: string;
}

/**
 * Authoritative Navigation Resolution Engine.
 * Resolves active workspace, custom features, terminology, and permissions into curated Business Domains.
 */
export function resolveNavigationSections({
  niche,
  nicheConfig,
  activeFeatureIds,
  isPathVisible,
  pathname = '',
}: ResolveNavigationOptions): ResolvedNavSection[] {
  const terminology = nicheConfig.terminology;
  const sections: ResolvedNavSection[] = [];

  // Helper to map and filter a set of item configs
  const mapItems = (items: NavItemConfig[]): NavResolvedItem[] => {
    return items
      .filter((item) => isPathVisible(item.href))
      .map((item) => ({
        id: item.id,
        label: resolveItemLabel(item, terminology),
        href: item.href,
        iconName: item.iconName,
        badge: item.badge,
        domain: item.domain,
        isAiAutomation: item.isAiAutomation,
        agentId: item.agentId,
      }));
  };

  // Helper to check if any child is active (supports nested sub-routes and cleans queries/hashes)
  const hasActiveChild = (items: { href: string; agentId?: string }[]) => {
    if (!pathname) return false;
    const cleanPath = pathname.split('?')[0].split('#')[0];
    return items.some((item) => {
      if (item.agentId) return false;
      const [baseWithoutHash] = item.href.split('#');
      const [itemClean] = baseWithoutHash.split('?');
      if (itemClean === cleanPath) return true;
      if (itemClean !== '/' && itemClean !== '/dashboard' && cleanPath.startsWith(itemClean + '/')) {
        return true;
      }
      return false;
    });
  };

  // 1. If a specialized Industry Niche is active (hospital, realestate, restaurant, retail, sme, agency),
  // inject its specialized Operational Command Hub first!
  if (niche !== 'all' && niche !== 'custom' && NICHE_COMMAND_HUBS[niche]) {
    const hub = NICHE_COMMAND_HUBS[niche];
    const visibleHubItems = mapItems(hub.items);
    const visibleHubAiItems = hub.aiItems ? mapItems(hub.aiItems) : [];
    if (visibleHubItems.length > 0 || visibleHubAiItems.length > 0) {
      sections.push({
        domainId: 'niche_hub',
        sectionTitle: hub.sectionTitle,
        iconName: hub.iconName,
        defaultExpanded: true,
        items: visibleHubItems,
        aiItems: visibleHubAiItems.length > 0 ? visibleHubAiItems : undefined,
      });
    }
  }

  // 2. Resolve Standard Business Domains
  // Define canonical domain ordering for maximum user findability
  const DOMAIN_ORDER: BusinessDomainId[] = [
    'ai',
    'automation',
    'sales_crm',
    'marketing',
    'finance',
    'customer_service',
    'projects',
    'people',
    'operations',
    'documents',
    'analytics',
    'administration',
    'developer',
  ];

  for (const domainId of DOMAIN_ORDER) {
    const meta = BUSINESS_DOMAINS[domainId];
    if (!meta) continue;

    // Filter master catalog items belonging to this domain
    let domainItems = MASTER_NAV_ITEMS.filter((item) => item.domain === domainId);

    // If in Custom Workspace mode, restrict strictly to active features!
    if (niche === 'custom') {
      domainItems = domainItems.filter((item) => {
        // Keep core home/dashboard always
        if (item.href === '/dashboard' || item.href === '/ai') return true;
        return activeFeatureIds.some((fId) => {
          // Check route matching against catalog
          return item.href === '/contacts' && fId === 'feat_contacts'
            || item.href === '/deals' && fId === 'feat_deals'
            || (item.href === '/projects' || item.href === '/projects?view=list') && fId === 'feat_projects'
            || item.href === '/invoices' && fId === 'feat_invoices'
            || item.href === '/ocr-invoice' && fId === 'feat_ocr_invoicing'
            || item.href === '/tickets' && fId === 'feat_tickets'
            || item.href === '/email-marketing' && fId === 'feat_email_marketing'
            || item.href === '/social' && fId === 'feat_social_media'
            || item.href === '/lead-prospector' && fId === 'feat_lead_prospector'
            || item.href === '/documents' && fId === 'feat_document_vault'
            || item.href === '/directory' && fId === 'feat_employee_org_tree'
            || item.href === '/automation' && (fId === 'feat_automations' || fId === 'feat_operations')
            || item.href === '/automations' && (fId === 'feat_automations' || fId === 'feat_operations')
            || item.href === '/data-sync' && (fId === 'feat_automations' || fId === 'feat_operations');
        });
      });
    }

    // In specialized industry niches, prune redundant deep items from secondary categories
    // so the navigation remains tight and contextually focused!
    if (niche !== 'all' && niche !== 'custom') {
      if (domainId === 'sales_crm') {
        domainItems = domainItems.filter((i) => ['/dashboard', '/contacts', '/deals', '/customer-360', '/lead-prospector'].includes(i.href));
      } else if (domainId === 'finance') {
        domainItems = domainItems.filter((i) => ['/invoices', '/ocr-invoice', '/quotes', '/price-books', '/banking', '/qr-payments', '/payment-links', '/subscriptions', '/finance-department', '/taxes'].includes(i.href));
      } else if (domainId === 'marketing') {
        domainItems = domainItems.filter((i) => ['/email-marketing', '/social', '/platform/templates/email', '/site-builder'].includes(i.href));
      } else if (domainId === 'customer_service') {
        domainItems = domainItems.filter((i) => ['/tickets', '/chat', '/customer-success', '/inbox'].includes(i.href));
      } else if (domainId === 'operations') {
        domainItems = domainItems.filter((i) => ['/voice', '/sim-gateway', '/portal'].includes(i.href));
      } else if (domainId === 'automation') {
        domainItems = domainItems.filter((i) => ['/automation', '/automations', '/data-sync'].includes(i.href));
      } else if (domainId === 'developer') {
        domainItems = domainItems.filter((i) => ['/developer', '/platform/schema'].includes(i.href));
      } else if (domainId === 'administration') {
        domainItems = domainItems.filter((i) => ['/compliance', '/audit-logs', '/customization', '/branding'].includes(i.href));
      }
    }

    const domainAiItems = mapItems(MASTER_AI_AUTOMATION_ITEMS.filter((item) => item.domain === domainId));

    // Automated deduplication guard:
    // Only prune when an AI automation item has the EXACT standalone route (without query params/anchors)
    // AND an identical label as a core item. Never prune fundamental core routes!
    const aiExactRoutes = new Set(
      domainAiItems
        .filter((i) => !i.href.includes('?') && !i.href.includes('#'))
        .map((i) => i.href.toLowerCase())
    );
    const aiLabels = new Set(
      domainAiItems.map((i) => i.label.trim().toLowerCase())
    );

    const dedupedDomainItems = domainItems.filter((item) => {
      const cleanHref = item.href.split('?')[0].split('#')[0].toLowerCase();
      const normLabel = item.label.trim().toLowerCase();

      // Always keep standard root / overview pages
      if (cleanHref === '/' || cleanHref === '/dashboard') return true;

      // Never prune primary domain routes (projects, hr, documents, tickets, automation, etc.)
      const coreProtectedRoutes = [
        '/projects',
        '/directory',
        '/onboarding',
        '/voice',
        '/automation',
        '/automations',
        '/reports',
        '/documents',
        '/contacts',
        '/deals',
        '/invoices',
        '/tickets',
      ];
      if (coreProtectedRoutes.includes(cleanHref)) return true;

      // Allow core department landing pages (e.g. /sales-department, /finance-department, /customer-success)
      // to coexist with individual named agent modal triggers (Ares, Midas, Athena)
      if (
        (cleanHref === '/sales-department' && item.id === 'crm-sales-dept') ||
        (cleanHref === '/finance-department' && item.id === 'fin-dept') ||
        (cleanHref === '/customer-success' && item.id === 'cs-dept')
      ) {
        return true;
      }

      // If already in AI Automation with the EXACT standalone route and identical label, prune duplicate
      if (aiExactRoutes.has(cleanHref) && aiLabels.has(normLabel)) return false;

      return true;
    });

    const resolvedItems = mapItems(dedupedDomainItems);

    if (resolvedItems.length === 0 && domainAiItems.length === 0) continue;

    sections.push({
      domainId,
      sectionTitle: meta.title,
      iconName: meta.iconName,
      defaultExpanded: Boolean(meta.defaultExpanded || hasActiveChild(resolvedItems) || hasActiveChild(domainAiItems)),
      items: resolvedItems,
      aiItems: domainAiItems.length > 0 ? domainAiItems : undefined,
    });
  }

  return sections;
}

/**
 * Resolves dynamic contextual breadcrumbs from the current pathname.
 */
export function resolveBreadcrumbs(
  pathname: string,
  nicheConfig: NicheMetadata
): { domainTitle: string; pageTitle: string; domainHref?: string } {
  if (!pathname || pathname === '/') {
    return { domainTitle: 'Business OS', pageTitle: 'Home' };
  }

  const cleanPath = pathname.split('?')[0].split('#')[0];

  // Check Niche Hub items first
  if (nicheConfig.id !== 'all' && NICHE_COMMAND_HUBS[nicheConfig.id]) {
    const hub = NICHE_COMMAND_HUBS[nicheConfig.id];
    const match = hub.items.find((i) => i.href === cleanPath);
    if (match) {
      return {
        domainTitle: hub.sectionTitle,
        pageTitle: resolveItemLabel(match, nicheConfig.terminology),
        domainHref: hub.items[0]?.href,
      };
    }
  }

  // Check Master Catalog items
  const match = MASTER_NAV_ITEMS.find((i) => i.href === cleanPath || i.href.split('?')[0] === cleanPath);
  if (match) {
    const domain = BUSINESS_DOMAINS[match.domain];
    return {
      domainTitle: domain?.title || 'Workspace',
      pageTitle: resolveItemLabel(match, nicheConfig.terminology),
      domainHref: `/dashboard`,
    };
  }

  // Fallback heuristics for nested routes like /deals/123 or /contacts/abc
  if (cleanPath.startsWith('/deals/')) {
    return {
      domainTitle: BUSINESS_DOMAINS.sales_crm.title,
      pageTitle: `${nicheConfig.terminology.deals} Details`,
      domainHref: '/deals',
    };
  }
  if (cleanPath.startsWith('/contacts/')) {
    return {
      domainTitle: BUSINESS_DOMAINS.sales_crm.title,
      pageTitle: `${nicheConfig.terminology.contacts} Details`,
      domainHref: '/contacts',
    };
  }
  if (cleanPath.startsWith('/automation')) {
    return {
      domainTitle: BUSINESS_DOMAINS.automation.title,
      pageTitle: cleanPath === '/automations' ? 'Automations Engine' : 'AI Automation OS Studio',
      domainHref: '/automation',
    };
  }

  return { domainTitle: 'Workspace', pageTitle: 'Overview' };
}
