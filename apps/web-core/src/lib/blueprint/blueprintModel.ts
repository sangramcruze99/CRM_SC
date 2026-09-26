// apps/web-core/src/lib/blueprint/blueprintModel.ts
/**
 * Master Niche / Industry Blueprint Model & Types
 * Represents the unified configuration blueprint across:
 * Business Profile -> Industry -> Business Type -> Niche Blueprint -> Configuration Inheritance
 */

export type IndustryKey =
  | 'HEALTHCARE'
  | 'REAL_ESTATE'
  | 'HOSPITALITY'
  | 'RETAIL'
  | 'AGENCY'
  | 'CONSTRUCTION'
  | 'SAAS'
  | 'CUSTOM'
  | 'ENTERPRISE'
  | 'LEGAL'
  | 'LOGISTICS'
  | 'FITNESS'
  | 'AUTOMOTIVE';

export type ServiceTierLevel = 'CORE' | 'RECOMMENDED' | 'OPTIONAL' | 'ADVANCED' | 'SYSTEM';

export type FieldDataType =
  | 'TEXT'
  | 'NUMBER'
  | 'CURRENCY'
  | 'DATE'
  | 'DATETIME'
  | 'EMAIL'
  | 'PHONE'
  | 'ADDRESS'
  | 'DROPDOWN'
  | 'MULTI_SELECT'
  | 'CHECKBOX'
  | 'FILE'
  | 'IMAGE'
  | 'RELATIONSHIP'
  | 'FORMULA'
  | 'STATUS'
  | 'RATING'
  | 'RICH_TEXT';

export type InheritanceSource =
  | 'GLOBAL_PLATFORM'
  | 'INDUSTRY_TEMPLATE'
  | 'BUSINESS_TYPE'
  | 'WORKSPACE_CUSTOM'
  | 'BRANCH_OVERRIDE'
  | 'ROLE_OVERRIDE';

export interface FieldConditionRule {
  targetFieldKey: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN';
  expectedValue: string | number | boolean;
  action: 'SHOW' | 'HIDE' | 'MAKE_REQUIRED' | 'SET_DEFAULT';
  actionValue?: string | number | boolean;
}

export interface ConfigurableField {
  id: string;
  name: string;
  label: string;
  key: string;
  type: FieldDataType;
  required: boolean;
  default?: string | number | boolean;
  visibility: 'ALWAYS' | 'CONDITIONAL' | 'HIDDEN' | 'ADMIN_ONLY';
  conditions?: FieldConditionRule[];
  options?: string[];
  placeholder?: string;
  searchable: boolean;
  filterable: boolean;
  reportable: boolean;
  permissions?: string[];
  inheritanceSource?: InheritanceSource;
}

export interface StatusPipelineStage {
  id: string;
  name: string;
  label: string;
  color: string;
  isDefault?: boolean;
  isTerminal?: boolean; // Closed won, closed lost, completed, cancelled
  outcome?: 'SUCCESS' | 'FAILURE' | 'NEUTRAL';
  order: number;
}

export interface ConfigurableRecordType {
  id: string;
  name: string;
  singular: string;
  plural: string;
  route: string;
  iconName: string;
  description: string;
  category: string;
  isCustom?: boolean;
  fields: ConfigurableField[];
  statuses: StatusPipelineStage[];
  relationships: {
    targetRecordId: string;
    relationshipType: 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';
    label: string;
    reverseLabel: string;
  }[];
  views: ('TABLE' | 'KANBAN' | 'CALENDAR' | 'LIST' | 'TIMELINE')[];
  inheritanceSource?: InheritanceSource;
}

export interface ConfigurableQuickAction {
  id: string;
  label: string;
  actionType: 'NAVIGATE' | 'MODAL_RECORD' | 'TRIGGER_WORKFLOW' | 'OPEN_DOCUMENT';
  href?: string;
  targetRecordId?: string;
  workflowId?: string;
  iconName: string;
  primary?: boolean;
  rolesAllowed?: string[];
  inheritanceSource?: InheritanceSource;
}

export interface ConfigurableDashboardWidget {
  id: string;
  title: string;
  type:
    | 'KPI'
    | 'CHART'
    | 'TABLE'
    | 'PIPELINE'
    | 'CALENDAR'
    | 'TASKS'
    | 'ALERTS'
    | 'ACTIVITY'
    | 'REPORT'
    | 'AI_INSIGHT'
    | 'AUTOMATION_STATUS'
    | 'PENDING_APPROVAL';
  size: 'SMALL' | 'MEDIUM' | 'LARGE' | 'FULL';
  dataSource?: string;
  metricValue?: string;
  metricDelta?: string;
  metricSubtext?: string;
  chartType?: 'BAR' | 'LINE' | 'DONUT' | 'AREA';
  iconName: string;
  refreshIntervalSeconds?: number;
  rolesAllowed?: string[];
  inheritanceSource?: InheritanceSource;
}

export interface ConfigurableKpiMetric {
  id: string;
  name: string;
  source: string;
  calculation: 'SUM' | 'COUNT' | 'AVERAGE' | 'GROWTH_RATE' | 'PERCENTAGE';
  filters?: Record<string, string | number | boolean>;
  timePeriod: 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  displayType: 'CURRENCY' | 'NUMBER' | 'PERCENTAGE' | 'DURATION';
  currentValue: string;
  deltaText: string;
  subtext: string;
  iconName: string;
  inheritanceSource?: InheritanceSource;
}

export interface ConfigurableWorkflowTemplate {
  id: string;
  name: string;
  category: string;
  trigger: string;
  actions: string[];
  description: string;
  enabledByDefault: boolean;
  requiredServiceIds: string[];
  inheritanceSource?: InheritanceSource;
}

export interface ConfigurableDocumentTemplate {
  id: string;
  name: string;
  category: string;
  fileFormat: 'PDF' | 'DOCX' | 'HTML' | 'ESIGN';
  linkedRecordId: string;
  description: string;
  fieldsIncluded: string[];
  inheritanceSource?: InheritanceSource;
}

export interface ConfigurableReportSpec {
  id: string;
  title: string;
  category: string;
  dataSource: string;
  chartType: 'BAR' | 'LINE' | 'PIE' | 'TABLE' | 'KPI_GRID';
  description: string;
  timeframe: string;
  schedule?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  inheritanceSource?: InheritanceSource;
}

export interface ConfigurableNavSectionItem {
  id: string;
  label: string;
  href: string;
  iconName: string;
  badge?: string;
  rolesAllowed?: string[];
  requiredServiceId?: string;
}

export interface ConfigurableNavSection {
  id: string;
  sectionTitle: string;
  iconName: string;
  order: number;
  items: ConfigurableNavSectionItem[];
  defaultExpanded?: boolean;
  rolesAllowed?: string[];
  inheritanceSource?: InheritanceSource;
}

export interface ConfigurableRolePreset {
  id: string;
  name: string;
  label: string;
  description: string;
  isDefault?: boolean;
  permissions: string[];
  accessibleSections: string[];
  quickActionIds: string[];
  defaultDashboardWidgetIds: string[];
}

export interface BusinessProfile {
  businessName: string;
  industry: IndustryKey;
  businessTypeId: string;
  companySize: 'SOLO_1' | 'SMALL_2_10' | 'GROWTH_11_50' | 'MID_51_200' | 'ENTERPRISE_201_PLUS';
  locationsCount: number;
  employeesCount: number;
  customerBaseType: 'B2B' | 'B2C' | 'HYBRID' | 'HEALTHCARE_PATIENTS' | 'GUESTS';
  productsOrServices: string;
  salesModel: 'DIRECT' | 'INBOUND' | 'SUBSCRIPTION' | 'WALK_IN_COUNTER' | 'CONSULTATIVE';
  billingModel: 'INVOICED_NET30' | 'SUBSCRIPTION_RECURRING' | 'POINT_OF_SALE' | 'MILESTONE_RETAINER';
  operatingHours: string;
  currency: string;
  taxConfiguration: string;
  businessRegion: string;
  departments: string[];
}

export interface BranchLocationOverride {
  id: string;
  branchName: string;
  city: string;
  staffCount: number;
  operatingHours?: string;
  customServiceIds?: string[];
  pricingMultiplier?: number;
  localSettings?: Record<string, string | number | boolean>;
}

export interface BusinessTypeTemplate {
  id: string;
  industry: IndustryKey;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  coreServiceIds: string[];
  recommendedServiceIds: string[];
  optionalServiceIds: string[];
  advancedServiceIds: string[];
  terminology: Record<string, string>;
  recordTypes: ConfigurableRecordType[];
  dashboardWidgets: ConfigurableDashboardWidget[];
  kpis: ConfigurableKpiMetric[];
  quickActions: ConfigurableQuickAction[];
  workflowTemplates: ConfigurableWorkflowTemplate[];
  documentTemplates: ConfigurableDocumentTemplate[];
  reports: ConfigurableReportSpec[];
  roles: ConfigurableRolePreset[];
  navigation: ConfigurableNavSection[];
  theme: {
    primaryColor: string;
    accentColor: string;
    badgeStyle: string;
  };
}

export interface NicheBlueprint {
  id: string;
  name: string;
  slug: string;
  industry: IndustryKey;
  businessTypes: string[];
  description: string;
  version: number;
  status: 'DRAFT' | 'PREVIEW' | 'PUBLISHED' | 'ARCHIVED';
  updatedAt: string;

  // Layer configuration
  profile?: BusinessProfile;
  activeBusinessTypeId: string;
  activeServiceIds: string[];

  // Configurable layers
  services: {
    serviceId: string;
    tier: ServiceTierLevel;
    enabled: boolean;
    customDisplayName?: string;
    whyEnabled?: string;
    usedBy?: string[];
  }[];

  terminology: {
    contacts: { singular: string; plural: string; verbAdd: string };
    deals: { singular: string; plural: string; verbAdd: string };
    projects: { singular: string; plural: string; verbAdd: string };
    invoices: { singular: string; plural: string; verbAdd: string };
    products: { singular: string; plural: string; verbAdd: string };
    tickets: { singular: string; plural: string; verbAdd: string };
    records: { singular: string; plural: string; verbAdd: string };
  };

  recordTypes: ConfigurableRecordType[];
  navigation: ConfigurableNavSection[];
  dashboards: ConfigurableDashboardWidget[];
  quickActions: ConfigurableQuickAction[];
  kpis: ConfigurableKpiMetric[];
  workflowTemplates: ConfigurableWorkflowTemplate[];
  documentTemplates: ConfigurableDocumentTemplate[];
  reports: ConfigurableReportSpec[];
  roles: ConfigurableRolePreset[];
  branches: BranchLocationOverride[];

  aiContext: {
    personaName: string;
    personaRole: string;
    systemPromptDirective: string;
    recommendedAgentIds: string[];
  };

  dependencies: {
    serviceId: string;
    requires: string[];
  }[];

  theme: {
    paletteName: string;
    accentHex: string;
    primaryHex: string;
  };
}

export interface ConfigurationAuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action:
    | 'SERVICE_ENABLED'
    | 'SERVICE_DISABLED'
    | 'FIELD_ADDED'
    | 'FIELD_MODIFIED'
    | 'FIELD_REMOVED'
    | 'TERMINOLOGY_CHANGED'
    | 'NAVIGATION_CHANGED'
    | 'DASHBOARD_CHANGED'
    | 'WORKFLOW_ADDED'
    | 'PERMISSION_CHANGED'
    | 'CONFIGURATION_PUBLISHED'
    | 'CONFIGURATION_ROLLBACK'
    | 'BRANCH_OVERRIDE_APPLIED';
  entity: string;
  detail: string;
  previousValue?: string;
  newValue?: string;
}

export interface ConfigurationHealthReport {
  overallStatus: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL_ERROR';
  score: number; // 0 - 100
  checks: {
    category:
      | 'DEPENDENCY'
      | 'NAVIGATION_ROUTE'
      | 'FIELD_VALIDATION'
      | 'WORKFLOW_INTEGRITY'
      | 'REPORT_SOURCE'
      | 'DASHBOARD_WIDGET';
    name: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    message: string;
    remediationAction?: string;
  }[];
}
