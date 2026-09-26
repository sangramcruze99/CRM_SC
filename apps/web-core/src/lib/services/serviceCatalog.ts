// apps/web-core/src/lib/services/serviceCatalog.ts

import { IndustryNiche } from '@/components/industry/IndustryContext';

export type ServiceCategory =
  | 'CRM'
  | 'SALES'
  | 'FINANCE'
  | 'OPERATIONS'
  | 'DOCUMENTS'
  | 'PEOPLE'
  | 'MARKETING'
  | 'CUSTOMER_SERVICE'
  | 'ANALYTICS'
  | 'AUTOMATION'
  | 'HEALTHCARE'
  | 'REAL_ESTATE'
  | 'HOSPITALITY'
  | 'RETAIL';

export type ServiceStatus =
  | 'AVAILABLE'
  | 'RECOMMENDED'
  | 'ENABLED'
  | 'NEEDS_SETUP'
  | 'CONNECTED'
  | 'PAUSED'
  | 'UNAVAILABLE'
  | 'REQUIRES_DEPENDENCY';

export type ServiceTier = 'CORE' | 'RECOMMENDED' | 'OPTIONAL' | 'HIDDEN';

export interface UniversalService {
  id: string;
  name: string;
  shortDesc: string;
  description: string;
  category: ServiceCategory;
  categoryName: string;
  iconName: string;
  route: string;
  supportedNiches: IndustryNiche[];
  dependencies: string[]; // IDs of services that must be enabled
  requiredPermissions?: string[];
  records: string[]; // e.g. ['Patient', 'Bed', 'MedicalInvoice']
  quickActions: {
    id: string;
    label: string;
    href?: string;
    iconName: string;
    primary?: boolean;
  }[];
  reports: {
    id: string;
    name: string;
    description: string;
  }[];
  workflowTemplates: {
    id: string;
    name: string;
    trigger: string;
  }[];
  aiCapabilities: string[];
}

export const UNIVERSAL_SERVICE_CATALOG: Record<string, UniversalService> = {
  // ==========================================================================
  // 1. CORE BUSINESS & CRM
  // ==========================================================================
  'srv_contacts': {
    id: 'srv_contacts',
    name: 'Customer & Contact Management',
    shortDesc: 'Comprehensive contact directory, customer accounts, stakeholder profiles, and unified activity timelines.',
    description: 'Central source of truth for all individuals, clients, patients, or guests doing business with the organization.',
    category: 'CRM',
    categoryName: 'CRM & Customer Management',
    iconName: 'Users',
    route: '/contacts',
    supportedNiches: ['all', 'hospital', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'custom'],
    dependencies: [],
    records: ['Contact', 'Company', 'Activity'],
    quickActions: [
      { id: 'act_new_contact', label: 'Add Contact', href: '/contacts?action=new', iconName: 'Plus', primary: true },
      { id: 'act_import_contacts', label: 'Import CSV/VCF', href: '/migration', iconName: 'ArrowRightLeft' },
    ],
    reports: [
      { id: 'rep_contact_growth', name: 'New Contact Growth', description: 'Monthly acquisition rate and source breakdown' },
      { id: 'rep_interaction_freq', name: 'Relationship Velocity', description: 'Touchpoint frequency and dormant account alarms' },
    ],
    workflowTemplates: [
      { id: 'wf_welcome_email', name: 'Automated Welcome & Tagging', trigger: 'When Contact Created' },
    ],
    aiCapabilities: ['AI Contact Enrichment', 'Social Handle Discovery', 'Executive Bio Summarizer'],
  },

  'srv_customer_360': {
    id: 'srv_customer_360',
    name: 'Customer 360 Relationship Graph',
    shortDesc: 'Full omni-channel graph linking interactions, purchase history, tickets, and sentiment.',
    description: 'Unified visualization of account health, total lifetime value, and organizational stakeholder maps.',
    category: 'CRM',
    categoryName: 'CRM & Customer Management',
    iconName: 'Users',
    route: '/customer-360',
    supportedNiches: ['all', 'realestate', 'sme', 'agency', 'custom'],
    dependencies: ['srv_contacts'],
    records: ['Contact', 'Company', 'Deal', 'Invoice', 'Ticket'],
    quickActions: [
      { id: 'act_search_360', label: 'Search 360 Graph', href: '/customer-360', iconName: 'Search' },
    ],
    reports: [
      { id: 'rep_churn_risk', name: 'Account Churn Probability', description: 'AI churn risk score based on activity drops' },
    ],
    workflowTemplates: [
      { id: 'wf_exec_sponsor_alert', name: 'Exec Sponsor Inactivity Alert', trigger: 'When 30 Days Without Meeting' },
    ],
    aiCapabilities: ['Relationship Sentiment Analysis', 'Account Expansion Prediction'],
  },

  'srv_b2b_prospector': {
    id: 'srv_b2b_prospector',
    name: 'B2B Lead Prospector & Intelligence',
    shortDesc: 'Apollo and ZoomInfo integration querying 275M+ verified business decision-makers.',
    description: 'Instant multi-filter prospect discovery with direct one-click ingestion into your sales pipeline.',
    category: 'SALES',
    categoryName: 'Sales & Revenue Acceleration',
    iconName: 'Database',
    route: '/lead-prospector',
    supportedNiches: ['all', 'realestate', 'sme', 'agency', 'custom'],
    dependencies: ['srv_contacts'],
    records: ['Contact', 'Company'],
    quickActions: [
      { id: 'act_query_leads', label: 'Query 275M+ Database', href: '/lead-prospector', iconName: 'Search', primary: true },
    ],
    reports: [
      { id: 'rep_lead_enrich_rate', name: 'Prospect Verification Yield', description: 'Valid email and direct-dial phone match rates' },
    ],
    workflowTemplates: [
      { id: 'wf_auto_qualify', name: 'Autonomous ICP Lead Triage', trigger: 'When New Prospect Added' },
    ],
    aiCapabilities: ['Ideal Customer Profile (ICP) Scoring', 'Automated LinkedIn Profile Scrape'],
  },

  // ==========================================================================
  // 2. SALES & PIPELINE
  // ==========================================================================
  'srv_deals_pipeline': {
    id: 'srv_deals_pipeline',
    name: 'Multi-Stage Deals & Revenue Pipeline',
    shortDesc: 'Visual Kanban pipeline with weighted forecasting, stage gates, and revenue projections.',
    description: 'End-to-end management of sales opportunities from initial lead capture through negotiation to final contract close.',
    category: 'SALES',
    categoryName: 'Sales & Revenue Acceleration',
    iconName: 'Briefcase',
    route: '/deals',
    supportedNiches: ['all', 'realestate', 'sme', 'agency', 'custom'],
    dependencies: ['srv_contacts'],
    records: ['Deal', 'Activity', 'Company'],
    quickActions: [
      { id: 'act_new_deal', label: 'Create Opportunity', href: '/deals?action=new', iconName: 'Plus', primary: true },
    ],
    reports: [
      { id: 'rep_sales_velocity', name: 'Pipeline Velocity Matrix', description: 'Days per stage and closing win/loss conversion' },
      { id: 'rep_weighted_forecast', name: 'Weighted Revenue Forecast', description: 'Forecasted gross close volume by closing month' },
    ],
    workflowTemplates: [
      { id: 'wf_deal_stalled', name: 'Stalled Opportunity Auto-Nudge', trigger: 'When Deal Idle for 14 Days' },
      { id: 'wf_win_handoff', name: 'Closed-Won Implementation Handoff', trigger: 'When Deal Stage = Closed Won' },
    ],
    aiCapabilities: ['Deal Win Probability Scoring', 'Next Best Sales Action Recommender'],
  },

  'srv_cpq_quotes': {
    id: 'srv_cpq_quotes',
    name: 'Commercial CPQ & Quotations',
    shortDesc: 'Configure, Price, and Quote generator with discount guardrails and e-signature handoff.',
    description: 'Professional commercial proposals and quotes generated directly from price book catalogs.',
    category: 'SALES',
    categoryName: 'Sales & Revenue Acceleration',
    iconName: 'FileBadge',
    route: '/quotes',
    supportedNiches: ['all', 'realestate', 'sme', 'agency', 'custom'],
    dependencies: ['srv_deals_pipeline', 'srv_price_books'],
    records: ['Quote', 'PriceBook', 'Deal'],
    quickActions: [
      { id: 'act_generate_quote', label: 'Generate Commercial Quote', href: '/quotes?action=new', iconName: 'Plus' },
    ],
    reports: [
      { id: 'rep_quote_acceptance', name: 'Quote Acceptance Velocity', description: 'Time from quote generation to signature' },
    ],
    workflowTemplates: [
      { id: 'wf_discount_approval', name: 'VP Approval for Discounts > 20%', trigger: 'When Quote Discount Exceeds Threshold' },
    ],
    aiCapabilities: ['Margin Maximization Suggestions', 'Dynamic Pricing Benchmarking'],
  },

  'srv_price_books': {
    id: 'srv_price_books',
    name: 'Price Books & Product Catalog',
    shortDesc: 'Tiered service pricing, SKU packages, multi-currency rates, and volume discount rules.',
    description: 'Master catalog for all standard goods, consulting tiers, agency rate cards, and clinical fee schedules.',
    category: 'SALES',
    categoryName: 'Sales & Revenue Acceleration',
    iconName: 'Layers',
    route: '/price-books',
    supportedNiches: ['all', 'hospital', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'custom'],
    dependencies: [],
    records: ['PriceBook', 'Product'],
    quickActions: [
      { id: 'act_add_price_book', label: 'Create Price Book', href: '/price-books', iconName: 'Plus' },
    ],
    reports: [
      { id: 'rep_catalog_util', name: 'Most Quoted SKUs & Packages', description: 'Catalog conversion by offering' },
    ],
    workflowTemplates: [],
    aiCapabilities: ['Competitive Price Scraping', 'Dynamic Currency Harmonization'],
  },

  // ==========================================================================
  // 3. FINANCE & TREASURY
  // ==========================================================================
  'srv_invoices_billing': {
    id: 'srv_invoices_billing',
    name: 'Commercial Invoicing & Accounts Receivable',
    shortDesc: 'Tax-compliant multi-currency invoicing, aging balance tracker, and automated payment receipts.',
    description: 'Core revenue collection engine supporting net terms, automated recurring billing, and payment tracking.',
    category: 'FINANCE',
    categoryName: 'Finance, Ledger & Treasury',
    iconName: 'Receipt',
    route: '/invoices',
    supportedNiches: ['all', 'hospital', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'custom'],
    dependencies: ['srv_contacts'],
    records: ['Invoice', 'InvoiceLineItem', 'Payment'],
    quickActions: [
      { id: 'act_new_invoice', label: 'Create Invoice', href: '/invoices?action=new', iconName: 'Plus', primary: true },
      { id: 'act_batch_email', label: 'Batch Reminders', href: '/invoices', iconName: 'Send' },
    ],
    reports: [
      { id: 'rep_ar_aging', name: 'A/R Aging Schedule (30/60/90 Days)', description: 'Breakdown of overdue commercial balances' },
      { id: 'rep_dso', name: 'Days Sales Outstanding (DSO)', description: 'Average collection cycle efficiency' },
    ],
    workflowTemplates: [
      { id: 'wf_auto_overdue_nudge', name: 'Multi-Step Overdue Nudge (Day 7, 14, 30)', trigger: 'When Invoice Overdue' },
    ],
    aiCapabilities: ['Late Payment Risk Predictor', 'Automated Dispute Settlement Drafter'],
  },

  'srv_dual_khata': {
    id: 'srv_dual_khata',
    name: 'Dual Khata Ledger & Banking Reconciliation',
    shortDesc: 'Dual-entry debit/credit ledger, bank feed sync, forex handling, and zero-leakage reconciliation.',
    description: 'Institutional-grade ledger tracking cash balances, payables, customer credits, and bank account reconciliations.',
    category: 'FINANCE',
    categoryName: 'Finance, Ledger & Treasury',
    iconName: 'Landmark',
    route: '/banking',
    supportedNiches: ['all', 'hospital', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'custom'],
    dependencies: ['srv_invoices_billing'],
    records: ['BankAccount', 'BankTransaction', 'JournalEntry', 'ChartOfAccount'],
    quickActions: [
      { id: 'act_reconcile_bank', label: 'Reconcile Bank Accounts', href: '/banking', iconName: 'RefreshCw', primary: true },
    ],
    reports: [
      { id: 'rep_cash_burn', name: 'Cash Burn Velocity & Runway', description: 'Consolidated cash burn and runway forecast' },
      { id: 'rep_trial_balance', name: 'Automated Trial Balance', description: 'Dual-entry balanced debit/credit ledger audit' },
    ],
    workflowTemplates: [
      { id: 'wf_reconcile_match', name: 'Instant Bank Rule Auto-Match', trigger: 'When New Bank Feed Ingested' },
    ],
    aiCapabilities: ['Smart Transaction Categorization', 'Anomalous Expense Detection'],
  },

  'srv_neural_ocr': {
    id: 'srv_neural_ocr',
    name: 'Neural OCR Vision Document Extraction',
    shortDesc: 'Extract line items, tax numbers, and dates from physical receipts and vendor bills with 98.4% accuracy.',
    description: 'Zero-touch document parsing for vendor bills, receipts, and invoices directly into accounting ledgers.',
    category: 'FINANCE',
    categoryName: 'Finance, Ledger & Treasury',
    iconName: 'Scan',
    route: '/ocr-invoice',
    supportedNiches: ['all', 'hospital', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'custom'],
    dependencies: ['srv_dual_khata'],
    records: ['Bill', 'BillLineItem', 'Document'],
    quickActions: [
      { id: 'act_scan_ocr', label: 'Scan Receipt / Bill', href: '/ocr-invoice', iconName: 'Scan', primary: true },
    ],
    reports: [
      { id: 'rep_ocr_accuracy', name: 'OCR Ingestion Efficiency', description: 'Straight-through processing rate without human edit' },
    ],
    workflowTemplates: [
      { id: 'wf_bill_approval', name: 'CFO Approval for Bills > $1,000', trigger: 'When Bill Extracted' },
    ],
    aiCapabilities: ['Multi-Language Receipt Parser', 'Fraudulent Duplicate Invoice Detector'],
  },

  'srv_payment_links_pos': {
    id: 'srv_payment_links_pos',
    name: 'Instant Payment Links & Table QR POS',
    shortDesc: 'One-click checkout links via Stripe/Razorpay and contactless QR code payment collection.',
    description: 'Instant multi-currency checkout links for quotes, retainers, table dining, or retail cashier counters.',
    category: 'FINANCE',
    categoryName: 'Finance, Ledger & Treasury',
    iconName: 'Zap',
    route: '/payment-links',
    supportedNiches: ['all', 'hospital', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'custom'],
    dependencies: ['srv_invoices_billing'],
    records: ['PaymentLink', 'Payment'],
    quickActions: [
      { id: 'act_create_link', label: 'Create Instant Stripe Link', href: '/payment-links', iconName: 'Plus', primary: true },
      { id: 'act_launch_qr', label: 'Table / Counter QR POS', href: '/qr-payments', iconName: 'Scan' },
    ],
    reports: [
      { id: 'rep_checkout_conversion', name: 'Link Payment Conversion', description: 'Clicks vs completed payments' },
    ],
    workflowTemplates: [
      { id: 'wf_payment_received', name: 'Instant Receipt & CRM Update', trigger: 'When Payment Link Paid' },
    ],
    aiCapabilities: ['Dynamic Currency Localization', 'Smart Abandoned Cart Reminders'],
  },

  'srv_saas_subscriptions': {
    id: 'srv_saas_subscriptions',
    name: 'SaaS Subscriptions & MRR Analytics',
    shortDesc: 'Automated recurring card charging, dunning recovery, subscription upgrades, and MRR waterfalls.',
    description: 'Turnkey recurring revenue engine tracking MRR, ARR, churn, Net Revenue Retention (NRR), and billing schedules.',
    category: 'FINANCE',
    categoryName: 'Finance, Ledger & Treasury',
    iconName: 'DollarSign',
    route: '/subscriptions',
    supportedNiches: ['all', 'sme', 'agency', 'custom'],
    dependencies: ['srv_invoices_billing'],
    records: ['Subscription', 'BillingCustomer', 'Plan'],
    quickActions: [
      { id: 'act_new_sub', label: 'Create Subscription', href: '/subscriptions?action=new', iconName: 'Plus', primary: true },
    ],
    reports: [
      { id: 'rep_mrr_waterfall', name: 'MRR Movement Waterfall', description: 'New, expansion, contraction, and churn MRR' },
      { id: 'rep_cohort_retention', name: 'Net Revenue Retention (NRR)', description: 'Cohort retention percentages over 12 months' },
    ],
    workflowTemplates: [
      { id: 'wf_dunning_recovery', name: 'Card Expiry Pre-Warning & Dunning', trigger: 'When Payment Fails' },
    ],
    aiCapabilities: ['Downgrade / Churn Predictor', 'Optimal Pricing Tier Optimizer'],
  },

  // ==========================================================================
  // 4. OPERATIONS & PROJECTS
  // ==========================================================================
  'srv_projects_tasks': {
    id: 'srv_projects_tasks',
    name: 'Projects, Sprints & Milestone Delivery',
    shortDesc: 'Sprint Kanban boards, Gantt charts, resource allocation, and milestone deliverable sign-offs.',
    description: 'Work breakdown structure, project budgets, team workload balancing, and client milestone delivery.',
    category: 'OPERATIONS',
    categoryName: 'Operations, Projects & Inventory',
    iconName: 'ClipboardList',
    route: '/projects',
    supportedNiches: ['all', 'hospital', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'custom'],
    dependencies: [],
    records: ['Project', 'Task'],
    quickActions: [
      { id: 'act_new_project', label: 'Create Project', href: '/projects?action=new', iconName: 'Plus', primary: true },
    ],
    reports: [
      { id: 'rep_burn_down', name: 'Sprint Burndown Velocity', description: 'Story points completed vs estimated' },
      { id: 'rep_budget_variance', name: 'Project Profitability & Budget Variance', description: 'Actual spend vs contract cap' },
    ],
    workflowTemplates: [
      { id: 'wf_milestone_billed', name: 'Trigger Milestone Invoice', trigger: 'When Milestone Signed Off' },
    ],
    aiCapabilities: ['AI Project Scope Estimator', 'Bottleneck & Delay Warning Engine'],
  },

  'srv_inventory_stock': {
    id: 'srv_inventory_stock',
    name: 'Multi-Warehouse Inventory & Reordering',
    shortDesc: 'Stock tracking across locations, automated low-stock reorder thresholds, and supplier purchase orders.',
    description: 'Physical product, medical consumable, ingredient, or retail SKU inventory ledger with real-time par levels.',
    category: 'OPERATIONS',
    categoryName: 'Operations, Projects & Inventory',
    iconName: 'Layers',
    route: '/inventory',
    supportedNiches: ['all', 'hospital', 'restaurant', 'retail', 'custom'],
    dependencies: ['srv_price_books'],
    records: ['Product', 'StockMovement', 'Supplier'],
    quickActions: [
      { id: 'act_adjust_stock', label: 'Stock Adjustment', href: '/inventory', iconName: 'RefreshCw' },
      { id: 'act_reorder_low', label: 'Reorder Depleted Items', href: '/inventory', iconName: 'ShoppingBag' },
    ],
    reports: [
      { id: 'rep_stock_turnover', name: 'Inventory Turnover & Days of Supply', description: 'Velocity of stock movement' },
      { id: 'rep_dead_stock', name: 'Dead Stock & Shrinkage Report', description: 'Unsold items > 90 days' },
    ],
    workflowTemplates: [
      { id: 'wf_low_stock_po', name: 'Autonomous Supplier Purchase Order', trigger: 'When Stock <= Par Level' },
    ],
    aiCapabilities: ['Demand Forecasting & Seasonal Spikes', 'Supplier Lead-Time Optimizer'],
  },

  // ==========================================================================
  // 5. DOCUMENTS & LEGAL
  // ==========================================================================
  'srv_documents_esign': {
    id: 'srv_documents_esign',
    name: 'Document Vault & Legally-Binding E-Sign',
    shortDesc: 'Secure encrypted document repository, NDAs, offer letters, deeds, and cryptographic e-signatures.',
    description: 'Compliance-ready document repository with embedded audit trails, field tagging, and recipient signing flows.',
    category: 'DOCUMENTS',
    categoryName: 'Documents, Vault & E-Signatures',
    iconName: 'FileSignature',
    route: '/documents',
    supportedNiches: ['all', 'hospital', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'custom'],
    dependencies: [],
    records: ['Document', 'ESignature', 'Folder'],
    quickActions: [
      { id: 'act_upload_doc', label: 'Deposit Document', href: '/documents', iconName: 'Plus' },
      { id: 'act_send_esign', label: 'Send for E-Signature', href: '/e-signatures', iconName: 'FileSignature', primary: true },
    ],
    reports: [
      { id: 'rep_esign_cycle', name: 'Signature Turnaround Velocity', description: 'Hours from sending to completion' },
    ],
    workflowTemplates: [
      { id: 'wf_signed_handoff', name: 'Execute Contract & Notify Stakeholders', trigger: 'When Document Fully Signed' },
    ],
    aiCapabilities: ['Contract Risk Clause Analyzer', 'Automated Metadata Tagging'],
  },

  // ==========================================================================
  // 6. PEOPLE & HUMAN RESOURCES
  // ==========================================================================
  'srv_hr_people': {
    id: 'srv_hr_people',
    name: 'HR Directory, Shifts & Payroll Ledger',
    shortDesc: 'Employee profiles, department structures, leave requests, shift scheduling, and salary payroll.',
    description: 'Complete workforce management system managing employee records, attendance, and compliant salary calculation.',
    category: 'PEOPLE',
    categoryName: 'People, Workforce & Onboarding',
    iconName: 'Users',
    route: '/directory',
    supportedNiches: ['all', 'hospital', 'restaurant', 'retail', 'sme', 'agency', 'custom'],
    dependencies: [],
    records: ['Employee', 'Department', 'LeaveRequest'],
    quickActions: [
      { id: 'act_add_employee', label: 'Add Employee', href: '/directory', iconName: 'Plus' },
      { id: 'act_onboarding', label: 'Onboarding Checklist', href: '/onboarding', iconName: 'CheckCircle2' },
    ],
    reports: [
      { id: 'rep_headcount_payroll', name: 'Monthly Payroll & Headcount Velocity', description: 'Compensation trend by department' },
    ],
    workflowTemplates: [
      { id: 'wf_onboarding_welcome', name: 'Autonomous Day-1 Onboarding Sprint', trigger: 'When Employee Created' },
    ],
    aiCapabilities: ['AI Resume Screening & Scorecard', 'Workforce Attrition Risk Monitor'],
  },

  // ==========================================================================
  // 7. MARKETING & GROWTH
  // ==========================================================================
  'srv_marketing_studio': {
    id: 'srv_marketing_studio',
    name: 'Social Studio, Email & Landing Builder',
    shortDesc: 'Automated 4-network social publishing, visual drag-and-drop email builder, and no-code landing pages.',
    description: 'Omni-channel marketing suite generating leads, publishing content, and tracking conversion campaigns.',
    category: 'MARKETING',
    categoryName: 'Marketing, Social & Growth',
    iconName: 'Share2',
    route: '/social',
    supportedNiches: ['all', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'custom'],
    dependencies: ['srv_contacts'],
    records: ['LandingPage'],
    quickActions: [
      { id: 'act_compose_social', label: 'Compose 4-Network Post', href: '/social', iconName: 'Share2', primary: true },
      { id: 'act_email_campaign', label: 'Create Email Campaign', href: '/email-marketing', iconName: 'Mail' },
      { id: 'act_site_builder', label: 'Build Landing Page', href: '/site-builder', iconName: 'Layout' },
    ],
    reports: [
      { id: 'rep_campaign_roas', name: 'Blended Acquisition Cost & ROAS', description: 'Return on ad spend across channels' },
    ],
    workflowTemplates: [
      { id: 'wf_newsletter_dispatch', name: 'Bi-Weekly Customer Newsletter', trigger: 'Scheduled Bi-Weekly' },
    ],
    aiCapabilities: ['Multi-Channel Copy Repurposer', 'Optimal Posting Time Predictor'],
  },

  // ==========================================================================
  // 8. CUSTOMER SERVICE & SUPPORT
  // ==========================================================================
  'srv_support_desk': {
    id: 'srv_support_desk',
    name: 'Helpdesk Tickets, SLAs & Live Chat',
    shortDesc: 'Multi-channel support inbox, SLA breach escalations, embeddable website chat widget, and AI resolution.',
    description: 'Enterprise ticket triage and support hub with automated routing, customer satisfaction surveys, and knowledge base integration.',
    category: 'CUSTOMER_SERVICE',
    categoryName: 'Customer Service & Helpdesk',
    iconName: 'Ticket',
    route: '/tickets',
    supportedNiches: ['all', 'hospital', 'realestate', 'retail', 'sme', 'agency', 'custom'],
    dependencies: ['srv_contacts'],
    records: ['Ticket', 'TicketMessage', 'SLA'],
    quickActions: [
      { id: 'act_new_ticket', label: 'Log Support Ticket', href: '/tickets?action=new', iconName: 'Plus', primary: true },
      { id: 'act_chat_widget', label: 'Configure Live Chat', href: '/chat-widgets', iconName: 'MessageSquare' },
    ],
    reports: [
      { id: 'rep_first_response', name: 'First Response Time (FRT)', description: 'Minutes to first human or AI reply' },
      { id: 'rep_csat_score', name: 'Customer Satisfaction (CSAT)', description: 'Average ticket rating and sentiment' },
    ],
    workflowTemplates: [
      { id: 'wf_sla_escalation', name: 'P1 Urgent SLA Page Engineer', trigger: 'When Urgent Ticket Unanswered > 15m' },
    ],
    aiCapabilities: ['AI Grounded Auto-Responder', 'Ticket Sentiment & Urgency Triage'],
  },

  // ==========================================================================
  // 9. AUTOMATION & AI CORE
  // ==========================================================================
  'srv_universal_automation': {
    id: 'srv_universal_automation',
    name: 'Universal Automation & Workflow Engine',
    shortDesc: 'Visual drag-and-drop workflow graph executor, multi-node triggers, webhooks, and human-in-the-loop approvals.',
    description: 'Enterprise automation fabric orchestrating cross-system logic, background schedules, and system integration mesh.',
    category: 'AUTOMATION',
    categoryName: 'Universal Automation & AI Mesh',
    iconName: 'Workflow',
    route: '/automation',
    supportedNiches: ['all', 'hospital', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'custom'],
    dependencies: [],
    records: ['Workflow', 'WorkflowExecution', 'WorkflowTemplate'],
    quickActions: [
      { id: 'act_new_workflow', label: 'Design Workflow', href: '/automation', iconName: 'Workflow', primary: true },
      { id: 'act_agent_fleet', label: 'Fleet Command', href: '/ai-agents', iconName: 'Bot' },
    ],
    reports: [
      { id: 'rep_workflow_throughput', name: 'Automation Run Success Rate', description: 'Successful executions vs exceptions' },
      { id: 'rep_hours_saved', name: 'Human Hours Saved', description: 'Calculated labor cost offset by workflows' },
    ],
    workflowTemplates: [
      { id: 'wf_daily_digest', name: 'Autonomous Executive Morning Briefing', trigger: 'Every Morning at 08:00' },
    ],
    aiCapabilities: ['Natural Language Workflow Generator', 'Self-Healing Execution Retry Engine'],
  },

  // ==========================================================================
  // 10. HEALTHCARE SPECIALIZED SERVICES
  // ==========================================================================
  'srv_healthcare_patients': {
    id: 'srv_healthcare_patients',
    name: 'Patient Registration & Clinical EHR Profiles',
    shortDesc: 'HIPAA-compliant inpatient/outpatient directory, demographic records, medical history, and emergency contacts.',
    description: 'Specialized clinical records ledger managing patient medical history, insurance coverage status, and attending physician assignments.',
    category: 'HEALTHCARE',
    categoryName: 'Healthcare & Clinical Operations',
    iconName: 'Stethoscope',
    route: '/industry/hospital',
    supportedNiches: ['hospital', 'all'],
    dependencies: [],
    records: ['Patient', 'MedicalHistory', 'InsurancePlan'],
    quickActions: [
      { id: 'act_admit_patient', label: 'Admit New Patient', href: '/industry/hospital?action=admit', iconName: 'Plus', primary: true },
      { id: 'act_search_ehr', label: 'Search Clinical EHR', href: '/industry/hospital', iconName: 'Search' },
    ],
    reports: [
      { id: 'rep_patient_volume', name: 'Patient Admission & Census Trends', description: 'Daily admissions, discharges, and length of stay' },
      { id: 'rep_triage_distribution', name: 'Triage Severity Distribution', description: 'Critical vs Urgent vs Stable intake percentages' },
    ],
    workflowTemplates: [
      { id: 'wf_patient_discharge_followup', name: 'Post-Discharge 48-Hour Care Check-in', trigger: 'When Patient Discharged' },
    ],
    aiCapabilities: ['Clinical Note Summarizer', 'Drug Interaction Pre-Flight Check'],
  },

  'srv_healthcare_appointments': {
    id: 'srv_healthcare_appointments',
    name: 'Doctor Rostering & Outpatient Scheduling',
    shortDesc: 'Specialist appointment calendars, on-call doctor shifts, automated SMS/WhatsApp reminders, and no-show tracking.',
    description: 'Outpatient consultation calendar managing specialist clinic hours, room allocations, and patient visit schedules.',
    category: 'HEALTHCARE',
    categoryName: 'Healthcare & Clinical Operations',
    iconName: 'Clock',
    route: '/industry/hospital',
    supportedNiches: ['hospital', 'all'],
    dependencies: ['srv_healthcare_patients'],
    records: ['Appointment', 'DoctorSchedule', 'Department'],
    quickActions: [
      { id: 'act_book_appt', label: 'Book Consultation', href: '/industry/hospital?action=book', iconName: 'Clock', primary: true },
    ],
    reports: [
      { id: 'rep_doctor_utilization', name: 'Physician On-Call & Clinic Utilization', description: 'Hours consulted per specialist' },
      { id: 'rep_no_show_rate', name: 'No-Show & Rescheduling Rate', description: 'Appointment adherence rate' },
    ],
    workflowTemplates: [
      { id: 'wf_appt_24h_reminder', name: 'WhatsApp Appointment Reminder (24h Pre)', trigger: 'Scheduled 24 Hours Before Appointment' },
    ],
    aiCapabilities: ['Athena Voice Receptionist Direct Booking', 'Optimal Slot Recommendation'],
  },

  'srv_healthcare_wards_beds': {
    id: 'srv_healthcare_wards_beds',
    name: 'Clinical Ward & Inpatient Bed Occupancy',
    shortDesc: 'Real-time bed census (ICU, General, Surgical, Maternity), ER triage queues, and sanitization tracking.',
    description: 'Live telemetry tracking bed utilization, room sanitation turnaround, and emergency triage bed allocation.',
    category: 'HEALTHCARE',
    categoryName: 'Healthcare & Clinical Operations',
    iconName: 'Bed',
    route: '/industry/hospital',
    supportedNiches: ['hospital', 'all'],
    dependencies: ['srv_healthcare_patients'],
    records: ['Ward', 'Bed', 'TriageRecord'],
    quickActions: [
      { id: 'act_transfer_bed', label: 'Allocate / Transfer Bed', href: '/industry/hospital', iconName: 'Bed' },
    ],
    reports: [
      { id: 'rep_bed_occupancy', name: 'Bed Occupancy & Census Rate', description: 'Bed utilization percentage and turnover interval' },
    ],
    workflowTemplates: [
      { id: 'wf_bed_turnover_clean', name: 'Housekeeping Alert upon Discharge', trigger: 'When Bed Status = Cleaning Needed' },
    ],
    aiCapabilities: ['Emergency Room Surge Prediction', 'Length-of-Stay Forecaster'],
  },

  'srv_healthcare_digital_rx': {
    id: 'srv_healthcare_digital_rx',
    name: 'Digital Rx Vault & Diagnostic Lab Orders',
    shortDesc: 'Electronic prescription generator with QR verification, pharmacy dispatch, and pathology lab test orders.',
    description: 'Tamper-evident digital prescription maker and diagnostic test tracking directly connected to the patient chart.',
    category: 'HEALTHCARE',
    categoryName: 'Healthcare & Clinical Operations',
    iconName: 'HeartPulse',
    route: '/industry/hospital',
    supportedNiches: ['hospital', 'all'],
    dependencies: ['srv_healthcare_patients'],
    records: ['Prescription', 'LabOrder', 'DiagnosticResult'],
    quickActions: [
      { id: 'act_create_rx', label: 'Prescribe Medication', href: '/industry/hospital', iconName: 'HeartPulse', primary: true },
    ],
    reports: [
      { id: 'rep_lab_turnaround', name: 'Diagnostic Lab Turnaround Time', description: 'Specimen draw to result upload' },
    ],
    workflowTemplates: [
      { id: 'wf_critical_lab_alert', name: 'Critical Value Alert to Attending Physician', trigger: 'When Lab Result Marked Abnormal' },
    ],
    aiCapabilities: ['Formulary Substitution Recommender', 'Allergy Cross-Reference'],
  },

  // ==========================================================================
  // 11. REAL ESTATE SPECIALIZED SERVICES
  // ==========================================================================
  'srv_realestate_listings': {
    id: 'srv_realestate_listings',
    name: 'MLS Property Listings & Asset Portfolio',
    shortDesc: 'Residential & commercial property database, unit specs, photo galleries, virtual tour links, and pricing.',
    description: 'Comprehensive property asset portfolio managing active listings, pricing, HOA fees, and MLS syndication data.',
    category: 'REAL_ESTATE',
    categoryName: 'Real Estate & Brokerage Operations',
    iconName: 'Home',
    route: '/industry/realestate',
    supportedNiches: ['realestate', 'all'],
    dependencies: [],
    records: ['Property', 'Listing', 'Unit'],
    quickActions: [
      { id: 'act_create_listing', label: 'Create MLS Listing', href: '/industry/realestate?action=new', iconName: 'Plus', primary: true },
    ],
    reports: [
      { id: 'rep_active_listings_value', name: 'Portfolio Valuation & Days on Market', description: 'Total active listing volume and absorption rate' },
    ],
    workflowTemplates: [
      { id: 'wf_new_listing_blast', name: 'New Listing Buyer Match Blast', trigger: 'When Listing Published' },
    ],
    aiCapabilities: ['Property Description Copywriter', 'Fair Market Value Estimator'],
  },

  'srv_realestate_escrow': {
    id: 'srv_realestate_escrow',
    name: 'Property Sales, Escrow & Closing Pipeline',
    shortDesc: 'Multi-stage real estate closings, earnest money deposit verification, title clearing, and escrow tracking.',
    description: 'Dedicated transaction management system managing purchase contracts, inspection contingencies, and closing dates.',
    category: 'REAL_ESTATE',
    categoryName: 'Real Estate & Brokerage Operations',
    iconName: 'Briefcase',
    route: '/industry/realestate',
    supportedNiches: ['realestate', 'all'],
    dependencies: ['srv_realestate_listings', 'srv_contacts'],
    records: ['PropertyDeal', 'EscrowTransaction', 'CommissionSplit'],
    quickActions: [
      { id: 'act_open_escrow', label: 'Launch Escrow File', href: '/industry/realestate', iconName: 'Briefcase', primary: true },
      { id: 'act_mortgage_calc', label: 'Mortgage Calculator', href: '/industry/realestate', iconName: 'Landmark' },
    ],
    reports: [
      { id: 'rep_escrow_closings', name: 'Projected Monthly Closings & Commission Pool', description: 'Gross commission income and broker split forecast' },
    ],
    workflowTemplates: [
      { id: 'wf_inspection_contingency', name: '7-Day Inspection Deadline Warning', trigger: 'When Escrow Entered Day 5' },
    ],
    aiCapabilities: ['Contract Contingency Extractor', 'Commission Split Calculator'],
  },

  'srv_realestate_rentals': {
    id: 'srv_realestate_rentals',
    name: 'Tenant Leasing & Rent Collection Ledger',
    shortDesc: 'Residential & commercial tenant leases, automated monthly rent charges, renewal alerts, and maintenance logs.',
    description: 'Property management suite tracking tenant leases, security deposits, monthly rent collections, and cap rate yields.',
    category: 'REAL_ESTATE',
    categoryName: 'Real Estate & Brokerage Operations',
    iconName: 'Users',
    route: '/industry/realestate',
    supportedNiches: ['realestate', 'all'],
    dependencies: ['srv_realestate_listings', 'srv_invoices_billing'],
    records: ['Lease', 'Tenant', 'RentPayment'],
    quickActions: [
      { id: 'act_new_lease', label: 'Draft Lease Agreement', href: '/industry/realestate', iconName: 'FileSignature' },
    ],
    reports: [
      { id: 'rep_rental_yield', name: 'Net Operating Income (NOI) & Cap Rate', description: 'Yield calculations per property' },
      { id: 'rep_lease_expirations', name: 'Upcoming Lease Expirations (60/90 Days)', description: 'Tenant renewal pipeline' },
    ],
    workflowTemplates: [
      { id: 'wf_rent_reminder', name: 'WhatsApp Monthly Rent Reminder', trigger: 'On 1st of Every Month' },
    ],
    aiCapabilities: ['Tenant Screening Scorecard', 'Rent Optimization Recommendation'],
  },

  // ==========================================================================
  // 12. RESTAURANT & HOSPITALITY SPECIALIZED SERVICES
  // ==========================================================================
  'srv_restaurant_floor_kds': {
    id: 'srv_restaurant_floor_kds',
    name: 'Host Floor Plan & Kitchen Display System (KDS)',
    shortDesc: 'Live dining room tables, host waitlist, table turnover speed, and real-time bump bar Kitchen Display System.',
    description: 'Front-of-house table floor plan synchronized with back-of-house kitchen order tickets (KOT) and station queues.',
    category: 'HOSPITALITY',
    categoryName: 'Restaurant & Hospitality Operations',
    iconName: 'UtensilsCrossed',
    route: '/industry/restaurant',
    supportedNiches: ['restaurant', 'all'],
    dependencies: [],
    records: ['Table', 'DineOrder', 'KitchenTicket'],
    quickActions: [
      { id: 'act_open_kds', label: 'Open Kitchen KDS Display', href: '/industry/restaurant', iconName: 'UtensilsCrossed', primary: true },
      { id: 'act_table_seat', label: 'Seat Dining Party', href: '/industry/restaurant', iconName: 'Users' },
    ],
    reports: [
      { id: 'rep_table_turnover', name: 'Table Turnover & Average Ticket Time', description: 'Minutes from order to table delivery' },
      { id: 'rep_daily_covers', name: 'Daily Covers & Revenue per Seat', description: 'Guests served across lunch and dinner shifts' },
    ],
    workflowTemplates: [
      { id: 'wf_order_delayed', name: 'Kitchen Delay Alert (Over 18m Ticket)', trigger: 'When Order in Kitchen > 18 Minutes' },
    ],
    aiCapabilities: ['Table Seating Optimization', 'Rush Hour Prep Quantity Forecaster'],
  },

  'srv_restaurant_menu_cost': {
    id: 'srv_restaurant_menu_cost',
    name: 'Menu Engineering & Food Cost Par Levels',
    shortDesc: 'Recipe ingredient breakdown, portion food cost percentage, dynamic 86-item alerts, and inventory par reordering.',
    description: 'F&B profitability engine calculating ingredient yield, food cost percentage (targeting 28-32%), and real-time menu availability.',
    category: 'HOSPITALITY',
    categoryName: 'Restaurant & Hospitality Operations',
    iconName: 'Layers',
    route: '/industry/restaurant',
    supportedNiches: ['restaurant', 'all'],
    dependencies: ['srv_price_books'],
    records: ['MenuItem', 'Ingredient', 'Recipe'],
    quickActions: [
      { id: 'act_86_item', label: 'Toggle 86 (Out of Stock)', href: '/industry/restaurant', iconName: 'X' },
      { id: 'act_add_dish', label: 'Add Menu Dish', href: '/price-books', iconName: 'Plus' },
    ],
    reports: [
      { id: 'rep_food_cost_pct', name: 'Real-Time Food Cost Percentage', description: 'Ingredient purchase cost vs food sales' },
      { id: 'rep_menu_matrix', name: 'Stars & Dogs Menu Profitability Matrix', description: 'High margin vs high popularity matrix' },
    ],
    workflowTemplates: [
      { id: 'wf_86_auto_disable', name: 'Auto-86 Dish on Zero Ingredient Stock', trigger: 'When Ingredient Level Reaches 0' },
    ],
    aiCapabilities: ['Dynamic Menu Pricing Recommender', 'Wastage Prevention Suggestions'],
  },

  // ==========================================================================
  // 13. RETAIL & COMMERCE SPECIALIZED SERVICES
  // ==========================================================================
  'srv_retail_pos_cashier': {
    id: 'srv_retail_pos_cashier',
    name: 'Point of Sale (POS) Cashier Register',
    shortDesc: 'Fast barcode scanning checkout, thermal receipt printing, split cash/card payments, and end-of-day register z-reports.',
    description: 'High-speed retail sales terminal supporting barcode scanners, thermal receipt printers, and cash drawer management.',
    category: 'RETAIL',
    categoryName: 'Retail & POS Storefront Operations',
    iconName: 'ShoppingBag',
    route: '/industry/retail',
    supportedNiches: ['retail', 'all'],
    dependencies: ['srv_price_books'],
    records: ['POSReceipt', 'CashRegister', 'BarcodeItem'],
    quickActions: [
      { id: 'act_open_pos', label: 'Open POS Register', href: '/industry/retail', iconName: 'ShoppingBag', primary: true },
      { id: 'act_print_barcode', label: 'Print Barcode Labels', href: '/industry/retail', iconName: 'Scan' },
    ],
    reports: [
      { id: 'rep_pos_daily_sales', name: 'Daily POS Sales & Register Z-Report', description: 'Total revenue, payment method split, and tax collected' },
      { id: 'rep_cashier_velocity', name: 'Cashier Throughput & Basket Size', description: 'Average items per transaction and revenue per hour' },
    ],
    workflowTemplates: [
      { id: 'wf_daily_z_report', name: 'Automated End-of-Day Register Reconciliation', trigger: 'At Store Close (22:00)' },
    ],
    aiCapabilities: ['Cross-Sell Product Recommender at Checkout', 'Cash Drawer Discrepancy Flagging'],
  },

  'srv_retail_khata_credit': {
    id: 'srv_retail_khata_credit',
    name: 'Customer Khata Credit Book & Store Loyalty',
    shortDesc: 'Local customer khata credit tracking, WhatsApp balance reminders, store credit points, and repeat buyer discounts.',
    description: 'Neighborhood store credit book managing customer credit limits, payment installments, and loyalty points.',
    category: 'RETAIL',
    categoryName: 'Retail & POS Storefront Operations',
    iconName: 'Users',
    route: '/industry/retail',
    supportedNiches: ['retail', 'all'],
    dependencies: ['srv_contacts', 'srv_retail_pos_cashier'],
    records: ['KhataAccount', 'CustomerCredit'],
    quickActions: [
      { id: 'act_log_credit', label: 'Log Khata Credit', href: '/industry/retail', iconName: 'Plus' },
    ],
    reports: [
      { id: 'rep_khata_receivables', name: 'Store Khata Credit Outstanding Balance', description: 'Pending dues from store regulars' },
    ],
    workflowTemplates: [
      { id: 'wf_khata_whatsapp_nudge', name: 'Weekly WhatsApp Khata Statement', trigger: 'Every Sunday at 10:00' },
    ],
    aiCapabilities: ['Credit Limit Risk Scoring', 'Personalized Restock Reminders'],
  },
};

/**
 * Helper to fetch all services supporting a given niche.
 */
export function getServicesForNiche(niche: IndustryNiche): UniversalService[] {
  return Object.values(UNIVERSAL_SERVICE_CATALOG).filter(
    (srv) => srv.supportedNiches.includes(niche) || srv.supportedNiches.includes('all')
  );
}

/**
 * Dependency validation helper:
 * Returns any missing dependency service objects for a given set of active service IDs.
 */
export function validateServiceDependencies(
  activeServiceIds: string[]
): { service: UniversalService; missingDependencies: UniversalService[] }[] {
  const activeSet = new Set(activeServiceIds);
  const issues: { service: UniversalService; missingDependencies: UniversalService[] }[] = [];

  for (const id of activeServiceIds) {
    const srv = UNIVERSAL_SERVICE_CATALOG[id];
    if (!srv) continue;

    const missingIds = srv.dependencies.filter((depId) => !activeSet.has(depId));
    if (missingIds.length > 0) {
      const missingServices = missingIds
        .map((mId) => UNIVERSAL_SERVICE_CATALOG[mId])
        .filter(Boolean);
      issues.push({ service: srv, missingDependencies: missingServices });
    }
  }

  return issues;
}

/**
 * Helper to resolve all transitive dependencies required to enable a given service.
 */
export function resolveRequiredDependencies(serviceId: string, currentActiveIds: string[]): string[] {
  const needed = new Set<string>();
  const activeSet = new Set(currentActiveIds);

  function walk(id: string) {
    const srv = UNIVERSAL_SERVICE_CATALOG[id];
    if (!srv) return;
    for (const depId of srv.dependencies) {
      if (!activeSet.has(depId) && !needed.has(depId)) {
        needed.add(depId);
        walk(depId);
      }
    }
  }

  walk(serviceId);
  return Array.from(needed);
}
