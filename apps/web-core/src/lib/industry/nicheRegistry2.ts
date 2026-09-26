// apps/web-core/src/lib/industry/nicheRegistry2.ts

import { IndustryNiche } from '@/components/industry/IndustryContext';

export interface IndustryRecordType {
  id: string;
  name: string;
  singular: string;
  plural: string;
  route: string;
  iconName: string;
  description: string;
}

export interface IndustryCustomField {
  module: 'CONTACTS' | 'DEALS' | 'INVOICES' | 'PROJECTS' | 'PRODUCTS';
  key: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'CURRENCY' | 'DROPDOWN' | 'DATE' | 'BOOLEAN';
  options?: string[];
  description: string;
}

export interface IndustryDashboardKpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  subtext: string;
  iconName: string;
}

export interface IndustryQuickAction {
  id: string;
  label: string;
  href: string;
  iconName: string;
  primary?: boolean;
}

export interface IndustryEmptyState {
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
  iconName: string;
}

export interface IndustryReportSpec {
  id: string;
  title: string;
  category: string;
  description: string;
}

export interface IndustryWorkflowSpec {
  id: string;
  name: string;
  description: string;
  trigger: string;
}

export interface IndustryAiPersona {
  name: string;
  role: string;
  promptContext: string;
}

export interface NicheConfiguration2 {
  id: IndustryNiche;
  name: string;
  slug: string;
  shortName: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: string;
  recommendedFor: string[];
  coreServiceIds: string[];
  recommendedServiceIds: string[];
  optionalServiceIds: string[];
  terminology: {
    contacts: string;
    deals: string;
    projects: string;
    invoices: string;
    products: string;
    tickets: string;
    records: string;
    actions: {
      createRecord: string;
      bookSchedule: string;
      generateBill: string;
      viewPipeline: string;
    };
  };
  recordTypes: IndustryRecordType[];
  customFields: IndustryCustomField[];
  dashboardKpis: IndustryDashboardKpi[];
  quickActions: IndustryQuickAction[];
  emptyStates: Record<string, IndustryEmptyState>;
  reportCatalog: IndustryReportSpec[];
  workflowTemplates: IndustryWorkflowSpec[];
  aiPersona: IndustryAiPersona;
}

export const NICHE_CONFIGURATIONS_2: Record<IndustryNiche, NicheConfiguration2> = {
  // ==========================================================================
  // 1. MASTER ENTERPRISE
  // ==========================================================================
  all: {
    id: 'all',
    name: 'Master Enterprise (All Modules)',
    slug: 'enterprise',
    shortName: 'Enterprise Master',
    tagline: 'Unfiltered access to all 67 enterprise CRM, platform, and revenue modules.',
    description: 'High-volume conglomerate workspace combining global CRM, multi-currency treasury, automated AI workforce, legal vault, and cross-subsidiary governance.',
    iconName: 'Globe',
    accentColor: 'emerald',
    recommendedFor: ['Conglomerates', 'Holding Companies', 'Multi-Division Enterprises', 'Global Operations'],
    coreServiceIds: [
      'srv_contacts',
      'srv_deals_pipeline',
      'srv_invoices_billing',
      'srv_dual_khata',
      'srv_projects_tasks',
      'srv_documents_esign',
      'srv_universal_automation',
    ],
    recommendedServiceIds: [
      'srv_customer_360',
      'srv_b2b_prospector',
      'srv_cpq_quotes',
      'srv_neural_ocr',
      'srv_saas_subscriptions',
      'srv_hr_people',
      'srv_marketing_studio',
      'srv_support_desk',
      'srv_inventory_stock',
    ],
    optionalServiceIds: [
      'srv_payment_links_pos',
      'srv_price_books',
      'srv_healthcare_patients',
      'srv_realestate_listings',
      'srv_restaurant_floor_kds',
      'srv_retail_pos_cashier',
    ],
    terminology: {
      contacts: 'Contacts & Accounts',
      deals: 'Deals Pipeline',
      projects: 'Sprint Projects',
      invoices: 'Commercial Invoices',
      products: 'Price Books',
      tickets: 'Helpdesk Support',
      records: 'Enterprise Records',
      actions: {
        createRecord: 'New Account / Deal',
        bookSchedule: 'Schedule Executive Sync',
        generateBill: 'Generate Invoice',
        viewPipeline: 'View Consolidated Pipeline',
      },
    },
    recordTypes: [
      { id: 'rec_account', name: 'Commercial Account', singular: 'Account', plural: 'Accounts', route: '/contacts', iconName: 'Users', description: 'Enterprise enterprise client entities' },
      { id: 'rec_deal', name: 'Strategic Opportunity', singular: 'Deal', plural: 'Deals', route: '/deals', iconName: 'Briefcase', description: 'High-value multi-stakeholder contract pipelines' },
      { id: 'rec_contract', name: 'Legal Contract', singular: 'Contract', plural: 'Contracts', route: '/documents', iconName: 'FileSignature', description: 'Master Services Agreements and NDAs' },
    ],
    customFields: [
      { module: 'CONTACTS', key: 'account_tier', label: 'Enterprise Account Tier', type: 'DROPDOWN', options: ['Tier 1 Global Strategic', 'Tier 2 Mid-Market', 'Tier 3 Emerging'], description: 'Client strategic weighting' },
      { module: 'DEALS', key: 'annual_contract_value', label: 'ACV ($)', type: 'CURRENCY', description: 'Annual Contract Value' },
    ],
    dashboardKpis: [
      { id: 'kpi_conglom_arr', label: 'Consolidated Revenue', value: '$1.42M', delta: '+18.4%', subtext: 'Trailing 12-month ARR', iconName: 'Landmark' },
      { id: 'kpi_pipeline_open', label: 'Active Pipeline', value: '$4.85M', delta: '42 deals', subtext: 'Weighted forecast $2.91M', iconName: 'Briefcase' },
      { id: 'kpi_cash_balance', label: 'Dual Khata Treasury', value: '$840.5k', delta: 'Audited', subtext: 'Operating cash runway 18m', iconName: 'Activity' },
      { id: 'kpi_agent_actions', label: 'Autonomous Fleet', value: '42.5k', delta: '99.8%', subtext: 'Actions executed this week', iconName: 'Workflow' },
    ],
    quickActions: [
      { id: 'qa_deal', label: 'Create Opportunity', href: '/deals?action=new', iconName: 'Briefcase', primary: true },
      { id: 'qa_invoice', label: 'Generate Commercial Invoice', href: '/invoices?action=new', iconName: 'Receipt' },
      { id: 'qa_bank', label: 'Reconcile Dual Khata', href: '/banking', iconName: 'Landmark' },
      { id: 'qa_automation', label: 'Design Workflow', href: '/automation', iconName: 'Workflow' },
    ],
    emptyStates: {
      contacts: { title: 'No Enterprise Accounts Registered', message: 'Add key accounts and business stakeholders to start tracking relationship health and commercial velocity.', actionLabel: 'Add First Account', actionHref: '/contacts?action=new', iconName: 'Users' },
      deals: { title: 'Pipeline Is Currently Clean', message: 'Create opportunities and link pricing quotes to track your corporate sales pipeline.', actionLabel: 'Create Opportunity', actionHref: '/deals?action=new', iconName: 'Briefcase' },
    },
    reportCatalog: [
      { id: 'rep_ent_board', title: 'Executive Boardroom Financial Forecast', category: 'Executive', description: 'Audited gross revenues, burn velocity, and divisional variance' },
      { id: 'rep_ent_churn', title: 'Enterprise Churn & Net Retention', category: 'Revenue', description: 'NDR breakdown across global accounts' },
    ],
    workflowTemplates: [
      { id: 'wf_ent_approval', name: 'Board Level Approval for Deals > $100k', description: 'Enforces CFO & General Counsel review before contract signature', trigger: 'When Deal Exceeds $100,000' },
    ],
    aiPersona: {
      name: 'Ares Corporate Overseer',
      role: 'Enterprise Operations Strategist',
      promptContext: 'You are an executive enterprise operations advisor focused on capital efficiency, compliance, and revenue velocity.',
    },
  },

  // ==========================================================================
  // 2. HEALTHCARE / HOSPITAL OS
  // ==========================================================================
  hospital: {
    id: 'hospital',
    name: 'Hospital, Clinic & Healthcare OS',
    slug: 'healthcare',
    shortName: 'Healthcare & Clinic',
    tagline: 'Tailored for medical centers, hospitals, private clinics, and diagnostic labs.',
    description: 'Clinical workspace prioritizing patient care workflows, doctor scheduling, ward bed census, electronic prescriptions, and diagnostic pathology tracking.',
    iconName: 'Stethoscope',
    accentColor: 'teal',
    recommendedFor: ['Hospitals', 'Outpatient Clinics', 'Diagnostic Labs', 'Private Practices', 'Dental Centers'],
    coreServiceIds: [
      'srv_healthcare_patients',
      'srv_healthcare_appointments',
      'srv_healthcare_wards_beds',
      'srv_healthcare_digital_rx',
      'srv_invoices_billing',
    ],
    recommendedServiceIds: [
      'srv_contacts',
      'srv_documents_esign',
      'srv_hr_people',
      'srv_inventory_stock',
      'srv_support_desk',
      'srv_universal_automation',
    ],
    optionalServiceIds: [
      'srv_dual_khata',
      'srv_marketing_studio',
      'srv_payment_links_pos',
      'srv_price_books',
    ],
    terminology: {
      contacts: 'Patients & Clinical Directory',
      deals: 'Treatment Plans & Care Episodes',
      projects: 'Clinical Ward & Rounds',
      invoices: 'Medical Invoices & Insurance Claims',
      products: 'Pharmaceutical & Medical Supplies',
      tickets: 'Patient Care & Triage Inquiries',
      records: 'Clinical EHR Records',
      actions: {
        createRecord: 'Admit Patient',
        bookSchedule: 'Book Consultation',
        generateBill: 'Generate Medical Bill',
        viewPipeline: 'View Inpatient Census',
      },
    },
    recordTypes: [
      { id: 'rec_patient', name: 'Patient Record (EHR)', singular: 'Patient', plural: 'Patients', route: '/industry/hospital', iconName: 'Stethoscope', description: 'Clinical history, insurance, and medical chart' },
      { id: 'rec_appointment', name: 'Doctor Consultation', singular: 'Appointment', plural: 'Appointments', route: '/industry/hospital', iconName: 'Clock', description: 'Specialist appointments and outpatient visits' },
      { id: 'rec_prescription', name: 'Digital Rx & Diagnostics', singular: 'Prescription', plural: 'Prescriptions', route: '/industry/hospital', iconName: 'HeartPulse', description: 'Pharmacy orders and pathology test requests' },
    ],
    customFields: [
      { module: 'CONTACTS', key: 'blood_group', label: 'Blood Group', type: 'DROPDOWN', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], description: 'Patient blood type' },
      { module: 'CONTACTS', key: 'insurance_provider', label: 'Health Insurance Carrier', type: 'TEXT', description: 'Insurance policy carrier name' },
      { module: 'CONTACTS', key: 'emergency_contact_phone', label: 'Emergency Contact Phone', type: 'TEXT', description: 'Primary next of kin telephone' },
      { module: 'DEALS', key: 'attending_physician', label: 'Attending Physician', type: 'TEXT', description: 'Doctor in charge of treatment care plan' },
    ],
    dashboardKpis: [
      { id: 'kpi_bed_occupancy', label: 'Ward Bed Occupancy', value: '84.2%', delta: '142/180', subtext: 'Optimal general & ICU capacity', iconName: 'Bed' },
      { id: 'kpi_today_appts', label: "Today's Consultations", value: '64 visits', delta: '98% on-time', subtext: '28 doctors currently on duty', iconName: 'Clock' },
      { id: 'kpi_er_triage', label: 'ER Triage Wait Time', value: '14 mins', delta: '-6 mins', subtext: 'Target under 20 minutes', iconName: 'HeartPulse' },
      { id: 'kpi_unpaid_claims', label: 'Insurance A/R Claims', value: '$64,280', delta: '18 claims', subtext: 'Average collection cycle 21 days', iconName: 'Receipt' },
    ],
    quickActions: [
      { id: 'qa_admit', label: 'Admit Patient', href: '/industry/hospital?action=admit', iconName: 'Plus', primary: true },
      { id: 'qa_book', label: 'Book Consultation', href: '/industry/hospital?action=book', iconName: 'Clock' },
      { id: 'qa_rx', label: 'Issue Digital Rx', href: '/industry/hospital', iconName: 'HeartPulse' },
      { id: 'qa_med_bill', label: 'Create Medical Invoice', href: '/invoices?action=new', iconName: 'Receipt' },
    ],
    emptyStates: {
      contacts: { title: 'No Patients Admitted Yet', message: 'Register your first patient profile to begin managing appointments, clinical histories, and digital prescriptions.', actionLabel: 'Admit Patient', actionHref: '/industry/hospital?action=admit', iconName: 'Stethoscope' },
      deals: { title: 'No Active Treatment Episodes', message: 'Create treatment care plans to coordinate specialist interventions, surgery schedules, and patient follow-ups.', actionLabel: 'New Treatment Episode', actionHref: '/industry/hospital', iconName: 'HeartPulse' },
    },
    reportCatalog: [
      { id: 'rep_hosp_census', title: 'Daily Inpatient Census & Bed Turnover', category: 'Clinical', description: 'Admission, discharge, and bed occupancy telemetry' },
      { id: 'rep_hosp_rev', title: 'Clinical Billing & Insurance Reconciler', category: 'Finance', description: 'Patient co-pays, insurance payouts, and outstanding claims' },
      { id: 'rep_hosp_provider', title: 'Physician Productivity & Roster Compliance', category: 'Staff', description: 'Consultations logged and clinic hours per provider' },
    ],
    workflowTemplates: [
      { id: 'wf_hosp_sms_reminder', name: '24-Hour Patient Appointment WhatsApp Alert', description: 'Sends automated consultation reminder with clinic directions', trigger: '24h Prior to Appointment' },
      { id: 'wf_hosp_critical_lab', name: 'Critical Pathology Alert to Attending Doctor', description: 'Immediately alerts specialist phone when lab results exceed danger bounds', trigger: 'When Lab Result Marked Critical' },
    ],
    aiPersona: {
      name: 'Asclepius Clinical Assistant',
      role: 'Clinical Operations & Triage Specialist',
      promptContext: 'You are an administrative healthcare assistant assisting clinical staff with scheduling, bed census tracking, and patient intake coordination. Do not provide unauthorized medical diagnoses.',
    },
  },

  // ==========================================================================
  // 3. REAL ESTATE BROKERAGE & PROPERTY OS
  // ==========================================================================
  realestate: {
    id: 'realestate',
    name: 'Real Estate Brokerage & Property OS',
    slug: 'realestate',
    shortName: 'Real Estate & Property',
    tagline: 'Optimized for real estate agents, commercial brokerages, property developers, and landlords.',
    description: 'Property transaction workspace managing MLS asset listings, buyer/seller pipelines, escrow milestone closings, lease agreements, and mortgage calculations.',
    iconName: 'Home',
    accentColor: 'emerald',
    recommendedFor: ['Real Estate Brokerages', 'Property Developers', 'Asset Managers', 'Commercial Leasing Agencies', 'Landlords'],
    coreServiceIds: [
      'srv_realestate_listings',
      'srv_realestate_escrow',
      'srv_realestate_rentals',
      'srv_contacts',
      'srv_deals_pipeline',
    ],
    recommendedServiceIds: [
      'srv_documents_esign',
      'srv_invoices_billing',
      'srv_marketing_studio',
      'srv_b2b_prospector',
      'srv_universal_automation',
    ],
    optionalServiceIds: [
      'srv_dual_khata',
      'srv_payment_links_pos',
      'srv_support_desk',
      'srv_hr_people',
    ],
    terminology: {
      contacts: 'Buyers, Sellers & Tenants',
      deals: 'Property Sales & Escrow Pipeline',
      projects: 'Property Showings & Inspections',
      invoices: 'Commission & Rental Billing',
      products: 'Property Listings & Units',
      tickets: 'Property Maintenance & Requests',
      records: 'Property Assets',
      actions: {
        createRecord: 'New Property Listing',
        bookSchedule: 'Schedule Showing',
        generateBill: 'Issue Commission Bill',
        viewPipeline: 'View Escrow Pipeline',
      },
    },
    recordTypes: [
      { id: 'rec_property', name: 'Property Listing (MLS)', singular: 'Property', plural: 'Properties', route: '/industry/realestate', iconName: 'Home', description: 'Residential and commercial real estate assets' },
      { id: 'rec_escrow', name: 'Escrow Transaction', singular: 'Escrow File', plural: 'Escrow Files', route: '/industry/realestate', iconName: 'Briefcase', description: 'Closing contingencies, title, and earnest deposits' },
      { id: 'rec_lease', name: 'Tenant Lease Agreement', singular: 'Lease', plural: 'Leases', route: '/industry/realestate', iconName: 'FileSignature', description: 'Rental agreements, monthly rent, and security deposits' },
    ],
    customFields: [
      { module: 'PRODUCTS', key: 'property_type', label: 'Property Classification', type: 'DROPDOWN', options: ['Single Family Residential', 'Multi-Family Apartment', 'Commercial Office', 'Industrial Warehouse', 'Land Parcel'], description: 'Property category' },
      { module: 'PRODUCTS', key: 'bedrooms_bathrooms', label: 'Bed / Bath Count', type: 'TEXT', description: 'e.g. 4 Bed / 3.5 Bath' },
      { module: 'PRODUCTS', key: 'square_footage', label: 'Gross Area (Sq Ft)', type: 'NUMBER', description: 'Total interior square footage' },
      { module: 'DEALS', key: 'escrow_closing_date', label: 'Target Escrow Closing Date', type: 'DATE', description: 'Agreed deed transfer date' },
      { module: 'DEALS', key: 'broker_commission_split', label: 'Commission Rate (%)', type: 'NUMBER', description: 'Total agreed commission percentage' },
    ],
    dashboardKpis: [
      { id: 'kpi_mls_portfolio', label: 'Active MLS Portfolio', value: '$48.6M', delta: '24 listings', subtext: 'Average 34 days on market', iconName: 'Home' },
      { id: 'kpi_escrow_closing', label: 'Escrow Closing Pipeline', value: '$6.2M', delta: '8 in flight', subtext: 'Target closings this month', iconName: 'Briefcase' },
      { id: 'kpi_comm_pool', label: 'Projected Commission Pool', value: '$186.4k', delta: '+22.5%', subtext: 'Broker split pending payout', iconName: 'Landmark' },
      { id: 'kpi_tenant_lease', label: 'Tenant Lease Occupancy', value: '96.4%', delta: 'Optimal', subtext: '56 managed units producing rent', iconName: 'Users' },
    ],
    quickActions: [
      { id: 'qa_new_listing', label: 'Create Property Listing', href: '/industry/realestate?action=new', iconName: 'Plus', primary: true },
      { id: 'qa_escrow_file', label: 'Launch Escrow File', href: '/industry/realestate', iconName: 'Briefcase' },
      { id: 'qa_mortgage_tool', label: 'Mortgage Calculator', href: '/industry/realestate', iconName: 'Landmark' },
      { id: 'qa_showing_task', label: 'Book Site Showing', href: '/projects', iconName: 'ClipboardList' },
    ],
    emptyStates: {
      contacts: { title: 'No Buyers or Sellers Registered', message: 'Add prospective buyers, property sellers, or commercial tenants to match with active inventory.', actionLabel: 'Add Client Contact', actionHref: '/contacts?action=new', iconName: 'Users' },
      deals: { title: 'No Escrow Transactions in Flight', message: 'Convert accepted purchase offers into escrow closing files to track contingencies and earn commissions.', actionLabel: 'Open Escrow File', actionHref: '/industry/realestate', iconName: 'Briefcase' },
    },
    reportCatalog: [
      { id: 'rep_re_pipeline', title: 'Monthly Escrow Closings & Commission Forecast', category: 'Sales', description: 'Expected commission settlements by agent' },
      { id: 'rep_re_absorption', title: 'Portfolio Absorption & Days on Market', category: 'Inventory', description: 'Listing velocity and price adjustment yield' },
      { id: 'rep_re_rentals', title: 'Property Management NOI & Cap Rates', category: 'Asset Management', description: 'Net operating income across leased buildings' },
    ],
    workflowTemplates: [
      { id: 'wf_re_inspection', name: '7-Day Inspection Contingency Deadline Reminder', description: 'Alerts buyer agent and escrow officer 48 hours before contingency waiver', trigger: 'Day 5 of Escrow Opening' },
      { id: 'wf_re_rent_sms', name: 'Monthly Tenant Rent Invoice WhatsApp Dispatch', description: 'Automates payment link dispatch on the 1st of every month', trigger: 'On 1st of Each Month' },
    ],
    aiPersona: {
      name: 'Vesta Property Sentinel',
      role: 'Real Estate Transaction Coordinator',
      promptContext: 'You are an institutional real estate transaction coordinator specializing in escrow checklists, buyer matching, and mortgage yield calculations.',
    },
  },

  // ==========================================================================
  // 4. RESTAURANT, CAFÉ & HOSPITALITY OS
  // ==========================================================================
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant, Café & Hospitality OS',
    slug: 'restaurant',
    shortName: 'Restaurant & Hospitality',
    tagline: 'Customized for dining restaurants, cafés, cloud kitchens, bars, and catering businesses.',
    description: 'Food & beverage operating system connecting host floor reservations, Kitchen Display Systems (KDS), recipe food cost engineering, and table QR billing.',
    iconName: 'UtensilsCrossed',
    accentColor: 'amber',
    recommendedFor: ['Fine Dining Restaurants', 'Bistros & Cafés', 'Cloud Kitchens', 'Bars & Breweries', 'Catering Operators'],
    coreServiceIds: [
      'srv_restaurant_floor_kds',
      'srv_restaurant_menu_cost',
      'srv_invoices_billing',
      'srv_payment_links_pos',
      'srv_inventory_stock',
    ],
    recommendedServiceIds: [
      'srv_contacts',
      'srv_hr_people',
      'srv_price_books',
      'srv_marketing_studio',
      'srv_universal_automation',
    ],
    optionalServiceIds: [
      'srv_dual_khata',
      'srv_support_desk',
      'srv_documents_esign',
      'srv_neural_ocr',
    ],
    terminology: {
      contacts: 'Guests & VIP Diners',
      deals: 'Private Dining & Catering Bookings',
      projects: 'Kitchen Order Tickets (KOT)',
      invoices: 'Dining & Delivery Bills',
      products: 'Food & Beverage Menu Items',
      tickets: 'Guest Feedback & Requests',
      records: 'Floor Tables & Orders',
      actions: {
        createRecord: 'New Table Order',
        bookSchedule: 'Reserve Table',
        generateBill: 'Print Dining Bill',
        viewPipeline: 'View Kitchen KDS',
      },
    },
    recordTypes: [
      { id: 'rec_table', name: 'Dining Room Table', singular: 'Table', plural: 'Tables', route: '/industry/restaurant', iconName: 'UtensilsCrossed', description: 'Table capacity, status, and floor location' },
      { id: 'rec_dish', name: 'Menu Item & Recipe', singular: 'Menu Dish', plural: 'Menu Dishes', route: '/price-books', iconName: 'Layers', description: 'Recipe ingredient breakdown and food cost margin' },
      { id: 'rec_kot', name: 'Kitchen Order Ticket', singular: 'Order Ticket', plural: 'Order Tickets', route: '/industry/restaurant', iconName: 'ClipboardList', description: 'Live line orders in preparation queue' },
    ],
    customFields: [
      { module: 'PRODUCTS', key: 'food_cost_target_pct', label: 'Target Food Cost (%)', type: 'NUMBER', description: 'Budgeted food cost par (e.g. 28%)' },
      { module: 'PRODUCTS', key: 'kitchen_station', label: 'Kitchen Station', type: 'DROPDOWN', options: ['Grill / Hot Line', 'Garde Manger (Cold)', 'Pastry / Dessert', 'Bar / Beverage', 'Pizza Oven'], description: 'Routing station for KDS' },
      { module: 'CONTACTS', key: 'vip_dining_notes', label: 'Guest Dietary / VIP Preferences', type: 'TEXT', description: 'Allergies, favorite table, wine preferences' },
    ],
    dashboardKpis: [
      { id: 'kpi_daily_covers', label: "Today's Guest Covers", value: '248 pax', delta: '+14.2%', subtext: 'Lunch: 110 | Dinner: 138', iconName: 'Users' },
      { id: 'kpi_table_util', label: 'Table Utilization Rate', value: '82.4%', delta: 'Peak Shift', subtext: 'Average ticket turnover 44 mins', iconName: 'UtensilsCrossed' },
      { id: 'kpi_food_cost_par', label: 'Food Cost Par Level', value: '28.4%', delta: 'Optimal', subtext: 'Target bounded between 28-32%', iconName: 'Layers' },
      { id: 'kpi_daily_sales', label: "Today's Gross F&B Sales", value: '$12,480', delta: '+18.6%', subtext: 'Bar $4.2k | Kitchen $8.2k', iconName: 'Receipt' },
    ],
    quickActions: [
      { id: 'qa_open_kds', label: 'Launch Kitchen KDS', href: '/industry/restaurant', iconName: 'UtensilsCrossed', primary: true },
      { id: 'qa_table_seat', label: 'Seat Party at Table', href: '/industry/restaurant', iconName: 'Users' },
      { id: 'qa_qr_pay', label: 'Table Contactless QR', href: '/qr-payments', iconName: 'Scan' },
      { id: 'qa_reorder_par', label: 'Reorder Depleted Stock', href: '/inventory', iconName: 'ShoppingBag' },
    ],
    emptyStates: {
      contacts: { title: 'No Guest Profiles Saved', message: 'Build your diner guest book to remember birthdays, anniversaries, allergies, and table preferences.', actionLabel: 'Add VIP Guest', actionHref: '/contacts?action=new', iconName: 'Users' },
      deals: { title: 'No Private Dining Inquiries', message: 'Manage banquet buyouts, wedding catering, and private room reservations.', actionLabel: 'New Event Booking', actionHref: '/deals?action=new', iconName: 'Briefcase' },
    },
    reportCatalog: [
      { id: 'rep_rest_sales', title: 'Daily F&B Revenue & Covers Summary', category: 'Operations', description: 'Sales by shift, category, and average ticket size' },
      { id: 'rep_rest_matrix', title: 'Menu Stars & Dogs Margin Analysis', category: 'Cost Control', description: 'Item volume vs gross contribution margin' },
      { id: 'rep_rest_kds', title: 'Kitchen Ticket Duration & Station Velocity', category: 'Back of House', description: 'Minutes to fire and station bottlenecks' },
    ],
    workflowTemplates: [
      { id: 'wf_rest_kitchen_alarm', name: 'Kitchen Order Delay Alarm (>18m Ticket)', description: 'Alerts expeditor when table ticket exceeds 18 minutes on the line', trigger: 'When Order in KDS > 18 Minutes' },
      { id: 'wf_rest_par_reorder', name: 'Low Ingredient Auto-Draft Purchase Order', description: 'Drafts purchase order when protein or dairy stock dips below par', trigger: 'When Inventory <= Minimum Par' },
    ],
    aiPersona: {
      name: 'Chef Auguste F&B Orchestrator',
      role: 'Hospitality & Kitchen Efficiency Director',
      promptContext: 'You are a Michelin-grade restaurant general manager and executive chef advisor focused on table turnover, food cost minimization, and guest experience.',
    },
  },

  // ==========================================================================
  // 5. LOCAL RETAIL, SHOP & SUPERMARKET POS
  // ==========================================================================
  retail: {
    id: 'retail',
    name: 'Local Retail, Shop & Supermarket POS',
    slug: 'retail',
    shortName: 'Retail & POS Shop',
    tagline: 'Engineered for retail stores, supermarkets, grocery outlets, wholesalers, and traders.',
    description: 'High-speed storefront POS terminal, barcode printing, SKU inventory reorders, customer khata credit ledger, and Shopify omnichannel sync.',
    iconName: 'ShoppingBag',
    accentColor: 'indigo',
    recommendedFor: ['Retail Stores', 'Supermarkets & Grocers', 'Apparel Boutiques', 'Electronics Outlets', 'Wholesale Traders'],
    coreServiceIds: [
      'srv_retail_pos_cashier',
      'srv_retail_khata_credit',
      'srv_inventory_stock',
      'srv_price_books',
      'srv_invoices_billing',
    ],
    recommendedServiceIds: [
      'srv_contacts',
      'srv_payment_links_pos',
      'srv_dual_khata',
      'srv_marketing_studio',
      'srv_universal_automation',
    ],
    optionalServiceIds: [
      'srv_hr_people',
      'srv_support_desk',
      'srv_neural_ocr',
      'srv_documents_esign',
    ],
    terminology: {
      contacts: 'Store Customers & Accounts',
      deals: 'Wholesale B2B Orders',
      projects: 'Stocktake & Inventory Audits',
      invoices: 'Retail Sales Receipts',
      products: 'Barcode Inventory SKUs',
      tickets: 'Customer Returns & Exchanges',
      records: 'POS Cashier Transactions',
      actions: {
        createRecord: 'New POS Sale',
        bookSchedule: 'Schedule Stocktake',
        generateBill: 'Print Cash Receipt',
        viewPipeline: 'View Store Register',
      },
    },
    recordTypes: [
      { id: 'rec_receipt', name: 'Cash Register Receipt', singular: 'Receipt', plural: 'Receipts', route: '/industry/retail', iconName: 'ShoppingBag', description: 'POS sale transactions, line items, and tender' },
      { id: 'rec_sku', name: 'Retail Product SKU', singular: 'SKU Item', plural: 'SKU Items', route: '/price-books', iconName: 'Layers', description: 'Barcode, cost price, retail price, and shelf stock' },
      { id: 'rec_khata', name: 'Customer Khata Credit', singular: 'Khata Entry', plural: 'Khata Entries', route: '/industry/retail', iconName: 'Users', description: 'Store regular credit balance and repayments' },
    ],
    customFields: [
      { module: 'PRODUCTS', key: 'barcode_ean_upc', label: 'Barcode (EAN / UPC / QR)', type: 'TEXT', description: 'Scannable barcode string' },
      { module: 'PRODUCTS', key: 'reorder_point_qty', label: 'Minimum Reorder Threshold', type: 'NUMBER', description: 'Automatic restock trigger level' },
      { module: 'CONTACTS', key: 'khata_credit_limit', label: 'Store Credit Limit ($)', type: 'CURRENCY', description: 'Approved khata credit allowance' },
    ],
    dashboardKpis: [
      { id: 'kpi_retail_daily', label: "Today's POS Sales", value: '$14,820', delta: '+12.4%', subtext: '421 receipts printed', iconName: 'Receipt' },
      { id: 'kpi_avg_basket', label: 'Average Basket Value', value: '$35.20', delta: '4.8 items', subtext: 'Cashier throughput 64 tx/hr', iconName: 'ShoppingBag' },
      { id: 'kpi_khata_dues', label: 'Customer Khata Receivables', value: '$3,840', delta: 'Balanced', subtext: '28 local accounts on store credit', iconName: 'Users' },
      { id: 'kpi_low_stock_sku', label: 'Low-Stock Restock Alarms', value: '14 items', delta: 'Action Needed', subtext: 'Inventory under par reorder limit', iconName: 'Layers' },
    ],
    quickActions: [
      { id: 'qa_open_pos', label: 'Launch POS Cashier', href: '/industry/retail', iconName: 'ShoppingBag', primary: true },
      { id: 'qa_barcode_print', label: 'Print Barcode Labels', href: '/industry/retail', iconName: 'Scan' },
      { id: 'qa_khata_log', label: 'Log Customer Khata Dues', href: '/industry/retail', iconName: 'Users' },
      { id: 'qa_inventory_check', label: 'Perform Stock Adjustment', href: '/inventory', iconName: 'RefreshCw' },
    ],
    emptyStates: {
      contacts: { title: 'No Customer Ledger Entries', message: 'Capture store regulars to provide instant khata credit, loyalty discounts, and WhatsApp receipts.', actionLabel: 'Add Store Customer', actionHref: '/contacts?action=new', iconName: 'Users' },
      deals: { title: 'No Wholesale Purchase Orders', message: 'Manage bulk buyer orders, supplier shipments, and trade container distribution.', actionLabel: 'Create B2B Order', actionHref: '/deals?action=new', iconName: 'Briefcase' },
    },
    reportCatalog: [
      { id: 'rep_ret_z_report', title: 'Daily Cash Register Z-Report', category: 'Cashier', description: 'Tender breakdown (Cash, Card, Khata, QR) and sales tax' },
      { id: 'rep_ret_turnover', title: 'SKU Inventory Turnover & Velocity', category: 'Inventory', description: 'Fast moving vs dead inventory analysis' },
      { id: 'rep_ret_margin', title: 'Gross Retail Margin by Department', category: 'Profitability', description: 'Cost of goods sold vs retail sales price' },
    ],
    workflowTemplates: [
      { id: 'wf_ret_daily_close', name: 'Automated 10pm Register Reconciler & Z-Report', description: 'Generates daily accounting entries and emails owner consolidated sales', trigger: 'Every Day at 22:00' },
      { id: 'wf_ret_low_stock', name: 'Low Stock SKU WhatsApp Alert to Manager', description: 'Dispatches instant restocking list when products cross reorder point', trigger: 'When Item Stock <= Minimum' },
    ],
    aiPersona: {
      name: 'Hermes Retail Merchant',
      role: 'Storefront POS & Inventory Strategist',
      promptContext: 'You are an experienced retail operations director advising on cashier throughput, inventory shrinkage prevention, and high-margin product merchandising.',
    },
  },

  // ==========================================================================
  // 6. SME & TECH B2B SAAS OS
  // ==========================================================================
  sme: {
    id: 'sme',
    name: 'SME & Tech B2B SaaS OS',
    slug: 'sme',
    shortName: 'SME & Tech SaaS',
    tagline: 'Built for software companies, high-growth B2B startups, consultants, and scale-ups.',
    description: 'B2B subscription and customer health engine managing MRR/ARR velocity, enterprise contract renewals, billable hours, and product support SLAs.',
    iconName: 'Building2',
    accentColor: 'teal',
    recommendedFor: ['Software Companies', 'B2B SaaS Startups', 'IT Consultancies', 'Tech Scale-ups', 'Professional Services'],
    coreServiceIds: [
      'srv_saas_subscriptions',
      'srv_deals_pipeline',
      'srv_invoices_billing',
      'srv_customer_360',
      'srv_support_desk',
      'srv_projects_tasks',
    ],
    recommendedServiceIds: [
      'srv_contacts',
      'srv_b2b_prospector',
      'srv_cpq_quotes',
      'srv_payment_links_pos',
      'srv_documents_esign',
      'srv_universal_automation',
    ],
    optionalServiceIds: [
      'srv_dual_khata',
      'srv_hr_people',
      'srv_marketing_studio',
      'srv_neural_ocr',
    ],
    terminology: {
      contacts: 'Accounts & Key Contacts',
      deals: 'Sales Opportunities & Renewals',
      projects: 'Customer Onboarding Sprints',
      invoices: 'Recurring Invoices & Stripe Dues',
      products: 'SaaS Plans & Add-ons',
      tickets: 'Engineering & Support Tickets',
      records: 'Customer Subscriptions',
      actions: {
        createRecord: 'New SaaS Deal',
        bookSchedule: 'Schedule Demo Call',
        generateBill: 'Issue Subscription Bill',
        viewPipeline: 'View MRR Pipeline',
      },
    },
    recordTypes: [
      { id: 'rec_sub', name: 'SaaS Subscription', singular: 'Subscription', plural: 'Subscriptions', route: '/subscriptions', iconName: 'DollarSign', description: 'Recurring plan tier, MRR, seats, and renewal date' },
      { id: 'rec_opp', name: 'Software Opportunity', singular: 'Opportunity', plural: 'Opportunities', route: '/deals', iconName: 'Briefcase', description: 'Enterprise procurement and expansion stages' },
      { id: 'rec_issue', name: 'Support / Engineering Issue', singular: 'Issue', plural: 'Issues', route: '/tickets', iconName: 'Ticket', description: 'SLA tickets, bug reports, and feature requests' },
    ],
    customFields: [
      { module: 'CONTACTS', key: 'customer_health_score', label: 'Health Score (1-100)', type: 'NUMBER', description: 'Product usage and executive sponsor health' },
      { module: 'DEALS', key: 'billing_frequency', label: 'Billing Cadence', type: 'DROPDOWN', options: ['Monthly Recurring', 'Annual Upfront (12mo)', '3-Year Multi-Year'], description: 'Contract payment structure' },
      { module: 'DEALS', key: 'seat_license_count', label: 'User Seat Licenses', type: 'NUMBER', description: 'Allocated user seats' },
    ],
    dashboardKpis: [
      { id: 'kpi_sme_mrr', label: 'Monthly Recurring Revenue', value: '$118.4k', delta: '+14.2%', subtext: 'Annualized ARR $1.42M', iconName: 'DollarSign' },
      { id: 'kpi_net_retention', label: 'Net Revenue Retention', value: '118.2%', delta: 'Healthy', subtext: 'Expansion MRR offsetting churn', iconName: 'TrendingUp' },
      { id: 'kpi_billable_hours', label: 'Active Retainer Burn', value: '78%', delta: '342 hrs', subtext: 'Unbilled consulting WIP $18.4k', iconName: 'Clock' },
      { id: 'kpi_open_p1_tickets', label: 'SLA Compliance Rate', value: '99.4%', delta: '0 Breaches', subtext: 'Median response time 14 mins', iconName: 'ShieldCheck' },
    ],
    quickActions: [
      { id: 'qa_new_sub', label: 'Create Subscription', href: '/subscriptions?action=new', iconName: 'DollarSign', primary: true },
      { id: 'qa_opp', label: 'Log Sales Opportunity', href: '/deals?action=new', iconName: 'Briefcase' },
      { id: 'qa_stripe_link', label: 'Create Instant Stripe Link', href: '/payment-links', iconName: 'Zap' },
      { id: 'qa_customer_360', label: 'Customer 360 Health', href: '/customer-360', iconName: 'Users' },
    ],
    emptyStates: {
      contacts: { title: 'No SaaS Accounts Onboarded', message: 'Import company accounts to track product health scores, active seat counts, and contract renewals.', actionLabel: 'Add Account', actionHref: '/contacts?action=new', iconName: 'Users' },
      deals: { title: 'No Sales Deals in Pipeline', message: 'Capture software opportunities to forecast ARR expansion, upsell seats, and manage closing stages.', actionLabel: 'Create SaaS Deal', actionHref: '/deals?action=new', iconName: 'Briefcase' },
    },
    reportCatalog: [
      { id: 'rep_saas_mrr', title: 'MRR Growth Waterfall & Churn Cohorts', category: 'Finance', description: 'New, expansion, contraction, and gross churn trends' },
      { id: 'rep_saas_cac', title: 'CAC Payback & LTV:CAC Ratio', category: 'Growth', description: 'Efficiency of customer acquisition investments' },
      { id: 'rep_saas_health', title: 'Customer Health & Churn Risk Matrix', category: 'Customer Success', description: 'At-risk accounts by login inactivity and ticket volume' },
    ],
    workflowTemplates: [
      { id: 'wf_saas_dunning', name: 'Failed Stripe Payment Dunning Sequence', description: 'Automates card retry and personalized customer alert upon billing fail', trigger: 'When Invoice Payment Fails' },
      { id: 'wf_saas_onboarding', name: 'New Customer Welcome & CS Kickoff Sprint', description: 'Assigns onboarding specialist and schedules 30-day executive review', trigger: 'When Deal Stage = Closed Won' },
    ],
    aiPersona: {
      name: 'Athena SaaS Growth Advisor',
      role: 'B2B SaaS Revenue & Retention Strategist',
      promptContext: 'You are a veteran SaaS operating advisor specializing in Net Revenue Retention (NRR), churn prevention, and sales pipeline velocity.',
    },
  },

  // ==========================================================================
  // 7. CREATIVE AGENCY & SERVICES OS
  // ==========================================================================
  agency: {
    id: 'agency',
    name: 'Creative Agency & Services OS',
    slug: 'agency',
    shortName: 'Creative Agency',
    tagline: 'Tailored for digital agencies, marketing studios, dev shops, and consultancy firms.',
    description: 'Client service workspace managing retainer proposals, milestone sprint deliverables, client review approvals, blended ad ROAS, and billable time tracking.',
    iconName: 'Palette',
    accentColor: 'indigo',
    recommendedFor: ['Digital Marketing Agencies', 'Design & Creative Studios', 'Software Dev Shops', 'PR & Media Firms', 'Management Consultancies'],
    coreServiceIds: [
      'srv_projects_tasks',
      'srv_invoices_billing',
      'srv_contacts',
      'srv_deals_pipeline',
      'srv_marketing_studio',
      'srv_documents_esign',
    ],
    recommendedServiceIds: [
      'srv_price_books',
      'srv_b2b_prospector',
      'srv_customer_360',
      'srv_payment_links_pos',
      'srv_universal_automation',
    ],
    optionalServiceIds: [
      'srv_dual_khata',
      'srv_hr_people',
      'srv_support_desk',
      'srv_neural_ocr',
    ],
    terminology: {
      contacts: 'Client Accounts & Stakeholders',
      deals: 'Pitch & Retainer Proposals',
      projects: 'Client Sprints & Deliverables',
      invoices: 'Milestone & Retainer Bills',
      products: 'Agency Service Rate Cards',
      tickets: 'Client Revisions & Feedback',
      records: 'Creative Deliverables',
      actions: {
        createRecord: 'New Client Project',
        bookSchedule: 'Book Pitch Presentation',
        generateBill: 'Issue Milestone Bill',
        viewPipeline: 'View Proposal Pipeline',
      },
    },
    recordTypes: [
      { id: 'rec_project', name: 'Client Sprint / Campaign', singular: 'Campaign', plural: 'Campaigns', route: '/projects', iconName: 'ClipboardList', description: 'Deliverable milestones, briefs, and client review stages' },
      { id: 'rec_retainer', name: 'Client Retainer Agreement', singular: 'Retainer', plural: 'Retainers', route: '/deals', iconName: 'Briefcase', description: 'Monthly scope of work, hours cap, and recurring fee' },
      { id: 'rec_proposal', name: 'Pitch Deck & Proposal', singular: 'Proposal', plural: 'Proposals', route: '/quotes', iconName: 'FileBadge', description: 'Creative proposals, estimates, and SOW agreements' },
    ],
    customFields: [
      { module: 'PROJECTS', key: 'creative_deliverable_type', label: 'Deliverable Format', type: 'DROPDOWN', options: ['Brand Identity & Guidelines', 'UI/UX Mobile/Web Design', 'Full-Stack Software Build', 'Ad Campaign Video Production', 'SEO & Content Sprint'], description: 'Service scope' },
      { module: 'DEALS', key: 'monthly_retainer_fee', label: 'Monthly Retainer ($)', type: 'CURRENCY', description: 'Recurring client retainer budget' },
      { module: 'PROJECTS', key: 'allocated_billable_hours', label: 'Allocated Monthly Hours', type: 'NUMBER', description: 'Hours cap agreed in SOW' },
    ],
    dashboardKpis: [
      { id: 'kpi_ad_spend', label: 'Managed Client Ad Spend', value: '$184.5k', delta: '+24.6%', subtext: 'Meta, Google, TikTok, LinkedIn', iconName: 'TrendingUp' },
      { id: 'kpi_blended_roas', label: 'Blended Client ROAS', value: '4.62x', delta: '+0.4x', subtext: 'Average return on marketing spend', iconName: 'Activity' },
      { id: 'kpi_deliverables_due', label: 'Active Deliverables', value: '42 / 50', delta: '8 in Review', subtext: 'Client review approvals pending', iconName: 'ClipboardList' },
      { id: 'kpi_team_util', label: 'Agency Billable Utilization', value: '86.4%', delta: 'Healthy', subtext: 'Optimal target bounded 80-90%', iconName: 'Users' },
    ],
    quickActions: [
      { id: 'qa_new_project', label: 'Create Client Sprint', href: '/projects?action=new', iconName: 'ClipboardList', primary: true },
      { id: 'qa_pitch_proposal', label: 'Draft Pitch Proposal', href: '/quotes?action=new', iconName: 'FileBadge' },
      { id: 'qa_social_calendar', label: 'Open Social Calendar', href: '/social', iconName: 'Share2' },
      { id: 'qa_retainer_invoice', label: 'Bill Monthly Retainer', href: '/invoices?action=new', iconName: 'Receipt' },
    ],
    emptyStates: {
      contacts: { title: 'No Agency Clients Registered', message: 'Add brand accounts and marketing stakeholders to manage project deliverables, approvals, and invoices.', actionLabel: 'Add Client Account', actionHref: '/contacts?action=new', iconName: 'Users' },
      deals: { title: 'No Retainer Proposals in Flight', message: 'Create pitch decks and retainer agreements to forecast your agency pipeline and billable capacity.', actionLabel: 'Draft Proposal', actionHref: '/deals?action=new', iconName: 'Briefcase' },
    },
    reportCatalog: [
      { id: 'rep_agn_profit', title: 'Client Account Profitability & Margin', category: 'Finance', description: 'Retainer revenue vs actual designer/dev hours logged' },
      { id: 'rep_agn_util', title: 'Team Billable Utilization & Capacity', category: 'Workforce', description: 'Staff hours logged to client vs internal work' },
      { id: 'rep_agn_roas', title: 'Multi-Network Campaign ROAS Audit', category: 'Marketing', description: 'Cross-client advertising yield across channels' },
    ],
    workflowTemplates: [
      { id: 'wf_agn_client_approved', name: 'Deliverable Client Approval to Production Release', description: 'Notifies team lead and generates client sign-off certificate upon approval', trigger: 'When Deliverable Marked Approved' },
      { id: 'wf_agn_hours_warning', name: 'Retainer 80% Hours Burn Pre-Warning', description: 'Alerts account manager when client has consumed 80% of monthly hours cap', trigger: 'When Hours Burn >= 80%' },
    ],
    aiPersona: {
      name: 'Muses Agency Strategist',
      role: 'Creative Director & Agency Operations Lead',
      promptContext: 'You are an agency operations executive focused on client delivery velocity, retainer margin protection, and campaign ROAS maximization.',
    },
  },

  // ==========================================================================
  // 8. CUSTOM TAILORED WORKSPACE
  // ==========================================================================
  custom: {
    id: 'custom',
    name: 'Custom Tailored Workspace',
    slug: 'custom',
    shortName: 'Custom Workspace',
    tagline: 'Bespoke workspace dynamically configured with user-selected features and entity schemas.',
    description: 'Dynamic low-code workspace composer allowing custom entity definitions, dynamic schemas, bespoke workflows, and tailored operational layouts.',
    iconName: 'Layers',
    accentColor: 'emerald',
    recommendedFor: ['Custom Enterprises', 'Specialty Consultancies', 'Hybrid Businesses', 'Independent Builders'],
    coreServiceIds: [
      'srv_contacts',
      'srv_deals_pipeline',
      'srv_invoices_billing',
      'srv_projects_tasks',
      'srv_universal_automation',
    ],
    recommendedServiceIds: [
      'srv_dual_khata',
      'srv_documents_esign',
      'srv_support_desk',
      'srv_b2b_prospector',
    ],
    optionalServiceIds: [
      'srv_neural_ocr',
      'srv_payment_links_pos',
      'srv_saas_subscriptions',
      'srv_inventory_stock',
      'srv_marketing_studio',
      'srv_hr_people',
    ],
    terminology: {
      contacts: 'Custom Contacts & Accounts',
      deals: 'Business Opportunities',
      projects: 'Operational Projects',
      invoices: 'Invoices & Billing',
      products: 'Items & Products',
      tickets: 'Inquiries & Issues',
      records: 'Custom Entity Objects',
      actions: {
        createRecord: 'Create Custom Record',
        bookSchedule: 'Schedule Action',
        generateBill: 'Generate Billing Entry',
        viewPipeline: 'View Custom Flow',
      },
    },
    recordTypes: [
      { id: 'rec_custom_entity', name: 'Dynamic Custom Object', singular: 'Custom Record', plural: 'Custom Records', route: '/customization', iconName: 'Database', description: 'User-defined schema entities and fields' },
    ],
    customFields: [],
    dashboardKpis: [
      { id: 'kpi_event_bus', label: 'Event Bus Mesh', value: '42.5k/m', delta: 'Healthy', subtext: 'Universal microservice pub/sub', iconName: 'Workflow' },
      { id: 'kpi_custom_objects', label: 'Registered Entities', value: '18 schemas', delta: '+3 new', subtext: 'Custom low-code objects active', iconName: 'Database' },
      { id: 'kpi_api_calls', label: 'Microservice Registry', value: '100% Up', delta: 'Zero Errors', subtext: '9 connected operational engines', iconName: 'Activity' },
      { id: 'kpi_custom_active', label: 'Active Workflows', value: '38 live', delta: 'Automated', subtext: 'Executing across tenant events', iconName: 'Sparkles' },
    ],
    quickActions: [
      { id: 'qa_schema_builder', label: 'Launch Schema Builder', href: '/customization', iconName: 'Database', primary: true },
      { id: 'qa_new_workflow_custom', label: 'Design Workflow', href: '/automation', iconName: 'Workflow' },
      { id: 'qa_api_sandbox', label: 'Developer Sandbox', href: '/developer', iconName: 'Code2' },
    ],
    emptyStates: {
      contacts: { title: 'No Records Defined Yet', message: 'Use the low-code schema builder to define custom objects, relationships, and custom fields tailored to your exact business needs.', actionLabel: 'Open Schema Builder', actionHref: '/customization', iconName: 'Database' },
      deals: { title: 'No Pipeline Records Found', message: 'Configure stages and custom attributes for your unique business workflows.', actionLabel: 'Configure Pipeline', actionHref: '/deals', iconName: 'Briefcase' },
    },
    reportCatalog: [
      { id: 'rep_cust_audit', title: 'System Event Bus Audit & API Health', category: 'Developer', description: 'Telemetry across custom objects and webhooks' },
    ],
    workflowTemplates: [
      { id: 'wf_cust_generic', name: 'Universal Webhook to Slack & Dual Khata', description: 'Dispatches custom event notifications to external webhooks', trigger: 'When Custom Entity Created' },
    ],
    aiPersona: {
      name: 'Daedalus Systems Architect',
      role: 'Universal Custom Architecture Engine',
      promptContext: 'You are an expert systems architect and database modeler assisting in structuring custom business entities, automations, and operational workflows.',
    },
  },

  // ==========================================================================
  // 9. CONSTRUCTION & CONTRACTING
  // ==========================================================================
  construction: {
    id: 'construction',
    name: 'Construction & Contracting OS',
    slug: 'construction',
    shortName: 'Construction',
    tagline: 'Heavy machinery tracking, site superintendent daily logs, subcontractor bids, and AIA progress billing.',
    description: 'Purpose-built for general contractors, civil engineers, specialty trades, and commercial builders.',
    iconName: 'HardHat',
    accentColor: '#f59e0b',
    recommendedFor: ['General Contractors', 'Commercial Builders', 'Trade Subcontractors (HVAC/MEP)', 'Civil Infrastructure'],
    coreServiceIds: ['srv_projects_tasks', 'srv_invoices_billing', 'srv_documents_esign', 'srv_contacts', 'srv_inventory_stock'],
    recommendedServiceIds: ['srv_deals_pipeline', 'srv_dual_khata', 'srv_universal_automation', 'srv_hr_people'],
    optionalServiceIds: ['srv_marketing_studio', 'srv_customer_360'],
    terminology: {
      contacts: 'Clients & Subcontractors',
      deals: 'Estimates & Tender Bids',
      projects: 'Active Job Sites',
      invoices: 'AIA Progress Invoices',
      products: 'Heavy Equipment & Materials',
      tickets: 'Site Punch List & Hazards',
      records: 'Job Site Records',
      actions: {
        createRecord: 'New Site Record',
        bookSchedule: 'Schedule Inspection',
        generateBill: 'Draft AIA Invoice',
        viewPipeline: 'View Tender Bids',
      },
    },
    recordTypes: [
      { id: 'rec_equipment', name: 'Heavy Machinery & Fleet', singular: 'Equipment', plural: 'Equipment', route: '/projects', iconName: 'Truck', description: 'Excavators, cranes, generators, and site assignments' },
      { id: 'rec_site_log', name: 'Site Daily Safety Log', singular: 'Daily Log', plural: 'Daily Logs', route: '/tickets', iconName: 'FileText', description: 'Daily worker counts, safety inspections, and site conditions' },
    ],
    customFields: [
      { module: 'PROJECTS', key: 'superintendent', label: 'Site Superintendent', type: 'TEXT', description: 'Lead field manager on site' },
      { module: 'DEALS', key: 'bond_required', label: 'Performance Bond Required', type: 'BOOLEAN', description: 'Indicates municipal bonding requirements' },
    ],
    dashboardKpis: [
      { id: 'kpi_active_sites', label: 'Active Job Sites', value: '8 Sites', delta: '14 Crews', subtext: '100% on safety schedule', iconName: 'Building2' },
      { id: 'kpi_bid_pipeline', label: 'Tender Bids Pipeline', value: '$3.8M', delta: '5 Pending', subtext: 'Commercial RFP submissions', iconName: 'Briefcase' },
      { id: 'kpi_equipment_util', label: 'Fleet Utilization', value: '92.4%', delta: '2 in Maintenance', subtext: '28 machines deployed', iconName: 'Truck' },
      { id: 'kpi_safety_days', label: 'Incident-Free Days', value: '412 Days', delta: 'OSHA Compliant', subtext: 'Zero recordables this year', iconName: 'ShieldAlert' },
    ],
    quickActions: [
      { id: 'qa_new_site', label: 'Create Job Site', href: '/projects?action=new', iconName: 'Plus', primary: true },
      { id: 'qa_aia_invoice', label: 'Generate AIA Draw', href: '/invoices?action=new', iconName: 'Receipt' },
      { id: 'qa_daily_log', label: 'Log Daily Site Report', href: '/tickets?action=new', iconName: 'FileText' },
    ],
    emptyStates: {
      contacts: { title: 'No Subcontractors Registered', message: 'Add certified trade subcontractors, general engineers, and suppliers.', actionLabel: 'Add Subcontractor', actionHref: '/contacts', iconName: 'Users' },
      deals: { title: 'No Tender Bids Found', message: 'Create estimating tenders and bid submissions for commercial RFPs.', actionLabel: 'New Tender Bid', actionHref: '/deals', iconName: 'Briefcase' },
    },
    reportCatalog: [
      { id: 'rep_const_draws', title: 'AIA Draw Schedule & Lien Waivers', category: 'Finance', description: 'Tracks architect-approved draw schedules and retainage' },
    ],
    workflowTemplates: [
      { id: 'wf_const_safety', name: 'OSHA Near-Miss Immediate Notification', description: 'Pages safety director when hazardous conditions are logged', trigger: 'Hazard Logged' },
    ],
    aiPersona: {
      name: 'Sentinel Site Superintendent',
      role: 'Construction Operations Specialist',
      promptContext: 'You are an experienced construction executive expert in AIA draw schedules, subcontractor contracts, equipment logistics, and OSHA safety compliance.',
    },
  },

  // ==========================================================================
  // 10. LAW FIRM & LEGAL PRACTICE
  // ==========================================================================
  legal: {
    id: 'legal',
    name: 'Law Firm & Legal Practice OS',
    slug: 'legal',
    shortName: 'Legal & Law',
    tagline: 'Matter management, conflict-of-interest checks, court dockets, time & billing, and retainer trust accounts.',
    description: 'Designed for litigation boutiques, corporate practices, family law firms, and in-house general counsel.',
    iconName: 'Scale',
    accentColor: '#0284c7',
    recommendedFor: ['Litigation Law Firms', 'Corporate Legal Practices', 'Family & Estate Attorneys', 'Solo Legal Practitioners'],
    coreServiceIds: ['srv_deals_pipeline', 'srv_invoices_billing', 'srv_documents_esign', 'srv_contacts', 'srv_support_desk'],
    recommendedServiceIds: ['srv_projects_tasks', 'srv_universal_automation', 'srv_customer_360', 'srv_neural_ocr'],
    optionalServiceIds: ['srv_marketing_studio', 'srv_hr_people'],
    terminology: {
      contacts: 'Clients & Opposing Counsel',
      deals: 'Client Matters & Retainers',
      projects: 'Court Filings & Discovery',
      invoices: 'Legal Fee & Trust Statements',
      products: 'Practice Areas & Hourly Rates',
      tickets: 'Court Docket Deadlines',
      records: 'Case Files',
      actions: {
        createRecord: 'Open New Matter',
        bookSchedule: 'Schedule Hearing',
        generateBill: 'Generate Fee Statement',
        viewPipeline: 'View Active Matters',
      },
    },
    recordTypes: [
      { id: 'rec_legal_matter', name: 'Client Legal Matter', singular: 'Matter', plural: 'Matters', route: '/deals', iconName: 'Scale', description: 'Case history, opposing parties, court filings, and conflict clearance' },
    ],
    customFields: [
      { module: 'DEALS', key: 'court_case_no', label: 'Court Docket / Case #', type: 'TEXT', description: 'Official court docket index number' },
      { module: 'DEALS', key: 'conflict_cleared', label: 'Conflict Check Cleared', type: 'BOOLEAN', description: 'Mandatory ethics clearance check' },
    ],
    dashboardKpis: [
      { id: 'kpi_active_matters', label: 'Active Legal Matters', value: '46 Cases', delta: '12 in Litigation', subtext: 'Across 4 practice areas', iconName: 'Scale' },
      { id: 'kpi_billable_hours', label: 'Billable Hours (Month)', value: '348 hrs', delta: '94% Target', subtext: 'Avg rate: $425/hr', iconName: 'Clock' },
      { id: 'kpi_trust_balance', label: 'IOLTA Trust Retainers', value: '$284,500', delta: 'Fully Segregated', subtext: 'Client escrow reserves', iconName: 'Receipt' },
      { id: 'kpi_upcoming_hearings', label: 'Hearings (Next 14d)', value: '8 Appearances', delta: 'Cal-Sync Active', subtext: 'State & Federal court', iconName: 'Calendar' },
    ],
    quickActions: [
      { id: 'qa_new_matter', label: 'Open Legal Matter', href: '/deals?action=new', iconName: 'Plus', primary: true },
      { id: 'qa_log_time', label: 'Log Billable Hours', href: '/projects?action=time', iconName: 'Clock' },
      { id: 'qa_trust_invoice', label: 'IOLTA Fee Statement', href: '/invoices?action=new', iconName: 'Receipt' },
    ],
    emptyStates: {
      contacts: { title: 'No Clients Registered', message: 'Add clients and record conflict-of-interest checks.', actionLabel: 'Add Client', actionHref: '/contacts', iconName: 'Users' },
      deals: { title: 'No Active Matters Found', message: 'Open client legal matters and track litigation milestones.', actionLabel: 'Open Matter', actionHref: '/deals', iconName: 'Scale' },
    },
    reportCatalog: [
      { id: 'rep_legal_trust', title: 'IOLTA Trust Account Reconciliation', category: 'Compliance', description: 'State Bar compliant trust accounting and ledger balances' },
    ],
    workflowTemplates: [
      { id: 'wf_court_deadline', name: 'Court Docket 72h Rule Escalation', description: 'Notifies lead partner 72 hours before filing cut-off', trigger: '72h Before Filing' },
    ],
    aiPersona: {
      name: 'Justitia Legal Paralegal',
      role: 'Legal Operations Specialist',
      promptContext: 'You are a senior legal operations and compliance assistant expert in matter intake, conflict clearing, court calendar rules, and IOLTA trust billing.',
    },
  },

  // ==========================================================================
  // 11. LOGISTICS, FREIGHT & FLEET
  // ==========================================================================
  logistics: {
    id: 'logistics',
    name: 'Logistics, Freight & Fleet OS',
    slug: 'logistics',
    shortName: 'Logistics & Fleet',
    tagline: 'Fleet dispatching, bills of lading, trip manifests, driver rosters, and freight billing.',
    description: 'Engineered for freight forwarders, 3PL warehouses, intermodal carriers, and delivery fleets.',
    iconName: 'Truck',
    accentColor: '#10b981',
    recommendedFor: ['Freight Forwarders', '3PL Warehouses', 'Intermodal Trucking Fleets', 'Last-Mile Delivery'],
    coreServiceIds: ['srv_projects_tasks', 'srv_invoices_billing', 'srv_contacts', 'srv_inventory_stock', 'srv_documents_esign'],
    recommendedServiceIds: ['srv_deals_pipeline', 'srv_dual_khata', 'srv_universal_automation'],
    optionalServiceIds: ['srv_support_desk', 'srv_marketing_studio'],
    terminology: {
      contacts: 'Shippers, Consignees & Drivers',
      deals: 'Freight Contracts & Loads',
      projects: 'Active Shipments & Routes',
      invoices: 'Freight Invoices & Fuel Surcharges',
      products: 'Fleet Assets & Trailer Stock',
      tickets: 'Dispatch Exceptions & Delays',
      records: 'Shipment Manifests',
      actions: {
        createRecord: 'Dispatch Load',
        bookSchedule: 'Schedule Pickup',
        generateBill: 'Issue Freight Bill',
        viewPipeline: 'View Load Board',
      },
    },
    recordTypes: [
      { id: 'rec_shipment', name: 'Freight Load & Manifest', singular: 'Shipment', plural: 'Shipments', route: '/projects', iconName: 'Truck', description: 'Origin, destination, assigned driver, trailer, and bill of lading' },
    ],
    customFields: [
      { module: 'PROJECTS', key: 'pro_number', label: 'PRO Tracking Number', type: 'TEXT', description: 'Standard carrier tracking number' },
      { module: 'PROJECTS', key: 'load_weight_lbs', label: 'Cargo Weight (lbs)', type: 'NUMBER', description: 'Gross cargo weight' },
    ],
    dashboardKpis: [
      { id: 'kpi_active_loads', label: 'Loads in Transit', value: '42 Loads', delta: '98.1% On-Time', subtext: 'Across 6 freight lanes', iconName: 'Truck' },
      { id: 'kpi_fleet_status', label: 'Active Drivers On Road', value: '36 Drivers', delta: 'Zero HOS Violations', subtext: 'ELD telematics sync', iconName: 'Users' },
      { id: 'kpi_freight_rev', label: 'Freight Revenue (WTD)', value: '$184k', delta: '+11% vs last week', subtext: 'Average rate $2.42/mi', iconName: 'DollarSign' },
      { id: 'kpi_claims_rate', label: 'Cargo Claims Ratio', value: '0.04%', delta: 'Well Below 0.5%', subtext: 'Zero lost freight', iconName: 'ShieldCheck' },
    ],
    quickActions: [
      { id: 'qa_dispatch_load', label: 'Dispatch Freight Load', href: '/projects?action=new', iconName: 'Truck', primary: true },
      { id: 'qa_gen_bol', label: 'Generate BOL Document', href: '/documents?action=new', iconName: 'FileText' },
    ],
    emptyStates: {
      contacts: { title: 'No Shippers or Carriers', message: 'Add commercial shippers, 3PL partners, and qualified CDL drivers.', actionLabel: 'Add Carrier', actionHref: '/contacts', iconName: 'Users' },
      deals: { title: 'No Freight Contracts', message: 'Create contracted rate agreements and spot market quote tenders.', actionLabel: 'New Freight Contract', actionHref: '/deals', iconName: 'Briefcase' },
    },
    reportCatalog: [
      { id: 'rep_log_lanes', title: 'Lane Profitability & Fuel Surcharge Report', category: 'Operations', description: 'Margin analysis across origins and destinations' },
    ],
    workflowTemplates: [
      { id: 'wf_pod_delivery', name: 'Automated Proof of Delivery (POD) Invoice Trigger', description: 'Generates final freight invoice immediately upon delivery sign-off', trigger: 'Delivered Signed' },
    ],
    aiPersona: {
      name: 'Hermes Fleet Dispatcher',
      role: 'Logistics Operations Specialist',
      promptContext: 'You are a master freight dispatcher and logistics coordinator expert in ELD compliance, lane pricing, bills of lading, and freight billing.',
    },
  },

  // ==========================================================================
  // 12. FITNESS CLUB & GYM STUDIO
  // ==========================================================================
  fitness: {
    id: 'fitness',
    name: 'Fitness Club & Gym Studio OS',
    slug: 'fitness',
    shortName: 'Fitness & Gym',
    tagline: 'Member check-ins, recurring class schedules, personal trainer rosters, and membership billing.',
    description: 'Designed for health clubs, crossfit boxes, yoga/pilates studios, and personal training facilities.',
    iconName: 'Dumbbell',
    accentColor: '#ec4899',
    recommendedFor: ['Health Clubs & Gyms', 'Boutique Fitness Studios', 'Martial Arts Dojos', 'Personal Training Centers'],
    coreServiceIds: ['srv_contacts', 'srv_invoices_billing', 'srv_projects_tasks', 'srv_retail_pos_cashier'],
    recommendedServiceIds: ['srv_deals_pipeline', 'srv_support_desk', 'srv_universal_automation'],
    optionalServiceIds: ['srv_marketing_studio', 'srv_customer_360'],
    terminology: {
      contacts: 'Members & Athletes',
      deals: 'Membership Plans & Trials',
      projects: 'Class Schedules & Workshops',
      invoices: 'Monthly Dues & POS Sales',
      products: 'Memberships, Supplements & Gear',
      tickets: 'Member Inquiries & Freezes',
      records: 'Member Check-Ins',
      actions: {
        createRecord: 'Enroll New Member',
        bookSchedule: 'Book Studio Class',
        generateBill: 'Charge Membership Dues',
        viewPipeline: 'View Trial Leads',
      },
    },
    recordTypes: [
      { id: 'rec_membership', name: 'Member Profile & Tier', singular: 'Membership', plural: 'Memberships', route: '/contacts', iconName: 'Users', description: 'Access level, barcode ID, recurring dues, and attendance records' },
    ],
    customFields: [
      { module: 'CONTACTS', key: 'keytag_barcode', label: 'Keytag / RFID Barcode', type: 'TEXT', description: 'Physical keytag code for automated turnstile check-in' },
      { module: 'CONTACTS', key: 'membership_tier', label: 'Membership Plan Tier', type: 'DROPDOWN', options: ['Basic Gym ($49/mo)', 'All-Access Group Fitness ($99/mo)', 'VIP Personal Training ($199/mo)'], description: 'Contracted recurring plan' },
    ],
    dashboardKpis: [
      { id: 'kpi_active_members', label: 'Active Gym Members', value: '842 Members', delta: '+28 this month', subtext: '94% retention rate', iconName: 'Users' },
      { id: 'kpi_today_visits', label: "Today's Gym Check-Ins", value: '312 Visits', delta: 'Peak: 5pm-8pm', subtext: '48 in group classes', iconName: 'Activity' },
      { id: 'kpi_mrr_dues', label: 'Monthly Recurring Dues', value: '$68,400', delta: '+8.4% MoM', subtext: 'Auto-debit collection: 98%', iconName: 'DollarSign' },
      { id: 'kpi_trainer_sessions', label: 'PT Sessions Completed', value: '42 Sessions', delta: '98% booked', subtext: '6 certified trainers on duty', iconName: 'Calendar' },
    ],
    quickActions: [
      { id: 'qa_checkin_member', label: 'Member Quick Check-In', href: '/contacts', iconName: 'CheckCircle2', primary: true },
      { id: 'qa_enroll_member', label: 'Enroll New Member', href: '/contacts?action=new', iconName: 'Plus' },
    ],
    emptyStates: {
      contacts: { title: 'No Members Enrolled Yet', message: 'Enroll your first gym members and set up recurring dues.', actionLabel: 'Enroll Member', actionHref: '/contacts', iconName: 'Users' },
      deals: { title: 'No Trial Leads Found', message: 'Track guest passes, day passes, and trial conversions.', actionLabel: 'Add Lead', actionHref: '/deals', iconName: 'Briefcase' },
    },
    reportCatalog: [
      { id: 'rep_fit_retention', title: 'Member Attendance & Churn Predictor', category: 'Retention', description: 'Identifies members with declining visits to trigger re-engagement' },
    ],
    workflowTemplates: [
      { id: 'wf_fit_absent', name: '14-Day Absent Member WhatsApp Nudge', description: 'Sends automated check-in message when member hasn’t visited in 14 days', trigger: '14 Days No Check-In' },
    ],
    aiPersona: {
      name: 'Titan Club Coordinator',
      role: 'Fitness Club Specialist',
      promptContext: 'You are an energetic fitness club manager expert in member retention, class scheduling, automated recurring billing, and studio operations.',
    },
  },

  // ==========================================================================
  // 13. AUTOMOTIVE & FLEET REPAIR
  // ==========================================================================
  automotive: {
    id: 'automotive',
    name: 'Automotive & Fleet Repair OS',
    slug: 'automotive',
    shortName: 'Auto Repair',
    tagline: 'Vehicle VIN registry, mechanic service bay dispatch, parts inventory, and diagnostic work orders.',
    description: 'Built for independent auto repair shops, fleet maintenance depots, transmission specialists, and tire centers.',
    iconName: 'Wrench',
    accentColor: '#4f46e5',
    recommendedFor: ['Auto Repair Shops', 'Fleet Maintenance Depots', 'Collision & Body Shops', 'Tire & Brake Service Centers'],
    coreServiceIds: ['srv_projects_tasks', 'srv_invoices_billing', 'srv_inventory_stock', 'srv_contacts', 'srv_documents_esign'],
    recommendedServiceIds: ['srv_deals_pipeline', 'srv_support_desk', 'srv_universal_automation'],
    optionalServiceIds: ['srv_marketing_studio', 'srv_customer_360'],
    terminology: {
      contacts: 'Vehicle Owners & Fleet Accounts',
      deals: 'Repair Estimates & Approvals',
      projects: 'Active Bay Work Orders',
      invoices: 'Repair Invoices & Parts Bills',
      products: 'OEM & Aftermarket Parts',
      tickets: 'Customer Diagnostic Complaints',
      records: 'Work Orders',
      actions: {
        createRecord: 'Open Repair Work Order',
        bookSchedule: 'Schedule Bay Service',
        generateBill: 'Draft Repair Bill',
        viewPipeline: 'View Bay Schedule',
      },
    },
    recordTypes: [
      { id: 'rec_vehicle', name: 'Customer Vehicle & VIN', singular: 'Vehicle', plural: 'Vehicles', route: '/contacts', iconName: 'Car', description: 'Year, make, model, VIN, odometer, and past service history' },
    ],
    customFields: [
      { module: 'CONTACTS', key: 'vin_number', label: '17-Digit VIN Number', type: 'TEXT', description: 'Vehicle Identification Number' },
      { module: 'PROJECTS', key: 'odometer_in', label: 'Odometer Mileage In', type: 'NUMBER', description: 'Recorded mileage at drop-off' },
    ],
    dashboardKpis: [
      { id: 'kpi_active_bays', label: 'Active Service Bays', value: '6 / 6 Bays Full', delta: '100% Capacity', subtext: 'Avg repair turnaround: 4.2h', iconName: 'Wrench' },
      { id: 'kpi_aro_ticket', label: 'Average Repair Order (ARO)', value: '$542', delta: '+12% vs last month', subtext: 'Parts: 58% · Labor: 42%', iconName: 'DollarSign' },
      { id: 'kpi_parts_stock', label: 'Parts Inventory Health', value: '418 SKUs', delta: '3 Low Stock', subtext: 'Filters & brake pads auto-reordered', iconName: 'Layers' },
      { id: 'kpi_tech_efficiency', label: 'Technician Labor Efficiency', value: '108%', delta: 'Above Benchmark', subtext: '5 ASE master certified mechanics', iconName: 'CheckCircle2' },
    ],
    quickActions: [
      { id: 'qa_new_ro', label: 'Open Repair Order', href: '/projects?action=new', iconName: 'Wrench', primary: true },
      { id: 'qa_order_parts', label: 'Search Parts Inventory', href: '/price-books', iconName: 'Layers' },
    ],
    emptyStates: {
      contacts: { title: 'No Vehicles Registered', message: 'Add customer vehicles with VIN numbers and past repair records.', actionLabel: 'Add Vehicle', actionHref: '/contacts', iconName: 'Car' },
      deals: { title: 'No Pending Estimates', message: 'Draft customer diagnostic estimates and send SMS approval links.', actionLabel: 'New Estimate', actionHref: '/deals', iconName: 'Briefcase' },
    },
    reportCatalog: [
      { id: 'rep_auto_aro', title: 'Shop Gross Margin & Labor Realization', category: 'Finance', description: 'Labor hours billed vs actual clock hours and parts margin' },
    ],
    workflowTemplates: [
      { id: 'wf_estimate_sms', name: 'Digital Estimate SMS Approval Link', description: 'Texts customer breakdown of diagnostic repair items for instant 1-click mobile authorization', trigger: 'Estimate Created' },
    ],
    aiPersona: {
      name: 'Torque Master Service Writer',
      role: 'Automotive Operations Specialist',
      promptContext: 'You are an ASE-certified master service writer expert in diagnostic work orders, labor guide estimating, parts margins, and fleet vehicle maintenance.',
    },
  },
};
