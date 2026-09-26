// apps/automation/src/intent/domain-packs.ts
// Domain Configuration Packs for Universal User-Friendly Automation

export interface DomainField {
  id: string;
  name: string;
  category: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'date';
  operators: string[];
  options?: string[];
  placeholder?: string;
}

export interface DomainActionOption {
  id: string;
  name: string;
  description: string;
  defaultConfig?: Record<string, any>;
  fields?: { id: string; name: string; type: string; required?: boolean; placeholder?: string }[];
}

export interface DomainTemplate {
  id: string;
  title: string;
  description: string;
  samplePrompt: string;
  trigger: string;
  rulesSummary: string[];
  actionSummary: string;
  resultDestination: string;
}

export interface DomainPack {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  fields: DomainField[];
  actions: DomainActionOption[];
  resultDestinations: { id: string; name: string; description: string }[];
  templates: DomainTemplate[];
  samplePrompts: string[];
}

export const COMMON_OPERATORS = [
  { id: 'equals', label: 'equals' },
  { id: 'does_not_equal', label: 'does not equal' },
  { id: 'contains', label: 'contains' },
  { id: 'does_not_contain', label: 'does not contain' },
  { id: 'is_greater_than', label: 'is greater than' },
  { id: 'is_less_than', label: 'is less than' },
  { id: 'is_at_least', label: 'is at least' },
  { id: 'is_at_most', label: 'is at most' },
  { id: 'is_empty', label: 'is empty' },
  { id: 'is_not_empty', label: 'is not empty' },
  { id: 'starts_with', label: 'starts with' },
  { id: 'ends_with', label: 'ends with' },
  { id: 'matches', label: 'matches pattern' },
  { id: 'exists', label: 'exists' },
];

export const DOMAIN_PACKS: Record<string, DomainPack> = {
  recruitment: {
    id: 'recruitment',
    name: 'Recruitment & Talent',
    tagline: 'Automate candidate screening, resume evaluation, and interview scheduling',
    icon: 'UserCheck',
    color: 'emerald',
    fields: [
      { id: 'candidate.cgpa', name: 'Candidate → Academic → CGPA', category: 'Academic', type: 'number', operators: ['is_at_least', 'is_greater_than', 'equals'] },
      { id: 'candidate.degree', name: 'Candidate → Academic → Degree Type', category: 'Academic', type: 'string', operators: ['equals', 'contains'], options: ["Bachelor's degree", "Master's degree", 'Doctorate', 'Associate degree'] },
      { id: 'candidate.experienceYears', name: 'Candidate → Experience → Relevant Years', category: 'Experience', type: 'number', operators: ['is_at_least', 'is_greater_than', 'is_at_most'] },
      { id: 'candidate.skills', name: 'Candidate → Skills → Matching Skill List', category: 'Skills', type: 'array', operators: ['contains', 'does_not_contain'] },
      { id: 'candidate.location', name: 'Candidate → Location → City / Remote', category: 'Location', type: 'string', operators: ['equals', 'contains'] },
      { id: 'candidate.accountingSoftware', name: 'Candidate → Preferred → Accounting Software Experience', category: 'Preferred', type: 'boolean', operators: ['exists', 'equals'] },
    ],
    actions: [
      { id: 'screen_candidate', name: 'Screen Candidate against Profile', description: 'Run anti-bias screening and generate evidence report' },
      { id: 'request_human_review', name: 'Send to Recruiter Review Queue', description: 'Flag candidate for human partner decision' },
      { id: 'send_interview_invite', name: 'Send Interview Invitation', description: 'Email or WhatsApp calendar scheduling link' },
      { id: 'request_more_info', name: 'Request Additional Information', description: 'Ask candidate for missing credentials or portfolio' },
      { id: 'reject_candidate', name: 'Send Polite Status Update', description: 'Send thoughtful status notification with audit record' },
    ],
    resultDestinations: [
      { id: 'recruiter_queue', name: 'Recruiter Review Queue', description: 'Interactive dashboard for candidate review and notes' },
      { id: 'candidate_profile', name: 'Candidate Profile & ATS', description: 'Record screening breakdown directly in ATS' },
      { id: 'calendar', name: 'Company Interview Calendar', description: 'Hold interview time slot on recruiter calendar' },
    ],
    templates: [
      {
        id: 'screen_accounts_exec',
        title: 'Junior Accounts Executive Screening',
        description: 'Screen graduates with CGPA 3.0+, 2+ years experience, and 5 of 8 office skills with human review.',
        samplePrompt: 'I need a graduate with CGPA 3.00 or above, at least 2 years relevant experience, and at least 5 of these 8 skills: MS Office, Excel, Word, PowerPoint, Google Sheets, Communication, Reporting, Data Entry. Accounting software experience is preferred.',
        trigger: 'Candidate Applied',
        rulesSummary: ["Degree: Bachelor's", 'CGPA ≥ 3.00', 'Experience ≥ 2 years', 'At least 5 of 8 listed skills'],
        actionSummary: 'Route qualified applicants to Recruiter Review Queue and send interview invitation.',
        resultDestination: 'Recruiter Review Queue + Candidate Profile',
      },
    ],
    samplePrompts: [
      'Screen candidates for an accounts executive role. Must be graduates with CGPA 3.0+, 2 years experience, and at least 5 of 8 office skills. Preferred QuickBooks.',
      'When an engineering candidate applies with 3+ years in TypeScript and Node.js, invite to technical screening.',
    ],
  },

  front_desk: {
    id: 'front_desk',
    name: 'AI Front Desk & Voice Receptionist',
    tagline: 'Autonomous call answering, business hours triage, and calendar booking',
    icon: 'PhoneCall',
    color: 'violet',
    fields: [
      { id: 'call.time', name: 'Call → Timing → Business Hours Status', category: 'Call', type: 'string', operators: ['equals'], options: ['During business hours', 'Outside business hours'] },
      { id: 'call.intent', name: 'Call → Intent → Caller Objective', category: 'Intent', type: 'string', operators: ['equals', 'contains'], options: ['Book Appointment', 'General Inquiry', 'Urgent Request', 'Billing Query'] },
      { id: 'call.complexity', name: 'Call → Complexity → Inquiry Difficulty', category: 'Analysis', type: 'string', operators: ['equals'], options: ['Routine', 'Complex', 'Uncertain'] },
      { id: 'caller.wantsHuman', name: 'Caller → Preference → Requests Live Person', category: 'Preference', type: 'boolean', operators: ['equals'] },
    ],
    actions: [
      { id: 'answer_with_knowledge', name: 'Answer with Business Knowledge', description: 'Consult corporate knowledge base to answer questions' },
      { id: 'book_appointment', name: 'Book Appointment on Calendar', description: 'Find mutually agreeable calendar slot and confirm booking' },
      { id: 'transfer_to_staff', name: 'Transfer Call to Human Staff', description: 'Warm transfer or route call directly to duty officer phone' },
      { id: 'send_sms_summary', name: 'Send SMS Follow-Up with Link', description: 'Send caller confirmation SMS with relevant links' },
    ],
    resultDestinations: [
      { id: 'appointment_record', name: 'Calendar & Appointment Book', description: 'Confirmed meeting recorded on company calendar' },
      { id: 'call_transcript', name: 'Call Logs & Audio Transcripts', description: 'Full audio recording, transcript, and sentiment analysis' },
      { id: 'duty_officer_notification', name: 'Staff Notification (SMS / Push)', description: 'Alert on-call staff of urgent or transferred inquiries' },
    ],
    templates: [
      {
        id: 'after_hours_receptionist',
        title: 'After-Hours Autonomous Receptionist',
        description: 'Answer calls outside business hours, resolve questions, book appointments, and escalate complex issues.',
        samplePrompt: 'Handle calls after hours, answer basic questions, book appointments, and transfer complex issues to my team.',
        trigger: 'Incoming call outside business hours',
        rulesSummary: ['Call is outside business hours', 'Customer requests appointment or information', 'Escalate if caller asks for human or issue is complex'],
        actionSummary: 'AI answers via Knowledge Base, books appointment on calendar, or warm-transfers to staff.',
        resultDestination: 'Calendar Appointment + Call Log + Staff SMS Alert',
      },
    ],
    samplePrompts: [
      'Handle after-hours calls and book appointments. Transfer complicated calls to a human.',
      'When a customer calls during office hours, ask their inquiry and route to sales if deal-related or support if billing.',
    ],
  },

  sales: {
    id: 'sales',
    name: 'Sales & Revenue Automation',
    tagline: 'Lead scoring, instant outreach, multi-channel cadences, and follow-ups',
    icon: 'TrendingUp',
    color: 'blue',
    fields: [
      { id: 'lead.score', name: 'Lead → Score → ICP Qualification Score', category: 'Lead', type: 'number', operators: ['is_at_least', 'is_greater_than'] },
      { id: 'lead.intent', name: 'Lead → Intent → Purchase Readiness', category: 'Lead', type: 'string', operators: ['equals'], options: ['High Intent', 'Medium Intent', 'Browsing'] },
      { id: 'lead.responded', name: 'Lead → Engagement → Has Responded', category: 'Engagement', type: 'boolean', operators: ['equals'] },
      { id: 'lead.companySize', name: 'Lead → Firmographics → Employee Count', category: 'Firmographics', type: 'number', operators: ['is_at_least', 'is_greater_than'] },
      { id: 'lead.daysSinceContact', name: 'Lead → Timing → Days Since Last Touch', category: 'Timing', type: 'number', operators: ['is_at_least', 'equals'] },
    ],
    actions: [
      { id: 'score_lead_ai', name: 'Calculate AI Lead Score & ICP Fit', description: 'Enrich domain and compute readiness score' },
      { id: 'contact_immediately', name: 'Instant Outreach (WhatsApp / Email)', description: 'Send personalized introduction within 60 seconds' },
      { id: 'wait_timer', name: 'Wait Specific Duration', description: 'Hold cadence for 2 days or specified time' },
      { id: 'send_follow_up', name: 'Send Intelligent Follow-Up Message', description: 'Follow up referencing previous touchpoint' },
      { id: 'assign_sales_rep', name: 'Assign Account Executive & Create Deal', description: 'Create deal in pipeline and notify rep' },
    ],
    resultDestinations: [
      { id: 'crm_deal', name: 'CRM Pipeline & Lead Record', description: 'Lead status and activity timeline updated' },
      { id: 'rep_task', name: 'Sales Rep Action Item', description: 'Task created for salesperson with contact details' },
    ],
    templates: [
      {
        id: 'instant_lead_cadence',
        title: 'Instant Outreach & 2-Day Follow-Up',
        description: 'Score incoming leads, message high-intent leads immediately, and follow up after 2 days of silence.',
        samplePrompt: 'When a new lead arrives, score it. If highly interested, contact immediately. If no response after 2 days, follow up.',
        trigger: 'New lead form submitted',
        rulesSummary: ['Lead intent is High Intent', 'Wait 2 days if no reply', 'Maximum 3 follow-ups'],
        actionSummary: 'Score lead, send instant outreach, wait 2 days, send friendly follow-up.',
        resultDestination: 'CRM Deal Pipeline + Sales Rep Alert',
      },
    ],
    samplePrompts: [
      'When a new lead arrives, score it. If highly interested, contact immediately. If no response after 2 days, follow up.',
      'When an enterprise lead with >50 employees signs up, notify the VP of Sales and book a demo discovery call.',
    ],
  },

  finance: {
    id: 'finance',
    name: 'Finance & Accounting Automation',
    tagline: 'Invoice parsing, approval thresholds, payment reconciliation, and ledger syncing',
    icon: 'DollarSign',
    color: 'amber',
    fields: [
      { id: 'invoice.amount', name: 'Invoice → Financial → Total Amount', category: 'Financial', type: 'number', operators: ['is_greater_than', 'is_at_least', 'is_less_than'] },
      { id: 'invoice.vendor', name: 'Invoice → Vendor → Name or Domain', category: 'Vendor', type: 'string', operators: ['equals', 'contains', 'exists'] },
      { id: 'invoice.dueDate', name: 'Invoice → Timing → Due Date', category: 'Timing', type: 'date', operators: ['is_less_than', 'is_greater_than'] },
      { id: 'invoice.poMatched', name: 'Invoice → Compliance → Purchase Order Matched', category: 'Compliance', type: 'boolean', operators: ['equals'] },
    ],
    actions: [
      { id: 'ocr_extract_invoice', name: 'Read & Extract Invoice Data (OCR)', description: 'Extract vendor, total, line items, and bank details' },
      { id: 'request_manager_approval', name: 'Request Finance Manager Approval', description: 'Send interactive approval notification to manager' },
      { id: 'create_accounting_record', name: 'Create Accounting & Ledger Record', description: 'Log transaction in ERP / accounting system' },
      { id: 'schedule_payment', name: 'Schedule Payment Execution', description: 'Queue payout for due date' },
    ],
    resultDestinations: [
      { id: 'accounting_ledger', name: 'Accounting System & Ledger', description: 'New verified transaction entered in ledger' },
      { id: 'manager_inbox', name: 'Manager Approval Queue', description: 'Pending approval card in Finance portal' },
    ],
    templates: [
      {
        id: 'invoice_threshold_approval',
        title: 'Invoice Ingestion with $5,000 Approval Rule',
        description: 'Extract invoice data automatically; require finance manager approval if amount exceeds $5,000.',
        samplePrompt: 'Process invoices automatically, but require approval over $5,000.',
        trigger: 'Invoice received via email or upload',
        rulesSummary: ['Extract total, vendor, due date', 'If amount > $5,000 → request approval', 'Otherwise record directly'],
        actionSummary: 'OCR parse invoice, check amount threshold, route for approval or log transaction.',
        resultDestination: 'Accounting Record + Manager Approval Queue',
      },
    ],
    samplePrompts: [
      'Process invoices automatically, but require approval over $5,000.',
      'When an invoice arrives by email, extract vendor, total, and due date, check against PO, and schedule payment.',
    ],
  },

  support: {
    id: 'support',
    name: 'Customer Support & Triage',
    tagline: 'Sentiment-aware triage, automated knowledge answers, and urgent human handoff',
    icon: 'LifeBuoy',
    color: 'rose',
    fields: [
      { id: 'customer.sentiment', name: 'Customer → Sentiment → Detected Emotion', category: 'Sentiment', type: 'string', operators: ['equals'], options: ['frustrated', 'neutral', 'satisfied', 'angry'] },
      { id: 'ai.confidence', name: 'AI → Confidence → Knowledge Match Certainty', category: 'Confidence', type: 'string', operators: ['equals', 'is_less_than'], options: ['high', 'moderate', 'unclear', 'low'] },
      { id: 'ticket.priority', name: 'Ticket → Urgency → Assigned Priority', category: 'Ticket', type: 'string', operators: ['equals'], options: ['URGENT', 'HIGH', 'NORMAL', 'LOW'] },
      { id: 'customer.isVip', name: 'Customer → Status → VIP Account', category: 'Account', type: 'boolean', operators: ['equals'] },
    ],
    actions: [
      { id: 'analyze_sentiment', name: 'Analyze Sentiment & AI Resolution Confidence', description: 'Inspect message tone and answer certainty' },
      { id: 'answer_with_kb', name: 'Send Automated Knowledge Base Solution', description: 'Provide verified resolution article' },
      { id: 'escalate_to_human', name: 'Escalate to Live Support Agent', description: 'Route ticket to tier-2 human queue with transcript summary' },
      { id: 'set_urgent_priority', name: 'Set Ticket to Urgent Priority', description: 'Trigger immediate paging alert for on-call agent' },
    ],
    resultDestinations: [
      { id: 'support_ticket', name: 'Support Helpdesk Ticket', description: 'Updated ticket status, priority, and assigned agent' },
      { id: 'slack_alert', name: 'Emergency Support Channel Alert', description: 'Notification in #support-escalations Slack channel' },
    ],
    templates: [
      {
        id: 'frustrated_customer_escalation',
        title: 'Frustrated Customer Sentiment Escalation',
        description: 'If a customer is frustrated or the AI is unsure, escalate immediately to a human support agent.',
        samplePrompt: 'If the customer is frustrated or the AI is unsure, escalate to human.',
        trigger: 'Customer submits support inquiry or message',
        rulesSummary: ['Customer sentiment is frustrated', 'OR AI confidence is unclear', 'Escalate with high priority'],
        actionSummary: 'Detect customer distress or unclear resolution, page live support agent with conversation summary.',
        resultDestination: 'Support Ticket + Live Agent Escalation Queue',
      },
    ],
    samplePrompts: [
      'If the customer is frustrated or the AI is unsure, escalate to human.',
      'When an urgent ticket is submitted by a VIP client, notify the account manager within 5 minutes.',
    ],
  },

  documents: {
    id: 'documents',
    name: 'Document & Contract Processing',
    tagline: 'Contract parsing, required field audits, missing data alerts, and document archival',
    icon: 'FileText',
    color: 'indigo',
    fields: [
      { id: 'document.type', name: 'Document → Category → File Type', category: 'Document', type: 'string', operators: ['equals'], options: ['Contract', 'NDA', 'Identification', 'Tax Form'] },
      { id: 'document.missingFields', name: 'Document → Completeness → Missing Required Fields', category: 'Completeness', type: 'array', operators: ['is_not_empty', 'is_empty'] },
      { id: 'document.isSigned', name: 'Document → Status → Executed Signature Present', category: 'Status', type: 'boolean', operators: ['equals'] },
    ],
    actions: [
      { id: 'extract_contract_fields', name: 'Extract Contract Key Terms & Dates', description: 'Extract parties, expiration dates, and obligations' },
      { id: 'check_required_fields', name: 'Verify All Mandatory Fields Are Present', description: 'Audit document against compliance checklist' },
      { id: 'notify_assigned_employee', name: 'Notify Assigned Employee of Missing Items', description: 'Send checklist of missing items to account lead' },
      { id: 'archive_document', name: 'Archive in Secure Document Vault', description: 'Store in verified compliance repository' },
    ],
    resultDestinations: [
      { id: 'document_vault', name: 'Document Vault Record', description: 'Indexed metadata and audit verification status' },
      { id: 'employee_task', name: 'Employee Remediation Task', description: 'Task generated for employee to retrieve missing documents' },
    ],
    templates: [
      {
        id: 'contract_audit_missing_fields',
        title: 'Contract Field Audit & Missing Information Alert',
        description: 'Extract contract data, verify required terms, and alert employee if key information is missing.',
        samplePrompt: 'When a contract is uploaded, extract the important information, check whether required fields are present, and send missing information to the assigned employee.',
        trigger: 'Contract uploaded to Document Vault',
        rulesSummary: ['Extract terms and signatures', 'Audit mandatory fields', 'If missing fields → notify employee'],
        actionSummary: 'OCR parse contract, verify compliance fields, notify responsible employee of omissions.',
        resultDestination: 'Document Vault + Employee Task',
      },
    ],
    samplePrompts: [
      'When a contract is uploaded, extract the important information, check whether required fields are present, and send missing information to the assigned employee.',
    ],
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce & Inventory Operations',
    tagline: 'Low stock alerts, supplier restock purchase orders, and fulfillment updates',
    icon: 'ShoppingCart',
    color: 'orange',
    fields: [
      { id: 'product.stockLevel', name: 'Inventory → Stock → Available Quantity', category: 'Inventory', type: 'number', operators: ['is_less_than', 'is_at_most'] },
      { id: 'order.amount', name: 'Order → Financial → Total Value', category: 'Order', type: 'number', operators: ['is_greater_than', 'is_at_least'] },
    ],
    actions: [
      { id: 'notify_store_manager', name: 'Notify Store Operations Manager', description: 'Send urgent inventory depletion warning' },
      { id: 'create_restock_task', name: 'Generate Restock Purchase Task', description: 'Draft purchase order with primary supplier' },
    ],
    resultDestinations: [
      { id: 'store_dashboard', name: 'Inventory Dashboard', description: 'Low stock badge and status alert' },
      { id: 'supplier_po', name: 'Draft Supplier Purchase Order', description: 'Pre-filled restock requisition' },
    ],
    templates: [
      {
        id: 'low_stock_restock',
        title: 'Low Inventory Restock Automation',
        description: 'When stock drops below 10 units, notify the store manager and draft a restock requisition.',
        samplePrompt: 'When inventory drops below 10, notify the store manager and create a restock task.',
        trigger: 'Inventory level updated',
        rulesSummary: ['Product quantity < 10 units', 'Notify manager', 'Create restock task'],
        actionSummary: 'Monitor stock levels, trigger alerts on threshold breaches, and queue procurement.',
        resultDestination: 'Store Dashboard + Restock Task',
      },
    ],
    samplePrompts: [
      'When inventory drops below 10, notify the store manager and create a restock task.',
    ],
  },

  marketing: {
    id: 'marketing',
    name: 'Marketing & Social Repurposing',
    tagline: 'Scheduled content repurposing, multi-channel distribution, and editorial approval',
    icon: 'Share2',
    color: 'pink',
    fields: [
      { id: 'content.publishedDate', name: 'Content → Timing → Publication Date', category: 'Content', type: 'date', operators: ['is_greater_than'] },
      { id: 'content.approvalRequired', name: 'Content → Editorial → Needs Review Before Publishing', category: 'Editorial', type: 'boolean', operators: ['equals'] },
    ],
    actions: [
      { id: 'repurpose_content_ai', name: 'Repurpose Article for LinkedIn, X & Instagram', description: 'Generate platform-tailored hooks, hashtags, and carousels' },
      { id: 'require_social_approval', name: 'Queue for Social Media Manager Approval', description: 'Send preview card to manager before publishing' },
      { id: 'publish_to_channels', name: 'Schedule & Publish to Selected Channels', description: 'Schedule social posts across active connectors' },
    ],
    resultDestinations: [
      { id: 'social_calendar', name: 'Content Marketing Calendar', description: 'Draft posts scheduled for publication' },
      { id: 'editorial_queue', name: 'Editorial Review Center', description: 'Pending approval card for marketing lead' },
    ],
    templates: [
      {
        id: 'weekly_blog_repurpose',
        title: 'Weekly Blog Social Repurposing Cadence',
        description: 'Every Monday extract the latest article, generate posts for LinkedIn, X and Instagram, and queue for review.',
        samplePrompt: 'Every Monday create social content from our latest blog and prepare it for LinkedIn, Instagram and X. Require approval before publishing.',
        trigger: 'Weekly schedule (Every Monday at 9:00 AM)',
        rulesSummary: ['Input: Latest published blog', 'Generate for LinkedIn, Instagram, X', 'Require manager sign-off'],
        actionSummary: 'Extract blog text, generate platform-specific drafts, present to editor for one-click approval.',
        resultDestination: 'Content Marketing Calendar + Editorial Queue',
      },
    ],
    samplePrompts: [
      'Every Monday create social content from our latest blog and prepare it for LinkedIn, Instagram and X.',
    ],
  },

  hr: {
    id: 'hr',
    name: 'HR & Employee Workflows',
    tagline: 'New hire onboarding, document collection, compliance checklists, and IT provisioning',
    icon: 'Users',
    color: 'teal',
    fields: [
      { id: 'employee.role', name: 'Employee → Position → Department / Role', category: 'Employee', type: 'string', operators: ['equals', 'contains'] },
      { id: 'employee.startDate', name: 'Employee → Timing → Start Date', category: 'Timing', type: 'date', operators: ['is_less_than'] },
      { id: 'onboarding.documentsComplete', name: 'Onboarding → Status → All Documents Submitted', category: 'Status', type: 'boolean', operators: ['equals'] },
    ],
    actions: [
      { id: 'send_onboarding_pack', name: 'Send Welcome Packet & Document Links', description: 'Email new hire portal access and compliance forms' },
      { id: 'create_it_provision_task', name: 'Create IT Hardware & Account Provisioning Task', description: 'Alert IT department to configure laptop and email' },
      { id: 'schedule_checkin_meetings', name: 'Schedule Day 1 & Week 1 Manager Check-Ins', description: 'Place introductory meetings on manager calendar' },
    ],
    resultDestinations: [
      { id: 'hr_portal', name: 'HR Employee Dossier', description: 'New employee onboarding profile' },
      { id: 'it_helpdesk', name: 'IT Provisioning Ticket', description: 'Hardware deployment checklist' },
    ],
    templates: [
      {
        id: 'new_employee_onboarding',
        title: 'Automated Employee Onboarding & IT Setup',
        description: 'When an offer is accepted, send the onboarding packet, alert IT for laptop setup, and schedule manager check-ins.',
        samplePrompt: 'When a new employee is hired, send onboarding documents, alert IT to configure accounts, and book welcome meetings.',
        trigger: 'New hire accepted offer',
        rulesSummary: ['Send welcome pack', 'Provision IT accounts', 'Schedule Day 1 meetings'],
        actionSummary: 'Orchestrate new hire onboarding across HR, IT, and team calendar.',
        resultDestination: 'HR Portal + IT Helpdesk Ticket',
      },
    ],
    samplePrompts: [
      'When a new employee is hired, send onboarding documents, alert IT to configure accounts, and book welcome meetings.',
    ],
  },
};
