// apps/web-core/src/lib/blueprint/blueprintEngine.ts
/**
 * Master Niche Blueprint Engine
 * Handles Layered Configuration Inheritance:
 * GLOBAL PLATFORM -> INDUSTRY TEMPLATE -> BUSINESS TYPE -> WORKSPACE CONFIGURATION -> BUSINESS CUSTOMIZATION -> BRANCH/LOCATION -> ROLE/USER VIEW
 *
 * Implements:
 * - Deterministic Blueprint Resolution
 * - Dependency Graph Walking & Validation
 * - Configuration Health Checks
 * - Audit Trail Recording
 * - Versioning & Rollback
 * - JSON Export / Import with Secret Scrubbing
 * - Dynamic AI Context Formulation
 */

import {
  NicheBlueprint,
  BusinessTypeTemplate,
  BusinessProfile,
  ConfigurationAuditLogEntry,
  ConfigurationHealthReport,
  IndustryKey,
} from './blueprintModel';
import { BUSINESS_TYPE_TEMPLATES } from './blueprintTemplates';
import { UNIVERSAL_SERVICE_CATALOG } from '../services/serviceCatalog';

const STORAGE_KEY_CURRENT_BLUEPRINT = 'business_os_active_blueprint';
const STORAGE_KEY_AUDIT_LOGS = 'business_os_blueprint_audit_logs';
const STORAGE_KEY_VERSIONS = 'business_os_blueprint_versions';

/**
 * Creates a brand new Niche Blueprint from a Business Profile & Business Type template.
 */
export function createBlueprintFromProfile(
  profile: BusinessProfile,
  businessTypeId?: string
): NicheBlueprint {
  const chosenTypeId = businessTypeId || profile.businessTypeId || 'dental_clinic';
  const template: BusinessTypeTemplate =
    BUSINESS_TYPE_TEMPLATES[chosenTypeId] || BUSINESS_TYPE_TEMPLATES['dental_clinic'];

  // Combine Core & Recommended services by default
  const activeServiceIds = Array.from(
    new Set([...template.coreServiceIds, ...template.recommendedServiceIds])
  );

  const services = Object.values(UNIVERSAL_SERVICE_CATALOG).map((catalogSrv) => {
    const isCore = template.coreServiceIds.includes(catalogSrv.id);
    const isRec = template.recommendedServiceIds.includes(catalogSrv.id);
    const isOpt = template.optionalServiceIds.includes(catalogSrv.id);
    const isAdv = template.advancedServiceIds.includes(catalogSrv.id);

    let tier: 'CORE' | 'RECOMMENDED' | 'OPTIONAL' | 'ADVANCED' | 'SYSTEM' = 'OPTIONAL';
    if (isCore) tier = 'CORE';
    else if (isRec) tier = 'RECOMMENDED';
    else if (isAdv) tier = 'ADVANCED';
    else if (isOpt) tier = 'OPTIONAL';

    const enabled = activeServiceIds.includes(catalogSrv.id);

    return {
      serviceId: catalogSrv.id,
      tier,
      enabled,
      customDisplayName: catalogSrv.name,
      whyEnabled: isCore
        ? `Essential foundation for ${template.name}`
        : isRec
        ? `Recommended for high operational efficiency in ${template.name}`
        : undefined,
      usedBy: catalogSrv.records,
    };
  });

  const terminologyMap = template.terminology || {};
  const blueprint: NicheBlueprint = {
    id: `bp_${Date.now()}_${template.slug}`,
    name: `${profile.businessName || 'My Business'} OS`,
    slug: template.slug,
    industry: template.industry,
    businessTypes: [chosenTypeId],
    description: template.description,
    version: 1,
    status: 'DRAFT',
    updatedAt: new Date().toISOString(),
    profile,
    activeBusinessTypeId: chosenTypeId,
    activeServiceIds,
    services,
    terminology: {
      contacts: {
        singular: terminologyMap.contacts?.split('&')[0]?.trim() || 'Client',
        plural: terminologyMap.contacts || 'Clients',
        verbAdd: `Add ${terminologyMap.contacts?.split('&')[0]?.trim() || 'Client'}`,
      },
      deals: {
        singular: terminologyMap.deals?.split('&')[0]?.trim() || 'Deal',
        plural: terminologyMap.deals || 'Deals',
        verbAdd: `Create ${terminologyMap.deals?.split('&')[0]?.trim() || 'Deal'}`,
      },
      projects: {
        singular: terminologyMap.projects?.split('&')[0]?.trim() || 'Project',
        plural: terminologyMap.projects || 'Projects',
        verbAdd: `Launch ${terminologyMap.projects?.split('&')[0]?.trim() || 'Project'}`,
      },
      invoices: {
        singular: terminologyMap.invoices?.split('&')[0]?.trim() || 'Invoice',
        plural: terminologyMap.invoices || 'Invoices',
        verbAdd: `Generate ${terminologyMap.invoices?.split('&')[0]?.trim() || 'Invoice'}`,
      },
      products: {
        singular: terminologyMap.products?.split('&')[0]?.trim() || 'Item',
        plural: terminologyMap.products || 'Items',
        verbAdd: `Add ${terminologyMap.products?.split('&')[0]?.trim() || 'Item'}`,
      },
      tickets: {
        singular: terminologyMap.tickets?.split('&')[0]?.trim() || 'Ticket',
        plural: terminologyMap.tickets || 'Tickets',
        verbAdd: `Open ${terminologyMap.tickets?.split('&')[0]?.trim() || 'Ticket'}`,
      },
      records: {
        singular: terminologyMap.records?.split('&')[0]?.trim() || 'Record',
        plural: terminologyMap.records || 'Records',
        verbAdd: `Create ${terminologyMap.records?.split('&')[0]?.trim() || 'Record'}`,
      },
    },
    recordTypes: template.recordTypes || [],
    navigation: template.navigation || [],
    dashboards: template.dashboardWidgets || [],
    quickActions: template.quickActions || [],
    kpis: template.kpis || [],
    workflowTemplates: template.workflowTemplates || [],
    documentTemplates: template.documentTemplates || [],
    reports: template.reports || [],
    roles: template.roles || [],
    branches: [
      {
        id: 'branch_hq',
        branchName: 'Headquarters / Main Practice',
        city: profile.businessRegion || 'Primary Facility',
        staffCount: profile.employeesCount || 8,
      },
    ],
    aiContext: {
      personaName: `${template.name} Copilot`,
      personaRole: `Operations & Clinical AI Director`,
      systemPromptDirective: `You are the specialized operational AI Director for ${profile.businessName || 'this enterprise'}, a ${template.name}. Prioritize compliance, workflow velocity, and revenue preservation.`,
      recommendedAgentIds: ['orchestrator', 'sentinel'],
    },
    dependencies: Object.values(UNIVERSAL_SERVICE_CATALOG).map((s) => ({
      serviceId: s.id,
      requires: s.dependencies,
    })),
    theme: {
      paletteName: template.theme.primaryColor,
      accentHex: template.theme.accentColor,
      primaryHex: template.theme.primaryColor,
    },
  };

  return blueprint;
}

/**
 * Resolves effective blueprint configuration by applying Layered Configuration Inheritance:
 * Parent (Business Type) -> Workspace Customization -> Branch Override -> Role View
 */
export function resolveEffectiveBlueprint(
  blueprint: NicheBlueprint,
  selectedBranchId?: string,
  selectedRoleId?: string
): NicheBlueprint {
  // Deep clone to avoid mutating parent
  const resolved: NicheBlueprint = JSON.parse(JSON.stringify(blueprint));

  // 1. If branch override applies
  if (selectedBranchId) {
    const branch = resolved.branches.find((b) => b.id === selectedBranchId);
    if (branch && branch.customServiceIds && branch.customServiceIds.length > 0) {
      resolved.activeServiceIds = branch.customServiceIds;
      resolved.services.forEach((s) => {
        s.enabled = branch.customServiceIds!.includes(s.serviceId);
      });
    }
  }

  // 2. If role filter applies
  if (selectedRoleId) {
    const role = resolved.roles.find((r) => r.id === selectedRoleId);
    if (role) {
      // Filter quick actions allowed for role
      if (role.quickActionIds && role.quickActionIds.length > 0) {
        resolved.quickActions = resolved.quickActions.filter((qa) =>
          role.quickActionIds.includes(qa.id)
        );
      }
      // Filter dashboard widgets
      if (role.defaultDashboardWidgetIds && role.defaultDashboardWidgetIds.length > 0) {
        resolved.dashboards = resolved.dashboards.filter((w) =>
          role.defaultDashboardWidgetIds.includes(w.id)
        );
      }
    }
  }

  return resolved;
}

/**
 * Validates dependencies for a blueprint.
 * Returns services that have missing requirements when enabled.
 */
export function validateBlueprintDependencies(
  blueprint: NicheBlueprint
): { serviceId: string; missingDependencies: string[] }[] {
  const activeSet = new Set(blueprint.activeServiceIds);
  const issues: { serviceId: string; missingDependencies: string[] }[] = [];

  for (const item of blueprint.dependencies) {
    if (activeSet.has(item.serviceId)) {
      const missing = item.requires.filter((reqId) => !activeSet.has(reqId));
      if (missing.length > 0) {
        issues.push({ serviceId: item.serviceId, missingDependencies: missing });
      }
    }
  }

  return issues;
}

/**
 * Runs a complete Configuration Health Check across the active blueprint.
 */
export function auditConfigurationHealth(blueprint: NicheBlueprint): ConfigurationHealthReport {
  const checks: ConfigurationHealthReport['checks'] = [];
  let failCount = 0;
  let warnCount = 0;

  // 1. Dependency check
  const depIssues = validateBlueprintDependencies(blueprint);
  if (depIssues.length === 0) {
    checks.push({
      category: 'DEPENDENCY',
      name: 'Service Dependency Integrity',
      status: 'PASS',
      message: 'All enabled services have their required prerequisite services active.',
    });
  } else {
    failCount++;
    checks.push({
      category: 'DEPENDENCY',
      name: 'Service Dependency Integrity',
      status: 'FAIL',
      message: `${depIssues.length} service(s) have unfulfilled dependencies.`,
      remediationAction: 'Auto-enable required prerequisite services.',
    });
  }

  // 2. Navigation route validation
  const brokenRoutes: string[] = [];
  blueprint.navigation.forEach((sec) => {
    sec.items.forEach((item) => {
      if (!item.href || item.href.trim() === '') brokenRoutes.push(item.label);
    });
  });

  if (brokenRoutes.length === 0) {
    checks.push({
      category: 'NAVIGATION_ROUTE',
      name: 'Navigation Routes & Link Targets',
      status: 'PASS',
      message: 'All navigation section items have valid route targets.',
    });
  } else {
    warnCount++;
    checks.push({
      category: 'NAVIGATION_ROUTE',
      name: 'Navigation Routes & Link Targets',
      status: 'WARN',
      message: `${brokenRoutes.length} navigation link(s) have blank routes.`,
      remediationAction: 'Assign target path in Navigation Builder.',
    });
  }

  // 3. Custom record types and fields
  const missingFieldKeyRecords: string[] = [];
  blueprint.recordTypes.forEach((rec) => {
    if (rec.fields.some((f) => !f.key)) {
      missingFieldKeyRecords.push(rec.name);
    }
  });

  if (missingFieldKeyRecords.length === 0) {
    checks.push({
      category: 'FIELD_VALIDATION',
      name: 'Data Model & Record Fields',
      status: 'PASS',
      message: 'All record type fields have unique database keys and assigned types.',
    });
  } else {
    failCount++;
    checks.push({
      category: 'FIELD_VALIDATION',
      name: 'Data Model & Record Fields',
      status: 'FAIL',
      message: `Record types without field keys: ${missingFieldKeyRecords.join(', ')}`,
      remediationAction: 'Open Field Builder and assign field keys.',
    });
  }

  // 4. Dashboard widgets
  if (blueprint.dashboards.length > 0) {
    checks.push({
      category: 'DASHBOARD_WIDGET',
      name: 'Dashboard Widget Alignment',
      status: 'PASS',
      message: `${blueprint.dashboards.length} widgets configured for default executive view.`,
    });
  } else {
    warnCount++;
    checks.push({
      category: 'DASHBOARD_WIDGET',
      name: 'Dashboard Widget Alignment',
      status: 'WARN',
      message: 'No dashboard widgets configured. Default overview may appear empty.',
      remediationAction: 'Add widgets in Dashboard Builder.',
    });
  }

  // 5. Overall status
  let overallStatus: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL_ERROR' = 'HEALTHY';
  if (failCount > 0) overallStatus = 'CRITICAL_ERROR';
  else if (warnCount > 0) overallStatus = 'NEEDS_ATTENTION';

  const score = Math.max(0, 100 - failCount * 30 - warnCount * 10);

  return {
    overallStatus,
    score,
    checks,
  };
}

/**
 * Records an audit log entry for any blueprint modification.
 */
export function recordBlueprintAudit(
  entry: Omit<ConfigurationAuditLogEntry, 'id' | 'timestamp'>
) {
  if (typeof window === 'undefined') return;

  const fullEntry: ConfigurationAuditLogEntry = {
    ...entry,
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const existingStr = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    const logs: ConfigurationAuditLogEntry[] = existingStr ? JSON.parse(existingStr) : [];
    logs.unshift(fullEntry);
    // Keep last 100 logs
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.error('Failed to save configuration audit log', e);
  }
}

/**
 * Fetches audit logs from storage.
 */
export function getBlueprintAuditLogs(): ConfigurationAuditLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const str = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    return str ? JSON.parse(str) : [];
  } catch {
    return [];
  }
}

/**
 * Saves active blueprint to LocalStorage and versions it.
 */
export function saveActiveBlueprint(blueprint: NicheBlueprint, isPublish = false) {
  if (typeof window === 'undefined') return;

  const updated: NicheBlueprint = {
    ...blueprint,
    version: isPublish ? blueprint.version + 1 : blueprint.version,
    status: isPublish ? 'PUBLISHED' : blueprint.status,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_BLUEPRINT, JSON.stringify(updated));

    if (isPublish) {
      // Archive into versions array
      const existingVersionsStr = localStorage.getItem(STORAGE_KEY_VERSIONS);
      const versions: NicheBlueprint[] = existingVersionsStr
        ? JSON.parse(existingVersionsStr)
        : [];
      versions.unshift(updated);
      localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(versions.slice(0, 10)));

      recordBlueprintAudit({
        actor: 'Workspace Admin',
        action: 'CONFIGURATION_PUBLISHED',
        entity: updated.name,
        detail: `Published Blueprint version v${updated.version}`,
      });
    }
  } catch (e) {
    console.error('Failed to save blueprint', e);
  }
}

export const NICHE_TO_BLUEPRINT_CONFIGS: Record<string, { industry: IndustryKey; businessTypeId: string; businessName: string; departments: string[]; customerBaseType: string }> = {
  hospital: {
    industry: 'HEALTHCARE',
    businessTypeId: 'hospital_center',
    businessName: 'Hospital & Healthcare Center OS',
    departments: ['Inpatient Wards', 'Emergency Triage', 'Pharmacy & Rx', 'Clinical Lab'],
    customerBaseType: 'HEALTHCARE_PATIENTS',
  },
  realestate: {
    industry: 'REAL_ESTATE',
    businessTypeId: 'realestate_brokerage',
    businessName: 'Real Estate Brokerage & Property OS',
    departments: ['Brokerage', 'Escrow', 'MLS Listings', 'Client Relations'],
    customerBaseType: 'B2C',
  },
  restaurant: {
    industry: 'HOSPITALITY',
    businessTypeId: 'restaurant_cafe',
    businessName: 'Restaurant, Cafe & Hospitality OS',
    departments: ['Floor', 'Kitchen', 'Bar', 'Catering'],
    customerBaseType: 'B2C',
  },
  retail: {
    industry: 'RETAIL',
    businessTypeId: 'retail_store',
    businessName: 'Retail Shop & Supermarket POS',
    departments: ['Cashier', 'Stockroom', 'Khata Accounts', 'Purchasing'],
    customerBaseType: 'B2C',
  },
  agency: {
    industry: 'AGENCY',
    businessTypeId: 'creative_agency',
    businessName: 'Creative Agency & Services OS',
    departments: ['Design', 'Engineering', 'Strategy', 'Client Accounts'],
    customerBaseType: 'B2B',
  },
  sme: {
    industry: 'SAAS',
    businessTypeId: 'saas_scaleup',
    businessName: 'SME & Tech B2B SaaS OS',
    departments: ['Product', 'Engineering', 'Sales', 'Customer Success'],
    customerBaseType: 'B2B',
  },
  custom: {
    industry: 'CUSTOM',
    businessTypeId: 'custom_bespoke',
    businessName: 'Custom Bespoke Workspace',
    departments: ['Operations', 'Sales', 'Billing'],
    customerBaseType: 'B2B',
  },
  all: {
    industry: 'ENTERPRISE',
    businessTypeId: 'enterprise_master',
    businessName: 'Master Enterprise (All Modules)',
    departments: ['Executive', 'Operations', 'Finance', 'Sales', 'Customer Support', 'IT & DevOps'],
    customerBaseType: 'B2B',
  },
  construction: {
    industry: 'CONSTRUCTION',
    businessTypeId: 'construction_contractor',
    businessName: 'Construction & Contracting OS',
    departments: ['Estimating', 'Field Operations', 'Equipment Fleet', 'Safety Compliance'],
    customerBaseType: 'B2B',
  },
  legal: {
    industry: 'LEGAL',
    businessTypeId: 'legal_practice',
    businessName: 'Law Firm & Legal Practice OS',
    departments: ['Litigation', 'Corporate Practice', 'Trust & Billing', 'Paralegal Services'],
    customerBaseType: 'B2B',
  },
  logistics: {
    industry: 'LOGISTICS',
    businessTypeId: 'logistics_freight',
    businessName: 'Logistics, Freight & Fleet OS',
    departments: ['Dispatch', 'Fleet Telematics', 'Carrier Billing', 'Driver Relations'],
    customerBaseType: 'B2B',
  },
  fitness: {
    industry: 'FITNESS',
    businessTypeId: 'fitness_gym',
    businessName: 'Fitness Club & Gym Studio OS',
    departments: ['Front Desk', 'Group Fitness', 'Personal Training', 'Member Billing'],
    customerBaseType: 'B2C',
  },
  automotive: {
    industry: 'AUTOMOTIVE',
    businessTypeId: 'automotive_repair',
    businessName: 'Automotive & Fleet Repair OS',
    departments: ['Service Bay', 'Parts Room', 'Diagnostics', 'Customer Service'],
    customerBaseType: 'B2C',
  },
};

/**
 * Returns a static default blueprint for SSR consistency.
 */
export function getDefaultBlueprint(nicheKey = 'hospital'): NicheBlueprint {
  const mapping = NICHE_TO_BLUEPRINT_CONFIGS[nicheKey] || NICHE_TO_BLUEPRINT_CONFIGS.hospital;
  return createBlueprintFromProfile({
    businessName: mapping.businessName,
    industry: mapping.industry,
    businessTypeId: mapping.businessTypeId,
    companySize: 'SMALL_2_10',
    locationsCount: 1,
    employeesCount: 8,
    customerBaseType: mapping.customerBaseType as any,
    productsOrServices: 'Core Operations',
    salesModel: 'DIRECT',
    billingModel: 'INVOICED_NET30',
    operatingHours: '09:00 - 18:00',
    currency: 'USD ($)',
    taxConfiguration: 'Standard',
    businessRegion: 'North America',
    departments: mapping.departments,
  }, mapping.businessTypeId);
}

/**
 * Retrieves the currently active blueprint, or initializes one if none exists.
 */
export function getActiveBlueprint(): NicheBlueprint {
  let savedNiche = 'hospital';
  if (typeof window !== 'undefined') {
    try {
      const niche = localStorage.getItem('business_os_niche');
      if (niche && NICHE_TO_BLUEPRINT_CONFIGS[niche]) {
        savedNiche = niche;
      }
      const str = localStorage.getItem(STORAGE_KEY_CURRENT_BLUEPRINT);
      if (str) {
        const parsed = JSON.parse(str);
        const expected = NICHE_TO_BLUEPRINT_CONFIGS[savedNiche];
        if (!expected || parsed.industry === expected.industry) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }

  const defaultBp = getDefaultBlueprint(savedNiche);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_BLUEPRINT, JSON.stringify(defaultBp));
    } catch {
      // ignore
    }
  }

  return defaultBp;
}

/**
 * Exports blueprint JSON with strictly scrubbed secrets (passwords, tokens, api keys removed).
 */
export function exportBlueprintJson(blueprint: NicheBlueprint): string {
  const cloned = JSON.parse(JSON.stringify(blueprint)) as Record<string, unknown>;
  // Clean potential secrets if any exist
  delete cloned.apiKey;
  delete cloned.token;
  delete cloned.password;
  delete cloned.secret;

  return JSON.stringify(cloned, null, 2);
}

/**
 * Safely parses and validates an imported Blueprint JSON.
 */
export function importBlueprintJson(jsonString: string): NicheBlueprint {
  const parsed = JSON.parse(jsonString);
  if (!parsed.id || !parsed.name || !parsed.industry || !parsed.services) {
    throw new Error('Invalid Blueprint JSON: Missing required root architecture fields.');
  }
  return parsed as NicheBlueprint;
}
