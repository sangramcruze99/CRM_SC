// apps/web-core/src/components/dashboard/dashboardConfig.ts
/**
 * UNIVERSAL DASHBOARD CONFIGURATION ENGINE 2.0
 * Generates an authoritative, prioritized dashboard configuration for any industry,
 * business type, workspace, role, and enabled services set.
 *
 * Information Hierarchy:
 * Zone 1: Header (Workspace, Role, Time Context, Primary Actions)
 * Zone 2: Needs Attention (Critical/High/Medium actionable items ranked by urgency)
 * Zone 3: Today's Operations Pulse (What is happening right now)
 * Zone 4: Primary KPIs (Strict max 4 core business metrics)
 * Zone 5: Main Business Operations Queue (8 columns)
 * Zone 6: Side Operational Timeline / Ledger (4 columns)
 * Zone 7: Secondary Operational Status (7 columns)
 * Zone 8: Recent Chronological Audit Activity (5 columns)
 * Zone 9: Quick Action Triggers
 */

import {
  DashboardConfig,
  DashboardAttentionItem,
  DashboardPrimaryKpi,
  DashboardTodayMetric,
  DashboardSecondaryCard,
  DashboardOperationalRecord,
  DashboardTimelineItem,
  DashboardRecentActivity,
  DashboardQuickAction,
} from './dashboard.types';
import { DataSourceRegistry } from './DataSourceRegistry';

export interface DashboardConfigOptions {
  niche: string;
  role?: string;
  mode?: 'OPERATIONS' | 'ANALYTICS';
  activeServiceIds?: string[];
  backendData?: any;
  callbacks?: {
    onAdmit?: () => void;
    onAppointment?: () => void;
    onRx?: () => void;
    onGeneralAction?: (actionName: string, payload?: any) => void;
  };
}

export function getDashboardConfig(
  niche: string,
  role: string = 'admin',
  mode: 'OPERATIONS' | 'ANALYTICS' = 'OPERATIONS',
  backendData?: any,
  callbacks?: {
    onAdmit?: () => void;
    onAppointment?: () => void;
    onRx?: () => void;
    onGeneralAction?: (actionName: string, payload?: any) => void;
  },
  activeServiceIds?: string[]
): DashboardConfig {
  const data = backendData?.data || {};
  const metrics = backendData?.metrics || {};
  const auditLogs = backendData?.auditLogs || [];

  // Helper: check if a service is enabled
  const isServiceEnabled = (serviceId: string) => {
    if (!activeServiceIds || activeServiceIds.length === 0) return true;
    return activeServiceIds.includes(serviceId);
  };

  // =========================================================================
  // 1. HEALTHCARE / CLINICAL COMMAND HUB
  // =========================================================================
  if (niche === 'hospital') {
    const rawPatients = data.patients || [];
    const rawAppts = data.appointments || [];
    const totalPatients = rawPatients.length || 14;
    const occupiedBeds = metrics.occupiedBeds || totalPatients;
    const totalBeds = metrics.totalBeds || 165;
    const occupancyRate = metrics.occupancyRate || `${((occupiedBeds / totalBeds) * 100).toFixed(1)}%`;
    const criticalPatients = rawPatients.filter((p: any) => p.triageLevel === 'CRITICAL').length;
    const todayAppointments = rawAppts.length || 8;

    // Needs Attention (Zone 2)
    const attentionItems: DashboardAttentionItem[] = [];
    if (criticalPatients > 0) {
      attentionItems.push({
        id: 'att_hosp_1',
        severity: 'CRITICAL',
        title: `${criticalPatients} Critical Triage Patient${criticalPatients > 1 ? 's' : ''} Awaiting Bed Assignment`,
        reason: 'Acute arrhythmia and trauma alert in ER · Vitals monitoring active',
        timeAgo: '12 min waiting',
        owner: 'Dr. Sarah Lin, MD (Cardiology)',
        actionLabel: 'Review Patient',
      });
    }
    attentionItems.push({
      id: 'att_hosp_2',
      severity: 'HIGH',
      title: 'Consultation Schedule Approaching Capacity',
      reason: '2 urgent inpatient specialist consultation slots require front-desk confirmation',
      timeAgo: '28 min ago',
      owner: 'Admissions Desk',
      actionLabel: 'Confirm Slots',
    });
    if (isServiceEnabled('srv_invoices_billing')) {
      attentionItems.push({
        id: 'att_hosp_3',
        severity: 'MEDIUM',
        title: 'Inpatient Insurance Pre-Authorization Pending',
        reason: 'BlueCross medical claim authorization awaiting clinical audit',
        timeAgo: '1 hr ago',
        owner: 'Billing & Compliance Desk',
        actionLabel: 'Verify Claim',
      });
    }

    // Filter attention by role
    const filteredAttention =
      role === 'doctor'
        ? attentionItems.filter((a) => a.severity === 'CRITICAL' || a.owner.includes('MD'))
        : role === 'receptionist'
        ? attentionItems.filter((a) => a.owner.includes('Desk') || a.severity === 'HIGH')
        : role === 'billing'
        ? attentionItems.filter((a) => a.owner.includes('Billing'))
        : attentionItems;

    // Today's Operational Pulse (Zone 3)
    const todayMetrics: DashboardTodayMetric[] = [
      { id: 'tm_1', label: 'Admissions Today', value: totalPatients, subtext: `${occupiedBeds} of ${totalBeds} total beds`, status: 'normal', iconName: 'Bed' },
      { id: 'tm_2', label: 'Active Critical Cases', value: `${criticalPatients} Case${criticalPatients > 1 ? 's' : ''}`, subtext: 'Average triage: 12 mins', status: criticalPatients > 0 ? 'warning' : 'success', iconName: 'HeartPulse' },
      { id: 'tm_3', label: 'Consultations Today', value: `${todayAppointments} Scheduled`, subtext: 'Across 8 medical specialties', status: 'normal', iconName: 'Calendar' },
      { id: 'tm_4', label: 'Attending Providers', value: '14 Active', subtext: '12 available · 2 in surgery', status: 'success', iconName: 'Stethoscope' },
    ];

    // Primary KPIs (Zone 4 - Strict max 4)
    const primaryKpis: DashboardPrimaryKpi[] = [
      {
        id: 'kpi_patients',
        label: 'Patients Under Care',
        value: totalPatients,
        delta: '+12% vs last week',
        isPositive: true,
        subtext: 'Active inpatient census',
        iconName: 'Users',
      },
      {
        id: 'kpi_occupancy',
        label: 'Bed Occupancy Rate',
        value: occupancyRate,
        delta: `${occupiedBeds} / ${totalBeds} Beds`,
        isPositive: true,
        subtext: 'Ward 3C & 2A near capacity',
        iconName: 'Bed',
      },
      {
        id: 'kpi_appts',
        label: 'Consultations Today',
        value: todayAppointments,
        delta: '100% on schedule',
        isPositive: true,
        subtext: '0 unassigned slots remaining',
        iconName: 'Calendar',
      },
      {
        id: 'kpi_compliance',
        label: 'HIPAA EHR Compliance',
        value: '100% Secure',
        delta: 'Audit verified',
        isPositive: true,
        subtext: 'End-to-end encrypted records',
        iconName: 'ShieldCheck',
      },
    ];

    // Main Operational Records (Zone 5 - Clinical Queue)
    const records: DashboardOperationalRecord[] = rawPatients.map((p: any) => ({
      id: p.id,
      primaryText: p.name,
      secondaryText: `${p.id} · ${p.age}y (${p.gender || 'Patient'})`,
      groupText: p.department || 'General Medicine',
      ownerText: p.attendingPhysician || 'On-Duty Specialist',
      priority: p.triageLevel || 'STABLE',
      location: p.roomNumber || 'Ward Bed 01',
      status: p.insuranceStatus || 'VERIFIED',
      statusVariant: p.insuranceStatus === 'VERIFIED' ? 'success' : p.insuranceStatus === 'PENDING' ? 'warning' : 'neutral',
      actionLabel: 'View EHR',
      raw: p,
    }));

    // Timeline Items (Zone 6 - Consultation Schedule)
    const timelineItems: DashboardTimelineItem[] = rawAppts.map((a: any) => ({
      id: a.id,
      time: a.time || '10:00 AM',
      title: a.patient,
      subtitle: a.type || 'Clinical Consultation',
      owner: a.doctor || 'Attending Physician',
      status: a.status || 'CONFIRMED',
      statusVariant: a.status === 'CONFIRMED' ? 'success' : 'warning',
    }));

    // Secondary Cards (Zone 7)
    const secondaryCards: DashboardSecondaryCard[] = [
      { id: 'sc_beds', title: 'Ward Bed Distribution', value: `${occupiedBeds} Occupied`, detail: `${totalBeds - occupiedBeds} beds sanitized and ready`, iconName: 'Bed', statusVariant: 'info' },
      { id: 'sc_er', title: 'ER Triage Status', value: 'Level 1 Operational', detail: 'All cardiac and stroke pathways clear', iconName: 'Activity', statusVariant: 'success' },
      { id: 'sc_rx', title: 'Digital Rx Issued', value: metrics.prescriptionsIssued || 4, detail: 'Validated via Digital Rx maker', iconName: 'FileText', statusVariant: 'success' },
    ];

    // Recent Activity (Zone 8)
    const recentActivity: DashboardRecentActivity[] = (auditLogs.length > 0 ? auditLogs.slice(0, 4) : [
      { id: 'act_1', timestamp: '12 min ago', title: 'Inpatient Admitted', description: 'Victoria Hawthorne assigned to Ward 3C · Bed 04', actor: 'Dr. Sarah Lin' },
      { id: 'act_2', timestamp: '26 min ago', title: 'Consultation Confirmed', description: 'Elena Rostova scheduled for Echocardiogram review', actor: 'Front Desk' },
      { id: 'act_3', timestamp: '48 min ago', title: 'Prescription Signed', description: 'Digital Rx issued for Rx #9902 (Atorvastatin 20mg)', actor: 'Dr. David Hayes' },
      { id: 'act_4', timestamp: '1 hr ago', title: 'Triage Updated', description: 'Patient PT-8941 marked as CRITICAL by triage nurse', actor: 'ER Dispatch' },
    ]).map((log: any, idx: number) => ({
      id: log.id || `act_${idx}`,
      timestamp: log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
      title: log.action ? log.action.replace(/_/g, ' ') : 'Operational Audit Event',
      description: log.details || 'Healthcare record synchronized',
      actor: log.niche || 'System',
    }));

    // Quick Actions (Zone 9)
    const quickActions: DashboardQuickAction[] = [
      { id: 'qa_admit', label: '+ Admit Patient', primary: true, onClick: callbacks?.onAdmit || (() => {}) },
      { id: 'qa_appt', label: '+ New Appointment', onClick: callbacks?.onAppointment || (() => {}) },
      { id: 'qa_rx', label: '+ Issue Digital Rx', onClick: callbacks?.onRx || (() => {}) },
    ];

    return {
      industry: 'healthcare',
      businessType: 'Hospital & Clinical Center',
      title:
        role === 'doctor'
          ? 'Physician Clinical Cockpit'
          : role === 'receptionist'
          ? 'Patient Reception & Admissions Desk'
          : role === 'billing'
          ? 'Healthcare Revenue & Billing Center'
          : 'Clinical Operations Command Hub',
      subtitle: 'Real-time inpatient care, triage queue, provider schedules, and EHR management.',
      categoryBadge: 'HEALTHCARE & CLINICAL ERP',
      availableRoles: [
        { id: 'admin', label: 'Hospital Admin' },
        { id: 'doctor', label: 'Attending Doctor' },
        { id: 'receptionist', label: 'Reception & Admissions' },
        { id: 'billing', label: 'Billing & Compliance' },
      ],
      currentRole: role,
      mode,
      attentionItems: filteredAttention,
      todayMetrics,
      primaryKpis,
      mainOperationTitle: 'Patient & Inpatient Clinical Queue',
      mainOperationSubtitle: 'Real-time patient census, attending care team, and ward placement',
      searchPlaceholder: 'Search by patient name, EHR ID, or department...',
      records,
      timelineTitle: "Today's Consultation Schedule",
      timelineSubtitle: 'Live synchronized consultation timeline',
      timelineItems,
      secondaryCards,
      recentActivity,
      quickActions,
    };
  }

  // =========================================================================
  // 2. REAL ESTATE COMMAND HUB
  // =========================================================================
  if (niche === 'realestate') {
    const properties = data.properties || [];
    const deals = data.deals || [];
    const showings = data.showings || [];
    const totalVolume = properties.reduce((acc: number, p: any) => acc + (p.price || 0), 0);
    const pendingVolume = deals.reduce((acc: number, d: any) => acc + (d.offerAmount || 0), 0);
    const commissions = deals.reduce((acc: number, d: any) => acc + (d.commissionAmount || 0), 0);

    const attentionItems: DashboardAttentionItem[] = [
      {
        id: 'att_re_1',
        severity: 'HIGH',
        title: 'Offer Expiration in 4 Hours on Penthouse Alpha',
        reason: '$4.2M offer from buyer syndicate awaiting client countersignature',
        timeAgo: '2 hr ago',
        owner: 'Alexander Wright (Senior Broker)',
        actionLabel: 'Review Offer',
      },
      {
        id: 'att_re_2',
        severity: 'MEDIUM',
        title: 'Inspection Contingency Due Today',
        reason: 'Escrow #401 (Bel Air Modern Estate) environmental audit report pending',
        timeAgo: 'Today',
        owner: 'Closing Desk',
        actionLabel: 'Track Escrow',
      },
    ];

    return {
      industry: 'realestate',
      businessType: 'Real Estate Brokerage',
      title:
        role === 'agent'
          ? 'Licensed Agent Deal Room'
          : role === 'coordinator'
          ? 'Escrow & Closing Operations Desk'
          : 'Property Operations Hub',
      subtitle: 'MLS property inventory, high-value deal pipeline, and buyer showing schedules.',
      categoryBadge: 'REAL ESTATE BROKERAGE',
      availableRoles: [
        { id: 'admin', label: 'Principal Broker' },
        { id: 'agent', label: 'Licensed Agent' },
        { id: 'coordinator', label: 'Closing Coordinator' },
      ],
      currentRole: role,
      mode,
      attentionItems,
      todayMetrics: [
        { id: 'tm_re_1', label: 'Active MLS Listings', value: properties.length || 3, subtext: `${DataSourceRegistry.formatCurrency(totalVolume)} portfolio volume`, iconName: 'Building' },
        { id: 'tm_re_2', label: 'Deals in Escrow', value: deals.length || 2, subtext: `${DataSourceRegistry.formatCurrency(pendingVolume)} pending closing`, iconName: 'Briefcase' },
        { id: 'tm_re_3', label: 'Private Showings Today', value: `${showings.length || 3} Tours`, subtext: 'High-intent qualified buyers', iconName: 'Calendar' },
        { id: 'tm_re_4', label: 'Avg Days on Market', value: '18 Days', subtext: '34% faster than metro benchmark', iconName: 'Clock' },
      ],
      primaryKpis: [
        { id: 'kpi_re_vol', label: 'Active Listing Volume', value: DataSourceRegistry.formatCurrency(totalVolume), delta: '+15% MoM', isPositive: true, subtext: 'Luxury residential & commercial' },
        { id: 'kpi_re_pipe', label: 'Pending Deals in Escrow', value: DataSourceRegistry.formatCurrency(pendingVolume), delta: `${deals.length} active escrows`, isPositive: true, subtext: 'Scheduled for Q4 closing' },
        { id: 'kpi_re_comm', label: 'Projected Commissions', value: DataSourceRegistry.formatCurrency(commissions || 345000), delta: '+8.2% vs target', isPositive: true, subtext: 'Gross agency commission' },
        { id: 'kpi_re_tours', label: 'Tours Completed Today', value: showings.length || 3, delta: '100% attendance', isPositive: true, subtext: 'Zero missed showings' },
      ],
      mainOperationTitle: 'Active Properties & Listing Portfolio',
      mainOperationSubtitle: 'MLS status, listing price, assigned agent, and scheduled viewings',
      searchPlaceholder: 'Search properties by title, address, or MLS ID...',
      records: properties.map((p: any) => ({
        id: p.id,
        primaryText: p.title,
        secondaryText: `${p.id} · ${p.location}`,
        groupText: p.propertyType || 'Luxury Residential',
        ownerText: p.agent || 'Alexander Wright',
        priority: p.status === 'UNDER_CONTRACT' ? 'HIGH' : 'NORMAL',
        location: p.location,
        status: p.status || 'ACTIVE',
        statusVariant: p.status === 'ACTIVE' ? 'success' : 'warning',
        actionLabel: 'View Listing',
        raw: p,
      })),
      timelineTitle: "Today's Scheduled Viewings",
      timelineSubtitle: 'Private broker and client showings',
      timelineItems: showings.map((s: any) => ({
        id: s.id,
        time: s.time || '14:00',
        title: s.property,
        subtitle: `Buyer: ${s.clientName}`,
        owner: s.agent || 'Alexander Wright',
        status: 'CONFIRMED',
        statusVariant: 'success',
      })),
      secondaryCards: [
        { id: 'sc_re_1', title: 'Buyer Match Rate', value: '92%', detail: 'AI Buyer Match engine actively pairing verified HNW clients', statusVariant: 'success' },
        { id: 'sc_re_2', title: 'Average Commission', value: '2.8%', detail: 'Contract average across active portfolio deals', statusVariant: 'info' },
      ],
      recentActivity: [
        { id: 're_act_1', timestamp: '18 min ago', title: 'MLS Listing Created', description: 'Added Malibu Oceanfront Villa ($8,500,000)', actor: 'MLS Sync Engine' },
        { id: 're_act_2', timestamp: '45 min ago', title: 'Showing Scheduled', description: 'Confirmed VIP showing for Bel Air Estate', actor: 'Front Desk' },
      ],
      quickActions: [
        { id: 'qa_re_1', label: '+ Create Listing', primary: true, onClick: () => callbacks?.onGeneralAction?.('CREATE_LISTING') },
        { id: 'qa_re_2', label: '+ Schedule Showing', onClick: () => callbacks?.onGeneralAction?.('SCHEDULE_SHOWING') },
      ],
    };
  }

  // =========================================================================
  // 3. RESTAURANT & HOSPITALITY HUB
  // =========================================================================
  if (niche === 'restaurant') {
    const tables = data.tables || [];
    const orders = data.kitchenOrders || [];
    const occupied = tables.filter((t: any) => t.status === 'OCCUPIED');
    const liveGrossSales = occupied.reduce((acc: number, t: any) => acc + (t.currentBill || t.billTotal || 0), 0);

    return {
      industry: 'restaurant',
      businessType: 'Restaurant & Dining Venue',
      title:
        role === 'chef'
          ? 'Executive Kitchen & Expedite Station'
          : role === 'host'
          ? 'Front of House & Maitre D\' Desk'
          : 'Restaurant Operations Hub',
      subtitle: 'Live dining room tables, Kitchen Order Tickets (KOT), and point-of-sale checkout.',
      categoryBadge: 'HOSPITALITY & DINING',
      availableRoles: [
        { id: 'admin', label: 'General Manager' },
        { id: 'chef', label: 'Head Chef' },
        { id: 'host', label: 'Host & Maitre D\'' },
      ],
      currentRole: role,
      mode,
      attentionItems: [
        {
          id: 'att_rest_1',
          severity: 'HIGH',
          title: 'Kitchen Ticket #KOT-09 Exceeding 18 Min Prep SLA',
          reason: 'Table T-02 main courses (Dry-Aged Ribeye) delayed at grill station',
          timeAgo: '19 min in prep',
          owner: 'Grill Station · Chef Marco',
          actionLabel: 'Expedite Ticket',
        },
        {
          id: 'att_rest_2',
          severity: 'MEDIUM',
          title: 'Low Stock Alert on Fresh Black Truffles',
          reason: 'Current inventory (2 units) below minimum evening par level (5 units)',
          timeAgo: '1 hr ago',
          owner: 'Pantry Lead',
          actionLabel: 'Order Par Stock',
        },
      ],
      todayMetrics: [
        { id: 'tm_rest_1', label: 'Tables Occupied', value: `${occupied.length} / ${tables.length}`, subtext: 'Floor occupancy: 62%', iconName: 'Utensils' },
        { id: 'tm_rest_2', label: 'Active Kitchen Tickets', value: `${orders.length} Tickets`, subtext: 'Avg turnaround: 14 mins', iconName: 'Clock' },
        { id: 'tm_rest_3', label: 'Live Floor Revenue', value: DataSourceRegistry.formatCurrency(liveGrossSales), subtext: 'Currently unbilled on open tables', iconName: 'DollarSign' },
        { id: 'tm_rest_4', label: 'Reservations Tonight', value: '48 Covers', subtext: 'Fully booked after 19:30', iconName: 'Calendar' },
      ],
      primaryKpis: [
        { id: 'kpi_rest_rev', label: 'Daily Floor Revenue', value: DataSourceRegistry.formatCurrency(liveGrossSales + 4200), delta: '+14% vs yesterday', isPositive: true, subtext: 'Total settled + open orders' },
        { id: 'kpi_rest_tables', label: 'Table Turnover Rate', value: '2.4x', delta: '42 min avg seating', isPositive: true, subtext: 'Fast, efficient service cycle' },
        { id: 'kpi_rest_kot', label: 'Kitchen Speed of Service', value: '13.8 min', delta: '-1.4 min vs target', isPositive: true, subtext: 'High kitchen throughput' },
        { id: 'kpi_rest_sat', label: 'Guest Rating Score', value: '4.9 / 5.0', delta: '98% positive reviews', isPositive: true, subtext: 'Top rated dining experience' },
      ],
      mainOperationTitle: 'Live Floor Tables & Seated Guests',
      mainOperationSubtitle: 'Real-time table status, seated party, bill subtotal, and service state',
      searchPlaceholder: 'Search tables by party name or table number...',
      records: tables.map((t: any) => ({
        id: t.id,
        primaryText: `Table ${t.tableNumber || t.id} (${t.capacity || 4} Top)`,
        secondaryText: t.guestName ? `Party: ${t.guestName}` : 'Table Ready & Set',
        groupText: t.section || 'Main Dining Hall',
        ownerText: t.serverName || 'Assigned Server',
        priority: t.status === 'OCCUPIED' ? 'HIGH' : 'NORMAL',
        location: `Section ${t.section || 'A'}`,
        status: t.status || 'AVAILABLE',
        statusVariant: t.status === 'AVAILABLE' ? 'success' : t.status === 'OCCUPIED' ? 'warning' : 'neutral',
        actionLabel: t.status === 'AVAILABLE' ? 'Seat Table' : 'Manage Bill',
        raw: t,
      })),
      timelineTitle: 'Active Kitchen Order Tickets (KOT)',
      timelineSubtitle: 'Live order prep progression',
      timelineItems: orders.map((o: any) => ({
        id: o.id,
        time: o.placedAt || '19:15',
        title: `Ticket ${o.id} · Table ${o.tableNumber}`,
        subtitle: Array.isArray(o.items) ? o.items.map((i: any) => `${i.qty}x ${i.name}`).join(', ') : 'Order items in prep',
        owner: o.chef || 'Grill & Expedite',
        status: o.status || 'PREPARING',
        statusVariant: o.status === 'PREPARING' ? 'warning' : 'success',
      })),
      secondaryCards: [
        { id: 'sc_rest_1', title: 'Bar & Wine Pairing Ratio', value: '42%', detail: '42% of dining parties ordered sommelier pairings', statusVariant: 'success' },
        { id: 'sc_rest_2', title: "86'd Menu Items", value: '0 Items', detail: 'All signature dishes fully available', statusVariant: 'success' },
      ],
      recentActivity: [
        { id: 'rest_act_1', timestamp: '8 min ago', title: 'Table Seated', description: 'Table T-01 seated party of 4 (James Montgomery)', actor: "Maitre D'" },
        { id: 'rest_act_2', timestamp: '22 min ago', title: 'KOT Dispatched', description: 'Kitchen ticket KOT-02 sent to saute station', actor: 'POS Terminal' },
      ],
      quickActions: [
        { id: 'qa_rest_1', label: '+ Seat Table', primary: true, onClick: () => callbacks?.onGeneralAction?.('SEAT_TABLE') },
        { id: 'qa_rest_2', label: '+ New Order (KOT)', onClick: () => callbacks?.onGeneralAction?.('CREATE_KOT') },
      ],
    };
  }

  // =========================================================================
  // 4. RETAIL & POS OPERATIONS HUB
  // =========================================================================
  if (niche === 'retail') {
    const products = data.catalogProducts || [];
    const sales = data.sales || [];
    const khata = data.khataCustomers || [];
    const totalSalesRevenue = sales.reduce((acc: number, s: any) => acc + (s.totalAmount || 0), 0);
    const lowStockCount = products.filter((p: any) => p.stock < 15).length;
    const totalKhataDue = khata.reduce((acc: number, c: any) => acc + (c.totalCreditDue || 0), 0);

    const attentionItems: DashboardAttentionItem[] = [];
    if (lowStockCount > 0 && isServiceEnabled('srv_inventory_stock')) {
      attentionItems.push({
        id: 'att_ret_1',
        severity: 'HIGH',
        title: `${lowStockCount} Product SKUs Nearing Out-of-Stock (< 15 units)`,
        reason: 'Immediate reorder recommended to prevent store stockouts',
        timeAgo: 'Updated live',
        owner: 'Inventory Lead',
        actionLabel: 'Restock SKUs',
      });
    }
    if (totalKhataDue > 0 && isServiceEnabled('srv_dual_khata')) {
      attentionItems.push({
        id: 'att_ret_2',
        severity: 'MEDIUM',
        title: `${DataSourceRegistry.formatCurrency(totalKhataDue)} in Overdue Khata Customer Credit`,
        reason: '3 regular accounts exceeding 30-day store credit settlement threshold',
        timeAgo: '1 hr ago',
        owner: 'Billing & Cashier',
        actionLabel: 'View Ledger',
      });
    }

    return {
      industry: 'retail',
      businessType: 'Retail & POS Store',
      title:
        role === 'cashier'
          ? 'Point of Sale Cash Register'
          : role === 'stock'
          ? 'Inventory & Stockroom Control'
          : 'Retail Operations Hub',
      subtitle: 'Real-time barcode inventory, POS register receipts, and customer Khata credit accounts.',
      categoryBadge: 'RETAIL & COMMERCE ERP',
      availableRoles: [
        { id: 'admin', label: 'Store Owner' },
        { id: 'manager', label: 'Store Manager' },
        { id: 'cashier', label: 'Cashier' },
        { id: 'stock', label: 'Inventory Lead' },
      ],
      currentRole: role,
      mode,
      attentionItems,
      todayMetrics: [
        { id: 'tm_ret_1', label: "Today's Gross Sales", value: DataSourceRegistry.formatCurrency(totalSalesRevenue || 4350), subtext: 'Cash, card & QR payments', iconName: 'DollarSign' },
        { id: 'tm_ret_2', label: 'Completed Transactions', value: `${sales.length || 18} Sales`, subtext: 'Zero returned orders', iconName: 'ShoppingBag' },
        { id: 'tm_ret_3', label: 'Active Catalog SKUs', value: products.length || 24, subtext: `${lowStockCount} low stock alerts`, iconName: 'Briefcase' },
        { id: 'tm_ret_4', label: 'Khata Credit Dues', value: DataSourceRegistry.formatCurrency(totalKhataDue || 1240), subtext: 'Customer credit receivables', iconName: 'CreditCard' },
      ],
      primaryKpis: [
        { id: 'kpi_ret_rev', label: "Today's Revenue", value: DataSourceRegistry.formatCurrency(totalSalesRevenue || 4350), delta: '+18% vs yesterday', isPositive: true, subtext: 'Total settled register receipts' },
        { id: 'kpi_ret_trans', label: 'Total Transactions', value: sales.length || 18, delta: '98% card/digital', isPositive: true, subtext: 'Throughput across 2 registers' },
        { id: 'kpi_ret_basket', label: 'Average Basket Size', value: '$84.50', delta: '+$6.20 MoM', isPositive: true, subtext: 'Avg transaction value' },
        { id: 'kpi_ret_lowstock', label: 'Low Stock SKUs', value: lowStockCount, delta: 'Restock initiated', isPositive: false, subtext: 'Units below safety stock' },
      ],
      mainOperationTitle: 'Product Catalog & Stockroom Inventory',
      mainOperationSubtitle: 'SKU barcode, category, current shelf stock, and unit retail price',
      searchPlaceholder: 'Search products by name, SKU, or barcode...',
      records: products.map((p: any) => ({
        id: p.id,
        primaryText: p.name,
        secondaryText: `Barcode: ${p.barcode || p.id} · Cat: ${p.category || 'Retail'}`,
        groupText: p.category || 'General Goods',
        ownerText: `${p.stock} units in stock`,
        priority: p.stock < 15 ? 'HIGH' : 'NORMAL',
        location: `$${p.price.toFixed(2)}`,
        status: p.stock < 15 ? 'LOW_STOCK' : 'IN_STOCK',
        statusVariant: p.stock < 15 ? 'warning' : 'success',
        actionLabel: 'Edit Product',
        raw: p,
      })),
      timelineTitle: 'Customer Khata Credit Accounts',
      timelineSubtitle: 'Store credit and receivables ledger',
      timelineItems: khata.map((k: any) => ({
        id: k.id,
        time: k.phone || 'Account',
        title: k.customerName,
        subtitle: `Credit Limit: $${(k.creditLimit || 500).toFixed(2)}`,
        owner: `${DataSourceRegistry.formatCurrency(k.totalCreditDue || 0)} Due`,
        status: k.status || 'ACTIVE',
        statusVariant: k.status === 'OVERDUE' ? 'warning' : 'success',
      })),
      secondaryCards: [
        { id: 'sc_ret_1', title: 'Top Velocity Category', value: 'Fresh Produce', detail: '38% of total register basket volume', statusVariant: 'success' },
        { id: 'sc_ret_2', title: 'Payment Method Split', value: '72% Card / POS', detail: '28% Cash & Instant Khata credit', statusVariant: 'info' },
      ],
      recentActivity: [
        { id: 'ret_act_1', timestamp: '5 min ago', title: 'POS Receipt Settled', description: 'Settled $142.50 via Visa Contactless · Register 1', actor: 'Cashier' },
        { id: 'ret_act_2', timestamp: '24 min ago', title: 'Barcode Printed', description: 'Generated 24 thermal shelf tags for SKU #9901', actor: 'Inventory Lead' },
      ],
      quickActions: [
        { id: 'qa_ret_pos', label: 'Open POS Register', primary: true, onClick: () => callbacks?.onGeneralAction?.('OPEN_POS') },
        { id: 'qa_ret_prod', label: '+ Add Product', onClick: () => callbacks?.onGeneralAction?.('ADD_PRODUCT') },
        { id: 'qa_ret_barcode', label: 'Print Barcodes', onClick: () => callbacks?.onGeneralAction?.('PRINT_BARCODES') },
      ],
    };
  }

  // =========================================================================
  // 5. B2B SAAS OPERATIONS HUB
  // =========================================================================
  if (niche === 'sme') {
    const subscriptions = data.subscriptions || [];
    const totalMrr = subscriptions.reduce((acc: number, s: any) => acc + (s.mrr || 0), 0);
    const pastDueAccounts = subscriptions.filter((s: any) => s.status === 'PAST_DUE').length;

    const attentionItems: DashboardAttentionItem[] = [];
    if (pastDueAccounts > 0) {
      attentionItems.push({
        id: 'att_saas_1',
        severity: 'HIGH',
        title: `${pastDueAccounts} Past Due Subscription Account${pastDueAccounts > 1 ? 's' : ''}`,
        reason: 'Payment retry failed on automated billing gateway · Churn risk',
        timeAgo: 'Failed 4 hr ago',
        owner: 'Customer Success & Billing',
        actionLabel: 'Resolve Billing',
      });
    }

    return {
      industry: 'sme',
      businessType: 'B2B SaaS & Tech Enterprise',
      title:
        role === 'sales'
          ? 'Sales Pipeline & New Accounts'
          : role === 'csm'
          ? 'Customer Success & Retention Hub'
          : 'SaaS Operations Hub',
      subtitle: 'Monthly recurring revenue, customer health scores, and automated subscription billing.',
      categoryBadge: 'B2B SAAS ENTERPRISE',
      availableRoles: [
        { id: 'admin', label: 'SaaS Executive' },
        { id: 'sales', label: 'Account Executive' },
        { id: 'csm', label: 'Customer Success' },
        { id: 'support', label: 'Support Lead' },
      ],
      currentRole: role,
      mode,
      attentionItems,
      todayMetrics: [
        { id: 'tm_saas_1', label: 'Monthly Recurring Rev', value: DataSourceRegistry.formatCurrency(totalMrr || 52300), subtext: 'Contracted active recurring', iconName: 'DollarSign' },
        { id: 'tm_saas_2', label: 'Active Tenant Orgs', value: subscriptions.length || 6, subtext: 'Zero customer churn this month', iconName: 'Building' },
        { id: 'tm_saas_3', label: 'Annualized Run-Rate', value: DataSourceRegistry.formatCurrency((totalMrr || 52300) * 12), subtext: 'Projected ARR trajectory', iconName: 'TrendingUp' },
        { id: 'tm_saas_4', label: 'Customer Health Avg', value: '91 / 100', subtext: 'High product engagement', iconName: 'Activity' },
      ],
      primaryKpis: [
        { id: 'kpi_saas_mrr', label: 'Monthly Recurring Revenue', value: DataSourceRegistry.formatCurrency(totalMrr || 52300), delta: '+14% MoM', isPositive: true, subtext: 'Active subscriber base' },
        { id: 'kpi_saas_arr', label: 'Annual Run Rate (ARR)', value: DataSourceRegistry.formatCurrency((totalMrr || 52300) * 12), delta: '+18% YoY', isPositive: true, subtext: 'Contracted annual pacing' },
        { id: 'kpi_saas_churn', label: 'Gross Logo Churn', value: '0.4%', delta: '-0.2% vs industry', isPositive: true, subtext: 'Top decile retention' },
        { id: 'kpi_saas_nps', label: 'Net Promoter Score', value: '+68', delta: 'Excellent cohort feedback', isPositive: true, subtext: 'B2B enterprise benchmark' },
      ],
      mainOperationTitle: 'Active SaaS Subscriptions & Accounts',
      mainOperationSubtitle: 'Customer account, subscription tier, MRR, health score, and renewal date',
      searchPlaceholder: 'Search accounts, domain, or plan tier...',
      records: subscriptions.map((s: any) => ({
        id: s.id,
        primaryText: s.account,
        secondaryText: `Plan: ${s.plan} · ${s.seats || 20} Seats`,
        groupText: DataSourceRegistry.formatCurrency(s.mrr) + '/mo',
        ownerText: `CSM: ${s.csmOwner || 'Sarah Chen'}`,
        priority: s.status === 'PAST_DUE' ? 'HIGH' : 'NORMAL',
        location: `Health: ${s.healthScore || 90}%`,
        status: s.status || 'ACTIVE',
        statusVariant: s.status === 'ACTIVE' ? 'success' : s.status === 'PAST_DUE' ? 'danger' : 'warning',
        actionLabel: 'View Account',
        raw: s,
      })),
      timelineTitle: 'Upcoming Contract Renewals',
      timelineSubtitle: '30-day renewal pipeline',
      timelineItems: subscriptions.map((s: any) => ({
        id: `ren_${s.id}`,
        time: s.renewalDate || 'Upcoming',
        title: s.account,
        subtitle: `${s.plan} · ${DataSourceRegistry.formatCurrency(s.mrr)} MRR`,
        owner: s.csmOwner || 'Customer Success',
        status: s.status === 'PAST_DUE' ? 'ACTION_REQUIRED' : 'AUTO_RENEW',
        statusVariant: s.status === 'PAST_DUE' ? 'warning' : 'success',
      })),
      secondaryCards: [
        { id: 'sc_saas_1', title: 'Net Dollar Retention', value: '118%', detail: 'Expansion revenue outpaces downgrades', statusVariant: 'success' },
        { id: 'sc_saas_2', title: 'AI Fleet Uptime', value: '99.98%', detail: 'All autonomous workflows healthy', statusVariant: 'success' },
      ],
      recentActivity: [
        { id: 'saas_act_1', timestamp: '15 min ago', title: 'Account Upgraded', description: 'Acme Robotics AI expanded to Dedicated Cluster (120 seats)', actor: 'Stripe Webhook' },
        { id: 'saas_act_2', timestamp: '42 min ago', title: 'Invoice Paid', description: 'Processed $12,500 renewal invoice', actor: 'Billing Gateway' },
      ],
      quickActions: [
        { id: 'qa_saas_sub', label: '+ Create Subscription', primary: true, onClick: () => callbacks?.onGeneralAction?.('CREATE_SUBSCRIPTION') },
        { id: 'qa_saas_cust', label: '+ Add Customer', onClick: () => callbacks?.onGeneralAction?.('ADD_CUSTOMER') },
      ],
    };
  }

  // =========================================================================
  // 6. CREATIVE AGENCY OPERATIONS HUB
  // =========================================================================
  if (niche === 'agency') {
    const deliverables = data.deliverables || [];
    const totalRetainers = deliverables.reduce((acc: number, d: any) => acc + (d.retainerAmount || 0), 0);
    const reviewPending = deliverables.filter((d: any) => d.status === 'CLIENT_REVIEW' || d.status === 'IN_REVIEW').length;

    const attentionItems: DashboardAttentionItem[] = [];
    if (reviewPending > 0) {
      attentionItems.push({
        id: 'att_ag_1',
        severity: 'HIGH',
        title: `${reviewPending} Creative Deliverables Awaiting Client Sign-Off`,
        reason: 'Q4 campaign creative and brand guidelines require sign-off before sprint deployment',
        timeAgo: 'Sent 6 hr ago',
        owner: 'Account Lead · Clara Oswald',
        actionLabel: 'Review Assets',
      });
    }

    return {
      industry: 'agency',
      businessType: 'Creative & Digital Agency',
      title:
        role === 'creative'
          ? 'Studio Creative Deliverables Desk'
          : role === 'pm'
          ? 'Project Milestones & Sprint Command'
          : 'Agency Operations Hub',
      subtitle: 'Client retainers, creative deliverable sprints, and campaign milestone tracking.',
      categoryBadge: 'CREATIVE AGENCY ERP',
      availableRoles: [
        { id: 'admin', label: 'Managing Director' },
        { id: 'pm', label: 'Project Manager' },
        { id: 'creative', label: 'Creative Lead' },
        { id: 'am', label: 'Account Manager' },
      ],
      currentRole: role,
      mode,
      attentionItems,
      todayMetrics: [
        { id: 'tm_ag_1', label: 'Active Client Sprints', value: deliverables.length || 5, subtext: `${reviewPending} in client review`, iconName: 'Briefcase' },
        { id: 'tm_ag_2', label: 'Monthly Retainer Value', value: DataSourceRegistry.formatCurrency(totalRetainers || 66500), subtext: 'Contracted agency retainers', iconName: 'DollarSign' },
        { id: 'tm_ag_3', label: 'Studio Utilization', value: '88.4%', subtext: 'Target: 85% capacity', iconName: 'Activity' },
        { id: 'tm_ag_4', label: 'On-Time Milestone SLA', value: '100%', subtext: 'All Q4 deliveries on schedule', iconName: 'CheckCircle2' },
      ],
      primaryKpis: [
        { id: 'kpi_ag_rev', label: 'Retainer Revenue', value: DataSourceRegistry.formatCurrency(totalRetainers || 66500), delta: '+12% MoM', isPositive: true, subtext: 'Recurring creative retainers' },
        { id: 'kpi_ag_sprints', label: 'Active Deliverables', value: deliverables.length || 5, delta: '100% on schedule', isPositive: true, subtext: 'Production milestones' },
        { id: 'kpi_ag_util', label: 'Billable Utilization', value: '88.4%', delta: '+3.4% vs target', isPositive: true, subtext: 'Creative studio throughput' },
        { id: 'kpi_ag_roas', label: 'Client Average ROAS', value: '4.8x', delta: 'Top campaign performance', isPositive: true, subtext: 'Ad creative attribution' },
      ],
      mainOperationTitle: 'Client Deliverables & Active Sprints',
      mainOperationSubtitle: 'Deliverable type, assigned creative lead, due date, and client approval state',
      searchPlaceholder: 'Search deliverables by client, name, or designer...',
      records: deliverables.map((d: any) => ({
        id: d.id,
        primaryText: d.deliverable,
        secondaryText: `Client: ${d.client} · Type: ${d.type}`,
        groupText: `Due: ${d.dueDate}`,
        ownerText: `Lead: ${d.leadDesigner}`,
        priority: d.status === 'CLIENT_REVIEW' ? 'HIGH' : 'NORMAL',
        location: d.type,
        status: d.status || 'IN_PRODUCTION',
        statusVariant: d.status === 'APPROVED' || d.status === 'LIVE' ? 'success' : d.status === 'CLIENT_REVIEW' ? 'warning' : 'info',
        actionLabel: 'View Sprint',
        raw: d,
      })),
      timelineTitle: 'Upcoming Sprint Deadlines',
      timelineSubtitle: 'Production milestone progression',
      timelineItems: deliverables.map((d: any) => ({
        id: `dl_${d.id}`,
        time: d.dueDate || 'Milestone',
        title: d.deliverable,
        subtitle: `Client: ${d.client}`,
        owner: d.leadDesigner,
        status: d.status,
        statusVariant: d.status === 'APPROVED' ? 'success' : 'warning',
      })),
      secondaryCards: [
        { id: 'sc_ag_1', title: 'Burned Retainer Hours', value: '298 / 360 hrs', detail: '82.7% of monthly allocation utilized', statusVariant: 'info' },
        { id: 'sc_ag_2', title: 'Asset Approval Velocity', value: '1.4 Days', detail: 'Average client feedback turnaround', statusVariant: 'success' },
      ],
      recentActivity: [
        { id: 'ag_act_1', timestamp: '20 min ago', title: 'Asset Approved', description: 'Elysian Luxury Villas approved Brand Identity Guidelines', actor: 'Client Portal' },
        { id: 'ag_act_2', timestamp: '1 hr ago', title: 'Sprint Started', description: 'Next.js 15 Configurator moved into production', actor: 'Devon Lee' },
      ],
      quickActions: [
        { id: 'qa_ag_del', label: '+ Create Deliverable', primary: true, onClick: () => callbacks?.onGeneralAction?.('CREATE_DELIVERABLE') },
        { id: 'qa_ag_prop', label: '+ Create Proposal', onClick: () => callbacks?.onGeneralAction?.('CREATE_PROPOSAL') },
      ],
    };
  }

  // =========================================================================
  // 7. MASTER ENTERPRISE COMMAND CENTER
  // =========================================================================
  if (niche === 'all') {
    const rawRecords = data.records || [];
    return {
      industry: 'all',
      businessType: 'Master Enterprise Conglomerate',
      title: 'Executive Operating Command Center',
      subtitle: 'Cross-division executive intelligence, governance, treasury, and autonomous agent orchestration.',
      categoryBadge: 'MASTER ENTERPRISE PLATFORM',
      availableRoles: [
        { id: 'admin', label: 'Chief Executive' },
        { id: 'operations', label: 'VP Operations' },
        { id: 'finance', label: 'Chief Financial Officer' },
        { id: 'technology', label: 'VP Technology' },
      ],
      currentRole: role,
      mode,
      attentionItems: [
        {
          id: 'att_ent_1',
          severity: 'HIGH',
          title: 'Cross-Subsidiary Financial Consolidation Ready',
          reason: 'End-of-month multi-currency ledger reconciliation pending executive approval',
          timeAgo: '1 hr ago',
          owner: 'Treasury & Audit',
          actionLabel: 'Review Consolidation',
        },
      ],
      todayMetrics: [
        { id: 'tm_ent_1', label: 'Connected Subsidiaries', value: '8 Divisions', subtext: 'Healthcare, Real Estate, Retail & Tech', iconName: 'Building' },
        { id: 'tm_ent_2', label: 'Active Enterprise Records', value: '1,420 Items', subtext: 'Synchronized in unified data mesh', iconName: 'Briefcase' },
        { id: 'tm_ent_3', label: 'Treasury Cash Flow', value: '$2.4M Net', subtext: '+14% operating margin', iconName: 'DollarSign' },
        { id: 'tm_ent_4', label: 'Security & SOC2 Health', value: '100% Compliant', subtext: 'Zero vulnerability flags', iconName: 'ShieldCheck' },
      ],
      primaryKpis: [
        { id: 'kpi_ent_rev', label: 'Consolidated Revenue', value: '$8.45M', delta: '+16.2% YoY', isPositive: true, subtext: 'Across all business divisions' },
        { id: 'kpi_ent_ops', label: 'Operational Efficiency', value: '94.2%', delta: '+3.1% vs benchmark', isPositive: true, subtext: 'OODA automated throughput' },
        { id: 'kpi_ent_cust', label: 'Global Client Accounts', value: '4,890', delta: '+320 this quarter', isPositive: true, subtext: 'Active relationship network' },
        { id: 'kpi_ent_agents', label: 'Governed AI Fleet', value: '38 Active', delta: '99.98% reliability', isPositive: true, subtext: 'Automated workforce agents' },
      ],
      mainOperationTitle: 'Cross-Division Operational Work Units',
      mainOperationSubtitle: 'High-priority business operations across all enabled enterprise modules',
      searchPlaceholder: 'Search enterprise records across all divisions...',
      records: [
        { id: 'REC-901', primaryText: 'Consolidated Inpatient Census', secondaryText: 'Clinical Command Hub · Ward 3C', groupText: 'Healthcare Division', ownerText: 'Dr. Sarah Lin', priority: 'HIGH', location: 'Metropolitan Medical Center', status: 'ACTIVE', statusVariant: 'success', actionLabel: 'Details' },
        { id: 'REC-902', primaryText: 'Penthouse Alpha Escrow Closing', secondaryText: 'MLS #89201 · $4.2M Sale', groupText: 'Real Estate Division', ownerText: 'Alexander Wright', priority: 'HIGH', location: 'Bel Air Modern Estate', status: 'PENDING_CLOSING', statusVariant: 'warning', actionLabel: 'Details' },
        { id: 'REC-903', primaryText: 'Enterprise SaaS Cluster Expansion', secondaryText: 'Acme Robotics AI · 120 Dedicated Seats', groupText: 'Technology Division', ownerText: 'Sarah Chen', priority: 'NORMAL', location: 'US-East Cluster', status: 'ACTIVE', statusVariant: 'success', actionLabel: 'Details' },
        { id: 'REC-904', primaryText: 'Flagship Store POS Inventory Restock', secondaryText: 'SKU #9901 · 240 Units Received', groupText: 'Retail Division', ownerText: 'Inventory Lead', priority: 'NORMAL', location: 'Downtown Store #01', status: 'COMPLETED', statusVariant: 'success', actionLabel: 'Details' },
      ],
      timelineTitle: 'Executive Governance Schedule',
      timelineSubtitle: 'Scheduled executive and compliance checkpoints',
      timelineItems: [
        { id: 'ent_time_1', time: '10:00 AM', title: 'Boardroom Treasury Briefing', subtitle: 'Consolidated financial forecast', owner: 'CFO Desk', status: 'CONFIRMED', statusVariant: 'success' },
        { id: 'ent_time_2', time: '14:30 PM', title: 'Security & Audit Checkpoint', subtitle: 'SOC2 Type II verification review', owner: 'Chief Information Security Officer', status: 'CONFIRMED', statusVariant: 'success' },
      ],
      secondaryCards: [
        { id: 'sc_ent_1', title: 'Global System Uptime', value: '99.99%', detail: 'All microservices operational', statusVariant: 'success' },
        { id: 'sc_ent_2', title: 'Audit Trail Events', value: '18,420 Today', detail: 'Immutable tenant event stream', statusVariant: 'info' },
      ],
      recentActivity: [
        { id: 'ent_act_1', timestamp: '10 min ago', title: 'Financial Consolidation Completed', description: 'Reconciled multi-currency accounts across 4 divisions', actor: 'Treasury Engine' },
        { id: 'ent_act_2', timestamp: '35 min ago', title: 'AI Fleet Health Check', description: 'All 38 autonomous agents verified healthy', actor: 'Sentinel' },
      ],
      quickActions: [
        { id: 'qa_ent_audit', label: 'Run Enterprise Audit', primary: true, onClick: () => callbacks?.onGeneralAction?.('RUN_AUDIT') },
        { id: 'qa_ent_report', label: 'Consolidated BI Deck', onClick: () => callbacks?.onGeneralAction?.('VIEW_REPORTS') },
      ],
    };
  }

  // =========================================================================
  // 8. DYNAMIC CUSTOM WORKSPACES
  // (Construction, Legal, Logistics, Fitness, Automotive, or Blueprint Custom)
  // =========================================================================
  const rawRecords = data.records || [];
  const totalCount = rawRecords.length || 3;
  const activeCount = rawRecords.filter((r: any) => !['Completed', 'Delivered', 'Ready'].includes(r.status)).length || 2;
  const niceTitle = niche.charAt(0).toUpperCase() + niche.slice(1);

  return {
    industry: niche,
    businessType: `${niceTitle} Operations`,
    title: `${niceTitle} Operations Command Hub`,
    subtitle: `Operational command, live work queue, and automated business capabilities for ${niceTitle}.`,
    categoryBadge: `${niceTitle.toUpperCase()} WORKSPACE`,
    availableRoles: [
      { id: 'admin', label: 'Operations Lead' },
      { id: 'specialist', label: 'Field Specialist' },
      { id: 'auditor', label: 'Quality Auditor' },
    ],
    currentRole: role,
    mode,
    attentionItems: [
      {
        id: `att_${niche}_1`,
        severity: 'HIGH',
        title: `Priority Milestone Awaiting Inspection in ${niceTitle}`,
        reason: 'SLA milestone requires operational sign-off and safety audit verification',
        timeAgo: '35 min ago',
        owner: 'Lead Specialist',
        actionLabel: 'Review Milestone',
      },
    ],
    todayMetrics: [
      { id: `tm_${niche}_1`, label: 'Active Work Units', value: totalCount, subtext: `${activeCount} currently in progress`, iconName: 'Briefcase' },
      { id: `tm_${niche}_2`, label: 'Completed Deliverables', value: Math.max(0, totalCount - activeCount), subtext: '100% QA verified', iconName: 'CheckCircle2' },
      { id: `tm_${niche}_3`, label: 'SLA Performance', value: '98.4%', subtext: 'On-schedule execution', iconName: 'Clock' },
      { id: `tm_${niche}_4`, label: 'Compliance Status', value: 'Active', subtext: 'Enterprise security verified', iconName: 'ShieldCheck' },
    ],
    primaryKpis: [
      { id: `kpi_${niche}_1`, label: 'Active Projects', value: totalCount, delta: '+8% MoM', isPositive: true, subtext: 'Tracked in workspace' },
      { id: `kpi_${niche}_2`, label: 'SLA Completion Rate', value: '98.4%', delta: '+2.1% vs target', isPositive: true, subtext: 'Active milestones' },
      { id: `kpi_${niche}_3`, label: 'Operations Value', value: DataSourceRegistry.formatCurrency(240000), delta: '+12% vs last month', isPositive: true, subtext: 'Pipeline in execution' },
      { id: `kpi_${niche}_4`, label: 'Audit Trail Health', value: '100% Logged', delta: 'Zero compliance flags', isPositive: true, subtext: 'Immutable event stream' },
    ],
    mainOperationTitle: `${niceTitle} Operational Work Queue`,
    mainOperationSubtitle: 'Primary records, assigned specialists, status progression, and verified deliverables',
    searchPlaceholder: `Search ${niceTitle} records, IDs, or specialists...`,
    records: rawRecords.map((r: any) => ({
      id: r.id,
      primaryText: r.name,
      secondaryText: `${r.id} · ${r.primaryField || 'Record Entry'}`,
      groupText: r.secondaryField || 'Operations Unit',
      ownerText: 'Assigned Specialist',
      priority: r.status === 'Completed' || r.status === 'Delivered' ? 'NORMAL' : 'HIGH',
      location: r.amount || 'Verified',
      status: r.status || 'Active',
      statusVariant: r.status === 'Completed' || r.status === 'Delivered' ? 'success' : 'warning',
      actionLabel: 'Details',
      raw: r,
    })),
    timelineTitle: `Today's ${niceTitle} Milestones`,
    timelineSubtitle: 'Scheduled operational progression',
    timelineItems: rawRecords.slice(0, 3).map((r: any, idx: number) => ({
      id: `time_${r.id}`,
      time: ['09:30', '13:00', '16:30'][idx] || '11:00',
      title: r.name,
      subtitle: r.primaryField || 'Milestone verification',
      owner: 'Lead Operator',
      status: r.status || 'In-Progress',
      statusVariant: r.status === 'Completed' ? 'success' : 'warning',
    })),
    secondaryCards: [
      { id: `sc_${niche}_1`, title: 'Capacity Utilization', value: '84%', detail: 'Resource bandwidth balanced across active pipeline', statusVariant: 'success' },
      { id: `sc_${niche}_2`, title: 'Automated Event Hooks', value: '12 Active', detail: 'Real-time workflow triggers syncing across services', statusVariant: 'info' },
    ],
    recentActivity: [
      { id: `act_${niche}_1`, timestamp: '14 min ago', title: 'Record Status Advanced', description: 'Milestone verified and progressed to active state', actor: 'Workflow Engine' },
      { id: `act_${niche}_2`, timestamp: '40 min ago', title: 'Audit Checkpoint Created', description: 'Automated compliance check passed without exceptions', actor: 'Security Sentinel' },
    ],
    quickActions: [
      { id: `qa_${niche}_1`, label: '+ Create Record', primary: true, onClick: () => callbacks?.onGeneralAction?.('CREATE_RECORD') },
      { id: `qa_${niche}_2`, label: '+ Run Audit', onClick: () => callbacks?.onGeneralAction?.('RUN_AUDIT') },
    ],
  };
}
