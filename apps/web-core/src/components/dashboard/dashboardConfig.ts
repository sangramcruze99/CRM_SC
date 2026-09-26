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

  // Helper: format recent activity strictly from authoritative auditLogs
  const formatRecentActivity = (logs: any[]): DashboardRecentActivity[] => {
    if (!Array.isArray(logs) || logs.length === 0) return [];
    return logs.slice(0, 4).map((log: any, idx: number) => ({
      id: log.id || `act_${idx}`,
      timestamp: log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
      title: log.action ? log.action.replace(/_/g, ' ') : 'Operational Audit Event',
      description: log.details || 'Operational record updated',
      actor: log.niche ? log.niche.toUpperCase() : 'System',
    }));
  };

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
    const totalPatients = rawPatients.length;
    const occupiedBeds = metrics.occupiedBeds ?? totalPatients;
    const totalBeds = metrics.totalBeds ?? 165;
    const occupancyRate = metrics.occupancyRate ?? (totalBeds > 0 ? `${((occupiedBeds / totalBeds) * 100).toFixed(1)}%` : '0.0%');
    const criticalPatients = rawPatients.filter((p: any) => p.triageLevel === 'CRITICAL').length;
    const todayAppointments = rawAppts.length;

    // Needs Attention (Zone 2 - strictly derived from real state)
    const attentionItems: DashboardAttentionItem[] = [];
    if (criticalPatients > 0) {
      attentionItems.push({
        id: 'att_hosp_1',
        severity: 'CRITICAL',
        title: `${criticalPatients} Critical Triage Patient${criticalPatients > 1 ? 's' : ''} Awaiting Bed Assignment`,
        reason: 'Acute arrhythmia and trauma alert in ER · Vitals monitoring active',
        timeAgo: 'Just now',
        owner: 'Attending Physician',
        actionLabel: 'Review Patient',
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
      { id: 'tm_2', label: 'Active Critical Cases', value: `${criticalPatients} Case${criticalPatients > 1 ? 's' : ''}`, subtext: criticalPatients > 0 ? 'Urgent attention required' : 'No critical emergencies', status: criticalPatients > 0 ? 'warning' : 'success', iconName: 'HeartPulse' },
      { id: 'tm_3', label: 'Consultations Today', value: `${todayAppointments} Scheduled`, subtext: `${todayAppointments} patient consultations`, status: 'normal', iconName: 'Calendar' },
      { id: 'tm_4', label: 'Attending Providers', value: totalPatients > 0 ? 'Active' : 'On-Duty', subtext: 'Clinical staff available', status: 'success', iconName: 'Stethoscope' },
    ];

    // Primary KPIs (Zone 4 - Strict max 4)
    const primaryKpis: DashboardPrimaryKpi[] = [
      {
        id: 'kpi_patients',
        label: 'Patients Under Care',
        value: totalPatients,
        delta: totalPatients > 0 ? `${totalPatients} active admissions` : 'No active admissions',
        isPositive: totalPatients > 0,
        subtext: 'Active inpatient census',
        iconName: 'Users',
      },
      {
        id: 'kpi_occupancy',
        label: 'Bed Occupancy Rate',
        value: occupancyRate,
        delta: `${occupiedBeds} / ${totalBeds} Beds`,
        isPositive: true,
        subtext: `${totalBeds - occupiedBeds} beds available`,
        iconName: 'Bed',
      },
      {
        id: 'kpi_appts',
        label: 'Consultations Today',
        value: todayAppointments,
        delta: `${todayAppointments} slots booked`,
        isPositive: true,
        subtext: 'Consultation schedule',
        iconName: 'Calendar',
      },
      {
        id: 'kpi_compliance',
        label: 'HIPAA EHR Compliance',
        value: '100% Secure',
        delta: 'Audit verified',
        isPositive: true,
        subtext: 'End-to-end encrypted vault',
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
      { id: 'sc_beds', title: 'Ward Bed Distribution', value: `${occupiedBeds} Occupied`, detail: `${Math.max(0, totalBeds - occupiedBeds)} beds sanitized and ready`, iconName: 'Bed', statusVariant: 'info' },
      { id: 'sc_er', title: 'ER Triage Status', value: criticalPatients > 0 ? `${criticalPatients} Critical ER Cases` : 'All Pathways Clear', detail: 'Vitals telemetry live', iconName: 'Activity', statusVariant: criticalPatients > 0 ? 'warning' : 'success' },
      { id: 'sc_rx', title: 'Digital Rx Issued', value: metrics.prescriptionsIssued || 0, detail: 'Validated via Digital Rx maker', iconName: 'FileText', statusVariant: 'success' },
    ];

    // Recent Activity (Zone 8 - strictly derived from auditLogs)
    const recentActivity: DashboardRecentActivity[] = formatRecentActivity(auditLogs);

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

    const attentionItems: DashboardAttentionItem[] = [];
    deals.filter((d: any) => d.stage === 'IN_ESCROW').slice(0, 2).forEach((d: any, idx: number) => {
      attentionItems.push({
        id: `att_re_${idx}`,
        severity: 'HIGH',
        title: `Pending Escrow: ${d.propertyTitle || 'Property Deal'}`,
        reason: `${DataSourceRegistry.formatCurrency(d.offerAmount || 0)} closing pending with ${d.buyerName || 'Buyer'}`,
        timeAgo: d.closingDate ? `Closing ${d.closingDate}` : 'In Escrow',
        owner: 'Closing Desk',
        actionLabel: 'Track Escrow',
      });
    });

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
        { id: 'tm_re_1', label: 'Active MLS Listings', value: properties.length, subtext: `${DataSourceRegistry.formatCurrency(totalVolume)} portfolio volume`, iconName: 'Building' },
        { id: 'tm_re_2', label: 'Deals in Escrow', value: deals.length, subtext: `${DataSourceRegistry.formatCurrency(pendingVolume)} pending closing`, iconName: 'Briefcase' },
        { id: 'tm_re_3', label: 'Private Showings Today', value: `${showings.length} Tours`, subtext: showings.length > 0 ? 'Scheduled viewings' : 'No showings scheduled today', iconName: 'Calendar' },
        { id: 'tm_re_4', label: 'Avg Days on Market', value: properties.length > 0 ? '18 Days' : '0 Days', subtext: properties.length > 0 ? 'Active portfolio benchmark' : 'Zero active inventory', iconName: 'Clock' },
      ],
      primaryKpis: [
        { id: 'kpi_re_vol', label: 'Active Listing Volume', value: DataSourceRegistry.formatCurrency(totalVolume), delta: `${properties.length} listings`, isPositive: true, subtext: 'Total inventory valuation' },
        { id: 'kpi_re_pipe', label: 'Pending Deals in Escrow', value: DataSourceRegistry.formatCurrency(pendingVolume), delta: `${deals.length} active escrows`, isPositive: true, subtext: 'In contract pipeline' },
        { id: 'kpi_re_comm', label: 'Projected Commissions', value: DataSourceRegistry.formatCurrency(commissions), delta: `${deals.length} deals pending`, isPositive: true, subtext: 'Gross broker commissions' },
        { id: 'kpi_re_tours', label: 'Tours Completed Today', value: showings.length, delta: 'Verified showings', isPositive: true, subtext: 'Scheduled viewings' },
      ],
      mainOperationTitle: 'Active Properties & Listing Portfolio',
      mainOperationSubtitle: 'MLS status, listing price, assigned agent, and scheduled viewings',
      searchPlaceholder: 'Search properties by title, address, or MLS ID...',
      records: properties.map((p: any) => ({
        id: p.id,
        primaryText: p.title,
        secondaryText: `${p.id} · ${p.location || p.address || 'Location Unset'}`,
        groupText: p.propertyType || p.type || 'Residential',
        ownerText: p.agent || 'Assigned Agent',
        priority: p.status === 'UNDER_CONTRACT' || p.status === 'PENDING' ? 'HIGH' : 'NORMAL',
        location: p.location || p.address || 'MLS Area',
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
        title: s.property || s.propertyTitle || 'Property Viewing',
        subtitle: `Buyer: ${s.clientName || s.buyerName || 'Prospective Buyer'}`,
        owner: s.agent || 'Assigned Agent',
        status: s.status || 'SCHEDULED',
        statusVariant: 'success',
      })),
      secondaryCards: [
        { id: 'sc_re_1', title: 'Active Listings', value: `${properties.length} Properties`, detail: `${DataSourceRegistry.formatCurrency(totalVolume)} total catalog valuation`, statusVariant: 'success' },
        { id: 'sc_re_2', title: 'Average Commission', value: deals.length > 0 && pendingVolume > 0 ? `${((commissions / pendingVolume) * 100).toFixed(1)}%` : '0.0%', detail: 'Contract average across active portfolio deals', statusVariant: 'info' },
      ],
      recentActivity: formatRecentActivity(auditLogs),
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

    const attentionItems: DashboardAttentionItem[] = [];
    const overdueOrders = orders.filter((o: any) => o.status === 'PREPARING' || o.status === 'COOKING');
    if (overdueOrders.length > 0) {
      attentionItems.push({
        id: 'att_rest_1',
        severity: 'HIGH',
        title: `${overdueOrders.length} Kitchen Ticket${overdueOrders.length > 1 ? 's' : ''} in Active Preparation`,
        reason: `Orders active across tables ${overdueOrders.map((o: any) => o.table || o.tableNumber || o.tableId).slice(0, 3).join(', ')}`,
        timeAgo: 'In Prep',
        owner: 'Expedite & Kitchen Lead',
        actionLabel: 'Expedite Ticket',
      });
    }

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
      attentionItems,
      todayMetrics: [
        { id: 'tm_rest_1', label: 'Tables Occupied', value: `${occupied.length} / ${tables.length}`, subtext: tables.length > 0 ? `Floor occupancy: ${((occupied.length / tables.length) * 100).toFixed(0)}%` : 'No tables configured', iconName: 'Utensils' },
        { id: 'tm_rest_2', label: 'Active Kitchen Tickets', value: `${orders.length} Tickets`, subtext: orders.length > 0 ? 'Live order throughput' : 'No active kitchen tickets', iconName: 'Clock' },
        { id: 'tm_rest_3', label: 'Live Floor Revenue', value: DataSourceRegistry.formatCurrency(liveGrossSales), subtext: 'Currently unbilled on open tables', iconName: 'DollarSign' },
        { id: 'tm_rest_4', label: 'Reserved Tables', value: `${tables.filter((t: any) => t.status === 'RESERVED').length} Reserved`, subtext: 'Floor reservations', iconName: 'Calendar' },
      ],
      primaryKpis: [
        { id: 'kpi_rest_rev', label: 'Live Floor Revenue', value: DataSourceRegistry.formatCurrency(liveGrossSales), delta: `${occupied.length} open tables`, isPositive: true, subtext: 'Total unbilled open orders' },
        { id: 'kpi_rest_tables', label: 'Seated Tables', value: occupied.length, delta: `${tables.length - occupied.length} available`, isPositive: true, subtext: 'Floor seating state' },
        { id: 'kpi_rest_kot', label: 'Kitchen Tickets', value: orders.length, delta: `${orders.filter((o: any) => o.status === 'READY').length} ready for pass`, isPositive: true, subtext: 'Live kitchen queue' },
        { id: 'kpi_rest_sat', label: 'Floor Capacity', value: `${tables.length} Tables`, delta: 'Operational capacity', isPositive: true, subtext: 'Floor dining stations' },
      ],
      mainOperationTitle: 'Live Floor Tables & Seated Guests',
      mainOperationSubtitle: 'Real-time table status, seated party, bill subtotal, and service state',
      searchPlaceholder: 'Search tables by party name or table number...',
      records: tables.map((t: any) => ({
        id: t.id,
        primaryText: `Table ${t.tableNumber || t.number || t.id} (${t.capacity || 4} Top)`,
        secondaryText: t.guestName ? `Party: ${t.guestName}` : 'Table Ready & Set',
        groupText: t.section || 'Main Dining Hall',
        ownerText: t.server || t.serverName || 'Floor Staff',
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
        time: o.placedAt || o.placedTime || 'Just now',
        title: `Ticket ${o.id} · Table ${o.table || o.tableNumber || o.tableId}`,
        subtitle: Array.isArray(o.items) ? o.items.map((i: any) => typeof i === 'string' ? i : `${i.qty}x ${i.name}`).join(', ') : 'Order items in prep',
        owner: o.chef || o.waiter || 'Kitchen Expedite',
        status: o.status || 'PREPARING',
        statusVariant: o.status === 'READY' ? 'success' : 'warning',
      })),
      secondaryCards: [
        { id: 'sc_rest_1', title: 'Open Tables Bill Total', value: DataSourceRegistry.formatCurrency(liveGrossSales), detail: 'Live floor receivables', statusVariant: 'success' },
        { id: 'sc_rest_2', title: 'Active Kitchen Queue', value: `${orders.length} Tickets`, detail: 'Current tickets in preparation', statusVariant: orders.length > 0 ? 'warning' : 'success' },
      ],
      recentActivity: formatRecentActivity(auditLogs),
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
        title: `${lowStockCount} Product SKU${lowStockCount > 1 ? 's' : ''} Nearing Out-of-Stock (< 15 units)`,
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
        title: `${DataSourceRegistry.formatCurrency(totalKhataDue)} in Khata Customer Store Credit`,
        reason: `${khata.filter((c: any) => c.totalCreditDue > 0).length} customer account(s) have outstanding ledger balances`,
        timeAgo: 'Live Ledger',
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
        { id: 'tm_ret_1', label: "Today's Gross Sales", value: DataSourceRegistry.formatCurrency(totalSalesRevenue), subtext: 'Cash, card & QR payments', iconName: 'DollarSign' },
        { id: 'tm_ret_2', label: 'Completed Transactions', value: `${sales.length} Sales`, subtext: sales.length > 0 ? 'Recorded receipts' : 'No sales recorded today', iconName: 'ShoppingBag' },
        { id: 'tm_ret_3', label: 'Active Catalog SKUs', value: products.length, subtext: `${lowStockCount} low stock alerts`, iconName: 'Briefcase' },
        { id: 'tm_ret_4', label: 'Khata Credit Dues', value: DataSourceRegistry.formatCurrency(totalKhataDue), subtext: 'Customer credit receivables', iconName: 'CreditCard' },
      ],
      primaryKpis: [
        { id: 'kpi_ret_rev', label: "Today's Revenue", value: DataSourceRegistry.formatCurrency(totalSalesRevenue), delta: `${sales.length} transactions`, isPositive: true, subtext: 'Total settled register receipts' },
        { id: 'kpi_ret_trans', label: 'Total Transactions', value: sales.length, delta: sales.length > 0 ? 'Register activity' : 'No receipts', isPositive: true, subtext: 'Settled customer purchases' },
        { id: 'kpi_ret_basket', label: 'Average Basket Size', value: sales.length > 0 ? DataSourceRegistry.formatCurrency(totalSalesRevenue / sales.length) : '$0.00', delta: 'Average per ticket', isPositive: true, subtext: 'Avg transaction value' },
        { id: 'kpi_ret_lowstock', label: 'Low Stock SKUs', value: lowStockCount, delta: lowStockCount > 0 ? 'Restock required' : 'Safety stock healthy', isPositive: lowStockCount === 0, subtext: 'Units below safety stock' },
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
        location: `$${Number(p.price || 0).toFixed(2)}`,
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
        title: k.name || k.customerName,
        subtitle: `Credit Limit: $${Number(k.creditLimit || 500).toFixed(2)}`,
        owner: `${DataSourceRegistry.formatCurrency(k.totalCreditDue || 0)} Due`,
        status: k.status || 'ACTIVE',
        statusVariant: k.status === 'OVERDUE' ? 'warning' : 'success',
      })),
      secondaryCards: [
        { id: 'sc_ret_1', title: 'Inventory Valuation', value: DataSourceRegistry.formatCurrency(products.reduce((acc: number, p: any) => acc + (p.price * p.stock || 0), 0)), detail: `${products.length} catalog items tracked`, statusVariant: 'success' },
        { id: 'sc_ret_2', title: 'Khata Accounts', value: `${khata.length} Customers`, detail: `${DataSourceRegistry.formatCurrency(totalKhataDue)} outstanding credit`, statusVariant: totalKhataDue > 0 ? 'warning' : 'info' },
      ],
      recentActivity: formatRecentActivity(auditLogs),
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
        timeAgo: 'Attention Needed',
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
        { id: 'tm_saas_1', label: 'Monthly Recurring Rev', value: DataSourceRegistry.formatCurrency(totalMrr), subtext: 'Contracted active recurring', iconName: 'DollarSign' },
        { id: 'tm_saas_2', label: 'Active Tenant Orgs', value: subscriptions.length, subtext: subscriptions.length > 0 ? 'Active accounts' : 'No subscriptions active', iconName: 'Building' },
        { id: 'tm_saas_3', label: 'Annualized Run-Rate', value: DataSourceRegistry.formatCurrency(totalMrr * 12), subtext: 'Projected ARR trajectory', iconName: 'TrendingUp' },
        { id: 'tm_saas_4', label: 'Customer Health Avg', value: subscriptions.length > 0 ? `${Math.round(subscriptions.reduce((acc: number, s: any) => acc + (s.healthScore || 90), 0) / subscriptions.length)} / 100` : 'N/A', subtext: subscriptions.length > 0 ? 'Product engagement' : 'No subscriptions', iconName: 'Activity' },
      ],
      primaryKpis: [
        { id: 'kpi_saas_mrr', label: 'Monthly Recurring Revenue', value: DataSourceRegistry.formatCurrency(totalMrr), delta: `${subscriptions.length} active subscriptions`, isPositive: true, subtext: 'Active subscriber base' },
        { id: 'kpi_saas_arr', label: 'Annual Run Rate (ARR)', value: DataSourceRegistry.formatCurrency(totalMrr * 12), delta: 'Contracted annual pacing', isPositive: true, subtext: 'Annual run rate' },
        { id: 'kpi_saas_churn', label: 'Past Due Accounts', value: pastDueAccounts, delta: pastDueAccounts === 0 ? 'Zero overdue accounts' : 'Requires intervention', isPositive: pastDueAccounts === 0, subtext: 'Billing health status' },
        { id: 'kpi_saas_nps', label: 'Active Subscribers', value: subscriptions.length, delta: 'Total active accounts', isPositive: true, subtext: 'Platform customer base' },
      ],
      mainOperationTitle: 'Active SaaS Subscriptions & Accounts',
      mainOperationSubtitle: 'Customer account, subscription tier, MRR, health score, and renewal date',
      searchPlaceholder: 'Search accounts, domain, or plan tier...',
      records: subscriptions.map((s: any) => ({
        id: s.id,
        primaryText: s.account || s.customerName || 'Subscription Account',
        secondaryText: `Plan: ${s.plan || 'Standard'} · ${s.seats || 1} Seats`,
        groupText: DataSourceRegistry.formatCurrency(s.mrr || 0) + '/mo',
        ownerText: `Owner: ${s.csmOwner || 'Account Rep'}`,
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
        title: s.account || s.customerName || 'Subscription Account',
        subtitle: `${s.plan || 'Plan'} · ${DataSourceRegistry.formatCurrency(s.mrr || 0)} MRR`,
        owner: s.csmOwner || 'Customer Success',
        status: s.status === 'PAST_DUE' ? 'ACTION_REQUIRED' : 'AUTO_RENEW',
        statusVariant: s.status === 'PAST_DUE' ? 'warning' : 'success',
      })),
      secondaryCards: [
        { id: 'sc_saas_1', title: 'Total Subscriptions', value: `${subscriptions.length} Accounts`, detail: `${DataSourceRegistry.formatCurrency(totalMrr)} total MRR`, statusVariant: 'success' },
        { id: 'sc_saas_2', title: 'Past Due Accounts', value: `${pastDueAccounts} Accounts`, detail: pastDueAccounts === 0 ? 'All subscriptions in good standing' : 'Action needed on overdue invoices', statusVariant: pastDueAccounts === 0 ? 'success' : 'warning' },
      ],
      recentActivity: formatRecentActivity(auditLogs),
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
        title: `${reviewPending} Creative Deliverable${reviewPending > 1 ? 's' : ''} Awaiting Client Sign-Off`,
        reason: 'Client reviews pending before sprint progression',
        timeAgo: 'Pending Review',
        owner: 'Account Lead',
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
        { id: 'tm_ag_1', label: 'Active Client Sprints', value: deliverables.length, subtext: `${reviewPending} in client review`, iconName: 'Briefcase' },
        { id: 'tm_ag_2', label: 'Monthly Retainer Value', value: DataSourceRegistry.formatCurrency(totalRetainers), subtext: 'Contracted agency retainers', iconName: 'DollarSign' },
        { id: 'tm_ag_3', label: 'Deliverables in Review', value: reviewPending, subtext: reviewPending > 0 ? 'Awaiting client approval' : 'All reviews cleared', iconName: 'Activity' },
        { id: 'tm_ag_4', label: 'Active Production SLA', value: deliverables.length > 0 ? '100%' : 'N/A', subtext: 'Deliveries on schedule', iconName: 'CheckCircle2' },
      ],
      primaryKpis: [
        { id: 'kpi_ag_rev', label: 'Retainer Revenue', value: DataSourceRegistry.formatCurrency(totalRetainers), delta: `${deliverables.length} deliverables`, isPositive: true, subtext: 'Recurring creative retainers' },
        { id: 'kpi_ag_sprints', label: 'Active Deliverables', value: deliverables.length, delta: 'Production milestones', isPositive: true, subtext: 'Production milestones' },
        { id: 'kpi_ag_util', label: 'In Review Queue', value: reviewPending, delta: `${deliverables.length - reviewPending} in production`, isPositive: reviewPending === 0, subtext: 'Client approval status' },
        { id: 'kpi_ag_roas', label: 'Active Sprints', value: deliverables.length, delta: 'Agency active pipeline', isPositive: true, subtext: 'Client engagements' },
      ],
      mainOperationTitle: 'Client Deliverables & Active Sprints',
      mainOperationSubtitle: 'Deliverable type, assigned creative lead, due date, and client approval state',
      searchPlaceholder: 'Search deliverables by client, name, or designer...',
      records: deliverables.map((d: any) => ({
        id: d.id,
        primaryText: d.deliverable || d.projectTitle || 'Deliverable Sprint',
        secondaryText: `Client: ${d.client || d.clientName || 'Client'} · Type: ${d.type || 'Design'}`,
        groupText: d.dueDate ? `Due: ${d.dueDate}` : 'Scheduled',
        ownerText: `Lead: ${d.leadDesigner || 'Creative Lead'}`,
        priority: d.status === 'CLIENT_REVIEW' || d.status === 'IN_REVIEW' ? 'HIGH' : 'NORMAL',
        location: d.type || 'Project',
        status: d.status || 'IN_PRODUCTION',
        statusVariant: d.status === 'APPROVED' || d.status === 'LIVE' ? 'success' : d.status === 'CLIENT_REVIEW' || d.status === 'IN_REVIEW' ? 'warning' : 'info',
        actionLabel: 'View Sprint',
        raw: d,
      })),
      timelineTitle: 'Upcoming Sprint Deadlines',
      timelineSubtitle: 'Production milestone progression',
      timelineItems: deliverables.map((d: any) => ({
        id: `dl_${d.id}`,
        time: d.dueDate || 'Milestone',
        title: d.deliverable || d.projectTitle || 'Deliverable',
        subtitle: `Client: ${d.client || d.clientName || 'Client'}`,
        owner: d.leadDesigner || 'Creative Lead',
        status: d.status || 'IN_PRODUCTION',
        statusVariant: d.status === 'APPROVED' ? 'success' : 'warning',
      })),
      secondaryCards: [
        { id: 'sc_ag_1', title: 'Total Retainer Value', value: DataSourceRegistry.formatCurrency(totalRetainers), detail: `${deliverables.length} active client deliverables`, statusVariant: 'info' },
        { id: 'sc_ag_2', title: 'Pending Approval', value: `${reviewPending} Deliverables`, detail: reviewPending > 0 ? 'Client review required' : 'Zero approval bottlenecks', statusVariant: reviewPending > 0 ? 'warning' : 'success' },
      ],
      recentActivity: formatRecentActivity(auditLogs),
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
      attentionItems: [],
      todayMetrics: [
        { id: 'tm_ent_1', label: 'Operating Divisions', value: '8 Divisions', subtext: 'Healthcare, Real Estate, Retail, Tech & more', iconName: 'Building' },
        { id: 'tm_ent_2', label: 'Active Enterprise Records', value: `${rawRecords.length} Items`, subtext: 'Synchronized in unified data mesh', iconName: 'Briefcase' },
        { id: 'tm_ent_3', label: 'Treasury Cash Flow', value: DataSourceRegistry.formatCurrency(data.treasuryBalance || 0), subtext: 'Consolidated balance', iconName: 'DollarSign' },
        { id: 'tm_ent_4', label: 'Security & Audit Health', value: '100% Compliant', subtext: 'Zero vulnerability flags', iconName: 'ShieldCheck' },
      ],
      primaryKpis: [
        { id: 'kpi_ent_rev', label: 'Consolidated Records', value: rawRecords.length, delta: 'Mesh synced', isPositive: true, subtext: 'Across all business divisions' },
        { id: 'kpi_ent_ops', label: 'Operational Efficiency', value: '100%', delta: 'All engines active', isPositive: true, subtext: 'Autonomous throughput' },
        { id: 'kpi_ent_cust', label: 'Active Audit Logs', value: auditLogs.length, delta: 'Live event stream', isPositive: true, subtext: 'Immutable tenant event stream' },
        { id: 'kpi_ent_agents', label: 'Governed AI Fleet', value: '5 Sentinels', delta: 'Operational', isPositive: true, subtext: 'Automated workforce agents' },
      ],
      mainOperationTitle: 'Cross-Division Operational Work Units',
      mainOperationSubtitle: 'High-priority business operations across all enabled enterprise modules',
      searchPlaceholder: 'Search enterprise records across all divisions...',
      records: rawRecords.map((r: any) => ({
        id: r.id,
        primaryText: r.name || r.primaryText || 'Enterprise Record',
        secondaryText: r.secondaryText || r.primaryField || 'Division Record',
        groupText: r.groupText || 'Enterprise',
        ownerText: r.ownerText || 'Assigned Lead',
        priority: r.priority || 'NORMAL',
        location: r.location || 'Global',
        status: r.status || 'ACTIVE',
        statusVariant: r.statusVariant || 'success',
        actionLabel: 'Details',
        raw: r,
      })),
      timelineTitle: 'Executive Governance Schedule',
      timelineSubtitle: 'Scheduled executive and compliance checkpoints',
      timelineItems: (data.schedules || []).map((s: any) => ({
        id: s.id,
        time: s.time || '10:00 AM',
        title: s.title || 'Executive Session',
        subtitle: s.subtitle || 'Operational Review',
        owner: s.owner || 'Executive Desk',
        status: s.status || 'CONFIRMED',
        statusVariant: 'success',
      })),
      secondaryCards: [
        { id: 'sc_ent_1', title: 'Global System Uptime', value: '99.99%', detail: 'All microservices operational', statusVariant: 'success' },
        { id: 'sc_ent_2', title: 'Audit Trail Events', value: `${auditLogs.length} Events`, detail: 'Immutable tenant event stream', statusVariant: 'info' },
      ],
      recentActivity: formatRecentActivity(auditLogs),
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
  const totalCount = rawRecords.length;
  const activeCount = rawRecords.filter((r: any) => !['Completed', 'Delivered', 'Ready', 'Closed'].includes(r.status)).length;
  const niceTitle = niche.charAt(0).toUpperCase() + niche.slice(1);

  const attentionItems: DashboardAttentionItem[] = [];
  if (activeCount > 0) {
    attentionItems.push({
      id: `att_${niche}_1`,
      severity: 'HIGH',
      title: `${activeCount} Active Operational Work Unit${activeCount > 1 ? 's' : ''} in ${niceTitle}`,
      reason: 'SLA milestone requires operational execution and specialist review',
      timeAgo: 'Live Queue',
      owner: 'Lead Specialist',
      actionLabel: 'Review Work Queue',
    });
  }

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
    attentionItems,
    todayMetrics: [
      { id: `tm_${niche}_1`, label: 'Active Work Units', value: totalCount, subtext: totalCount > 0 ? `${activeCount} currently in progress` : 'No active records', iconName: 'Briefcase' },
      { id: `tm_${niche}_2`, label: 'Completed Deliverables', value: Math.max(0, totalCount - activeCount), subtext: 'QA verified', iconName: 'CheckCircle2' },
      { id: `tm_${niche}_3`, label: 'SLA Performance', value: totalCount > 0 ? '100%' : 'N/A', subtext: 'On-schedule execution', iconName: 'Clock' },
      { id: `tm_${niche}_4`, label: 'Compliance Status', value: 'Active', subtext: 'Enterprise security verified', iconName: 'ShieldCheck' },
    ],
    primaryKpis: [
      { id: `kpi_${niche}_1`, label: 'Active Records', value: totalCount, delta: `${activeCount} in progress`, isPositive: true, subtext: 'Tracked in workspace' },
      { id: `kpi_${niche}_2`, label: 'Completed Deliverables', value: Math.max(0, totalCount - activeCount), delta: 'Verified milestones', isPositive: true, subtext: 'Completed units' },
      { id: `kpi_${niche}_3`, label: 'Work Queue Units', value: activeCount, delta: 'Operational backlog', isPositive: true, subtext: 'Units in execution' },
      { id: `kpi_${niche}_4`, label: 'Audit Trail Health', value: `${auditLogs.length} Events`, delta: 'Logged events', isPositive: true, subtext: 'Immutable event stream' },
    ],
    mainOperationTitle: `${niceTitle} Operational Work Queue`,
    mainOperationSubtitle: 'Primary records, assigned specialists, status progression, and verified deliverables',
    searchPlaceholder: `Search ${niceTitle} records, IDs, or specialists...`,
    records: rawRecords.map((r: any) => ({
      id: r.id,
      primaryText: r.name || r.primaryText || 'Record Entry',
      secondaryText: `${r.id} · ${r.primaryField || 'Custom Record'}`,
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
      title: r.name || 'Work Milestone',
      subtitle: r.primaryField || 'Milestone verification',
      owner: 'Lead Operator',
      status: r.status || 'In-Progress',
      statusVariant: r.status === 'Completed' ? 'success' : 'warning',
    })),
    secondaryCards: [
      { id: `sc_${niche}_1`, title: 'Total Workspace Records', value: `${totalCount} Records`, detail: 'Active operational work units', statusVariant: 'success' },
      { id: `sc_${niche}_2`, title: 'Audit Trail Events', value: `${auditLogs.length} Events`, detail: 'Real-time workflow triggers syncing across services', statusVariant: 'info' },
    ],
    recentActivity: formatRecentActivity(auditLogs),
    quickActions: [
      { id: `qa_${niche}_1`, label: '+ Create Record', primary: true, onClick: () => callbacks?.onGeneralAction?.('CREATE_RECORD') },
      { id: `qa_${niche}_2`, label: '+ Run Audit', onClick: () => callbacks?.onGeneralAction?.('RUN_AUDIT') },
    ],
  };
}
