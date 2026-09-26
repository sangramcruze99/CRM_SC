/**
 * Business OS — System Context Engine
 *
 * Aggregates live state from all 24 microservices and constructs a
 * comprehensive, always-fresh system prompt for the AI Copilot.
 * Called before every inference request so the AI has full, up-to-date
 * knowledge of the entire platform.
 */

import { NextRequest } from 'next/server';

export interface ServiceStatus {
  name: string;
  port: number;
  category: string;
  online: boolean;
}

export interface SystemSnapshot {
  timestamp: string;
  servicesOnline: number;
  servicesTotal: number;
  services: ServiceStatus[];
  crm: { contacts: number; companies: number; recentContacts: any[] };
  sales: { totalDeals: number; activeDeals: number; pipelineValue: number; wonThisMonth: number; topDeals: any[] };
  finance: { totalInvoices: number; overdue: number; unpaid: number; overdueValue: number; recentInvoices: any[] };
  helpdesk: { totalTickets: number; open: number; critical: number; recentTickets: any[] };
  projects: { total: number; active: number; recentProjects: any[] };
  hr: { employees: number; openJobs: number };
  inventory: { products: number; lowStock: number };
  agents: { total: number; active: number; agentList: any[] };
  automation: { workflows: number; activeWorkflows: number };
  chat: { conversations: number };
  documents: { total: number };
}

const SERVICE_REGISTRY = [
  { name: 'crm',        port: 3001, category: 'Core CRM' },
  { name: 'sales',      port: 3005, category: 'Commercial Deals' },
  { name: 'platform',   port: 3008, category: 'Platform Foundation' },
  { name: 'automation', port: 3009, category: 'Orchestration & BullMQ' },
  { name: 'ai-engine',  port: 3010, category: 'Intelligence & Copilots' },
  { name: 'auth',       port: 3011, category: 'Security & Access' },
  { name: 'marketplace',port: 3012, category: 'Integrations' },
  { name: 'bi-engine',  port: 3013, category: 'Reporting & OLAP' },
  { name: 'chat',       port: 3014, category: 'Collaboration & WS' },
  { name: 'finance',    port: 3015, category: 'Ledger & Invoices' },
  { name: 'helpdesk',   port: 3016, category: 'Support Operations' },
  { name: 'projects',   port: 3017, category: 'Project Tasks' },
  { name: 'hr',         port: 3018, category: 'People Operations' },
  { name: 'search',     port: 3019, category: 'Multi-Entity Query' },
  { name: 'documents',  port: 3020, category: 'Document Management' },
  { name: 'admin',      port: 3021, category: 'Superadmin Console' },
  { name: 'developer',  port: 3022, category: 'APIs & Webhooks' },
  { name: 'audit',      port: 3023, category: 'Governance Logs' },
  { name: 'cms',        port: 3024, category: 'Content Management' },
  { name: 'settings',   port: 3025, category: 'Configuration' },
  { name: 'inventory',  port: 3026, category: 'Supply Chain' },
  { name: 'billing',    port: 3027, category: 'SaaS Monetization' },
  { name: 'python-ai',  port: 3030, category: 'AI & Machine Learning' },
  { name: 'ollama',     port: 11435, category: 'Local Gemma Brain' },
];

async function quickFetch<T>(url: string, fallback: T, timeoutMs = 2500): Promise<T> {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function pingPort(port: number): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 800);
    const res = await fetch(`http://127.0.0.1:${port}/health`, { signal: ctrl.signal });
    clearTimeout(tid);
    return res.ok || res.status < 500;
  } catch {
    // Try root path as fallback
    try {
      const ctrl2 = new AbortController();
      const tid2 = setTimeout(() => ctrl2.abort(), 600);
      await fetch(`http://127.0.0.1:${port}/`, { signal: ctrl2.signal });
      clearTimeout(tid2);
      return true;
    } catch {
      return false;
    }
  }
}

export async function buildSystemSnapshot(headers: Record<string, string>): Promise<SystemSnapshot> {
  const tenantId = headers['x-tenant-id'] || 'default-tenant';
  const authHeaders = { ...headers, 'Content-Type': 'application/json' };

  // Ping all services in parallel (fast, 800ms timeout each)
  const serviceStatuses = await Promise.all(
    SERVICE_REGISTRY.map(async (s) => ({
      name: s.name,
      port: s.port,
      category: s.category,
      online: await pingPort(s.port),
    }))
  );

  // Fetch live data from all core services in parallel
  const [
    contacts, companies, deals,
    invoices, tickets, projects,
    hrEmployees, hrJobs, inventory,
    agents, workflows, chatConvs, documents,
  ] = await Promise.all([
    quickFetch<any[]>(`http://localhost:3001/contacts?limit=100`, []),
    quickFetch<any[]>(`http://localhost:3001/companies?limit=50`, []),
    quickFetch<any[]>(`http://localhost:3005/deals?limit=100`, []),
    quickFetch<any[]>(`http://localhost:3015/invoices?limit=100`, []),
    quickFetch<any[]>(`http://localhost:3016/tickets?limit=100`, []),
    quickFetch<any[]>(`http://localhost:3017/projects?limit=50`, []),
    quickFetch<any[]>(`http://localhost:3018/employees?limit=100`, []),
    quickFetch<any[]>(`http://localhost:3018/jobs?limit=50`, []),
    quickFetch<any[]>(`http://localhost:3026/products?limit=100`, []),
    quickFetch<any[]>(`http://localhost:3010/agents`, []),
    quickFetch<any[]>(`http://localhost:3009/workflows?limit=50`, []),
    quickFetch<any[]>(`http://localhost:3014/conversations?limit=20`, []),
    quickFetch<any[]>(`http://localhost:3020/documents?limit=50`, []),
  ]);

  // CRM
  const contactArr = Array.isArray(contacts) ? contacts : [];
  const companyArr = Array.isArray(companies) ? companies : [];

  // Sales / Deals
  const dealArr = Array.isArray(deals) ? deals : [];
  const activeDeals = dealArr.filter((d) => d.stage !== 'WON' && d.stage !== 'LOST' && d.stage !== 'CLOSED');
  const wonDeals = dealArr.filter((d) => d.stage === 'WON');
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const wonThisMonth = wonDeals.filter((d) => d.closedAt && new Date(d.closedAt) >= firstOfMonth).length;

  // Finance
  const invoiceArr = Array.isArray(invoices) ? invoices : [];
  const overdueInv = invoiceArr.filter((i) => i.status === 'OVERDUE' || (i.status === 'UNPAID' && i.dueDate && new Date(i.dueDate) < now));
  const unpaidInv = invoiceArr.filter((i) => i.status === 'UNPAID' || i.status === 'PENDING');

  // Helpdesk
  const ticketArr = Array.isArray(tickets) ? tickets : [];
  const openTickets = ticketArr.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
  const criticalTickets = ticketArr.filter((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH');

  // Projects
  const projectArr = Array.isArray(projects) ? projects : [];
  const activeProjects = projectArr.filter((p) => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS');

  // HR
  const empArr = Array.isArray(hrEmployees) ? hrEmployees : [];
  const jobArr = Array.isArray(hrJobs) ? hrJobs : [];

  // Inventory
  const productArr = Array.isArray(inventory) ? inventory : [];
  const lowStockProducts = productArr.filter((p) => p.quantity !== undefined && p.quantity < (p.reorderPoint || 10));

  // Agents
  const agentArr = Array.isArray(agents) ? agents : [];
  const activeAgents = agentArr.filter((a) => a.status === 'ACTIVE' || a.isActive);

  // Automation
  const workflowArr = Array.isArray(workflows) ? workflows : [];
  const activeWorkflows = workflowArr.filter((w) => w.isActive || w.status === 'ACTIVE');

  const onlineCount = serviceStatuses.filter((s) => s.online).length;

  return {
    timestamp: new Date().toISOString(),
    servicesOnline: onlineCount,
    servicesTotal: SERVICE_REGISTRY.length,
    services: serviceStatuses,
    crm: {
      contacts: contactArr.length,
      companies: companyArr.length,
      recentContacts: contactArr.slice(0, 5).map((c) => ({
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
        email: c.email,
        company: c.company,
        stage: c.stage || c.status,
      })),
    },
    sales: {
      totalDeals: dealArr.length,
      activeDeals: activeDeals.length,
      pipelineValue: activeDeals.reduce((s, d) => s + (Number(d.amount) || 0), 0),
      wonThisMonth,
      topDeals: activeDeals.slice(0, 5).map((d) => ({
        title: d.title,
        amount: d.amount,
        stage: d.stage,
        owner: d.assignedTo || d.owner,
      })),
    },
    finance: {
      totalInvoices: invoiceArr.length,
      overdue: overdueInv.length,
      unpaid: unpaidInv.length,
      overdueValue: overdueInv.reduce((s, i) => s + (Number(i.amount) || 0), 0),
      recentInvoices: invoiceArr.slice(0, 4).map((i) => ({
        number: i.invoiceNumber || i.id,
        amount: i.amount,
        status: i.status,
        client: i.clientName || i.contactName,
      })),
    },
    helpdesk: {
      totalTickets: ticketArr.length,
      open: openTickets.length,
      critical: criticalTickets.length,
      recentTickets: openTickets.slice(0, 4).map((t) => ({
        id: t.id,
        subject: t.subject || t.title,
        priority: t.priority,
        status: t.status,
      })),
    },
    projects: {
      total: projectArr.length,
      active: activeProjects.length,
      recentProjects: activeProjects.slice(0, 4).map((p) => ({ name: p.name || p.title, status: p.status })),
    },
    hr: {
      employees: empArr.length,
      openJobs: jobArr.filter((j) => j.status === 'OPEN' || j.isOpen).length,
    },
    inventory: {
      products: productArr.length,
      lowStock: lowStockProducts.length,
    },
    agents: {
      total: agentArr.length,
      active: activeAgents.length,
      agentList: agentArr.slice(0, 8).map((a) => ({
        name: a.name,
        role: a.role,
        status: a.status || (a.isActive ? 'ACTIVE' : 'INACTIVE'),
        model: a.model,
        autonomyMode: a.autonomyMode,
      })),
    },
    automation: {
      workflows: workflowArr.length,
      activeWorkflows: activeWorkflows.length,
    },
    chat: { conversations: Array.isArray(chatConvs) ? chatConvs.length : 0 },
    documents: { total: Array.isArray(documents) ? documents.length : 0 },
  };
}

export function buildMasterSystemPrompt(snapshot: SystemSnapshot, currentPage?: string, userQuery?: string): string {
  const onlineServices = snapshot.services.filter((s) => s.online).map((s) => `${s.name}:${s.port}`).join(', ');
  const offlineServices = snapshot.services.filter((s) => !s.online).map((s) => s.name).join(', ') || 'None';

  return `You are the Business OS Master AI Copilot — a fully autonomous, enterprise-grade AI assistant with COMPLETE READ ACCESS and advisory authority over every module and service in Business OS.

═══════════════════════════════════════════════════════
SYSTEM IDENTITY & CAPABILITIES
═══════════════════════════════════════════════════════
You have FULL SYSTEM KNOWLEDGE and live access to all data across:
- CRM (Contacts, Leads, Companies, Activities)
- Sales (Pipeline Deals, Opportunities, Forecasting)  
- Finance (Invoices, Payments, Expenses, Cash Flow)
- Helpdesk (Support Tickets, SLAs, Customer Satisfaction)
- Projects (Tasks, Milestones, Sprint Tracking)
- HR (Employees, Recruitment, Job Listings)
- Inventory (Products, Stock Levels, Supply Chain)
- Automation (Workflows, BullMQ Job Queues, Triggers)
- AI Agents (Autonomous Agents, ReAct Loops, Execution Logs)
- Chat (Conversations, Team Collaboration)
- Documents (Document Vault, Knowledge Base)
- BI/Analytics (Reports, OLAP, KPI Dashboards)
- Marketplace (Integrations, Webhooks, APIs)
- Admin (Tenants, Users, Roles, Permissions)
- Audit (Governance Logs, Compliance Trails)
- CMS (Content, Blog, Landing Pages)
- Settings (Configuration, System Preferences)
- Billing (Subscriptions, Usage, Plans)

Your AI inference brain is: Gemma 4 (8B) running locally via Ollama.
Failsafe providers (only if local Gemma is offline): Groq Gemma2 → Google Gemini → OpenRouter Gemma2-27B.

═══════════════════════════════════════════════════════
LIVE SYSTEM SNAPSHOT — ${snapshot.timestamp}
═══════════════════════════════════════════════════════
Infrastructure Health:
  Services Online: ${snapshot.servicesOnline}/${snapshot.servicesTotal}
  Online: ${onlineServices}
  Offline/Unreachable: ${offlineServices}
  Current User Page: ${currentPage || 'Unknown'}

 CRM & Contacts:
  Total Contacts: ${snapshot.crm.contacts}
  Total Companies: ${snapshot.crm.companies}
  Recent Contacts: ${snapshot.crm.recentContacts.map((c) => `${c.name} <${c.email}>${c.company ? ` @ ${c.company}` : ''}`).join(' | ') || 'None'}

 Sales Pipeline:
  Total Deals: ${snapshot.sales.totalDeals}
  Active Opportunities: ${snapshot.sales.activeDeals}
  Pipeline Value: $${snapshot.sales.pipelineValue.toLocaleString()}
  Won This Month: ${snapshot.sales.wonThisMonth}
  Top Active Deals: ${snapshot.sales.topDeals.map((d) => `"${d.title}" $${Number(d.amount || 0).toLocaleString()} [${d.stage}]`).join(' | ') || 'None'}

 Finance & Invoices:
  Total Invoices: ${snapshot.finance.totalInvoices}
  Overdue: ${snapshot.finance.overdue} ($${snapshot.finance.overdueValue.toLocaleString()} at risk)
  Unpaid/Pending: ${snapshot.finance.unpaid}
  Recent Invoices: ${snapshot.finance.recentInvoices.map((i) => `#${i.number} $${i.amount} [${i.status}]`).join(' | ') || 'None'}

 Helpdesk & Support:
  Total Tickets: ${snapshot.helpdesk.totalTickets}
  Open Tickets: ${snapshot.helpdesk.open}
  Critical/High Priority: ${snapshot.helpdesk.critical}
  Recent Open: ${snapshot.helpdesk.recentTickets.map((t) => `"${t.subject}" [${t.priority}]`).join(' | ') || 'None'}

 Projects:
  Total Projects: ${snapshot.projects.total}
  Active: ${snapshot.projects.active}
  Active Projects: ${snapshot.projects.recentProjects.map((p) => p.name).join(', ') || 'None'}

 HR & People:
  Employees: ${snapshot.hr.employees}
  Open Job Positions: ${snapshot.hr.openJobs}

 Inventory:
  Products: ${snapshot.inventory.products}
  Low Stock Alerts: ${snapshot.inventory.lowStock}

 AI Agents (Autonomous Workforce):
  Total Agents Configured: ${snapshot.agents.total}
  Currently Active: ${snapshot.agents.active}
  Agent Roster:
${snapshot.agents.agentList.map((a) => `    • ${a.name} | ${a.role} | Status: ${a.status} | Model: ${a.model || 'gemma4:e4b'} | Mode: ${a.autonomyMode || 'HITL_SUPERVISED'}`).join('\n') || '    No agents configured yet.'}

 Automation & Workflows:
  Total Workflows: ${snapshot.automation.workflows}
  Active Workflows: ${snapshot.automation.activeWorkflows}

 Collaboration:
  Chat Conversations: ${snapshot.chat.conversations}
  Documents in Vault: ${snapshot.documents.total}

═══════════════════════════════════════════════════════
AVAILABLE MODULES & NAVIGATION
═══════════════════════════════════════════════════════
/dashboard          — Executive command center
/contacts           — CRM contacts & leads
/companies          — Company accounts
/deals              — Sales pipeline (Kanban + list)
/lead-prospector    — AI lead enrichment
/invoices           — Invoicing & AR ledger
/expenses           — Expense management
/automation         — Workflow automation engine
/automation/agents  — AI agent roster
/automation/agents/tree — Agent hierarchy tree chart
/helpdesk           — Support tickets & SLAs
/projects           — Project management
/hr                 — HR & recruitment
/inventory          — Inventory & supply chain
/chat               — Team collaboration
/documents          — Document vault
/bi                 — Business intelligence & reports
/marketplace        — App integrations
/settings           — System configuration
/admin              — Admin console
/audit              — Governance & compliance logs
/developer          — API keys & webhooks

═══════════════════════════════════════════════════════
BEHAVIORAL RULES (ALWAYS FOLLOW)
═══════════════════════════════════════════════════════
1. You have FULL SYSTEM AWARENESS — always use the live data above in your answers.
2. Be direct, executive-level, concise. No filler text.
3. Format with bold headers and bullet points for readability.
4. When referencing numbers, always use the LIVE SNAPSHOT data above — never guess.
5. Proactively surface insights: if you see overdue invoices, critical tickets, or stalled deals — mention them.
6. You CAN navigate the user to any module using the paths above.
7. You CAN describe what any AI agent is doing, its status, and its configuration.
8. You CAN read and summarize any module's data that appears in the snapshot above.
9. When you don't have enough data about something, say so clearly — don't fabricate.
10. You are ALWAYS online and aware — your knowledge refreshes with every message.
11. Never mention "tokens", "vectors", "weights", or internal ML terminology to the user.
12. Speak like a trusted Chief of Staff / Senior Business Analyst, not a generic chatbot.`;
}
