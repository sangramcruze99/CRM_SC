export interface HealthMetricWeight {
  metric: string;
  weightPercent: number;
  healthyThreshold: string;
  dangerThreshold: string;
}

export interface ChurnRootCauseBattlecard {
  category: 'PRODUCT_ADOPTION' | 'TECHNICAL_DEBT' | 'CHAMPION_TURNOVER' | 'COMMERCIAL_BUDGET' | 'ONBOARDING_STALL';
  primaryIssue: string;
  symptoms: string[];
  recommendedIntervention: string;
  playbookSteps: string[];
  expectedImpact: string;
}

export interface CSPolicyRule {
  ruleId: string;
  name: string;
  description: string;
  enforcement: 'AUTO_TRIGGER' | 'REQUIRE_APPROVAL' | 'LOG_ALERT';
  thresholdScore?: number;
}

export const CS_HEALTH_METRICS: HealthMetricWeight[] = [
  {
    metric: 'Support Ticket Velocity & Unresolved Severity',
    weightPercent: 25,
    healthyThreshold: '0 High/Urgent tickets open, SLA response < 1h',
    dangerThreshold: '>2 open High tickets, unresolved >48 hours',
  },
  {
    metric: 'Onboarding & Project Milestone Delivery',
    weightPercent: 25,
    healthyThreshold: 'All project tasks on track, sprint velocity > 85%',
    dangerThreshold: 'Project milestone delayed > 7 days, task blocked',
  },
  {
    metric: 'Financial Timeliness & AR Aging',
    weightPercent: 20,
    healthyThreshold: 'Invoices paid on or before due date, 0 overdue',
    dangerThreshold: 'Invoice overdue > 14 days, payment failure recorded',
  },
  {
    metric: 'Platform Engagement & Touchpoint Recency',
    weightPercent: 30,
    healthyThreshold: 'Activity logged within 7 days, regular executive check-ins',
    dangerThreshold: 'Zero activity or logins for > 21 days',
  },
];

export const CS_CHURN_BATTLECARDS: ChurnRootCauseBattlecard[] = [
  {
    category: 'ONBOARDING_STALL',
    primaryIssue: 'Client onboarding project stagnant with incomplete integrations',
    symptoms: [
      'Project status TODO/REVIEW for > 14 days',
      'Initial admin user invited but team members not onboarded',
      'Low usage in week 2 and 3 post-contract'
    ],
    recommendedIntervention: 'Deploy 48-Hour Onboarding Acceleration Sprint with Dedicated Solutions Architect',
    playbookSteps: [
      'Trigger Athena Onboarding Sprint email offering hands-on technical pair-programming',
      'Generate personalized video walkthrough of completed integrations',
      'Create high-priority project task assigned to senior Customer Success Manager'
    ],
    expectedImpact: 'Recovers 74% of at-risk onboarding accounts within 10 business days',
  },
  {
    category: 'PRODUCT_ADOPTION',
    primaryIssue: 'Under-utilization of core features and low daily active users',
    symptoms: [
      'Only 1 user active in workspace',
      'Zero automated workflows created in first 30 days',
      'Disjointed external tools still actively utilized'
    ],
    recommendedIntervention: 'Conduct 1-on-1 Role-Specific Value Realization Workshop',
    playbookSteps: [
      'Identify internal power user and schedule 20-minute workflow audit',
      'Deploy 3 pre-built industry workspace templates matching their vertical',
      'Offer tailored automations tailored to their top 2 manual bottlenecks'
    ],
    expectedImpact: 'Increases weekly active user engagement by 2.8x in 14 days',
  },
  {
    category: 'TECHNICAL_DEBT',
    primaryIssue: 'Repeated support tickets or unresolved critical integration bug',
    symptoms: [
      '>3 support tickets logged in a 14-day window',
      'Negative sentiment in support ticket messages',
      'SLA breach or prolonged escalation'
    ],
    recommendedIntervention: 'Executive Engineering Interlock + Priority Patch SLA + 1-Month Service Credit',
    playbookSteps: [
      'Escalate ticket to Head of Engineering for 24h turnaround commit',
      'Schedule joint call between CSM, Lead Architect, and client technical sponsor',
      'Log commercial goodwill credit in billing ledger (governed by HITL Approval Center)'
    ],
    expectedImpact: 'De-escalates customer churn risk from CRITICAL to STABLE in 92% of cases',
  },
  {
    category: 'CHAMPION_TURNOVER',
    primaryIssue: 'Original buyer or project champion left the client organization',
    symptoms: [
      'Bounced email from primary contact',
      'Sudden drop in communication and meeting cancellations',
      'New executive sponsor unaware of Business OS ROI'
    ],
    recommendedIntervention: 'Executive Sponsor Multi-Threading & Re-Discovery Briefing',
    playbookSteps: [
      'Map secondary stakeholders from historical activity logs and contacts list',
      'Send Executive Value Realization Report highlighting business ROI achieved to date',
      'Request 15-minute executive briefing with incoming leadership'
    ],
    expectedImpact: 'Re-establishes organizational alignment and preserves contract renewal in 80% of accounts',
  },
  {
    category: 'COMMERCIAL_BUDGET',
    primaryIssue: 'Budget consolidation or request for contract downsizing',
    symptoms: [
      'Invoice payment delayed or inquiry regarding plan downgrade',
      'Client evaluating SaaS vendor consolidation',
      'Procurement inquiry regarding license minimums'
    ],
    recommendedIntervention: 'Multi-Year Restructuring Proposal with Platform Consolidation ROI',
    playbookSteps: [
      'Provide side-by-side cost displacement analysis showing savings over legacy tools',
      'Offer flexible quarterly milestone billing or 15% loyalty extension',
      'Submit approval request to Executive Committee via Stage 4 Approval Center'
    ],
    expectedImpact: 'Protects annual recurring revenue (ARR) with 0% net revenue churn',
  },
];

export const CS_POLICY_RULES: CSPolicyRule[] = [
  {
    ruleId: 'POL_HEALTH_CRITICAL_ALERT',
    name: 'Critical Health Score Churn Intervention Trigger',
    description: 'When account health score collapses below 50, automatically create P1 CSM task and notify Account Director.',
    enforcement: 'AUTO_TRIGGER',
    thresholdScore: 50,
  },
  {
    ruleId: 'POL_SLA_BREACH_ESCALATION',
    name: 'Ticket SLA Breach Escalation',
    description: 'Any high or urgent ticket open for >24 hours with no staff reply triggers immediate CSM alert.',
    enforcement: 'AUTO_TRIGGER',
    thresholdScore: 24,
  },
  {
    ruleId: 'POL_RETENTION_CONCESSION_APPROVAL',
    name: 'Retention Concession & Service Credit Gate',
    description: 'Any retention credit, invoice waiver, or discount >15% requires human executive approval in the HITL Center.',
    enforcement: 'REQUIRE_APPROVAL',
    thresholdScore: 15,
  },
  {
    ruleId: 'POL_CS_OUTREACH_COOLDOWN',
    name: 'Customer Retention Outreach Cooldown',
    description: 'Do not send automated proactive outreach emails to the same account more than once every 5 days.',
    enforcement: 'AUTO_TRIGGER',
    thresholdScore: 5,
  }
];
