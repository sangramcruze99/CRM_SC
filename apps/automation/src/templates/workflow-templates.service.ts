import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WorkflowTemplateData {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  requiredIntegrations: string[];
  requiredCredentials: string[];
  nodes: any[];
  edges: any[];
  variables: Record<string, any>;
}

@Injectable()
export class WorkflowTemplatesService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowTemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultTemplates();
  }

  private async seedDefaultTemplates() {
    const templates: WorkflowTemplateData[] = [
      // ==========================================
      // FLAGSHIP RECRUITMENT TEMPLATE (Section 22)
      // ==========================================
      {
        id: 'tmpl_recruitment_screening',
        name: 'Autonomous Resume Screening & Interview Scheduler',
        description: 'End-to-end recruitment pipeline: parses CV, extracts profile & JD criteria, screens with anti-bias AI, branches by threshold, shortlists, dispatches self-scheduler invite, books interview, and handles follow-up/rejection.',
        category: 'Recruitment',
        version: '2.0.0',
        author: 'Business OS Autonomous Recruitment Team',
        requiredIntegrations: ['hr', 'documents', 'calendar', 'resend'],
        requiredCredentials: [],
        variables: { passingScore: 75, targetRole: 'Senior Distributed Systems Engineer', responseWaitDays: 2 },
        nodes: [
          { id: '1', type: 'trigger:candidate_applied', position: { x: 50, y: 200 }, data: { title: 'Candidate Applied', badge: 'Trigger' } },
          { id: '2', type: 'doc:resume_parse', position: { x: 380, y: 200 }, data: { title: 'Resume Parse & Extract', badge: 'Parser' } },
          { id: '3', type: 'ai:extract_candidate_profile', position: { x: 710, y: 200 }, data: { title: 'Extract Candidate Profile', badge: 'Profile AI' } },
          { id: '4', type: 'ai:extract_job_requirements', position: { x: 1040, y: 200 }, data: { title: 'Extract JD Requirements', badge: 'JD Parser' } },
          { id: '5', type: 'ai:skill_matching', position: { x: 1370, y: 200 }, data: { title: 'Match Candidate Skills', badge: 'Skill Matcher' } },
          { id: '6', type: 'ai:candidate_screening', position: { x: 1700, y: 200 }, data: { title: 'AI Candidate Fit Screening', badge: 'Screening AI' } },
          { id: '7', type: 'ai:candidate_scoring', position: { x: 2030, y: 200 }, data: { title: 'Compute Objective Score', badge: 'Score Matrix' } },
          {
            id: '8',
            type: 'logic:if_else',
            position: { x: 2360, y: 200 },
            data: { title: 'Score >= 75 Threshold?', field: 'candidateScore', operator: 'GREATER_THAN_OR_EQUAL', value: 75, badge: 'Decision Gate' },
          },
          // True Branch (Shortlist & Scheduling)
          { id: '9', type: 'candidate:shortlist', position: { x: 2700, y: 80 }, data: { title: 'Shortlist Candidate', badge: 'Candidate' } },
          { id: '10', type: 'comm:interview_invitation', position: { x: 3030, y: 80 }, data: { title: 'Send Interview Invitation', badge: 'Email' } },
          { id: '11', type: 'logic:wait_for_event', position: { x: 3360, y: 80 }, data: { title: 'Wait for Candidate Response', badge: 'Wait State' } },
          {
            id: '12',
            type: 'logic:if_else',
            position: { x: 3690, y: 80 },
            data: { title: 'Response Received?', field: 'candidateResponded', operator: 'EQUALS', value: true, badge: 'Gate' },
          },
          { id: '13', type: 'calendar:common_availability', position: { x: 4020, y: 20 }, data: { title: 'Find Common Availability', badge: 'Calendar' } },
          { id: '14', type: 'calendar:create_interview', position: { x: 4350, y: 20 }, data: { title: 'Book Interview Appointment', badge: 'Calendar' } },
          { id: '15', type: 'comm:email', position: { x: 4680, y: 20 }, data: { title: 'Send Confirmation Email', badge: 'Email' } },
          { id: '16', type: 'calendar:send_reminder', position: { x: 5010, y: 20 }, data: { title: 'Schedule 24h Reminder', badge: 'Reminder' } },
          // No response follow-up branch
          { id: '17', type: 'comm:follow_up', position: { x: 4020, y: 160 }, data: { title: 'Send Follow-up Nudge', badge: 'Follow-up' } },
          { id: '18', type: 'logic:delay', position: { x: 4350, y: 160 }, data: { title: 'Wait 2 Days', duration: 2, unit: 'DAYS', badge: 'Delay' } },
          // False Branch from Score (Human Review & Rejection)
          { id: '19', type: 'candidate:reject', position: { x: 2700, y: 350 }, data: { title: 'Reject / Flag Borderline', badge: 'Disposition' } },
          { id: '20', type: 'comm:rejection', position: { x: 3030, y: 350 }, data: { title: 'Send Courteous Rejection', badge: 'Email' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
          { id: 'e4-5', source: '4', target: '5' },
          { id: 'e5-6', source: '5', target: '6' },
          { id: 'e6-7', source: '6', target: '7' },
          { id: 'e7-8', source: '7', target: '8' },
          { id: 'e8-9', source: '8', target: '9', sourceHandle: 'true' },
          { id: 'e9-10', source: '9', target: '10' },
          { id: 'e10-11', source: '10', target: '11' },
          { id: 'e11-12', source: '11', target: '12' },
          { id: 'e12-13', source: '12', target: '13', sourceHandle: 'true' },
          { id: 'e13-14', source: '13', target: '14' },
          { id: 'e14-15', source: '14', target: '15' },
          { id: 'e15-16', source: '15', target: '16' },
          { id: 'e12-17', source: '12', target: '17', sourceHandle: 'false' },
          { id: 'e17-18', source: '17', target: '18' },
          { id: 'e8-19', source: '8', target: '19', sourceHandle: 'false' },
          { id: 'e19-20', source: '19', target: '20' },
        ],
      },

      // ==========================================
      // SECTION 23 RECRUITMENT TEMPLATES
      // ==========================================
      {
        id: 'tmpl_recruitment_high_volume',
        name: 'High-Volume Candidate Screening & Triage',
        description: 'Automated rapid triage for high-volume openings. Deduplicates applicants, analyzes qualifications, scores skills, and routes directly to recruiter review.',
        category: 'Recruitment',
        version: '1.2.0',
        author: 'Business OS People Team',
        requiredIntegrations: ['hr', 'documents'],
        requiredCredentials: [],
        variables: { fastTrackScore: 85 },
        nodes: [
          { id: '1', type: 'trigger:candidate_applied', position: { x: 80, y: 150 }, data: { title: 'Batch Application Ingested' } },
          { id: '2', type: 'ai:duplicate_detection', position: { x: 420, y: 150 }, data: { title: 'Check Historical Records' } },
          { id: '3', type: 'doc:resume_parse', position: { x: 760, y: 150 }, data: { title: 'Parse Resume CV' } },
          { id: '4', type: 'ai:candidate_screening', position: { x: 1100, y: 150 }, data: { title: 'Score Qualifications' } },
          { id: '5', type: 'output:create_shortlist', position: { x: 1440, y: 150 }, data: { title: 'Add to Hiring Batch' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
          { id: 'e4-5', source: '4', target: '5' },
        ],
      },
      {
        id: 'tmpl_recruitment_interview_scheduler',
        name: 'Autonomous Interview Scheduling & Calendar Sync',
        description: 'Connects recruiter availability, finds open mutual slots, books Google Meet, and writes calendar sync to CRM timeline.',
        category: 'Recruitment',
        version: '1.1.0',
        author: 'Business OS Scheduling Team',
        requiredIntegrations: ['calendar', 'hr', 'resend'],
        requiredCredentials: [],
        variables: { slotDurationMinutes: 45 },
        nodes: [
          { id: '1', type: 'trigger:candidate_updated', position: { x: 80, y: 150 }, data: { title: 'Candidate Shortlisted' } },
          { id: '2', type: 'calendar:check_availability', position: { x: 420, y: 150 }, data: { title: 'Query Open Interview Slots' } },
          { id: '3', type: 'calendar:create_interview', position: { x: 760, y: 150 }, data: { title: 'Reserve Calendar Slot' } },
          { id: '4', type: 'comm:interview_invitation', position: { x: 1100, y: 150 }, data: { title: 'Dispatch Calendar Invite' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
        ],
      },
      {
        id: 'tmpl_recruitment_interview_reminder',
        name: 'Interview Reminder & Attendance Confirmation',
        description: 'Dispatches multi-channel 24-hour and 1-hour pre-interview alerts with video links and rescheduling options.',
        category: 'Recruitment',
        version: '1.0.0',
        author: 'Business OS People Team',
        requiredIntegrations: ['calendar', 'whatsapp', 'resend'],
        requiredCredentials: [],
        variables: { reminderLeadHours: 24 },
        nodes: [
          { id: '1', type: 'trigger:schedule', position: { x: 80, y: 150 }, data: { title: 'Daily 8am Sweep' } },
          { id: '2', type: 'comm:reminder', position: { x: 420, y: 150 }, data: { title: 'Send 24h Email Alert' } },
          { id: '3', type: 'comm:whatsapp', position: { x: 760, y: 150 }, data: { title: 'WhatsApp Quick Confirmation' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
        ],
      },
      {
        id: 'tmpl_recruitment_noshow_recovery',
        name: 'Interview No-Show Instant Recovery',
        description: 'Detects unattended video meeting, alerts recruiter, sends courteous recovery message with immediate rebooking link.',
        category: 'Recruitment',
        version: '1.0.0',
        author: 'Business OS Scheduling Team',
        requiredIntegrations: ['calendar', 'comm'],
        requiredCredentials: [],
        variables: { graceMinutes: 10 },
        nodes: [
          { id: '1', type: 'trigger:interview_missed', position: { x: 80, y: 150 }, data: { title: 'No-Show Detected' } },
          { id: '2', type: 'calendar:detect_noshow', position: { x: 420, y: 150 }, data: { title: 'Record Attendance Incident' } },
          { id: '3', type: 'comm:email', position: { x: 760, y: 150 }, data: { title: 'Dispatched Reschedule Link' } },
          { id: '4', type: 'candidate:create_task', position: { x: 1100, y: 150 }, data: { title: 'Alert Recruiter Cockpit' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
        ],
      },
      {
        id: 'tmpl_recruitment_candidate_followup',
        name: 'Candidate Re-Engagement & Follow-Up Loop',
        description: 'Monitors unresponded invitations and dispatches gentle follow-ups over email and WhatsApp.',
        category: 'Recruitment',
        version: '1.1.0',
        author: 'Business OS People Team',
        requiredIntegrations: ['comm', 'hr'],
        requiredCredentials: [],
        variables: { waitDays: 3 },
        nodes: [
          { id: '1', type: 'trigger:schedule', position: { x: 80, y: 150 }, data: { title: '3-Day Follow-Up Sweep' } },
          { id: '2', type: 'comm:follow_up', position: { x: 420, y: 150 }, data: { title: 'Send Personalized Nudge' } },
          { id: '3', type: 'logic:wait_for_event', position: { x: 760, y: 150 }, data: { title: 'Listen for Reply' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
        ],
      },
      {
        id: 'tmpl_recruitment_rejection',
        name: 'Compliant & Courteous Candidate Rejection',
        description: 'Updates candidate disposition with explainable audit log, sends respectful personalized feedback email, and archives into future talent pool.',
        category: 'Recruitment',
        version: '1.0.0',
        author: 'Business OS People Team',
        requiredIntegrations: ['hr', 'resend'],
        requiredCredentials: [],
        variables: {},
        nodes: [
          { id: '1', type: 'trigger:candidate_updated', position: { x: 80, y: 150 }, data: { title: 'Candidate Disqualified' } },
          { id: '2', type: 'candidate:reject', position: { x: 420, y: 150 }, data: { title: 'Mark REJECTED with Reason' } },
          { id: '3', type: 'comm:rejection', position: { x: 760, y: 150 }, data: { title: 'Send Courteous Feedback' } },
          { id: '4', type: 'candidate:archive', position: { x: 1100, y: 150 }, data: { title: 'Archive to Talent Network' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
        ],
      },
      {
        id: 'tmpl_recruitment_approval_workflow',
        name: 'Executive & Recruiter Sign-Off Gate',
        description: 'Flags senior hires and compensation packages for VP/Hiring Manager approval before formal offer generation.',
        category: 'Recruitment',
        version: '1.0.0',
        author: 'Business OS Governance',
        requiredIntegrations: ['hr', 'approvals'],
        requiredCredentials: [],
        variables: {},
        nodes: [
          { id: '1', type: 'trigger:interview_completed', position: { x: 80, y: 150 }, data: { title: 'Final Interview Finished' } },
          { id: '2', type: 'human:review', position: { x: 420, y: 150 }, data: { title: 'Hiring Manager Sign-Off' } },
          { id: '3', type: 'candidate:move_stage', position: { x: 760, y: 80 }, data: { title: 'Advance to Offer Prep' } },
          { id: '4', type: 'candidate:reject', position: { x: 760, y: 220 }, data: { title: 'Archive Application' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3', sourceHandle: 'approved' },
          { id: 'e2-4', source: '2', target: '4', sourceHandle: 'rejected' },
        ],
      },

      // ==========================================
      // OTHER BUSINESS DOMAIN TEMPLATES
      // ==========================================
      {
        id: 'tmpl_ai_lead_qual',
        name: 'AI Lead Qualification & Fast-Track Routing',
        description: 'Enriches inbound leads with Apollo-style data, calculates ICP score, assigns owner, and alerts sales Slack.',
        category: 'Sales',
        version: '1.2.0',
        author: 'Business OS Enterprise Team',
        requiredIntegrations: ['crm', 'slack'],
        requiredCredentials: ['SLACK_BOT_TOKEN'],
        variables: { minScoreForFastTrack: 75, targetSlackChannel: '#hot-leads' },
        nodes: [
          { id: '1', type: 'trigger:new_lead', position: { x: 100, y: 150 }, data: { title: 'New Lead Ingested' } },
          { id: '2', type: 'ai:score', position: { x: 350, y: 150 }, data: { title: 'AI ICP Score Evaluation' } },
          { id: '3', type: 'logic:if_else', position: { x: 600, y: 150 }, data: { title: 'Score >= 75?' } },
          { id: '4', type: 'crm:create_deal', position: { x: 850, y: 50 }, data: { title: 'Create Fast-Track Deal' } },
          { id: '5', type: 'comm:slack', position: { x: 1100, y: 50 }, data: { title: 'Notify Reps in Slack' } },
          { id: '6', type: 'crm:add_activity', position: { x: 850, y: 250 }, data: { title: 'Queue for Low-Touch Nurture' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true' },
          { id: 'e4-5', source: '4', target: '5' },
          { id: 'e3-6', source: '3', target: '6', sourceHandle: 'false' },
        ],
      },
      {
        id: 'tmpl_whatsapp_sales',
        name: 'WhatsApp Autonomous Sales Concierge',
        description: 'Engages inbound WhatsApp leads, qualifies budget and intent via natural language, and books appointments.',
        category: 'WhatsApp',
        version: '2.0.0',
        author: 'Business OS Enterprise Team',
        requiredIntegrations: ['whatsapp', 'crm', 'calendar'],
        requiredCredentials: ['WHATSAPP_ACCESS_TOKEN'],
        variables: { defaultGreeting: 'Hi! How can we assist your business today?' },
        nodes: [
          { id: '1', type: 'trigger:whatsapp_received', position: { x: 100, y: 150 }, data: { title: 'WhatsApp Message Inbound' } },
          { id: '2', type: 'ai:agent', position: { x: 350, y: 150 }, data: { title: 'AI Conversational Agent' } },
          { id: '3', type: 'logic:if_else', position: { x: 600, y: 150 }, data: { title: 'High Intent Detected?' } },
          { id: '4', type: 'comm:calendar', position: { x: 850, y: 50 }, data: { title: 'Book Discovery Call' } },
          { id: '5', type: 'comm:whatsapp', position: { x: 1100, y: 50 }, data: { title: 'Send Calendar Confirmation' } },
          { id: '6', type: 'comm:whatsapp', position: { x: 850, y: 250 }, data: { title: 'Send FAQ Guide' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true' },
          { id: 'e4-5', source: '4', target: '5' },
          { id: 'e3-6', source: '3', target: '6', sourceHandle: 'false' },
        ],
      },
      {
        id: 'tmpl_invoice_processing',
        name: 'Autonomous OCR Invoice & Dual Khata Reconciler',
        description: 'Parses uploaded vendor bills with vision AI, extracts line items, applies tax rules, and creates Dual Khata ledger entry.',
        category: 'Finance',
        version: '1.5.0',
        author: 'Business OS Finance Ops',
        requiredIntegrations: ['documents', 'finance'],
        requiredCredentials: [],
        variables: { autoApproveUnder: 1000 },
        nodes: [
          { id: '1', type: 'trigger:document_uploaded', position: { x: 100, y: 150 }, data: { title: 'Invoice Deposited' } },
          { id: '2', type: 'finance:invoice_ocr', position: { x: 350, y: 150 }, data: { title: 'Neural Vision Extraction' } },
          { id: '3', type: 'finance:high_risk_approval', position: { x: 600, y: 150 }, data: { title: 'CFO Approval (if > $1,000)' } },
          { id: '4', type: 'finance:reconcile', position: { x: 850, y: 150 }, data: { title: 'Post to Dual Khata Ledger' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4', sourceHandle: 'approved' },
        ],
      },
      // ==========================================
      // SECTION 69 CANONICAL DOMAIN TEMPLATES
      // ==========================================
      {
        id: 'tmpl_support_triage_sla',
        name: 'AI Support Ticket Triage & SLA Escalation',
        description: 'Analyzes incoming support inquiries with sentiment and intent detection, attempts RAG resolution, and automatically escalates critical breaches to engineers.',
        category: 'Support',
        version: '2.0.0',
        author: 'Business OS Support Ops',
        requiredIntegrations: ['support', 'ai', 'comm'],
        requiredCredentials: [],
        variables: { slaThresholdHours: 2 },
        nodes: [
          { id: '1', type: 'trigger:ticket_created', position: { x: 100, y: 150 }, data: { title: 'Ticket Ingested' } },
          { id: '2', type: 'ai:sentiment', position: { x: 350, y: 150 }, data: { title: 'Analyze Sentiment & Intent' } },
          { id: '3', type: 'support:sla_check', position: { x: 600, y: 150 }, data: { title: 'Evaluate SLA Tier' } },
          { id: '4', type: 'logic:if_else', position: { x: 850, y: 150 }, data: { title: 'SLA Breached or Urgent?' } },
          { id: '5', type: 'support:escalate', position: { x: 1100, y: 50 }, data: { title: 'Escalate to Tier 2 Human' } },
          { id: '6', type: 'comm:email', position: { x: 1100, y: 250 }, data: { title: 'Dispatch AI Grounded Reply' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
          { id: 'e4-5', source: '4', target: '5', sourceHandle: 'true' },
          { id: 'e4-6', source: '4', target: '6', sourceHandle: 'false' },
        ],
      },
      {
        id: 'tmpl_hr_employee_onboarding',
        name: 'Autonomous Employee Onboarding & Offer Letter',
        description: 'Generates compliant offer letter, collects e-signature, provisions employee record in HR directory, and dispatches Day-1 welcome kits.',
        category: 'HR',
        version: '1.4.0',
        author: 'Business OS People Ops',
        requiredIntegrations: ['hr', 'documents', 'comm'],
        requiredCredentials: [],
        variables: { department: 'Engineering' },
        nodes: [
          { id: '1', type: 'trigger:employee_created', position: { x: 100, y: 150 }, data: { title: 'Offer Accepted' } },
          { id: '2', type: 'hr:send_offer', position: { x: 350, y: 150 }, data: { title: 'Send Signable Offer' } },
          { id: '3', type: 'hr:create_employee', position: { x: 600, y: 150 }, data: { title: 'Create Employee Profile' } },
          { id: '4', type: 'hr:onboarding_workflow', position: { x: 850, y: 150 }, data: { title: 'Assign Onboarding Checklist' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
        ],
      },
      {
        id: 'tmpl_voice_ai_receptionist',
        name: 'AI Receptionist & Appointment Booking Voice Agent',
        description: 'Processes inbound voice calls, queries company knowledge via conversational agent, checks live calendar availability, and books meetings with WhatsApp receipts.',
        category: 'Voice',
        version: '2.1.0',
        author: 'Business OS Voice AI Labs',
        requiredIntegrations: ['voice', 'calendar', 'whatsapp', 'ai'],
        requiredCredentials: [],
        variables: { maxDurationMinutes: 10 },
        nodes: [
          { id: '1', type: 'voice:call_received', position: { x: 100, y: 150 }, data: { title: 'Inbound Phone Call' } },
          { id: '2', type: 'voice:ai_receptionist', position: { x: 350, y: 150 }, data: { title: 'Athena Conversational Receptionist' } },
          { id: '3', type: 'calendar:check_availability', position: { x: 600, y: 150 }, data: { title: 'Check Availability' } },
          { id: '4', type: 'calendar:create_interview', position: { x: 850, y: 150 }, data: { title: 'Confirm & Book Appointment' } },
          { id: '5', type: 'comm:whatsapp', position: { x: 1100, y: 150 }, data: { title: 'Send SMS / WhatsApp Confirmation' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
          { id: 'e4-5', source: '4', target: '5' },
        ],
      },
      {
        id: 'tmpl_ecom_fulfillment_alert',
        name: 'E-Commerce Order Fulfillment & Inventory Alert',
        description: 'Triggers on new storefront orders, verifies real-time stock levels, notifies warehouse fulfillment, and updates customer CRM records.',
        category: 'E-Commerce',
        version: '1.2.0',
        author: 'Business OS Commerce Labs',
        requiredIntegrations: ['ecom', 'crm', 'comm'],
        requiredCredentials: [],
        variables: { lowStockThreshold: 10 },
        nodes: [
          { id: '1', type: 'ecom:order_created', position: { x: 100, y: 150 }, data: { title: 'Order Placed' } },
          { id: '2', type: 'ecom:inventory_check', position: { x: 350, y: 150 }, data: { title: 'Check Stock Availability' } },
          { id: '3', type: 'crm:update_contact', position: { x: 600, y: 150 }, data: { title: 'Update Customer Lifetime Value' } },
          { id: '4', type: 'comm:email', position: { x: 850, y: 150 }, data: { title: 'Send Order Receipt & Tracking' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
        ],
      },
      {
        id: 'tmpl_marketing_content_repurposing',
        name: 'AI Multi-Channel Content Repurposer',
        description: 'Transforms long-form product releases or customer case studies into tailored LinkedIn posts, Twitter threads, newsletter copy, and summary slides.',
        category: 'Marketing',
        version: '1.0.0',
        author: 'Business OS Growth Team',
        requiredIntegrations: ['marketing', 'ai'],
        requiredCredentials: [],
        variables: { channels: ['linkedin', 'newsletter'] },
        nodes: [
          { id: '1', type: 'trigger:manual', position: { x: 100, y: 150 }, data: { title: 'Source Content Ingested' } },
          { id: '2', type: 'marketing:content_repurpose', position: { x: 350, y: 150 }, data: { title: 'AI Format Transformation' } },
          { id: '3', type: 'output:create_artifact', position: { x: 600, y: 150 }, data: { title: 'Save Generated Asset Pack' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
        ],
      },
      {
        id: 'tmpl_browser_data_extractor',
        name: 'Sandboxed Browser Web Research & Extraction',
        description: 'Spawns secure containerized browser subagent to gather public pricing or competitive data and writes verified artifacts into workspace.',
        category: 'Browser',
        version: '1.0.0',
        author: 'Business OS Automation Labs',
        requiredIntegrations: ['browser', 'ai'],
        requiredCredentials: [],
        variables: {},
        nodes: [
          { id: '1', type: 'trigger:manual', position: { x: 100, y: 150 }, data: { title: 'Initiate Research Request' } },
          { id: '2', type: 'browser:sandboxed_task', position: { x: 350, y: 150 }, data: { title: 'Containerized Web Extractor' } },
          { id: '3', type: 'output:create_artifact', position: { x: 600, y: 150 }, data: { title: 'Persist Extracted Intel Report' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
        ],
      },
    ];

    for (const t of templates) {
      await this.prisma.workflowTemplate.upsert({
        where: { id: t.id },
        update: {
          name: t.name,
          description: t.description,
          category: t.category,
          version: t.version,
          author: t.author,
          requiredIntegrations: JSON.stringify(t.requiredIntegrations),
          requiredCredentials: JSON.stringify(t.requiredCredentials),
          nodes: JSON.stringify(t.nodes),
          edges: JSON.stringify(t.edges),
          variables: JSON.stringify(t.variables),
        },
        create: {
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
          version: t.version,
          author: t.author,
          requiredIntegrations: JSON.stringify(t.requiredIntegrations),
          requiredCredentials: JSON.stringify(t.requiredCredentials),
          nodes: JSON.stringify(t.nodes),
          edges: JSON.stringify(t.edges),
          variables: JSON.stringify(t.variables),
        },
      });
    }

    this.logger.log(`Initialized ${templates.length} pre-built enterprise workflow templates.`);
  }

  async getTemplates(category?: string) {
    const where: any = { isPublished: true };
    if (category && category !== 'ALL') {
      where.category = category;
    }

    const templates = await this.prisma.workflowTemplate.findMany({
      where,
      orderBy: { usageCount: 'desc' },
    });

    return templates.map((t) => ({
      ...t,
      requiredIntegrations: t.requiredIntegrations ? JSON.parse(t.requiredIntegrations) : [],
      requiredCredentials: t.requiredCredentials ? JSON.parse(t.requiredCredentials) : [],
      nodes: t.nodes ? JSON.parse(t.nodes) : [],
      edges: t.edges ? JSON.parse(t.edges) : [],
      variables: t.variables ? JSON.parse(t.variables) : {},
    }));
  }

  async getTemplateById(id: string) {
    const t = await this.prisma.workflowTemplate.findUnique({ where: { id } });
    if (!t) throw new Error('Template not found');

    return {
      ...t,
      requiredIntegrations: t.requiredIntegrations ? JSON.parse(t.requiredIntegrations) : [],
      requiredCredentials: t.requiredCredentials ? JSON.parse(t.requiredCredentials) : [],
      nodes: t.nodes ? JSON.parse(t.nodes) : [],
      edges: t.edges ? JSON.parse(t.edges) : [],
      variables: t.variables ? JSON.parse(t.variables) : {},
    };
  }

  async cloneTemplateToWorkflow(tenantId: string, templateId: string, customName?: string) {
    const template = await this.getTemplateById(templateId);

    const workflow = await this.prisma.workflow.create({
      data: {
        tenantId,
        name: customName || template.name,
        description: template.description,
        isActive: true,
        triggerType: template.nodes[0]?.type || 'MANUAL',
        triggerData: JSON.stringify({
          sourceTemplateId: template.id,
          nodes: template.nodes,
          edges: template.edges,
          variables: template.variables,
        }),
      },
    });

    await this.prisma.workflowTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    });

    this.logger.log(`Cloned template ${template.name} into Workflow ${workflow.id} for Tenant ${tenantId}`);
    return workflow;
  }
}
