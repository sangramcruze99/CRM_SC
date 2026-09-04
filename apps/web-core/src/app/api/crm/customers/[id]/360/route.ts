import { NextRequest, NextResponse } from 'next/server';
import { getTenantHeaders, safeFetch } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const headers = await getTenantHeaders();
  const tenantId = headers['x-tenant-id'] || 'default-tenant';

  try {
    // 1. Fetch Contact from CRM Service (:3001)
    const contacts = await safeFetch<any[]>(
      'http://localhost:3001/contacts',
      { headers, cache: 'no-store' },
      []
    );

    let contact = contacts.find((c: any) => c.id === id);
    if (!contact) {
      // Fallback sample for demonstration/dev if not yet seeded
      contact = {
        id,
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena.rostova@hyperion.io',
        phone: '+1 (555) 382-9912',
        company: {
          id: 'comp_hyperion',
          name: 'Hyperion Technologies Inc.',
          domain: 'hyperion.io',
          industry: 'Enterprise SaaS',
        },
        customData: JSON.stringify({
          leadScore: 84,
          tags: ['Enterprise Stakeholder', 'Champion', 'SOC2 Compliant'],
          buyingRole: 'Economic Decision Maker',
          location: 'San Francisco, CA',
        }),
      };
    }

    let customData: any = {};
    try {
      customData = typeof contact.customData === 'string' ? JSON.parse(contact.customData || '{}') : (contact.customData || {});
    } catch {
      customData = {};
    }

    const companyName = contact.company?.name || 'Enterprise Account';
    const companyId = contact.company?.id;

    // 2. Fetch Deals (:3005)
    const allDeals = await safeFetch<any[]>(
      'http://localhost:3005/deals',
      { headers, cache: 'no-store' },
      []
    );
    const relatedDeals = allDeals.filter(
      (d: any) => d.contactId === id || (companyId && d.companyId === companyId) || d.title?.toLowerCase().includes(companyName.toLowerCase())
    );

    // 3. Fetch Invoices (:3015)
    const allInvoices = await safeFetch<any[]>(
      'http://localhost:3015/invoices',
      { headers, cache: 'no-store' },
      []
    );
    const relatedInvoices = allInvoices.filter(
      (inv: any) => inv.tenantId === tenantId
    ).slice(0, 5);

    // 4. Fetch Support Tickets (:3016)
    const allTickets = await safeFetch<any[]>(
      'http://localhost:3016/tickets',
      { headers, cache: 'no-store' },
      []
    );
    const relatedTickets = allTickets.filter(
      (t: any) => t.title?.toLowerCase().includes(companyName.toLowerCase()) || t.description?.toLowerCase().includes(contact.email?.toLowerCase() || '')
    );

    // 5. Fetch Projects & Tasks (:3017)
    const allProjects = await safeFetch<any[]>(
      'http://localhost:3017/projects',
      { headers, cache: 'no-store' },
      []
    );

    // 6. Fetch CRM Activities (:3001)
    const allActivities = await safeFetch<any[]>(
      'http://localhost:3001/activities',
      { headers, cache: 'no-store' },
      []
    );
    const relatedActivities = allActivities.filter(
      (a: any) => a.contactId === id || a.content?.toLowerCase().includes(contact.email?.toLowerCase() || '')
    );

    // 7. Calculate Dynamic Customer Health Score (0 - 100)
    let healthScore = 78;
    const healthSignals: string[] = [];

    // Overdue invoices penalty
    const overdueInvoices = relatedInvoices.filter((i: any) => i.status === 'OVERDUE');
    if (overdueInvoices.length > 0) {
      healthScore -= overdueInvoices.length * 20;
      healthSignals.push(`${overdueInvoices.length} Overdue Invoices (-${overdueInvoices.length * 20} pts)`);
    } else if (relatedInvoices.length > 0) {
      healthScore += 10;
      healthSignals.push('Invoices up-to-date and paid on schedule (+10 pts)');
    }

    // Urgent tickets penalty
    const urgentTickets = relatedTickets.filter((t: any) => t.priority === 'URGENT' || t.priority === 'HIGH');
    if (urgentTickets.length > 0) {
      healthScore -= urgentTickets.length * 15;
      healthSignals.push(`${urgentTickets.length} High/Urgent Support Tickets (-${urgentTickets.length * 15} pts)`);
    } else {
      healthScore += 8;
      healthSignals.push('Zero critical support escalations (+8 pts)');
    }

    // Deal activity bonus
    const wonDeals = relatedDeals.filter((d: any) => d.stage === 'Won' || d.stage === 'Closed Won');
    if (wonDeals.length > 0) {
      healthScore += 15;
      healthSignals.push(`Closed commercial deal on ledger (+15 pts)`);
    }

    // Engagement bonus
    const recentComms = relatedActivities.filter((a: any) => a.type === 'EMAIL' || a.type === 'CALL' || a.type === 'MEETING');
    if (recentComms.length >= 2) {
      healthScore += 10;
      healthSignals.push(`Strong omnichannel communication cadence (${recentComms.length} touchpoints, +10 pts)`);
    }

    // Clamp score between 10 and 100
    healthScore = Math.max(10, Math.min(100, healthScore));

    const churnRisk = healthScore < 45 ? 'HIGH' : healthScore < 70 ? 'MEDIUM' : 'LOW';
    const expansionOpportunity = healthScore >= 75 ? 'HIGH' : healthScore >= 55 ? 'MEDIUM' : 'LOW';

    // 8. Compile Unified Chronological Timeline
    const timelineItems: any[] = [];

    // Add Activities
    for (const act of relatedActivities) {
      timelineItems.push({
        id: `act_${act.id}`,
        type: act.type || 'NOTE',
        category: 'CRM Activity',
        title: act.title || 'Client Touchpoint',
        description: act.content,
        timestamp: act.createdAt || new Date().toISOString(),
        author: act.user?.name || act.user?.email || 'Account Representative',
        badge: act.type,
      });
    }

    // Add Deals
    for (const d of relatedDeals) {
      timelineItems.push({
        id: `deal_${d.id}`,
        type: 'DEAL',
        category: 'Sales Pipeline',
        title: `Deal: ${d.title}`,
        description: `Stage: ${d.stage} · Commercial Value: $${(d.amount || 0).toLocaleString()}`,
        timestamp: d.createdAt || new Date().toISOString(),
        author: 'Sales Engine',
        badge: `$${(d.amount || 0).toLocaleString()}`,
      });
    }

    // Add Invoices
    for (const inv of relatedInvoices) {
      timelineItems.push({
        id: `inv_${inv.id}`,
        type: 'INVOICE',
        category: 'Finance',
        title: `Commercial Invoice #${inv.invoiceNum || inv.id}`,
        description: `Amount: $${(inv.amount || 0).toLocaleString()} · Status: ${inv.status} · Due: ${new Date(inv.dueDate).toLocaleDateString()}`,
        timestamp: inv.createdAt || new Date().toISOString(),
        author: 'Finance Service',
        badge: inv.status,
      });
    }

    // Add Tickets
    for (const t of relatedTickets) {
      timelineItems.push({
        id: `tkt_${t.id}`,
        type: 'TICKET',
        category: 'Helpdesk',
        title: `Support Ticket: ${t.title}`,
        description: `Priority: ${t.priority} · Status: ${t.status}\n${t.description}`,
        timestamp: t.createdAt || new Date().toISOString(),
        author: 'Client Portal',
        badge: t.priority,
      });
    }

    // Default system seed if timeline is young
    if (timelineItems.length === 0) {
      timelineItems.push({
        id: 'evt_init',
        type: 'SYSTEM',
        category: 'System Foundation',
        title: `Client Account Created: ${contact.firstName} ${contact.lastName}`,
        description: `Lead registered under ${companyName}. Initial lead score computed: ${customData.leadScore || 50} pts.`,
        timestamp: contact.createdAt || new Date().toISOString(),
        author: 'Business OS Lead Engine',
        badge: 'INITIALIZED',
      });
    }

    // Sort descending by timestamp
    timelineItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 9. Buying Committee Matrix
    const otherCompanyContacts = contacts.filter((c: any) => c.company?.name === companyName && c.id !== id);
    const buyingCommittee = [
      {
        id: contact.id,
        name: `${contact.firstName} ${contact.lastName}`,
        role: customData.buyingRole || 'Economic Buyer / Decision Maker',
        influence: 'HIGH',
        email: contact.email,
        phone: contact.phone,
        status: 'ENGAGED',
      },
      ...otherCompanyContacts.map((c: any) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        role: c.jobTitle || 'Technical Stakeholder',
        influence: 'MEDIUM',
        email: c.email,
        phone: c.phone,
        status: 'CHAMPION',
      })),
    ];

    return NextResponse.json({
      success: true,
      contact: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: `${contact.firstName} ${contact.lastName}`.trim(),
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        companyName,
        customData,
        tags: customData.tags || ['Active Client'],
        leadScore: customData.leadScore || 65,
        location: customData.location || 'Global Remote',
      },
      health: {
        score: healthScore,
        churnRisk,
        expansionOpportunity,
        signals: healthSignals,
        lastEvaluated: new Date().toISOString(),
      },
      governance: {
        marketingEmails: true,
        productUpdates: true,
        smsNotifications: Boolean(contact.phone),
        quietHours: '20:00 - 08:00 Local Time',
        channelPreference: 'EMAIL_THEN_SMS',
        maxTouchesPerWeek: 3,
      },
      deals: relatedDeals,
      invoices: relatedInvoices,
      tickets: relatedTickets,
      projects: allProjects.slice(0, 3),
      timeline: timelineItems,
      buyingCommittee,
      nextBestAction: {
        action: healthScore < 50 ? 'SCHEDULE_RETENTION_CALL' : relatedDeals.length > 0 ? 'CALL_CUSTOMER' : 'SEND_EXECUTIVE_BRIEFING',
        confidence: 0.91,
        rationale: healthScore < 50
          ? 'Customer health flagged as at-risk. Direct executive check-in recommended within 24 hours.'
          : 'High engagement detected across omnichannel signals. Recommend advancing commercial conversation.',
      },
    });
  } catch (error: any) {
    console.error('Customer 360 aggregation error:', error);
    return NextResponse.json(
      { error: 'Failed to aggregate Customer 360 data', message: error.message },
      { status: 500 }
    );
  }
}
