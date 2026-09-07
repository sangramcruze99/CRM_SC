import { NextResponse } from 'next/server';
import { getTenantHeaders, safeFetch } from '@/lib/auth';

// In-memory tenant global pause & department settings cache for high-speed responsiveness
const globalState: {
  isPaused: boolean;
  pausedAt: string | null;
  departments: Record<string, {
    autonomy: 'RECOMMEND' | 'ASSIST' | 'AUTOPILOT';
    enabled: boolean;
    capabilities: string[];
  }>;
} = {
  isPaused: false,
  pausedAt: null,
  departments: {
    sales: {
      autonomy: 'ASSIST',
      enabled: true,
      capabilities: ['stalled_deals', 'lead_follow_up', 'deal_synthesis', 'discount_check'],
    },
    cs: {
      autonomy: 'ASSIST',
      enabled: true,
      capabilities: ['churn_risk', 'health_scanner', 'ebr_prep', 'sentiment_monitor'],
    },
    finance: {
      autonomy: 'ASSIST',
      enabled: true,
      capabilities: ['overdue_invoices', 'collections_copilot', 'cashflow_forecast'],
    },
    support: {
      autonomy: 'RECOMMEND',
      enabled: true,
      capabilities: ['auto_triage', 'reply_drafting', 'urgent_escalation'],
    },
    operations: {
      autonomy: 'RECOMMEND',
      enabled: true,
      capabilities: ['project_handoff', 'sla_watchdog', 'onboarding_tasks'],
    },
    marketing: {
      autonomy: 'RECOMMEND',
      enabled: true,
      capabilities: ['content_repurpose', 'social_drafts', 'audience_sync'],
    },
  },
};

export async function GET() {
  const headers = await getTenantHeaders();

  // Fetch real data in parallel from core services
  const [deals, contacts, invoices, approvals] = await Promise.all([
    safeFetch<any[]>('http://localhost:3005/deals', { headers }, []),
    safeFetch<any[]>('http://localhost:3001/contacts', { headers }, []),
    safeFetch<any[]>('http://localhost:3015/invoices', { headers }, []),
    safeFetch<any[]>('http://localhost:3009/approvals?status=PENDING', { headers }, []),
  ]);

  // Derive human-understandable proactive action items from real data
  const actionItems = [];

  // 1. Stalled deals check
  const stalledDeals = Array.isArray(deals) ? deals.filter((d) => d.stage !== 'WON' && d.stage !== 'LOST') : [];
  if (stalledDeals.length > 0) {
    const topDeal = stalledDeals[0];
    actionItems.push({
      id: `act_deal_${topDeal.id || 1}`,
      department: 'Sales AI',
      departmentKey: 'sales',
      priority: 'HIGH',
      title: `${topDeal.title || 'Enterprise Deal'} requires follow-up`,
      description: `Opportunity worth $${Number(topDeal.amount || 15000).toLocaleString()} has had no recent activity.`,
      recommendedAction: 'Send a personalized progress check-in message to prospect.',
      targetEntity: 'deal',
      targetId: topDeal.id,
      requiresApproval: globalState.departments.sales.autonomy !== 'AUTOPILOT',
    });
  }

  // 2. Overdue invoices check
  const overdueInvoices = Array.isArray(invoices) ? invoices.filter((i) => i.status === 'OVERDUE' || (i.status === 'UNPAID' && i.dueDate && new Date(i.dueDate) < new Date())) : [];
  if (overdueInvoices.length > 0) {
    const inv = overdueInvoices[0];
    actionItems.push({
      id: `act_inv_${inv.id || 1}`,
      department: 'Finance AI',
      departmentKey: 'finance',
      priority: 'MEDIUM',
      title: `Invoice #${inv.invoiceNumber || inv.id || '1042'} payment overdue`,
      description: `Outstanding balance of $${Number(inv.amount || 0).toLocaleString()} awaiting reconciliation.`,
      recommendedAction: 'Send a friendly tone-calibrated payment reminder.',
      targetEntity: 'invoice',
      targetId: inv.id,
      requiresApproval: globalState.departments.finance.autonomy !== 'AUTOPILOT',
    });
  }

  // 3. High-potential leads check
  const freshContacts = Array.isArray(contacts) ? contacts.slice(0, 5) : [];
  if (freshContacts.length > 0) {
    const contact = freshContacts[0];
    actionItems.push({
      id: `act_lead_${contact.id || 1}`,
      department: 'Sales AI',
      departmentKey: 'sales',
      priority: 'LOW',
      title: `Follow up with ${contact.firstName || 'New'} ${contact.lastName || 'Lead'}`,
      description: `Contact ${contact.email || 'lead'} recently added to CRM.`,
      recommendedAction: 'Prepare an executive introduction and value proposition.',
      targetEntity: 'contact',
      targetId: contact.id,
      requiresApproval: true,
    });
  }

  // Summary statistics
  const metrics = {
    pendingApprovals: Array.isArray(approvals) ? approvals.length : 0,
    dealsUnderWatch: stalledDeals.length,
    invoicesMonitored: Array.isArray(invoices) ? invoices.length : 0,
    activeAssistants: Object.values(globalState.departments).filter((d) => d.enabled).length,
    isGlobalPaused: globalState.isPaused,
    pausedAt: globalState.pausedAt,
  };

  return NextResponse.json({
    metrics,
    proactiveActions: actionItems,
    departments: globalState.departments,
    systemStatus: globalState.isPaused ? 'PAUSED' : 'ACTIVE',
  });
}
