// apps/web-core/src/components/dashboard/WidgetRegistry.ts
/**
 * UNIVERSAL WIDGET REGISTRY 2.0
 * Declarative catalog of all dashboard widgets across all industries, business types, and roles.
 * Each widget specifies its required services, permitted roles, target zone, and priority.
 */

import { AttentionSeverity } from './dashboard.types';

export type DashboardZone =
  | 'HEADER'
  | 'ATTENTION'
  | 'TODAY_PULSE'
  | 'PRIMARY_KPIS'
  | 'MAIN_OPERATIONS'
  | 'TIMELINE'
  | 'SECONDARY_OPERATIONS'
  | 'ACTIVITY'
  | 'QUICK_ACTIONS';

export type WidgetType =
  | 'KPI'
  | 'ALERT'
  | 'TABLE'
  | 'TIMELINE'
  | 'METRIC_CARD'
  | 'ACTIVITY_FEED'
  | 'QUICK_ACTION_GROUP'
  | 'CHART';

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  type: WidgetType;
  zone: DashboardZone;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';
  size: '1-col' | '2-col' | '3-col' | '4-col' | '5-col' | '6-col' | '7-col' | '8-col' | '12-col';
  supportedIndustries: string[]; // e.g. ['hospital', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'all', 'custom']
  requiredServices: string[]; // Service IDs from UNIVERSAL_SERVICE_CATALOG that must be active
  permittedRoles: string[]; // e.g. ['admin', 'doctor', 'receptionist', 'billing', 'all']
  dataSource: string; // e.g. 'hospital.patients', 'retail.sales', 'sme.subscriptions'
  refreshStrategy: 'STATIC' | 'ON_LOAD' | 'PERIODIC' | 'REALTIME';
}

export const UNIVERSAL_WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  // =========================================================================
  // HEALTHCARE WIDGETS
  // =========================================================================
  'hosp_critical_triage_alert': {
    id: 'hosp_critical_triage_alert',
    name: 'Critical Triage Patients Alert',
    description: 'Surfaces patients awaiting immediate clinical assessment in emergency or ICU.',
    type: 'ALERT',
    zone: 'ATTENTION',
    priority: 'CRITICAL',
    size: '4-col',
    supportedIndustries: ['hospital'],
    requiredServices: ['srv_healthcare_patients'],
    permittedRoles: ['admin', 'doctor'],
    dataSource: 'hospital.patients',
    refreshStrategy: 'REALTIME',
  },
  'hosp_consultation_confirm_alert': {
    id: 'hosp_consultation_confirm_alert',
    name: 'Unconfirmed Consultations Alert',
    description: 'Highlights patient appointments that need front-desk confirmation.',
    type: 'ALERT',
    zone: 'ATTENTION',
    priority: 'HIGH',
    size: '4-col',
    supportedIndustries: ['hospital'],
    requiredServices: ['srv_healthcare_appointments'],
    permittedRoles: ['admin', 'receptionist'],
    dataSource: 'hospital.appointments',
    refreshStrategy: 'ON_LOAD',
  },
  'hosp_billing_preauth_alert': {
    id: 'hosp_billing_preauth_alert',
    name: 'Insurance Pre-Auth Alert',
    description: 'Flags inpatient insurance claims awaiting authorization.',
    type: 'ALERT',
    zone: 'ATTENTION',
    priority: 'MEDIUM',
    size: '4-col',
    supportedIndustries: ['hospital'],
    requiredServices: ['srv_invoices_billing'],
    permittedRoles: ['admin', 'billing'],
    dataSource: 'hospital.billing',
    refreshStrategy: 'ON_LOAD',
  },
  'hosp_census_kpi': {
    id: 'hosp_census_kpi',
    name: 'Inpatient Census KPI',
    description: 'Total patients currently admitted across hospital wards.',
    type: 'KPI',
    zone: 'PRIMARY_KPIS',
    priority: 'HIGH',
    size: '3-col',
    supportedIndustries: ['hospital'],
    requiredServices: ['srv_healthcare_patients'],
    permittedRoles: ['all'],
    dataSource: 'hospital.metrics.occupiedBeds',
    refreshStrategy: 'PERIODIC',
  },
  'hosp_occupancy_rate_kpi': {
    id: 'hosp_occupancy_rate_kpi',
    name: 'Bed Occupancy Rate KPI',
    description: 'Percentage of total sanitized beds occupied by inpatients.',
    type: 'KPI',
    zone: 'PRIMARY_KPIS',
    priority: 'HIGH',
    size: '3-col',
    supportedIndustries: ['hospital'],
    requiredServices: ['srv_healthcare_patients'],
    permittedRoles: ['admin', 'billing'],
    dataSource: 'hospital.metrics.occupancyRate',
    refreshStrategy: 'PERIODIC',
  },
  'hosp_consultations_today_kpi': {
    id: 'hosp_consultations_today_kpi',
    name: 'Today\'s Consultations KPI',
    description: 'Total confirmed consultations scheduled across clinical specialties.',
    type: 'KPI',
    zone: 'PRIMARY_KPIS',
    priority: 'HIGH',
    size: '3-col',
    supportedIndustries: ['hospital'],
    requiredServices: ['srv_healthcare_appointments'],
    permittedRoles: ['all'],
    dataSource: 'hospital.appointments.length',
    refreshStrategy: 'PERIODIC',
  },
  'hosp_patient_queue_table': {
    id: 'hosp_patient_queue_table',
    name: 'Clinical Patient Queue',
    description: 'Master list of inpatients, triage priorities, attending doctors, and ward beds.',
    type: 'TABLE',
    zone: 'MAIN_OPERATIONS',
    priority: 'HIGH',
    size: '8-col',
    supportedIndustries: ['hospital'],
    requiredServices: ['srv_healthcare_patients'],
    permittedRoles: ['all'],
    dataSource: 'hospital.patients',
    refreshStrategy: 'REALTIME',
  },
  'hosp_appointment_timeline': {
    id: 'hosp_appointment_timeline',
    name: 'Consultation Timeline',
    description: 'Chronological timeline of scheduled provider appointments today.',
    type: 'TIMELINE',
    zone: 'TIMELINE',
    priority: 'HIGH',
    size: '4-col',
    supportedIndustries: ['hospital'],
    requiredServices: ['srv_healthcare_appointments'],
    permittedRoles: ['all'],
    dataSource: 'hospital.appointments',
    refreshStrategy: 'PERIODIC',
  },

  // =========================================================================
  // REAL ESTATE WIDGETS
  // =========================================================================
  're_closing_offer_alert': {
    id: 're_closing_offer_alert',
    name: 'Offer Expiration Alert',
    description: 'Alerts brokers to purchase offers expiring within 24 hours.',
    type: 'ALERT',
    zone: 'ATTENTION',
    priority: 'HIGH',
    size: '6-col',
    supportedIndustries: ['realestate'],
    requiredServices: ['srv_deals_pipeline'],
    permittedRoles: ['admin', 'agent'],
    dataSource: 'realestate.deals',
    refreshStrategy: 'REALTIME',
  },
  're_active_volume_kpi': {
    id: 're_active_volume_kpi',
    name: 'Active MLS Listing Volume KPI',
    description: 'Total market volume of properties currently listed.',
    type: 'KPI',
    zone: 'PRIMARY_KPIS',
    priority: 'HIGH',
    size: '3-col',
    supportedIndustries: ['realestate'],
    requiredServices: ['srv_realestate_listings'],
    permittedRoles: ['all'],
    dataSource: 'realestate.metrics.totalListingVolume',
    refreshStrategy: 'PERIODIC',
  },
  're_property_portfolio_table': {
    id: 're_property_portfolio_table',
    name: 'Property Portfolio Table',
    description: 'Operational view of MLS listings, pricing, locations, and assigned agents.',
    type: 'TABLE',
    zone: 'MAIN_OPERATIONS',
    priority: 'HIGH',
    size: '8-col',
    supportedIndustries: ['realestate'],
    requiredServices: ['srv_realestate_listings'],
    permittedRoles: ['all'],
    dataSource: 'realestate.properties',
    refreshStrategy: 'ON_LOAD',
  },

  // =========================================================================
  // RESTAURANT WIDGETS
  // =========================================================================
  'rest_kot_delay_alert': {
    id: 'rest_kot_delay_alert',
    name: 'Delayed KOT Prep Alert',
    description: 'Flags kitchen tickets that have exceeded prep time SLA.',
    type: 'ALERT',
    zone: 'ATTENTION',
    priority: 'HIGH',
    size: '6-col',
    supportedIndustries: ['restaurant'],
    requiredServices: ['srv_restaurant_floor_kds'],
    permittedRoles: ['admin', 'chef'],
    dataSource: 'restaurant.kitchenOrders',
    refreshStrategy: 'REALTIME',
  },
  'rest_low_par_stock_alert': {
    id: 'rest_low_par_stock_alert',
    name: 'Pantry Par Stock Alert',
    description: 'Alerts chef and manager to kitchen ingredients below par level.',
    type: 'ALERT',
    zone: 'ATTENTION',
    priority: 'MEDIUM',
    size: '6-col',
    supportedIndustries: ['restaurant'],
    requiredServices: ['srv_inventory_stock'],
    permittedRoles: ['admin', 'chef'],
    dataSource: 'restaurant.menuItems',
    refreshStrategy: 'ON_LOAD',
  },
  'rest_floor_tables_table': {
    id: 'rest_floor_tables_table',
    name: 'Dining Room Floor Tables',
    description: 'Live table layout with seated guests, running checks, and server assignment.',
    type: 'TABLE',
    zone: 'MAIN_OPERATIONS',
    priority: 'HIGH',
    size: '8-col',
    supportedIndustries: ['restaurant'],
    requiredServices: ['srv_restaurant_floor_kds'],
    permittedRoles: ['all'],
    dataSource: 'restaurant.tables',
    refreshStrategy: 'REALTIME',
  },

  // =========================================================================
  // RETAIL WIDGETS
  // =========================================================================
  'retail_low_stock_alert': {
    id: 'retail_low_stock_alert',
    name: 'Low Stock SKU Alert',
    description: 'Identifies inventory items nearing stockout (< 15 units).',
    type: 'ALERT',
    zone: 'ATTENTION',
    priority: 'HIGH',
    size: '6-col',
    supportedIndustries: ['retail'],
    requiredServices: ['srv_inventory_stock'],
    permittedRoles: ['admin', 'manager', 'stock'],
    dataSource: 'retail.catalogProducts',
    refreshStrategy: 'ON_LOAD',
  },
  'retail_khata_due_alert': {
    id: 'retail_khata_due_alert',
    name: 'Overdue Khata Customer Credit',
    description: 'Alerts cashier/owner to customer credit accounts past 30-day settlement.',
    type: 'ALERT',
    zone: 'ATTENTION',
    priority: 'MEDIUM',
    size: '6-col',
    supportedIndustries: ['retail'],
    requiredServices: ['srv_dual_khata'],
    permittedRoles: ['admin', 'manager', 'cashier'],
    dataSource: 'retail.khataCustomers',
    refreshStrategy: 'ON_LOAD',
  },
  'retail_daily_sales_kpi': {
    id: 'retail_daily_sales_kpi',
    name: 'Daily POS Sales Revenue',
    description: 'Gross revenue collected via cash, card, and POS today.',
    type: 'KPI',
    zone: 'PRIMARY_KPIS',
    priority: 'HIGH',
    size: '3-col',
    supportedIndustries: ['retail'],
    requiredServices: ['srv_retail_pos_cashier'],
    permittedRoles: ['all'],
    dataSource: 'retail.metrics.totalSalesRevenue',
    refreshStrategy: 'REALTIME',
  },
  'retail_catalog_table': {
    id: 'retail_catalog_table',
    name: 'Retail SKU & Inventory Queue',
    description: 'Active stock catalog, barcodes, category, prices, and stock units.',
    type: 'TABLE',
    zone: 'MAIN_OPERATIONS',
    priority: 'HIGH',
    size: '8-col',
    supportedIndustries: ['retail'],
    requiredServices: ['srv_retail_pos_cashier'],
    permittedRoles: ['all'],
    dataSource: 'retail.catalogProducts',
    refreshStrategy: 'ON_LOAD',
  },

  // =========================================================================
  // SAAS / SME WIDGETS
  // =========================================================================
  'saas_past_due_alert': {
    id: 'saas_past_due_alert',
    name: 'Past Due Subscription Alert',
    description: 'Alerts CSMs and billing team to accounts with failed subscription charges.',
    type: 'ALERT',
    zone: 'ATTENTION',
    priority: 'HIGH',
    size: '6-col',
    supportedIndustries: ['sme'],
    requiredServices: ['srv_saas_subscriptions'],
    permittedRoles: ['admin', 'csm', 'billing'],
    dataSource: 'sme.subscriptions',
    refreshStrategy: 'ON_LOAD',
  },
  'saas_mrr_kpi': {
    id: 'saas_mrr_kpi',
    name: 'Monthly Recurring Revenue (MRR)',
    description: 'Contracted recurring revenue across all active customer subscriptions.',
    type: 'KPI',
    zone: 'PRIMARY_KPIS',
    priority: 'HIGH',
    size: '3-col',
    supportedIndustries: ['sme'],
    requiredServices: ['srv_saas_subscriptions'],
    permittedRoles: ['all'],
    dataSource: 'sme.metrics.totalMrr',
    refreshStrategy: 'PERIODIC',
  },
  'saas_subscriptions_table': {
    id: 'saas_subscriptions_table',
    name: 'Active SaaS Subscriptions & Accounts',
    description: 'Customer accounts, tier, MRR, seats, health score, and renewal date.',
    type: 'TABLE',
    zone: 'MAIN_OPERATIONS',
    priority: 'HIGH',
    size: '8-col',
    supportedIndustries: ['sme'],
    requiredServices: ['srv_saas_subscriptions'],
    permittedRoles: ['all'],
    dataSource: 'sme.subscriptions',
    refreshStrategy: 'ON_LOAD',
  },

  // =========================================================================
  // CREATIVE AGENCY WIDGETS
  // =========================================================================
  'agency_review_blocked_alert': {
    id: 'agency_review_blocked_alert',
    name: 'Client Review Pending Alert',
    description: 'Alerts account managers to deliverables awaiting client approval sign-off.',
    type: 'ALERT',
    zone: 'ATTENTION',
    priority: 'HIGH',
    size: '6-col',
    supportedIndustries: ['agency'],
    requiredServices: ['srv_projects_tasks'],
    permittedRoles: ['admin', 'pm', 'am'],
    dataSource: 'agency.deliverables',
    refreshStrategy: 'ON_LOAD',
  },
  'agency_retainers_kpi': {
    id: 'agency_retainers_kpi',
    name: 'Active Retainer Contract Value',
    description: 'Total monthly recurring fee across active agency retainers.',
    type: 'KPI',
    zone: 'PRIMARY_KPIS',
    priority: 'HIGH',
    size: '3-col',
    supportedIndustries: ['agency'],
    requiredServices: ['srv_invoices_billing'],
    permittedRoles: ['all'],
    dataSource: 'agency.metrics.totalRetainerValue',
    refreshStrategy: 'PERIODIC',
  },
  'agency_deliverables_table': {
    id: 'agency_deliverables_table',
    name: 'Client Deliverables & Sprints Queue',
    description: 'Design, development, and campaign milestones with status and lead creatives.',
    type: 'TABLE',
    zone: 'MAIN_OPERATIONS',
    priority: 'HIGH',
    size: '8-col',
    supportedIndustries: ['agency'],
    requiredServices: ['srv_projects_tasks'],
    permittedRoles: ['all'],
    dataSource: 'agency.deliverables',
    refreshStrategy: 'ON_LOAD',
  },

  // =========================================================================
  // MASTER ENTERPRISE & CUSTOM WORKSPACES WIDGETS
  // =========================================================================
  'universal_audit_feed': {
    id: 'universal_audit_feed',
    name: 'Immutable Audit Trail Feed',
    description: 'Live chronological stream of security and operational event logs.',
    type: 'ACTIVITY_FEED',
    zone: 'ACTIVITY',
    priority: 'NORMAL',
    size: '5-col',
    supportedIndustries: ['all', 'hospital', 'realestate', 'restaurant', 'retail', 'sme', 'agency', 'custom'],
    requiredServices: ['srv_universal_automation'],
    permittedRoles: ['all'],
    dataSource: 'auditLogs',
    refreshStrategy: 'REALTIME',
  },
};

/**
 * Filter widgets by enabled services and role.
 * If a required service is disabled in the workspace, the widget is excluded.
 */
export function filterWidgetsForWorkspace(
  industry: string,
  role: string,
  activeServiceIds: string[]
): WidgetDefinition[] {
  return Object.values(UNIVERSAL_WIDGET_REGISTRY).filter((widget) => {
    // 1. Industry match
    if (
      !widget.supportedIndustries.includes('all') &&
      !widget.supportedIndustries.includes(industry)
    ) {
      return false;
    }

    // 2. Role permission match
    if (
      !widget.permittedRoles.includes('all') &&
      !widget.permittedRoles.includes(role)
    ) {
      return false;
    }

    // 3. Service enablement match: all required services must be active
    if (widget.requiredServices.length > 0) {
      const hasAllServices = widget.requiredServices.every((srvId) =>
        activeServiceIds.includes(srvId)
      );
      if (!hasAllServices) return false;
    }

    return true;
  });
}
