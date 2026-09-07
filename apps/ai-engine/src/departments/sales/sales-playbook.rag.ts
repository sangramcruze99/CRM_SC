export interface ICPCriterion {
  tier: 'TIER_1_ENTERPRISE' | 'TIER_2_MIDMARKET' | 'TIER_3_GROWTH';
  minEmployees: number;
  maxEmployees?: number;
  minRevenueMillions: number;
  idealIndustries: string[];
  buyingSignals: string[];
  standardContractValue: number;
}

export interface ObjectionBattlecard {
  category: 'BUDGET' | 'TIMING' | 'COMPETITOR' | 'SECURITY' | 'MIGRATION';
  objection: string;
  talkingPoints: string[];
  proofPoints: string[];
  recommendedResponseTemplate: string;
}

export interface SalesPolicyRule {
  ruleId: string;
  name: string;
  description: string;
  enforcement: 'STRICT_BLOCK' | 'REQUIRE_APPROVAL' | 'LOG_WARNING';
  threshold?: number;
}

export const SALES_ICP_RUBRIC: ICPCriterion[] = [
  {
    tier: 'TIER_1_ENTERPRISE',
    minEmployees: 500,
    minRevenueMillions: 50,
    idealIndustries: ['Enterprise Software', 'Financial Services', 'Healthcare Tech', 'E-Commerce Logistics', 'Telecommunications'],
    buyingSignals: [
      'Multi-team workflow bottlenecks',
      'High seat license costs in legacy CRM',
      'Need for self-hosted / private tenant AI agents',
      'Automated cross-department handoffs'
    ],
    standardContractValue: 65000,
  },
  {
    tier: 'TIER_2_MIDMARKET',
    minEmployees: 100,
    maxEmployees: 499,
    minRevenueMillions: 10,
    idealIndustries: ['B2B SaaS', 'Professional Services', 'Real Estate Brokerages', 'Digital Agencies', 'Manufacturing Tech'],
    buyingSignals: [
      'Fast growing sales rep count',
      'Lead response times > 24 hours',
      'Disjointed tools (CRM, Helpdesk, Billing separated)',
      'Need for automated follow-up & billing reconciliation'
    ],
    standardContractValue: 24000,
  },
  {
    tier: 'TIER_3_GROWTH',
    minEmployees: 10,
    maxEmployees: 99,
    minRevenueMillions: 1,
    idealIndustries: ['High Growth Startups', 'E-Commerce Brands', 'Boutique Consultancies', 'Recruiting Agencies'],
    buyingSignals: [
      'Founder-led sales transitioning to first SDR team',
      'Manual invoice chasing and payment delays',
      'Desire for 24/7 automated inbound qualification'
    ],
    standardContractValue: 9600,
  },
];

export const SALES_OBJECTION_BATTLECARDS: ObjectionBattlecard[] = [
  {
    category: 'BUDGET',
    objection: "We don't have the budget allocated for another software platform right now.",
    talkingPoints: [
      'Business OS consolidates 5 tools into 1 (CRM, AI SDR, Support Helpdesk, Invoicing, Automation), typically reducing net SaaS spend by 40-60%.',
      'Payback period is historically under 45 days through recovered stalled pipeline and automated inbound conversion.',
      'Flexible deferred billing or quarterly milestone payments available upon approval.'
    ],
    proofPoints: [
      'Acme Logistics cut $48k/year by replacing 3 disjointed subscription tools with Business OS.',
      'Average deal closing velocity accelerated by 2.4x in the first quarter.'
    ],
    recommendedResponseTemplate: "I completely appreciate budget vigilance. Many of our enterprise partners felt the same until they realized Business OS isn't an additional expense—it replaces disconnected CRM, Helpdesk, and Zapier tiers while automating SDR outreach, net saving 40% on SaaS overhead. Would it make sense to review a 10-minute side-by-side cost breakdown?"
  },
  {
    category: 'COMPETITOR',
    objection: "We are already locked into Salesforce / HubSpot.",
    talkingPoints: [
      'Business OS is not just a passive database of records; it is an active Autonomous Business OS that takes actions (dispatches emails, books calendars, audits AR).',
      'No seat-tax penalties: AI departments work 24/7 at sub-10ms response times without paying per-seat SDR add-ons.',
      'Zero friction 48-hour two-way sync or full migration with Prisma SQLite/Postgres schemas.'
    ],
    proofPoints: [
      'Global FinTech migrated 15,000 accounts with 0 minutes of pipeline downtime.',
      'Ares Sales Sentinel recovered $180,000 in stalled opportunities within the first 14 days of activation.'
    ],
    recommendedResponseTemplate: "HubSpot/Salesforce are great traditional record vaults, but they require humans to manually click, log, and draft every interaction. Business OS embeds autonomous AI departments that qualify leads, draft proposals, and recover stalled accounts in real time. Can I show you a 3-minute live side-by-side run?"
  },
  {
    category: 'SECURITY',
    objection: "How do you handle our confidential deal data and AI privacy?",
    talkingPoints: [
      'Strict multi-tenant isolation enforced cryptographically via JWT claims and tenant schemas.',
      'Zero model training on customer data. Local dense vector RAG with private tenant boundaries.',
      'Human-in-the-loop (HITL) approval gates required for sensitive outbound actions and contractual discounts.'
    ],
    proofPoints: [
      'AES-256 encrypted data-at-rest with tenant-scoped SQLite / PostgreSQL partitions.',
      '100% audit logging on all autonomous agent tool executions and LLM prompts.'
    ],
    recommendedResponseTemplate: "Data confidentiality is our primary architectural pillar. Your workspace runs with strict tenant-level isolation, zero LLM model re-training on your proprietary data, and cryptographic JWT verification. Furthermore, our HITL Governance Center ensures no contract or discount is ever transmitted without rep sign-off."
  },
  {
    category: 'TIMING',
    objection: "We are too busy with our current roadmap to implement this quarter.",
    talkingPoints: [
      'Turnkey setup in under 30 minutes with out-of-the-box autonomous agent presets.',
      'AI SDR begins qualifying inbound prospects immediately without disrupting rep workflows.',
      'Immediate lift: SDRs save 3.5 hours daily on manual data entry and email drafting.'
    ],
    proofPoints: [
      'Standard onboarding time: 27 minutes to first live autonomous inbound qualification run.',
      '92% rep adoption within week one due to embedded Next.js command center.'
    ],
    recommendedResponseTemplate: "That makes total sense—nobody wants a heavy multi-month implementation. That's why Business OS was built to be live in under 30 minutes with zero developer overhead. The AI immediately starts triaging inbound traffic so your reps gain back 3 hours today, not 6 months from now."
  },
  {
    category: 'MIGRATION',
    objection: "Data migration is too risky and disruptive for our ongoing sales quarter.",
    talkingPoints: [
      'Dual-run mode: run Business OS alongside existing systems with seamless CSV/API ingestion.',
      'Automated schema mapping for custom objects, custom fields, and deal stages.',
      'Dedicated migration playbook with rollback checkpoints.'
    ],
    proofPoints: [
      'Over 200,000 contacts migrated with 100% field parity across all custom properties.',
      'Automated deduplication and domain enrichment executed during import.'
    ],
    recommendedResponseTemplate: "We designed our ingestion engine specifically to prevent quarterly disruption. You can run in dual-mode where Business OS supercharges your pipeline without cutting over your historical system until your team is 100% confident."
  }
];

export const SALES_POLICY_RULES: SalesPolicyRule[] = [
  {
    ruleId: 'POL_DISCOUNT_THRESHOLD',
    name: 'Maximum Autonomous Discount Limit',
    description: 'Any proposal or quote with discount exceeding 15% requires human executive approval.',
    enforcement: 'REQUIRE_APPROVAL',
    threshold: 15,
  },
  {
    ruleId: 'POL_COOLDOWN_PROTECTION',
    name: 'Prospect Outreach Cooldown',
    description: 'Prospects cannot be contacted autonomously more than once every 72 hours.',
    enforcement: 'STRICT_BLOCK',
    threshold: 72,
  },
  {
    ruleId: 'POL_DEAL_SLIPPAGE_ALERT',
    name: 'Stalled Deal SLA Warning',
    description: 'Deals with no activity for > 7 days are flagged for autonomous re-engagement campaign.',
    enforcement: 'LOG_WARNING',
    threshold: 7,
  },
  {
    ruleId: 'POL_TIER1_SLA_RESPONSE',
    name: 'Enterprise Lead SLA',
    description: 'Tier 1 Enterprise leads must receive qualified dossier within 15 minutes of inbound capture.',
    enforcement: 'REQUIRE_APPROVAL',
    threshold: 15,
  }
];
