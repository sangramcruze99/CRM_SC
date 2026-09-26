// apps/automation/src/intent/intent-parser.service.ts
// AI Natural Language Requirement & Intent Parser

import { Injectable, Logger } from '@nestjs/common';
import { DOMAIN_PACKS, DomainPack } from './domain-packs';

export interface StructuredRule {
  id: string;
  field: string;
  fieldLabel: string;
  operator: string;
  value: any;
  priority: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
}

export interface AtLeastNRule {
  threshold: number;
  total: number;
  items: string[];
  priority: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
}

export interface RuleGroup {
  logic: 'ALL' | 'ANY' | 'NONE';
  rules: StructuredRule[];
  atLeastNRules?: AtLeastNRule[];
}

export interface StructuredAction {
  id: string;
  type: string;
  name: string;
  description: string;
  config: Record<string, any>;
}

export interface StructuredIntent {
  id?: string;
  name: string;
  goal: string;
  domain: string;
  domainName: string;
  trigger: {
    type: string;
    description: string;
    timing: 'IMMEDIATELY' | 'AFTER_DELAY' | 'SCHEDULED' | 'BUSINESS_HOURS' | 'OUTSIDE_BUSINESS_HOURS';
    delayValue?: string;
    cronExpression?: string;
  };
  ruleGroups: RuleGroup[];
  actions: StructuredAction[];
  timing: {
    schedule: string;
    window?: 'BUSINESS_HOURS' | 'OUTSIDE_BUSINESS_HOURS' | 'ALWAYS';
    delay?: string;
  };
  channels: string[];
  approvalPolicy: {
    required: boolean;
    condition: 'NEVER' | 'ALWAYS' | 'AI_UNSURE' | 'THRESHOLD_EXCEEDED' | 'EXTERNAL_COMMUNICATION';
    reviewerRole?: string;
    thresholdAmount?: number;
  };
  resultDestination: {
    id: string;
    name: string;
    summary: string;
  };
  exceptions: {
    onFailure: 'ASK_HUMAN' | 'RETRY' | 'STOP' | 'FALLBACK';
    onUncertain: 'ESCALATE_TO_HUMAN' | 'ASK_FOR_INFO';
    fallbackAction?: string;
  };
  explanation: string;
  visualSummary: string[];
  validation: {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  };
}

@Injectable()
export class IntentParserService {
  private readonly logger = new Logger(IntentParserService.name);

  /**
   * Parse natural-language intent into StructuredIntent
   */
  async parseIntent(prompt: string, domainHint?: string): Promise<StructuredIntent> {
    this.logger.log(`[IntentParser] Parsing natural language prompt: "${prompt}"`);
    const cleanPrompt = prompt.trim();
    const lower = cleanPrompt.toLowerCase();

    // 1. Detect Domain
    const domainKey = domainHint || this.detectDomain(lower);
    const domainPack: DomainPack = DOMAIN_PACKS[domainKey] || DOMAIN_PACKS['sales'];

    // 2. Dispatch to Domain-Specific Intent Extractor
    let intent: StructuredIntent;
    switch (domainKey) {
      case 'recruitment':
        intent = this.parseRecruitmentIntent(cleanPrompt, lower);
        break;
      case 'front_desk':
        intent = this.parseFrontDeskIntent(cleanPrompt, lower);
        break;
      case 'sales':
        intent = this.parseSalesIntent(cleanPrompt, lower);
        break;
      case 'finance':
        intent = this.parseFinanceIntent(cleanPrompt, lower);
        break;
      case 'support':
        intent = this.parseSupportIntent(cleanPrompt, lower);
        break;
      case 'documents':
        intent = this.parseDocumentIntent(cleanPrompt, lower);
        break;
      case 'ecommerce':
        intent = this.parseEcommerceIntent(cleanPrompt, lower);
        break;
      case 'marketing':
        intent = this.parseMarketingIntent(cleanPrompt, lower);
        break;
      case 'hr':
        intent = this.parseHrIntent(cleanPrompt, lower);
        break;
      default:
        intent = this.parseSalesIntent(cleanPrompt, lower);
        break;
    }

    // 3. Post-process & Validate
    this.validateIntent(intent);
    return intent;
  }

  private detectDomain(lower: string): string {
    if (lower.includes('cgpa') || lower.includes('graduate') || lower.includes('candidate') || lower.includes('resume') || lower.includes('applicant') || lower.includes('interview')) {
      return 'recruitment';
    }
    if (lower.includes('call') || lower.includes('phone') || lower.includes('after hours') || lower.includes('front desk') || lower.includes('receptionist') || lower.includes('appointment')) {
      return 'front_desk';
    }
    if (lower.includes('invoice') || lower.includes('payment') || lower.includes('accounting') || lower.includes('$') || lower.includes('po') || lower.includes('ledger')) {
      return 'finance';
    }
    if (lower.includes('frustrated') || lower.includes('support') || lower.includes('ticket') || lower.includes('helpdesk') || lower.includes('escalat') || lower.includes('sentiment')) {
      return 'support';
    }
    if (lower.includes('contract') || lower.includes('document') || lower.includes('nda') || lower.includes('upload') || lower.includes('ocr')) {
      return 'documents';
    }
    if (lower.includes('inventory') || lower.includes('stock') || lower.includes('restock') || lower.includes('product') || lower.includes('cart')) {
      return 'ecommerce';
    }
    if (lower.includes('blog') || lower.includes('social') || lower.includes('linkedin') || lower.includes('instagram') || lower.includes('twitter') || lower.includes('repurpose')) {
      return 'marketing';
    }
    if (lower.includes('employee') || lower.includes('onboard') || lower.includes('hire') || lower.includes('it provision')) {
      return 'hr';
    }
    if (lower.includes('lead') || lower.includes('deal') || lower.includes('sales') || lower.includes('score') || lower.includes('follow up') || lower.includes('outreach')) {
      return 'sales';
    }
    return 'sales';
  }

  // --- Domain Parser: Recruitment ---
  private parseRecruitmentIntent(prompt: string, lower: string): StructuredIntent {
    let minCgpa = 3.0;
    const cgpaMatch = prompt.match(/cgpa\s*(?:of|is|\>=|>=)?\s*([0-9]+(?:\.[0-9]+)?)/i) || prompt.match(/gpa\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (cgpaMatch) minCgpa = parseFloat(cgpaMatch[1]);

    let minYears = 2;
    const expMatch = prompt.match(/([0-9]+)\+?\s*years?(?:\s+of)?(?:\s+relevant)?(?:\s+experience)?/i);
    if (expMatch) minYears = parseInt(expMatch[1], 10);

    let threshold = 5;
    const countMatch = prompt.match(/at\s+least\s+([0-9]+)\s+of\s+(?:these\s+)?([0-9]+)?/i) || prompt.match(/([0-9]+)\s+of\s+([0-9]+)\s+skills/i);
    if (countMatch) threshold = parseInt(countMatch[1], 10);

    const defaultSkills = ['MS Office', 'Excel', 'Word', 'PowerPoint', 'Google Sheets', 'Communication', 'Reporting', 'Data Entry'];
    let skillItems = defaultSkills;
    const skillsColonMatch = prompt.match(/skills?:\s*([^\.]+)/i);
    if (skillsColonMatch) {
      const parsed = skillsColonMatch[1].split(/,|\band\b/i).map((s) => s.trim()).filter((s) => s.length > 1 && !s.toLowerCase().startsWith('at least'));
      if (parsed.length >= 3) skillItems = parsed;
    }

    const rules: StructuredRule[] = [
      {
        id: 'r_edu',
        field: 'candidate.degree',
        fieldLabel: 'Candidate → Academic → Degree Type',
        operator: 'equals',
        value: "Bachelor's degree",
        priority: 'REQUIRED',
      },
      {
        id: 'r_cgpa',
        field: 'candidate.cgpa',
        fieldLabel: 'Candidate → Academic → CGPA',
        operator: 'is_at_least',
        value: minCgpa,
        priority: 'REQUIRED',
      },
      {
        id: 'r_exp',
        field: 'candidate.experienceYears',
        fieldLabel: 'Candidate → Experience → Relevant Years',
        operator: 'is_at_least',
        value: minYears,
        priority: 'REQUIRED',
      },
    ];

    if (lower.includes('accounting software') || lower.includes('preferred')) {
      rules.push({
        id: 'r_pref_acc',
        field: 'candidate.accountingSoftware',
        fieldLabel: 'Candidate → Preferred → Accounting Software Experience',
        operator: 'exists',
        value: true,
        priority: 'PREFERRED',
      });
    }

    const atLeastN: AtLeastNRule = {
      threshold,
      total: skillItems.length,
      items: skillItems,
      priority: 'REQUIRED',
    };

    return {
      name: 'Automated Candidate Screening & Recruiter Review',
      goal: `Screen applicants for minimum degree, CGPA >= ${minCgpa.toFixed(2)}, ${minYears}+ years experience, and at least ${threshold} of ${skillItems.length} skills.`,
      domain: 'recruitment',
      domainName: 'Recruitment & Talent',
      trigger: {
        type: 'recruitment:candidate_applied',
        description: 'When a new candidate submits an application or resume',
        timing: 'IMMEDIATELY',
      },
      ruleGroups: [
        {
          logic: 'ALL',
          rules,
          atLeastNRules: [atLeastN],
        },
      ],
      actions: [
        {
          id: 'act_screen',
          type: 'recruitment:screen_candidate',
          name: 'Screen Candidate against Profile',
          description: 'Extract resume citations and evaluate mandatory/preferred criteria without protected-attribute bias.',
          config: { minCgpa, minYears, threshold, skills: skillItems },
        },
        {
          id: 'act_review',
          type: 'recruitment:human_review',
          name: 'Route to Recruiter Review Queue',
          description: 'Present transparent match breakdown and evidence citations for human sign-off.',
          config: { requireNotes: true },
        },
        {
          id: 'act_invite',
          type: 'communication:send_email',
          name: 'Send Interview Invitation',
          description: 'Upon recruiter approval, send calendar booking link to candidate.',
          config: { template: 'interview_invitation' },
        },
      ],
      timing: {
        schedule: 'Immediately upon application receipt',
        window: 'ALWAYS',
      },
      channels: ['Email', 'Internal Review Queue'],
      approvalPolicy: {
        required: true,
        condition: 'ALWAYS',
        reviewerRole: 'Recruiter / Talent Partner',
      },
      resultDestination: {
        id: 'recruiter_queue',
        name: 'Recruiter Review Queue + Candidate Profile',
        summary: 'Candidate dossier, transparent score breakdown, and interview booking state saved in ATS.',
      },
      exceptions: {
        onFailure: 'ASK_HUMAN',
        onUncertain: 'ESCALATE_TO_HUMAN',
        fallbackAction: 'Flag application as "Unclear - Manual Review Required"',
      },
      explanation: `The system monitors incoming candidate applications, parses resumes for a Bachelor's degree (CGPA ≥ ${minCgpa}), checks for ${minYears}+ years experience, and verifies at least ${threshold} of ${skillItems.length} required skills. All matches route to human recruiter review before any invitations are dispatched.`,
      visualSummary: [
        '1. WHEN: Candidate applies with resume',
        `2. AI CHECKS: Degree (Bachelor's), CGPA ≥ ${minCgpa}, Experience ≥ ${minYears} yrs`,
        `3. SKILL RULE: Candidate possesses at least ${threshold} of ${skillItems.length} skills`,
        '4. HUMAN AUDIT: Recruiter reviews evidence and approves interview',
        '5. RESULT: Candidate dossier updated & interview invitation sent',
      ],
      validation: { isValid: true, warnings: [], errors: [] },
    };
  }

  // --- Domain Parser: AI Front Desk ---
  private parseFrontDeskIntent(prompt: string, lower: string): StructuredIntent {
    const afterHours = lower.includes('after hours') || lower.includes('outside business hours');
    const transfersHuman = lower.includes('transfer') || lower.includes('human') || lower.includes('team');

    return {
      name: 'AI Front Desk & After-Hours Receptionist',
      goal: 'Answer incoming customer phone calls after business hours, answer questions with business knowledge, book calendar appointments, and warm-transfer complex calls.',
      domain: 'front_desk',
      domainName: 'AI Front Desk & Voice Receptionist',
      trigger: {
        type: 'voice:call_received',
        description: 'When an incoming call is received on the primary business phone number',
        timing: afterHours ? 'OUTSIDE_BUSINESS_HOURS' : 'IMMEDIATELY',
      },
      ruleGroups: [
        {
          logic: 'ALL',
          rules: [
            {
              id: 'r_hours',
              field: 'call.time',
              fieldLabel: 'Call → Timing → Business Hours Status',
              operator: 'equals',
              value: afterHours ? 'Outside business hours' : 'During business hours',
              priority: 'REQUIRED',
            },
          ],
        },
      ],
      actions: [
        {
          id: 'act_answer_ai',
          type: 'ai:voice_receptionist',
          name: 'Answer Call with Business Knowledge',
          description: 'Engage caller with friendly voice AI backed by verified corporate knowledge base.',
          config: { knowledgeBaseId: 'kb_corporate' },
        },
        {
          id: 'act_book_cal',
          type: 'calendar:book_appointment',
          name: 'Book Appointment on Calendar',
          description: 'Coordinate available time slot and create calendar invitation.',
          config: { calendarId: 'primary_calendar' },
        },
        ...(transfersHuman
          ? [
              {
                id: 'act_transfer',
                type: 'voice:transfer_call',
                name: 'Transfer Complex Call to Human Staff',
                description: 'Route call to duty officer if customer requests live agent or inquiry is complex.',
                config: { transferPhone: '+1-555-0199', timeoutSeconds: 30 },
              },
            ]
          : []),
      ],
      timing: {
        schedule: afterHours ? 'Outside business hours (Mon-Sun 6:00 PM - 8:00 AM)' : '24/7 Real-Time',
        window: afterHours ? 'OUTSIDE_BUSINESS_HOURS' : 'ALWAYS',
      },
      channels: ['Phone Voice Call', 'SMS Notification'],
      approvalPolicy: {
        required: false,
        condition: 'AI_UNSURE',
        reviewerRole: 'Duty Officer',
      },
      resultDestination: {
        id: 'appointment_record',
        name: 'Calendar Appointment + Call Audio & Transcript',
        summary: 'Booked appointment stored on team calendar; full transcript and sentiment analysis logged.',
      },
      exceptions: {
        onFailure: 'FALLBACK',
        onUncertain: 'ESCALATE_TO_HUMAN',
        fallbackAction: 'Take voicemail message and send urgent SMS alert to staff phone',
      },
      explanation:
        'When a call arrives outside business hours, the AI Voice Receptionist answers immediately. It addresses inquiries using verified company knowledge, assists with booking calendar appointments, and warm-transfers the call to human staff if the caller asks for a person or the issue is complex.',
      visualSummary: [
        '1. WHEN: Incoming call received outside business hours',
        '2. AI ACTION: Voice Receptionist answers & resolves inquiry',
        '3. IF APPOINTMENT REQUESTED: Calendar slot booked and confirmed',
        '4. IF COMPLEX OR HUMAN REQUESTED: Warm transfer to staff phone',
        '5. RESULT: Call audio, transcript, and appointment saved',
      ],
      validation: { isValid: true, warnings: [], errors: [] },
    };
  }

  // --- Domain Parser: Sales ---
  private parseSalesIntent(prompt: string, lower: string): StructuredIntent {
    let waitDays = 2;
    const waitMatch = prompt.match(/([0-9]+)\s*days?/i);
    if (waitMatch) waitDays = parseInt(waitMatch[1], 10);

    return {
      name: 'Instant Lead Qualification & Cadence Follow-Up',
      goal: 'Automatically score incoming leads, immediately contact high-intent prospects, and follow up if no reply after 2 days.',
      domain: 'sales',
      domainName: 'Sales & Revenue Automation',
      trigger: {
        type: 'sales:lead_created',
        description: 'When a new lead submits a contact or demo request form',
        timing: 'IMMEDIATELY',
      },
      ruleGroups: [
        {
          logic: 'ALL',
          rules: [
            {
              id: 'r_lead_intent',
              field: 'lead.intent',
              fieldLabel: 'Lead → Intent → Purchase Readiness',
              operator: 'equals',
              value: 'High Intent',
              priority: 'REQUIRED',
            },
          ],
        },
      ],
      actions: [
        {
          id: 'act_score',
          type: 'ai:lead_scoring',
          name: 'Calculate AI Lead Score & ICP Fit',
          description: 'Enrich lead domain, evaluate company size, and calculate ICP score.',
          config: { minScoreThreshold: 75 },
        },
        {
          id: 'act_contact_now',
          type: 'communication:send_whatsapp',
          name: 'Instant Outreach (WhatsApp / Email)',
          description: 'Send personalized introduction within 60 seconds of submission.',
          config: { channel: 'whatsapp', delaySeconds: 30 },
        },
        {
          id: 'act_wait',
          type: 'workflow:wait_timer',
          name: `Wait ${waitDays} Days for Customer Reply`,
          description: 'Pause sequence to observe customer response.',
          config: { durationDays: waitDays },
        },
        {
          id: 'act_followup',
          type: 'communication:send_email',
          name: 'Send Intelligent Follow-Up Message',
          description: 'If lead has not replied after waiting, dispatch friendly check-in.',
          config: { maxFollowUps: 3 },
        },
      ],
      timing: {
        schedule: `Instant outreach, followed by ${waitDays}-day check-in cadence`,
        window: 'ALWAYS',
        delay: `${waitDays} days`,
      },
      channels: ['WhatsApp', 'Email', 'CRM Notification'],
      approvalPolicy: {
        required: false,
        condition: 'AI_UNSURE',
        reviewerRole: 'Sales Manager',
      },
      resultDestination: {
        id: 'crm_deal',
        name: 'CRM Lead Pipeline & Account Executive Alert',
        summary: 'Lead enriched, touchpoints recorded in timeline, and deal stage advanced.',
      },
      exceptions: {
        onFailure: 'ASK_HUMAN',
        onUncertain: 'ASK_FOR_INFO',
        fallbackAction: 'Assign lead directly to SDR for manual telephone outreach',
      },
      explanation: `When a new lead arrives, the system scores their intent and ICP fit. High-intent leads receive an immediate outreach message. If the lead does not reply within ${waitDays} days, a personalized follow-up is automatically delivered.`,
      visualSummary: [
        '1. WHEN: New lead arrives from website form',
        '2. AI EVALUATES: Lead score & purchase intent',
        '3. IF HIGH INTENT: Send instant outreach message',
        `4. CADENCE: Wait ${waitDays} days with no reply → Send follow-up`,
        '5. RESULT: CRM lead record updated and sales rep notified',
      ],
      validation: { isValid: true, warnings: [], errors: [] },
    };
  }

  // --- Domain Parser: Finance ---
  private parseFinanceIntent(prompt: string, lower: string): StructuredIntent {
    let thresholdAmount = 5000;
    const amountMatch = prompt.match(/\$?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)/);
    if (amountMatch) {
      thresholdAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    return {
      name: 'Invoice Processing & Manager Approval Gateway',
      goal: `Extract incoming invoice details automatically and require manager approval for invoices exceeding $${thresholdAmount.toLocaleString()}.`,
      domain: 'finance',
      domainName: 'Finance & Accounting Automation',
      trigger: {
        type: 'finance:invoice_received',
        description: 'When an invoice PDF or document is received via email or file upload',
        timing: 'IMMEDIATELY',
      },
      ruleGroups: [
        {
          logic: 'ALL',
          rules: [
            {
              id: 'r_amount',
              field: 'invoice.amount',
              fieldLabel: 'Invoice → Financial → Total Amount',
              operator: 'is_greater_than',
              value: thresholdAmount,
              priority: 'REQUIRED',
            },
          ],
        },
      ],
      actions: [
        {
          id: 'act_ocr',
          type: 'ai:ocr_extract',
          name: 'Read & Extract Invoice Data (OCR)',
          description: 'Extract vendor name, line items, subtotal, tax, and due date.',
          config: { autoValidateFields: true },
        },
        {
          id: 'act_approval',
          type: 'approval:manager_signoff',
          name: 'Request Finance Manager Approval',
          description: `Route for interactive manager review because amount exceeds $${thresholdAmount.toLocaleString()}.`,
          config: { threshold: thresholdAmount, approverRole: 'FINANCE_MANAGER' },
        },
        {
          id: 'act_record',
          type: 'finance:create_ledger_entry',
          name: 'Create Accounting & Ledger Record',
          description: 'Record verified transaction in accounting system.',
          config: { syncLedger: true },
        },
      ],
      timing: {
        schedule: 'Real-time invoice ingestion and immediate approval dispatch',
        window: 'ALWAYS',
      },
      channels: ['Email', 'Finance Manager Portal', 'Slack Approval Card'],
      approvalPolicy: {
        required: true,
        condition: 'THRESHOLD_EXCEEDED',
        reviewerRole: 'Finance Manager',
        thresholdAmount,
      },
      resultDestination: {
        id: 'accounting_ledger',
        name: 'Accounting Ledger + Manager Approval Card',
        summary: 'Extracted invoice metadata stored in ERP ledger and approval audit trail archived.',
      },
      exceptions: {
        onFailure: 'ASK_HUMAN',
        onUncertain: 'ESCALATE_TO_HUMAN',
        fallbackAction: 'Route invoice to unclassified exceptions folder for manual review',
      },
      explanation: `When an invoice arrives, OCR extracts the vendor, line items, and total amount. If the amount exceeds $${thresholdAmount.toLocaleString()}, it requests Finance Manager approval before recording; otherwise, it logs the transaction automatically.`,
      visualSummary: [
        '1. WHEN: Invoice received via email or upload',
        '2. AI OCR: Reads invoice total, vendor, and due date',
        `3. RULE: If amount exceeds $${thresholdAmount.toLocaleString()} → Request manager approval`,
        '4. OTHERWISE: Proceed with automatic ledger entry',
        '5. RESULT: Accounting record created and payment scheduled',
      ],
      validation: { isValid: true, warnings: [], errors: [] },
    };
  }

  // --- Domain Parser: Customer Support ---
  private parseSupportIntent(prompt: string, lower: string): StructuredIntent {
    return {
      name: 'Frustrated Customer Sentiment Escalation',
      goal: 'Detect frustrated customer sentiment or low AI resolution confidence, and immediately escalate conversation to a live support agent.',
      domain: 'support',
      domainName: 'Customer Support & Triage',
      trigger: {
        type: 'support:ticket_message_received',
        description: 'When a customer sends a message or submits a support inquiry',
        timing: 'IMMEDIATELY',
      },
      ruleGroups: [
        {
          logic: 'ANY',
          rules: [
            {
              id: 'r_sentiment',
              field: 'customer.sentiment',
              fieldLabel: 'Customer → Sentiment → Detected Emotion',
              operator: 'equals',
              value: 'frustrated',
              priority: 'REQUIRED',
            },
            {
              id: 'r_confidence',
              field: 'ai.confidence',
              fieldLabel: 'AI → Confidence → Knowledge Match Certainty',
              operator: 'equals',
              value: 'unclear',
              priority: 'REQUIRED',
            },
          ],
        },
      ],
      actions: [
        {
          id: 'act_sentiment_analysis',
          type: 'ai:sentiment_analysis',
          name: 'Analyze Sentiment & AI Resolution Confidence',
          description: 'Detect customer distress or unclear resolution.',
          config: {},
        },
        {
          id: 'act_escalate',
          type: 'support:escalate_to_human',
          name: 'Escalate to Live Support Agent',
          description: 'Page tier-2 human queue with conversation summary and customer history.',
          config: { priority: 'URGENT' },
        },
      ],
      timing: {
        schedule: 'Real-time message evaluation with sub-second escalation dispatch',
        window: 'ALWAYS',
      },
      channels: ['Helpdesk Ticket', 'Emergency Support Slack / PagerDuty'],
      approvalPolicy: {
        required: true,
        condition: 'ALWAYS',
        reviewerRole: 'Tier-2 Support Agent',
      },
      resultDestination: {
        id: 'support_ticket',
        name: 'Support Helpdesk Ticket + Live Agent Queue',
        summary: 'Ticket priority elevated to URGENT, live agent assigned, and transcript summary appended.',
      },
      exceptions: {
        onFailure: 'ASK_HUMAN',
        onUncertain: 'ESCALATE_TO_HUMAN',
        fallbackAction: 'Page on-call support team with raw transcript',
      },
      explanation:
        'The system monitors customer communications in real time. If customer sentiment is classified as frustrated or the AI is uncertain how to resolve the issue, the ticket is instantly escalated to a human support agent.',
      visualSummary: [
        '1. WHEN: Customer submits inquiry or chat message',
        '2. AI EVALUATION: Sentiment analysis & resolution confidence',
        '3. CONDITION: Customer is frustrated OR AI is unsure',
        '4. ACTION: Escalate immediately to human support agent',
        '5. RESULT: Ticket priority set to URGENT with full transcript summary',
      ],
      validation: { isValid: true, warnings: [], errors: [] },
    };
  }

  // --- Domain Parser: Documents ---
  private parseDocumentIntent(prompt: string, lower: string): StructuredIntent {
    return {
      name: 'Contract Extraction & Missing Field Audit',
      goal: 'Extract key terms from uploaded contracts, check for missing mandatory fields, and alert assigned employee.',
      domain: 'documents',
      domainName: 'Document & Contract Processing',
      trigger: {
        type: 'documents:contract_uploaded',
        description: 'When a contract or legal document is uploaded to the Document Vault',
        timing: 'IMMEDIATELY',
      },
      ruleGroups: [
        {
          logic: 'ALL',
          rules: [
            {
              id: 'r_missing',
              field: 'document.missingFields',
              fieldLabel: 'Document → Completeness → Missing Required Fields',
              operator: 'is_not_empty',
              value: true,
              priority: 'REQUIRED',
            },
          ],
        },
      ],
      actions: [
        {
          id: 'act_ocr_contract',
          type: 'ai:ocr_extract',
          name: 'Extract Contract Key Terms & Dates',
          description: 'Extract parties, expiration date, value, and clauses.',
          config: {},
        },
        {
          id: 'act_notify_employee',
          type: 'communication:send_internal_notification',
          name: 'Notify Assigned Employee of Missing Items',
          description: 'Send task checklist of missing required items to assigned account lead.',
          config: {},
        },
      ],
      timing: { schedule: 'Immediate upon upload', window: 'ALWAYS' },
      channels: ['Internal Notification', 'Document Vault'],
      approvalPolicy: { required: false, condition: 'NEVER' },
      resultDestination: {
        id: 'document_vault',
        name: 'Document Vault Record + Employee Remediation Task',
        summary: 'Indexed contract metadata and task generated for responsible employee.',
      },
      exceptions: { onFailure: 'ASK_HUMAN', onUncertain: 'ASK_FOR_INFO' },
      explanation: 'When a contract is uploaded, AI extracts key fields and checks mandatory terms. If any required information is missing, the assigned employee is notified immediately.',
      visualSummary: [
        '1. WHEN: Contract uploaded to Document Vault',
        '2. AI EXTRACTS: Important terms and signatures',
        '3. CHECK: Are all required compliance fields present?',
        '4. IF MISSING: Send task notification to assigned employee',
        '5. RESULT: Document indexed in Vault and audit record created',
      ],
      validation: { isValid: true, warnings: [], errors: [] },
    };
  }

  // --- Domain Parser: E-Commerce ---
  private parseEcommerceIntent(prompt: string, lower: string): StructuredIntent {
    let stockThreshold = 10;
    const stockMatch = prompt.match(/([0-9]+)\s*(?:units?|items?|stock)?/i);
    if (stockMatch) stockThreshold = parseInt(stockMatch[1], 10);

    return {
      name: 'Low Stock Alert & Restock Requisition',
      goal: `Monitor product inventory and create restock task when quantity drops below ${stockThreshold} units.`,
      domain: 'ecommerce',
      domainName: 'E-Commerce & Inventory Operations',
      trigger: {
        type: 'ecommerce:inventory_updated',
        description: 'When an order is placed or stock quantity changes',
        timing: 'IMMEDIATELY',
      },
      ruleGroups: [
        {
          logic: 'ALL',
          rules: [
            {
              id: 'r_stock',
              field: 'product.stockLevel',
              fieldLabel: 'Inventory → Stock → Available Quantity',
              operator: 'is_less_than',
              value: stockThreshold,
              priority: 'REQUIRED',
            },
          ],
        },
      ],
      actions: [
        {
          id: 'act_alert_mgr',
          type: 'communication:send_internal_notification',
          name: 'Notify Store Operations Manager',
          description: `Send low stock warning for items below ${stockThreshold} units.`,
          config: {},
        },
        {
          id: 'act_restock_task',
          type: 'ecommerce:create_restock_po',
          name: 'Generate Restock Purchase Task',
          description: 'Draft purchase order with primary supplier.',
          config: {},
        },
      ],
      timing: { schedule: 'Continuous inventory monitoring', window: 'ALWAYS' },
      channels: ['Store Dashboard', 'Internal Email Alert'],
      approvalPolicy: { required: false, condition: 'NEVER' },
      resultDestination: {
        id: 'store_dashboard',
        name: 'Inventory Dashboard + Draft Supplier PO',
        summary: 'Low stock status displayed on operations dashboard and supplier PO queued.',
      },
      exceptions: { onFailure: 'ASK_HUMAN', onUncertain: 'ASK_FOR_INFO' },
      explanation: `Whenever inventory drops below ${stockThreshold} units, the store manager is notified and a restock requisition is prepared.`,
      visualSummary: [
        '1. WHEN: Product inventory changes',
        `2. CONDITION: Stock level is less than ${stockThreshold}`,
        '3. ACTION: Notify store manager',
        '4. ACTION: Draft supplier restock purchase order',
        '5. RESULT: Dashboard flagged and restock task created',
      ],
      validation: { isValid: true, warnings: [], errors: [] },
    };
  }

  // --- Domain Parser: Marketing ---
  private parseMarketingIntent(prompt: string, lower: string): StructuredIntent {
    const requireApproval = lower.includes('approval') || lower.includes('review');

    return {
      name: 'Weekly Content Repurposing Engine',
      goal: 'Repurpose latest published blog into platform-tailored social content for LinkedIn, Instagram, and X.',
      domain: 'marketing',
      domainName: 'Marketing & Social Repurposing',
      trigger: {
        type: 'scheduler:cron',
        description: 'Every Monday at 9:00 AM',
        timing: 'SCHEDULED',
        cronExpression: '0 9 * * 1',
      },
      ruleGroups: [],
      actions: [
        {
          id: 'act_repurpose',
          type: 'ai:content_repurpose',
          name: 'Repurpose Article for LinkedIn, X & Instagram',
          description: 'Extract core insights and generate tailored copy, hashtags, and carousel slides.',
          config: { channels: ['linkedin', 'instagram', 'twitter'] },
        },
        ...(requireApproval
          ? [
              {
                id: 'act_social_approval',
                type: 'approval:social_media_manager',
                name: 'Queue for Social Media Manager Approval',
                description: 'Hold publication until marketing lead reviews and approves copies.',
                config: {},
              },
            ]
          : []),
      ],
      timing: { schedule: 'Every Monday at 9:00 AM', window: 'BUSINESS_HOURS' },
      channels: ['LinkedIn', 'Instagram', 'X (Twitter)', 'Marketing Dashboard'],
      approvalPolicy: {
        required: requireApproval,
        condition: requireApproval ? 'ALWAYS' : 'NEVER',
        reviewerRole: 'Marketing Manager',
      },
      resultDestination: {
        id: 'social_calendar',
        name: 'Content Marketing Calendar + Editorial Queue',
        summary: 'Draft social posts populated into calendar and presented for review.',
      },
      exceptions: { onFailure: 'ASK_HUMAN', onUncertain: 'ASK_FOR_INFO' },
      explanation: 'Every Monday morning, the AI ingests the latest blog post, generates tailored social content for LinkedIn, Instagram, and X, and queues drafts for editorial review before publishing.',
      visualSummary: [
        '1. SCHEDULE: Every Monday at 9:00 AM',
        '2. INPUT: Ingest latest company blog post',
        '3. AI GENERATES: Tailored posts for LinkedIn, Instagram, and X',
        '4. EDITORIAL REVIEW: Marketing manager approves drafts',
        '5. RESULT: Scheduled on social media calendar',
      ],
      validation: { isValid: true, warnings: [], errors: [] },
    };
  }

  // --- Domain Parser: HR ---
  private parseHrIntent(prompt: string, lower: string): StructuredIntent {
    return {
      name: 'Automated Employee Onboarding Orchestrator',
      goal: 'Dispatch new hire welcome package, provision IT hardware accounts, and schedule manager check-in meetings.',
      domain: 'hr',
      domainName: 'HR & Employee Workflows',
      trigger: {
        type: 'hr:offer_accepted',
        description: 'When a candidate signs their offer letter and is hired',
        timing: 'IMMEDIATELY',
      },
      ruleGroups: [],
      actions: [
        {
          id: 'act_send_pack',
          type: 'communication:send_email',
          name: 'Send Welcome Packet & Document Links',
          description: 'Email new hire portal credentials and compliance forms.',
          config: {},
        },
        {
          id: 'act_it_provision',
          type: 'hr:create_it_ticket',
          name: 'Create IT Hardware & Account Provisioning Task',
          description: 'Alert IT department to prepare laptop, email, and security keys.',
          config: {},
        },
        {
          id: 'act_cal_checkins',
          type: 'calendar:book_appointment',
          name: 'Schedule Day 1 & Week 1 Manager Check-Ins',
          description: 'Add orientation and check-in meetings to manager calendar.',
          config: {},
        },
      ],
      timing: { schedule: 'Immediate upon signed offer letter', window: 'ALWAYS' },
      channels: ['Email', 'HR Portal', 'IT Helpdesk'],
      approvalPolicy: { required: false, condition: 'NEVER' },
      resultDestination: {
        id: 'hr_portal',
        name: 'HR Employee Dossier + IT Helpdesk Ticket',
        summary: 'Employee onboarding profile initialized and IT provisioning task dispatched.',
      },
      exceptions: { onFailure: 'ASK_HUMAN', onUncertain: 'ASK_FOR_INFO' },
      explanation: 'When an offer is accepted, the onboarding engine dispatches welcome forms, tasks IT to provision accounts, and books initial meetings on the manager calendar.',
      visualSummary: [
        '1. WHEN: New hire accepts job offer',
        '2. ACTION: Send welcome packet and tax forms',
        '3. ACTION: Alert IT to prepare laptop and accounts',
        '4. ACTION: Schedule Day 1 welcome meetings',
        '5. RESULT: Dossier created and tickets assigned',
      ],
      validation: { isValid: true, warnings: [], errors: [] },
    };
  }

  private validateIntent(intent: StructuredIntent) {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!intent.goal || intent.goal.length < 5) {
      errors.push('Goal description is too short');
    }
    if (!intent.actions || intent.actions.length === 0) {
      errors.push('Intent must contain at least one configured action');
    }
    if (intent.approvalPolicy?.required && !intent.approvalPolicy?.reviewerRole) {
      warnings.push('Human approval is required but reviewer role is not explicitly specified');
    }

    intent.validation = {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }
}
