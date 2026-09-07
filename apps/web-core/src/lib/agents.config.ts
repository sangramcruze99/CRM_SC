// apps/web-core/src/lib/agents.config.ts

export interface AgentActionCapability {
  id: string;
  title: string;
  description: string;
}

export interface AgentAutomationItem {
  id: string;
  title: string;
  active: boolean;
  frequency: string;
}

export interface AgentActivityLog {
  id: string;
  entity: string;
  action: string;
  time: string;
  status: 'COMPLETED' | 'STAGED' | 'WARNING';
}

export interface BusinessAgentMetadata {
  id: string;
  friendlyName: string;
  departmentTitle: string;
  technicalCodename: string;
  roleDescription: string;
  avatarIcon: string;
  themeColor: string;
  whatICanDo: string[];
  todayStats: Array<{ label: string; value: string | number; alert?: boolean }>;
  automations: AgentAutomationItem[];
  recentActivity: AgentActivityLog[];
  primaryActionLabel: string;
  reviewRoute?: string;
  runEndpoint?: string;
}

export const BUSINESS_AGENTS: Record<string, BusinessAgentMetadata> = {
  midas: {
    id: 'midas',
    friendlyName: 'Midas',
    departmentTitle: 'Finance AI',
    technicalCodename: 'Midas AR Sentinel & Treasury Dunning Specialist',
    roleDescription: 'Audits accounts receivable, prepares tone-calibrated invoice reminders, creates payment links, and prevents revenue leakage.',
    avatarIcon: 'Landmark',
    themeColor: 'from-amber-500 to-yellow-600',
    whatICanDo: [
      'Find overdue invoices across all client accounts',
      'Prepare tone-calibrated payment reminders (gentle, firm, or executive)',
      'Generate dynamic checkout and payment links (Stripe / Razorpay)',
      'Identify high-risk debtor accounts before default',
      'Create automated follow-up tasks on rep calendars',
    ],
    todayStats: [
      { label: 'Overdue invoices detected', value: 12, alert: true },
      { label: 'High-risk debtor accounts', value: 3, alert: true },
      { label: 'Payment reminders ready', value: 5 },
      { label: 'Cashflow visibility', value: '30 Days' },
    ],
    automations: [
      { id: 'midas_scan', title: 'Daily overdue invoice scan (9:00 AM UTC)', active: true, frequency: 'Daily' },
      { id: 'midas_reminder', title: 'Payment reminder preparation for accounts > 7 days past due', active: true, frequency: 'Real-time' },
      { id: 'midas_crm', title: 'CRM follow-up task creation for invoices > $10,000', active: true, frequency: 'On Trigger' },
    ],
    recentActivity: [
      { id: 'act_1', entity: 'Invoice #1042 ($4,800 · Stark Industries)', action: 'Gentle reminder prepared for review', time: '14m ago', status: 'STAGED' },
      { id: 'act_2', entity: 'Invoice #1091 ($18,500 · Acme Corp)', action: 'Follow-up task created on Account Executive board', time: '42m ago', status: 'COMPLETED' },
      { id: 'act_3', entity: 'Invoice #1075 ($2,100 · Globex)', action: 'Payment link generated & sent via Resend', time: '2h ago', status: 'COMPLETED' },
    ],
    primaryActionLabel: 'Run Midas Automation',
    reviewRoute: '/ai/approvals?dept=finance',
    runEndpoint: '/api/ai/departments/finance/audit',
  },

  ares: {
    id: 'ares',
    friendlyName: 'Ares',
    departmentTitle: 'Sales AI',
    technicalCodename: 'Ares SDR Sentinel & Deal Velocity Orchestrator',
    roleDescription: 'Monitors deal pipeline velocity, identifies stalled opportunities, enriches inbound prospects, and drafts warm sales follow-ups.',
    avatarIcon: 'TrendingUp',
    themeColor: 'from-amber-500 to-orange-600',
    whatICanDo: [
      'Detect stalled deals with no communication for over 7 days',
      'Prepare contextual sales follow-up messages using CRM history',
      'Score and qualify incoming B2B leads automatically',
      'Summarize customer meeting transcripts and next steps',
      'Recommend optimal deal pricing and discount margins',
    ],
    todayStats: [
      { label: 'Stalled deals flagged', value: 4, alert: true },
      { label: 'Warm follow-ups ready', value: 7 },
      { label: 'Incoming leads qualified', value: 23 },
      { label: 'Pipeline velocity score', value: '88/100' },
    ],
    automations: [
      { id: 'ares_stalled', title: 'Daily deal inactivity watchdog', active: true, frequency: 'Daily' },
      { id: 'ares_enrich', title: 'Automatic Apollo / ZoomInfo lead enrichment', active: true, frequency: 'On Ingestion' },
      { id: 'ares_draft', title: 'Follow-up proposal drafting on stage change', active: true, frequency: 'On Trigger' },
    ],
    recentActivity: [
      { id: 'act_4', entity: 'Deal: Acme Corp ($42,000)', action: 'Executive check-in message staged for review', time: '10m ago', status: 'STAGED' },
      { id: 'act_5', entity: 'Lead: Cyberdyne Systems', action: 'Lead scored 94/100 (Hot Prospect)', time: '35m ago', status: 'COMPLETED' },
      { id: 'act_6', entity: 'Deal: Wayne Enterprises ($85,000)', action: 'Stall warning prevented via rep ping', time: '1h ago', status: 'COMPLETED' },
    ],
    primaryActionLabel: 'Run Ares Pipeline Audit',
    reviewRoute: '/ai/approvals?dept=sales',
    runEndpoint: '/api/ai/departments/sales/audit',
  },

  athena: {
    id: 'athena',
    friendlyName: 'Athena',
    departmentTitle: 'Customer Success AI',
    technicalCodename: 'Athena Retention Sentinel & Churn Defense Officer',
    roleDescription: 'Monitors client product usage, detects early account churn signals, and drafts proactive health check-ins.',
    avatarIcon: 'ShieldCheck',
    themeColor: 'from-emerald-500 to-teal-600',
    whatICanDo: [
      'Monitor seat activity and detect 30-day usage declines',
      'Calculate multi-factor health scores across usage, support, and billing',
      'Draft proactive relationship check-in emails for account managers',
      'Assemble quarterly Executive Business Review (EBR) dossiers',
      'Alert CS leads to negative sentiment in helpdesk tickets',
    ],
    todayStats: [
      { label: 'At-risk accounts flagged', value: 2, alert: true },
      { label: 'Accounts scanned today', value: 48 },
      { label: 'Health reviews staged', value: 5 },
      { label: 'Net retention protected', value: '98.4%' },
    ],
    automations: [
      { id: 'athena_usage', title: 'Continuous account usage telemetry analysis', active: true, frequency: 'Real-time' },
      { id: 'athena_churn', title: 'Early warning trigger when active seats drop > 25%', active: true, frequency: 'On Trigger' },
    ],
    recentActivity: [
      { id: 'act_7', entity: 'Account: Globex Logistics', action: 'Active seats dropped 35% — check-in drafted', time: '1h ago', status: 'STAGED' },
      { id: 'act_8', entity: 'Account: Initech Corporation', action: 'Health score improved from 62 to 88', time: '3h ago', status: 'COMPLETED' },
    ],
    primaryActionLabel: 'Run Athena Health Scan',
    reviewRoute: '/ai/approvals?dept=cs',
    runEndpoint: '/api/ai/departments/cs/scan',
  },

  recruitment: {
    id: 'recruitment',
    friendlyName: 'Recruitment Agent',
    departmentTitle: 'People & HR AI',
    technicalCodename: 'Talent Acquisition & Pipeline Screener',
    roleDescription: 'Parses incoming resumes, matches candidate profiles against role scorecards, and drafts personalized interview invitations.',
    avatarIcon: 'Users',
    themeColor: 'from-indigo-500 to-purple-600',
    whatICanDo: [
      'Parse applicant resumes and extract technical qualifications',
      'Rank candidates against role job descriptions with objective match scoring',
      'Draft personalized interview confirmation and rejection emails',
      'Coordinate interview schedule slots with hiring managers',
      'Compile candidate dossiers with compensation expectations',
    ],
    todayStats: [
      { label: 'Resumes parsed today', value: 18 },
      { label: 'Top candidate matches', value: 4 },
      { label: 'Interview invites staged', value: 3 },
      { label: 'Time-to-screen average', value: '1.2m' },
    ],
    automations: [
      { id: 'rec_screen', title: 'Instant scorecard matching on applicant submission', active: true, frequency: 'On Ingestion' },
      { id: 'rec_invite', title: 'Interview scheduling link dispatch upon approval', active: true, frequency: 'On Approval' },
    ],
    recentActivity: [
      { id: 'act_9', entity: 'Candidate: Marcus Vance (Senior Fullstack)', action: 'Scorecard match: 96% — Interview draft prepared', time: '22m ago', status: 'STAGED' },
      { id: 'act_10', entity: 'Candidate: Sarah Lin (Product Designer)', action: 'Interview slot confirmed for Thursday 2:00 PM', time: '1h ago', status: 'COMPLETED' },
    ],
    primaryActionLabel: 'Review Candidate Matches',
    reviewRoute: '/onboarding',
  },

  onboarding: {
    id: 'onboarding',
    friendlyName: 'Onboarding Agent',
    departmentTitle: 'People & HR AI',
    technicalCodename: 'Employee Lifecycle & Readiness Sentinel',
    roleDescription: 'Guides new hires through document collection, benefits provisioning, hardware tracking, and departmental introductions.',
    avatarIcon: 'Contact',
    themeColor: 'from-teal-500 to-emerald-600',
    whatICanDo: [
      'Automate NDA and employment contract e-signature workflows',
      'Track identity documents and tax compliance forms',
      'Provision corporate email, Slack, and software seats',
      'Assign 30-60-90 day milestone checklists to new joiners',
      'Alert HR managers to incomplete onboarding paperwork',
    ],
    todayStats: [
      { label: 'Active new hires in flow', value: 3 },
      { label: 'Pending signature forms', value: 2, alert: true },
      { label: 'Onboarding tasks completed', value: 14 },
      { label: 'Day-1 readiness rate', value: '100%' },
    ],
    automations: [
      { id: 'onb_flow', title: 'Trigger Day-1 onboarding checklist upon contract signature', active: true, frequency: 'On Trigger' },
      { id: 'onb_ping', title: 'Gentle reminder to new hires with pending tax forms', active: true, frequency: 'Every 48h' },
    ],
    recentActivity: [
      { id: 'act_11', entity: 'New Hire: David Miller (Sales Engineer)', action: 'Offer letter signed & IT hardware checklist assigned', time: '3h ago', status: 'COMPLETED' },
    ],
    primaryActionLabel: 'Open Onboarding Board',
    reviewRoute: '/onboarding',
  },

  hr_assistant: {
    id: 'hr_assistant',
    friendlyName: 'HR Assistant',
    departmentTitle: 'People & HR AI',
    technicalCodename: 'People Operations & Policy Copilot',
    roleDescription: 'Answers employee policy inquiries, manages time-off requests, and tracks compliance certifications.',
    avatarIcon: 'Users',
    themeColor: 'from-pink-500 to-rose-600',
    whatICanDo: [
      'Answer questions on company PTO, benefits, and workplace policies',
      'Process vacation and sick leave requests with manager approval routing',
      'Audit expiration dates for work authorizations and certifications',
      'Maintain employee directory hierarchy and reporting lines',
    ],
    todayStats: [
      { label: 'Policy questions resolved', value: 9 },
      { label: 'Pending leave requests', value: 2 },
      { label: 'Compliance items up to date', value: '100%' },
    ],
    automations: [
      { id: 'hr_pto', title: 'Automatic leave balance deduction upon manager sign-off', active: true, frequency: 'On Approval' },
    ],
    recentActivity: [
      { id: 'act_12', entity: 'Leave Request: Vacation (3 days · Alex Rivera)', action: 'Manager approval routed to Slack', time: '4h ago', status: 'COMPLETED' },
    ],
    primaryActionLabel: 'View Employee Directory',
    reviewRoute: '/directory',
  },

  hermes: {
    id: 'hermes',
    friendlyName: 'Hermes',
    departmentTitle: 'Operations & Projects AI',
    technicalCodename: 'Hermes Workflow Conductor & Task Sentinel',
    roleDescription: 'Orchestrates cross-departmental handoffs, post-deal project initialization, and sprint milestone delivery.',
    avatarIcon: 'Workflow',
    themeColor: 'from-cyan-500 to-blue-600',
    whatICanDo: [
      'Initialize client project boards automatically when deals close',
      'Monitor task milestone deadlines and flag bottlenecks before delay',
      'Automate multi-step DAG workflows across all 21 microservices',
      'Synchronize external webhooks and data pipelines',
    ],
    todayStats: [
      { label: 'Active workflows running', value: 16 },
      { label: 'Project handoffs coordinated', value: 3 },
      { label: 'SLA delays prevented', value: 2 },
    ],
    automations: [
      { id: 'hermes_deal', title: 'Deal-to-Project instantiation workflow', active: true, frequency: 'On Won' },
      { id: 'hermes_sla', title: 'Sprint deadline watchdog', active: true, frequency: 'Hourly' },
    ],
    recentActivity: [
      { id: 'act_13', entity: 'Workflow: Acme Onboarding DAG', action: 'All 6 cross-service actions completed', time: '18m ago', status: 'COMPLETED' },
    ],
    primaryActionLabel: 'Open Automation OS',
    reviewRoute: '/automation',
  },

  support: {
    id: 'support',
    friendlyName: 'Frontline Copilot',
    departmentTitle: 'Support AI',
    technicalCodename: 'Customer Care & SLA Escalation Copilot',
    roleDescription: 'Classifies incoming helpdesk tickets, references company knowledge base, and drafts human-friendly answers.',
    avatarIcon: 'MessageSquare',
    themeColor: 'from-purple-500 to-pink-600',
    whatICanDo: [
      'Classify ticket urgency and tag technical domains',
      'Draft answers citing company documentation and articles',
      'Escalate high-severity outages to on-call engineers',
      'Calculate customer satisfaction (CSAT) trends',
    ],
    todayStats: [
      { label: 'Tickets categorized', value: 42 },
      { label: 'Draft replies prepared', value: 29 },
      { label: 'Urgent alerts dispatched', value: 1, alert: true },
    ],
    automations: [
      { id: 'sup_triage', title: 'Instant ticket categorization & priority scoring', active: true, frequency: 'On Ingestion' },
      { id: 'sup_draft', title: 'RAG knowledge search & draft response generation', active: true, frequency: 'Real-time' },
    ],
    recentActivity: [
      { id: 'act_14', entity: 'Ticket #492 (OAuth API Error)', action: 'Knowledge reply drafted referencing Dev Docs v2', time: '8m ago', status: 'STAGED' },
    ],
    primaryActionLabel: 'Open Helpdesk Tickets',
    reviewRoute: '/tickets',
  },

  vesta: {
    id: 'vesta',
    friendlyName: 'Vesta',
    departmentTitle: 'Real Estate AI',
    technicalCodename: 'Vesta Property & Escrow Sentinel',
    roleDescription: 'Matches buyers to MLS listings, tracks escrow milestones, and drafts lease agreements and property showings.',
    avatarIcon: 'Home',
    themeColor: 'from-emerald-600 to-teal-700',
    whatICanDo: [
      'Match buyer preference profiles to active property units',
      'Monitor escrow deadlines and deposit milestones',
      'Draft standardized lease agreements and property deeds',
      'Coordinate agent property showing schedules',
    ],
    todayStats: [
      { label: 'Buyer preferences matched', value: 14 },
      { label: 'Escrow milestones on track', value: 6 },
      { label: 'Contracts ready for e-sign', value: 2 },
    ],
    automations: [
      { id: 'vesta_match', title: 'Daily MLS listing match against buyer criteria', active: true, frequency: 'Daily' },
    ],
    recentActivity: [
      { id: 'act_15', entity: 'Property: 742 Evergreen Terrace ($1.2M)', action: 'Offer contract attached to vault and staged', time: '55m ago', status: 'COMPLETED' },
    ],
    primaryActionLabel: 'Open Property Pipeline',
    reviewRoute: '/deals',
  },

  documents: {
    id: 'documents',
    friendlyName: 'Doc Intelligence',
    departmentTitle: 'Documents & OCR AI',
    technicalCodename: 'Neural OCR & Intelligent Document Processing Sentinel',
    roleDescription: 'Extracts tabular line items from invoices, audits contract clauses, and hashes files into the Central Document Vault.',
    avatarIcon: 'Scan',
    themeColor: 'from-blue-600 to-indigo-700',
    whatICanDo: [
      'Extract vendor, dates, tax, and line items from PDFs and receipts',
      'Auto-classify documents into tenant service namespaces',
      'Audit legal contracts for missing liability and indemnity clauses',
      'Compute SHA-256 cryptographic checksums for document provenance',
    ],
    todayStats: [
      { label: 'Documents scanned today', value: 38 },
      { label: 'OCR accuracy rate', value: '99.4%' },
      { label: 'Line items reconciled', value: 142 },
    ],
    automations: [
      { id: 'doc_ocr', title: 'Automatic neural OCR extraction upon file upload', active: true, frequency: 'On Upload' },
    ],
    recentActivity: [
      { id: 'act_16', entity: 'Vendor_Invoice_AWS_Aug.pdf', action: 'Extracted 14 line items & created draft invoice', time: '12m ago', status: 'COMPLETED' },
    ],
    primaryActionLabel: 'Launch OCR Scanner',
    reviewRoute: '/ocr-invoice',
  },
};
