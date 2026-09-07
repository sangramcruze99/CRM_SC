import { NextRequest, NextResponse } from 'next/server';

// Shared in-memory team configuration state with persistent defaults
const teamState: Record<string, {
  id: string;
  name: string;
  codename: string;
  role: string;
  description: string;
  avatarColor: string;
  autonomy: 'RECOMMEND' | 'ASSIST' | 'AUTOPILOT';
  enabled: boolean;
  capabilities: Array<{ id: string; label: string; enabled: boolean; description: string }>;
  todayStats: Array<{ label: string; value: number | string }>;
  willDo: string[];
  willNotDo: string[];
}> = {
  sales: {
    id: 'sales',
    name: 'Sales AI',
    codename: 'Ares SDR Sentinel',
    role: 'Your Digital Sales Assistant',
    description: 'Watches deals, identifies stalled opportunities, scores incoming leads, and prepares personalized sales messages.',
    avatarColor: 'from-amber-500 to-orange-600',
    autonomy: 'ASSIST',
    enabled: true,
    capabilities: [
      { id: 'stalled_deals', label: 'Identify stalled opportunities', enabled: true, description: 'Alerts you when a promising deal has had no communication for over 7 days.' },
      { id: 'lead_follow_up', label: 'Prepare lead follow-up messages', enabled: true, description: 'Drafts timely, contextual follow-ups for warm prospects.' },
      { id: 'deal_synthesis', label: 'Summarize deal negotiations', enabled: true, description: 'Extracts next steps and decision maker sentiment from interaction history.' },
      { id: 'discount_check', label: 'Review discounting safety', enabled: false, description: 'Ensures proposed deal discounts comply with company margin guidelines.' },
    ],
    todayStats: [
      { label: 'Leads reviewed', value: 23 },
      { label: 'Follow-ups prepared', value: 7 },
      { label: 'Deals needing attention', value: 4 },
      { label: 'Meetings suggested', value: 2 },
    ],
    willDo: [
      'Check for inactive opportunities daily',
      'Identify important follow-ups',
      'Prepare personalized draft messages',
      'Create reminder tasks for reps',
    ],
    willNotDo: [
      'Change pricing or terms without your approval',
      'Offer discounts without human authorization',
      'Send emails to VIP contacts without human review',
    ],
  },
  cs: {
    id: 'cs',
    name: 'Customer Success AI',
    codename: 'Athena Retention Sentinel',
    role: 'Your Customer Retention Partner',
    description: 'Monitors client satisfaction, detects early churn signals, and prepares proactive health check-ins.',
    avatarColor: 'from-emerald-500 to-teal-600',
    autonomy: 'ASSIST',
    enabled: true,
    capabilities: [
      { id: 'churn_risk', label: 'Detect customer churn risk', enabled: true, description: 'Monitors product usage drops and flags accounts before they consider leaving.' },
      { id: 'health_scanner', label: 'Daily account health scanner', enabled: true, description: 'Computes multi-factor health scores across support, usage, and payments.' },
      { id: 'ebr_prep', label: 'Prepare executive business reviews', enabled: false, description: 'Aggregates value delivered over the past quarter into a presentation draft.' },
    ],
    todayStats: [
      { label: 'Accounts scanned', value: 48 },
      { label: 'At-risk accounts flagged', value: 2 },
      { label: 'Health reviews staged', value: 5 },
      { label: 'Retention rate protected', value: '98.4%' },
    ],
    willDo: [
      'Monitor account activity patterns',
      'Surface accounts needing proactive support',
      'Draft relationship check-in emails',
    ],
    willNotDo: [
      'Cancel or alter active subscriptions',
      'Escalate without notifying account managers',
    ],
  },
  finance: {
    id: 'finance',
    name: 'Finance AI',
    codename: 'Midas AR Sentinel',
    role: 'Your Accounts Receivable Specialist',
    description: 'Tracks open invoices, sends tone-calibrated payment reminders, and forecasts 30-day cashflow.',
    avatarColor: 'from-blue-500 to-indigo-600',
    autonomy: 'ASSIST',
    enabled: true,
    capabilities: [
      { id: 'overdue_invoices', label: 'Track overdue receivables', enabled: true, description: 'Flags invoices passing net payment terms and organizes collection tiers.' },
      { id: 'collections_copilot', label: 'Tone-calibrated reminder drafter', enabled: true, description: 'Drafts gentle first reminders and firm executive notices based on days overdue.' },
      { id: 'cashflow_forecast', label: '30-day rolling cashflow forecast', enabled: true, description: 'Projects incoming revenue against pending payables and recurring costs.' },
    ],
    todayStats: [
      { label: 'Invoices monitored', value: 34 },
      { label: 'Overdue detected', value: 5 },
      { label: 'Reminders prepared', value: 3 },
      { label: 'Cashflow visibility', value: '30 Days' },
    ],
    willDo: [
      'Monitor payment due dates automatically',
      'Draft reminder messages for your approval',
      'Update invoice payment status upon receipt',
    ],
    willNotDo: [
      'Charge customer cards without authorization',
      'Issue credit notes without management approval',
      'Initiate external bank transfers',
    ],
  },
  support: {
    id: 'support',
    name: 'Support AI',
    codename: 'Frontline Copilot',
    role: 'Your 24/7 Customer Care Assistant',
    description: 'Classifies incoming inquiries, resolves frequent technical questions, and routes urgent issues immediately.',
    avatarColor: 'from-purple-500 to-pink-600',
    autonomy: 'RECOMMEND',
    enabled: true,
    capabilities: [
      { id: 'auto_triage', label: 'Classify & prioritize tickets', enabled: true, description: 'Identifies urgency and tags tickets with relevant departmental categories.' },
      { id: 'reply_drafting', label: 'Draft knowledge-backed answers', enabled: true, description: 'Uses company documentation to prepare accurate, human-friendly replies.' },
      { id: 'urgent_escalation', label: 'Escalate critical incidents', enabled: true, description: 'Pings on-call team members when high-impact disruptions are reported.' },
    ],
    todayStats: [
      { label: 'Tickets classified', value: 42 },
      { label: 'Replies prepared', value: 29 },
      { label: 'Urgent alerts', value: 1 },
      { label: 'Average resolution time', value: '4.2m' },
    ],
    willDo: [
      'Read and categorize new support tickets instantly',
      'Draft responses referencing company knowledge',
      'Flag unhappy customer sentiment',
    ],
    willNotDo: [
      'Close unresolved issues prematurely',
      'Make policy exceptions without human sign-off',
    ],
  },
  operations: {
    id: 'operations',
    name: 'Operations AI',
    codename: 'Workflow Conductor',
    role: 'Your Team Coordination Officer',
    description: 'Manages post-sales onboarding, enforces project milestone SLAs, and automates cross-department handoffs.',
    avatarColor: 'from-cyan-500 to-blue-600',
    autonomy: 'RECOMMEND',
    enabled: true,
    capabilities: [
      { id: 'project_handoff', label: 'Deal-to-project creation', enabled: true, description: 'Automatically initializes project boards and onboarding checklists when deals close.' },
      { id: 'sla_watchdog', label: 'Project milestone watchdog', enabled: true, description: 'Alerts project leads when milestone delivery dates are at risk.' },
      { id: 'onboarding_tasks', label: 'Client onboarding task generator', enabled: true, description: 'Assigns relevant team tasks according to chosen customer tier.' },
    ],
    todayStats: [
      { label: 'Projects tracked', value: 16 },
      { label: 'Handoffs coordinated', value: 3 },
      { label: 'SLA warnings avoided', value: 2 },
    ],
    willDo: [
      'Trigger standard onboarding checklists upon closed deals',
      'Notify assignees of approaching deadlines',
    ],
    willNotDo: [
      'Reassign team responsibilities without manager consent',
      'Archive active customer projects',
    ],
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing AI',
    codename: 'Content & Growth Copilot',
    role: 'Your Campaign & Audience Specialist',
    description: 'Transforms company updates into multi-channel campaigns, drafts newsletters, and segments customer audiences.',
    avatarColor: 'from-rose-500 to-red-600',
    autonomy: 'RECOMMEND',
    enabled: true,
    capabilities: [
      { id: 'content_repurpose', label: 'Multi-channel content repurposing', enabled: true, description: 'Turns release notes or blogs into LinkedIn, Twitter, and email digests.' },
      { id: 'social_drafts', label: 'Draft social announcements', enabled: true, description: 'Prepares ready-to-schedule social posts with tone matching your brand.' },
      { id: 'audience_sync', label: 'Dynamic audience segmentation', enabled: false, description: 'Groups contacts based on recent activity, product interests, and deal status.' },
    ],
    todayStats: [
      { label: 'Campaign drafts prepared', value: 6 },
      { label: 'Audience segments updated', value: 3 },
      { label: 'Engagement lift', value: '+14%' },
    ],
    willDo: [
      'Draft marketing copy and email newsletters',
      'Suggest publication schedules and audience segments',
    ],
    willNotDo: [
      'Send mass emails without human review and approval',
      'Publish social posts without authorization',
    ],
  },
};

export async function GET() {
  return NextResponse.json({
    team: Object.values(teamState),
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { departmentId, autonomy, enabled, capabilities } = body;

    if (!departmentId || !teamState[departmentId]) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const dept = teamState[departmentId];

    if (autonomy && ['RECOMMEND', 'ASSIST', 'AUTOPILOT'].includes(autonomy)) {
      dept.autonomy = autonomy;
    }

    if (typeof enabled === 'boolean') {
      dept.enabled = enabled;
    }

    if (Array.isArray(capabilities)) {
      dept.capabilities = dept.capabilities.map((c) => {
        const found = capabilities.find((item: any) => item.id === c.id);
        return found !== undefined ? { ...c, enabled: Boolean(found.enabled) } : c;
      });
    }

    return NextResponse.json({
      success: true,
      department: dept,
      message: `Updated ${dept.name} settings successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
