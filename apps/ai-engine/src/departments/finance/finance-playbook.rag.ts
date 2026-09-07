/**
 * RAG Playbook & Knowledge Base for AI Finance Department
 * Midas AR Sentinel, Collections Copilot, and Dual Khata Anomaly Auditor
 */

export interface DunningStrategy {
  tier: 'COURTESY_NUDGE' | 'ACCOUNT_PING' | 'PRE_SUSPENSION' | 'LEGAL_ESCALATION';
  minDaysOverdue: number;
  maxDaysOverdue: number;
  tone: 'WARM' | 'PROFESSIONAL' | 'FIRM' | 'URGENT_LEGAL';
  subject: string;
  templateBody: string;
  recommendedChannel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'DIRECT_CALL';
  allowDiscounts: boolean;
  maxDiscountPercent: number;
}

export interface DisputeBattlecard {
  category: 'SERVICE_QUALITY' | 'BILLING_ERROR' | 'MISSING_PO' | 'FINANCIAL_HARDSHIP';
  triggers: string[];
  recommendedAction: string;
  settlementPolicy: string;
  responseTemplate: string;
}

export const FINANCE_POLICY_RULES = [
  {
    ruleId: 'POL_FIN_001',
    name: 'Autonomous Courtesy Dunning',
    description: 'Invoices 1-7 days past due receive automated polite courtesy notifications without human escalation.',
    enforcement: 'AUTONOMOUS',
    thresholdDays: 7,
  },
  {
    ruleId: 'POL_FIN_002',
    name: 'Executive HITL Approval for Write-offs',
    description: 'Any bad-debt write-off or settlement discount exceeding $500 requires human-in-the-loop CFO approval.',
    enforcement: 'HITL_REQUIRED',
    thresholdAmount: 500,
  },
  {
    ruleId: 'POL_FIN_003',
    name: 'Dual Khata Discrepancy Tolerance',
    description: 'Ledger reconciliations with variance > $0.01 between invoice paid status and bank transaction trigger an anomaly alert.',
    enforcement: 'SYSTEMIC_BLOCK',
    thresholdAmount: 0.01,
  },
  {
    ruleId: 'POL_FIN_004',
    name: 'Critical Service Suspension Warning',
    description: 'Invoices overdue > 45 days automatically queue an account suspension warning and lock non-essential API endpoints.',
    enforcement: 'SEMI_AUTONOMOUS',
    thresholdDays: 45,
  },
];

export const DUNNING_STRATEGIES: Record<string, DunningStrategy> = {
  COURTESY_NUDGE: {
    tier: 'COURTESY_NUDGE',
    minDaysOverdue: 1,
    maxDaysOverdue: 7,
    tone: 'WARM',
    subject: 'Friendly reminder: Invoice {{invoiceNum}} from {{companyName}}',
    templateBody:
      'Hi {{contactName}},\n\nWe hope you are having a productive week. This is a gentle reminder that invoice {{invoiceNum}} for ${{amount}} was due on {{dueDate}}.\n\nYou can review and pay securely using this link: {{paymentLink}}\n\nIf you have already arranged payment, please disregard this note.\n\nWarm regards,\n{{financeTeamName}}',
    recommendedChannel: 'EMAIL',
    allowDiscounts: false,
    maxDiscountPercent: 0,
  },
  ACCOUNT_PING: {
    tier: 'ACCOUNT_PING',
    minDaysOverdue: 8,
    maxDaysOverdue: 21,
    tone: 'PROFESSIONAL',
    subject: 'Follow-up regarding overdue invoice {{invoiceNum}}',
    templateBody:
      'Dear {{contactName}},\n\nOur accounts receivable records indicate that invoice {{invoiceNum}} (${{amount}}) remains outstanding past its due date of {{dueDate}}.\n\nTo ensure uninterrupted platform access and service continuity, please settle this balance at your earliest convenience: {{paymentLink}}\n\nPlease let us know if you have any questions or require an updated copy of the invoice.\n\nBest regards,\n{{financeTeamName}}',
    recommendedChannel: 'EMAIL',
    allowDiscounts: false,
    maxDiscountPercent: 0,
  },
  PRE_SUSPENSION: {
    tier: 'PRE_SUSPENSION',
    minDaysOverdue: 22,
    maxDaysOverdue: 45,
    tone: 'FIRM',
    subject: 'Urgent notice: Outstanding balance for {{invoiceNum}} - Action required',
    templateBody:
      'Attention {{contactName}},\n\nInvoice {{invoiceNum}} for ${{amount}} is now {{daysOverdue}} days overdue. Our automated credit policy will require us to temporarily restrict non-critical account features if this balance is not resolved.\n\nPlease remit payment immediately via the secure portal: {{paymentLink}}\n\nIf your organization requires a split payment plan, please reply directly so our treasury team can assist.\n\nSincerely,\n{{financeTeamName}}',
    recommendedChannel: 'EMAIL',
    allowDiscounts: true,
    maxDiscountPercent: 5,
  },
  LEGAL_ESCALATION: {
    tier: 'LEGAL_ESCALATION',
    minDaysOverdue: 46,
    maxDaysOverdue: 999,
    tone: 'URGENT_LEGAL',
    subject: 'FINAL NOTICE: Delinquent balance for invoice {{invoiceNum}}',
    templateBody:
      'FINAL DEMAND NOTICE\n\nRe: Account {{accountName}} - Invoice {{invoiceNum}} (${{amount}})\n\nDespite previous reminders, invoice {{invoiceNum}} remains unpaid for {{daysOverdue}} days. Unless full settlement or an agreed installment plan is finalized within 5 business days, this account will be transferred to outside collections.\n\nImmediate payment portal: {{paymentLink}}\n\nCredit Operations,\n{{financeTeamName}}',
    recommendedChannel: 'DIRECT_CALL',
    allowDiscounts: true,
    maxDiscountPercent: 15,
  },
};

export const DISPUTE_BATTLECARDS: DisputeBattlecard[] = [
  {
    category: 'SERVICE_QUALITY',
    triggers: ['downtime', 'sla violation', 'bug', 'outage', 'unsatisfied'],
    recommendedAction: 'Verify uptime metrics in CloudWatch/SLA logs. If verified SLA breach, offer standard credit memo.',
    settlementPolicy: 'Grant up to 10% SLA service credit against next billing cycle upon manager sign-off.',
    responseTemplate:
      'Thank you for bringing this to our attention. We investigated the reported issue against our uptime telemetry. As part of our commitment to excellence, we have applied a ${{creditAmount}} SLA credit to your invoice.',
  },
  {
    category: 'BILLING_ERROR',
    triggers: ['wrong amount', 'double charge', 'cancelled license', 'seat mismatch'],
    recommendedAction: 'Cross-reference active seats in LicenseManager with BillingLineItems. Recalculate true prorated amount.',
    settlementPolicy: 'Immediately void inaccurate invoice and issue corrected invoice with matching audit log.',
    responseTemplate:
      'We identified the billing discrepancy on line item {{lineItem}}. We have updated the invoice balance to ${{correctedAmount}} and adjusted your account balance accordingly.',
  },
  {
    category: 'MISSING_PO',
    triggers: ['need po', 'purchase order', 'procurement', 'vendor portal'],
    recommendedAction: 'Extract buyer AP requirements, generate updated PDF with PO reference, submit to buyer portal.',
    settlementPolicy: 'Hold dunning clock for 7 calendar days while procurement approves vendor PO.',
    responseTemplate:
      'We have attached an updated invoice referencing PO #{{poNumber}} for your procurement department. The due date has been updated to {{newDueDate}}.',
  },
  {
    category: 'FINANCIAL_HARDSHIP',
    triggers: ['budget freeze', 'cash flow', 'restructuring', 'layoffs', 'split payment'],
    recommendedAction: 'Propose structured 3-month installment payment plan with automated Stripe card authorization.',
    settlementPolicy: 'Require 33% immediate down payment; distribute remaining 67% over 60 days.',
    responseTemplate:
      'We understand market conditions can present cash flow challenges. We can offer an automated 3-installment plan starting with ${{installmentAmount}} today to keep your services fully operational.',
  },
];
