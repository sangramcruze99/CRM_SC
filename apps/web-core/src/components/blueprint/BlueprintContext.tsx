// apps/web-core/src/components/blueprint/BlueprintContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  NicheBlueprint,
  BusinessProfile,
  IndustryKey,
  ConfigurationAuditLogEntry,
  ConfigurationHealthReport,
  ConfigurableField,
  ConfigurableRecordType,
  StatusPipelineStage,
  ConfigurableNavSection,
  ConfigurableDashboardWidget,
} from '@/lib/blueprint/blueprintModel';
import {
  getDefaultBlueprint,
  getActiveBlueprint,
  saveActiveBlueprint,
  createBlueprintFromProfile,
  resolveEffectiveBlueprint,
  auditConfigurationHealth,
  recordBlueprintAudit,
  getBlueprintAuditLogs,
  exportBlueprintJson,
  importBlueprintJson,
} from '@/lib/blueprint/blueprintEngine';

interface BlueprintContextValue {
  mounted: boolean;
  blueprint: NicheBlueprint;
  effectiveBlueprint: NicheBlueprint;
  healthReport: ConfigurationHealthReport;
  auditLogs: ConfigurationAuditLogEntry[];
  selectedBranchId?: string;
  selectedRoleId?: string;
  setSelectedBranchId: (branchId: string | undefined) => void;
  setSelectedRoleId: (roleId: string | undefined) => void;

  // Actions
  updateProfile: (profile: Partial<BusinessProfile>) => void;
  selectIndustryAndType: (industryKey: IndustryKey, businessTypeId: string) => void;
  toggleService: (serviceId: string, enabled?: boolean) => void;
  updateTerminology: (termKey: string, singular: string, plural: string, verbAdd: string) => void;
  saveRecordType: (recordType: ConfigurableRecordType) => void;
  removeRecordType: (recordTypeId: string) => void;
  updateRecordFields: (recordTypeId: string, fields: ConfigurableField[]) => void;
  updateRecordStatuses: (recordTypeId: string, statuses: StatusPipelineStage[]) => void;
  updateNavigation: (sections: ConfigurableNavSection[]) => void;
  updateDashboardWidgets: (widgets: ConfigurableDashboardWidget[]) => void;
  publishConfiguration: () => void;
  exportBlueprint: () => string;
  importBlueprint: (jsonStr: string) => void;
  applyAiPreset: (promptText: string) => void;
}

const BlueprintContext = createContext<BlueprintContextValue | null>(null);

export function BlueprintProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [blueprint, setBlueprintState] = useState<NicheBlueprint>(() => getDefaultBlueprint());
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(undefined);
  const [auditLogs, setAuditLogs] = useState<ConfigurationAuditLogEntry[]>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const active = getActiveBlueprint();
      setBlueprintState(active);
    } catch {
      // ignore
    }
    setAuditLogs(getBlueprintAuditLogs());
  }, []);

  // Compute effective blueprint through inheritance: Base -> Workspace -> Branch -> Role
  const effectiveBlueprint = useMemo(() => {
    return resolveEffectiveBlueprint(blueprint, selectedBranchId, selectedRoleId);
  }, [blueprint, selectedBranchId, selectedRoleId]);

  // Compute health report on every change
  const healthReport = useMemo(() => {
    return auditConfigurationHealth(effectiveBlueprint);
  }, [effectiveBlueprint]);

  const updateProfile = (partial: Partial<BusinessProfile>) => {
    const updatedProfile = { ...(blueprint.profile || ({} as BusinessProfile)), ...partial } as BusinessProfile;
    const updated = {
      ...blueprint,
      profile: updatedProfile,
      name: `${updatedProfile.businessName || 'Business'} OS`,
      updatedAt: new Date().toISOString(),
    };
    setBlueprintState(updated);
    saveActiveBlueprint(updated);
    recordBlueprintAudit({
      actor: 'Admin',
      action: 'CONFIGURATION_PUBLISHED',
      entity: 'Business Profile',
      detail: `Updated business profile for ${updatedProfile.businessName}`,
    });
  };

  const selectIndustryAndType = (industryKey: IndustryKey, businessTypeId: string) => {
    const currentProfile = blueprint.profile || {
      businessName: 'My Practice',
      industry: industryKey,
      businessTypeId,
      companySize: 'SMALL_2_10',
      locationsCount: 1,
      employeesCount: 5,
      customerBaseType: 'B2B',
      productsOrServices: 'Core Services',
      salesModel: 'DIRECT',
      billingModel: 'INVOICED_NET30',
      operatingHours: '09:00 - 18:00',
      currency: 'USD ($)',
      taxConfiguration: 'Standard',
      businessRegion: 'North America',
      departments: ['Management', 'Operations', 'Finance'],
    };

    const newBp = createBlueprintFromProfile({
      ...currentProfile,
      industry: industryKey,
      businessTypeId,
    }, businessTypeId);

    setBlueprintState(newBp);
    saveActiveBlueprint(newBp);
    recordBlueprintAudit({
      actor: 'Admin',
      action: 'CONFIGURATION_PUBLISHED',
      entity: 'Industry Blueprint',
      detail: `Switched business type template to ${businessTypeId} in ${industryKey}`,
    });
    setAuditLogs(getBlueprintAuditLogs());
  };

  const toggleService = (serviceId: string, forceEnabled?: boolean) => {
    const exists = blueprint.activeServiceIds.includes(serviceId);
    const nextState = forceEnabled !== undefined ? forceEnabled : !exists;

    let updatedServiceIds: string[];
    if (nextState) {
      updatedServiceIds = Array.from(new Set([...blueprint.activeServiceIds, serviceId]));
    } else {
      updatedServiceIds = blueprint.activeServiceIds.filter((id) => id !== serviceId);
    }

    const updatedServices = blueprint.services.map((s) => ({
      ...s,
      enabled: updatedServiceIds.includes(s.serviceId),
    }));

    const updated: NicheBlueprint = {
      ...blueprint,
      activeServiceIds: updatedServiceIds,
      services: updatedServices,
      updatedAt: new Date().toISOString(),
    };

    setBlueprintState(updated);
    saveActiveBlueprint(updated);
    recordBlueprintAudit({
      actor: 'Admin',
      action: nextState ? 'SERVICE_ENABLED' : 'SERVICE_DISABLED',
      entity: serviceId,
      detail: `${nextState ? 'Enabled' : 'Disabled'} service ${serviceId}`,
    });
    setAuditLogs(getBlueprintAuditLogs());
  };

  const updateTerminology = (termKey: string, singular: string, plural: string, verbAdd: string) => {
    const updatedTerminology = {
      ...blueprint.terminology,
      [termKey]: { singular, plural, verbAdd },
    };

    const updated: NicheBlueprint = {
      ...blueprint,
      terminology: updatedTerminology,
      updatedAt: new Date().toISOString(),
    };

    setBlueprintState(updated);
    saveActiveBlueprint(updated);
    recordBlueprintAudit({
      actor: 'Admin',
      action: 'TERMINOLOGY_CHANGED',
      entity: termKey,
      detail: `Mapped ${termKey} -> ${singular} / ${plural}`,
    });
    setAuditLogs(getBlueprintAuditLogs());
  };

  const saveRecordType = (recordType: ConfigurableRecordType) => {
    const existingIndex = blueprint.recordTypes.findIndex((r) => r.id === recordType.id);
    let updatedTypes: ConfigurableRecordType[];
    if (existingIndex >= 0) {
      updatedTypes = [...blueprint.recordTypes];
      updatedTypes[existingIndex] = recordType;
    } else {
      updatedTypes = [...blueprint.recordTypes, recordType];
    }

    const updated: NicheBlueprint = {
      ...blueprint,
      recordTypes: updatedTypes,
      updatedAt: new Date().toISOString(),
    };

    setBlueprintState(updated);
    saveActiveBlueprint(updated);
    recordBlueprintAudit({
      actor: 'Admin',
      action: existingIndex >= 0 ? 'FIELD_MODIFIED' : 'FIELD_ADDED',
      entity: recordType.name,
      detail: `Saved record schema ${recordType.name} with ${recordType.fields.length} fields`,
    });
    setAuditLogs(getBlueprintAuditLogs());
  };

  const removeRecordType = (recordTypeId: string) => {
    const target = blueprint.recordTypes.find((r) => r.id === recordTypeId);
    const updated: NicheBlueprint = {
      ...blueprint,
      recordTypes: blueprint.recordTypes.filter((r) => r.id !== recordTypeId),
      updatedAt: new Date().toISOString(),
    };

    setBlueprintState(updated);
    saveActiveBlueprint(updated);
    recordBlueprintAudit({
      actor: 'Admin',
      action: 'FIELD_REMOVED',
      entity: target?.name || recordTypeId,
      detail: `Removed record type ${target?.name || recordTypeId}`,
    });
    setAuditLogs(getBlueprintAuditLogs());
  };

  const updateRecordFields = (recordTypeId: string, fields: ConfigurableField[]) => {
    const updated = {
      ...blueprint,
      recordTypes: blueprint.recordTypes.map((r) =>
        r.id === recordTypeId ? { ...r, fields } : r
      ),
      updatedAt: new Date().toISOString(),
    };
    setBlueprintState(updated);
    saveActiveBlueprint(updated);
  };

  const updateRecordStatuses = (recordTypeId: string, statuses: StatusPipelineStage[]) => {
    const updated = {
      ...blueprint,
      recordTypes: blueprint.recordTypes.map((r) =>
        r.id === recordTypeId ? { ...r, statuses } : r
      ),
      updatedAt: new Date().toISOString(),
    };
    setBlueprintState(updated);
    saveActiveBlueprint(updated);
  };

  const updateNavigation = (sections: ConfigurableNavSection[]) => {
    const updated = {
      ...blueprint,
      navigation: sections,
      updatedAt: new Date().toISOString(),
    };
    setBlueprintState(updated);
    saveActiveBlueprint(updated);
    recordBlueprintAudit({
      actor: 'Admin',
      action: 'NAVIGATION_CHANGED',
      entity: 'Sidebar Navigation',
      detail: `Reordered & customized navigation (${sections.length} sections)`,
    });
    setAuditLogs(getBlueprintAuditLogs());
  };

  const updateDashboardWidgets = (widgets: ConfigurableDashboardWidget[]) => {
    const updated = {
      ...blueprint,
      dashboards: widgets,
      updatedAt: new Date().toISOString(),
    };
    setBlueprintState(updated);
    saveActiveBlueprint(updated);
    recordBlueprintAudit({
      actor: 'Admin',
      action: 'DASHBOARD_CHANGED',
      entity: 'Executive Dashboard',
      detail: `Configured dashboard layout with ${widgets.length} widgets`,
    });
    setAuditLogs(getBlueprintAuditLogs());
  };

  const publishConfiguration = () => {
    saveActiveBlueprint(blueprint, true);
    setBlueprintState((prev) => ({
      ...prev,
      version: prev.version + 1,
      status: 'PUBLISHED',
      updatedAt: new Date().toISOString(),
    }));
    setAuditLogs(getBlueprintAuditLogs());
  };

  const exportBlueprint = () => {
    return exportBlueprintJson(blueprint);
  };

  const importBlueprint = (jsonStr: string) => {
    const parsed = importBlueprintJson(jsonStr);
    setBlueprintState(parsed);
    saveActiveBlueprint(parsed);
    recordBlueprintAudit({
      actor: 'Admin',
      action: 'CONFIGURATION_PUBLISHED',
      entity: parsed.name,
      detail: `Imported blueprint configuration from JSON package`,
    });
    setAuditLogs(getBlueprintAuditLogs());
  };

  const applyAiPreset = (promptText: string) => {
    const lower = promptText.toLowerCase();
    let matchedType = 'dental_clinic';
    let matchedInd: IndustryKey = 'HEALTHCARE';

    // 1. Intelligent Industry & Business Type Matching
    if (lower.includes('hospital') || lower.includes('inpatient') || lower.includes('ward') || lower.includes('triage') || lower.includes('er ') || lower.includes('emergency')) {
      matchedType = 'hospital_center';
      matchedInd = 'HEALTHCARE';
    } else if (lower.includes('dental') || lower.includes('teeth') || lower.includes('orthodontic') || lower.includes('operatory')) {
      matchedType = 'dental_clinic';
      matchedInd = 'HEALTHCARE';
    } else if (lower.includes('lease') || lower.includes('tenant') || lower.includes('rent roll') || lower.includes('property management')) {
      matchedType = 'property_management';
      matchedInd = 'REAL_ESTATE';
    } else if (lower.includes('real estate') || lower.includes('property') || lower.includes('broker') || lower.includes('realtor') || lower.includes('mls')) {
      matchedType = 'realestate_brokerage';
      matchedInd = 'REAL_ESTATE';
    } else if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('dining') || lower.includes('kitchen') || lower.includes('bar ') || lower.includes('catering')) {
      matchedType = 'restaurant_cafe';
      matchedInd = 'HOSPITALITY';
    } else if (lower.includes('retail') || lower.includes('store') || lower.includes('shop') || lower.includes('pos') || lower.includes('supermarket') || lower.includes('boutique') || lower.includes('khata')) {
      matchedType = 'retail_store';
      matchedInd = 'RETAIL';
    } else if (lower.includes('agency') || lower.includes('creative') || lower.includes('consult') || lower.includes('marketing') || lower.includes('design studio') || lower.includes('retainer')) {
      matchedType = 'creative_agency';
      matchedInd = 'AGENCY';
    } else if (lower.includes('construction') || lower.includes('contractor') || lower.includes('builder') || lower.includes('roofing') || lower.includes('solar') || lower.includes('hvac') || lower.includes('plumbing') || lower.includes('job site')) {
      matchedType = 'construction_contractor';
      matchedInd = 'CONSTRUCTION';
    } else if (lower.includes('saas') || lower.includes('software') || lower.includes('startup') || lower.includes('subscription') || lower.includes('b2b tech') || lower.includes('cloud')) {
      matchedType = 'saas_scaleup';
      matchedInd = 'SAAS';
    } else {
      matchedType = 'custom_bespoke';
      matchedInd = 'CUSTOM';
    }

    selectIndustryAndType(matchedInd, matchedType);

    // 2. Intelligent Parameter Extraction
    // Check if business name is mentioned like "called X", "named X", or "run X"
    const nameMatch = promptText.match(/(?:called|named|run|for|at)\s+([A-Z][A-Za-z0-9\s&]{2,30})/);
    if (nameMatch && nameMatch[1]) {
      const extractedName = nameMatch[1].trim();
      if (extractedName && !['A', 'An', 'The', 'My', 'Our'].includes(extractedName)) {
        updateProfile({ businessName: extractedName });
      }
    }

    // Check for employee count mention
    const staffMatch = promptText.match(/(\d+)\s*(?:staff|employees|workers|people|doctors|mechanics|agents|crew)/i);
    if (staffMatch && staffMatch[1]) {
      const count = parseInt(staffMatch[1], 10);
      let size: any = 'SMALL_2_10';
      if (count === 1) size = 'SOLO_1';
      else if (count <= 10) size = 'SMALL_2_10';
      else if (count <= 50) size = 'GROWTH_11_50';
      else if (count <= 200) size = 'MID_51_200';
      else size = 'ENTERPRISE_201_PLUS';
      updateProfile({ employeesCount: count, companySize: size });
    }
  };

  return (
    <BlueprintContext.Provider
      value={{
        mounted,
        blueprint,
        effectiveBlueprint,
        healthReport,
        auditLogs,
        selectedBranchId,
        selectedRoleId,
        setSelectedBranchId,
        setSelectedRoleId,
        updateProfile,
        selectIndustryAndType,
        toggleService,
        updateTerminology,
        saveRecordType,
        removeRecordType,
        updateRecordFields,
        updateRecordStatuses,
        updateNavigation,
        updateDashboardWidgets,
        publishConfiguration,
        exportBlueprint,
        importBlueprint,
        applyAiPreset,
      }}
    >
      {children}
    </BlueprintContext.Provider>
  );
}

export function useBlueprint() {
  const context = useContext(BlueprintContext);
  if (!context) {
    throw new Error('useBlueprint must be used within a BlueprintProvider');
  }
  return context;
}
