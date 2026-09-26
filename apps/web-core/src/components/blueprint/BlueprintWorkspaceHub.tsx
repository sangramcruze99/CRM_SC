// apps/web-core/src/components/blueprint/BlueprintWorkspaceHub.tsx
'use client';

import React, { useState } from 'react';
import {
  Compass,
  Sliders,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ArrowRight,
  Download,
  Upload,
  Search,
  X,
  Plus,
  Trash2,
  Activity,
  BarChart3,
  Database,
  Palette,
  ChevronUp,
  ChevronDown,
  Edit2,
  Check,
  Tag,
  GitBranch,
  Eye,
  FileText,
} from 'lucide-react';
import { useBlueprint } from './BlueprintContext';
import { INDUSTRY_CATALOG, BUSINESS_TYPE_TEMPLATES } from '@/lib/blueprint/blueprintTemplates';
import { UNIVERSAL_SERVICE_CATALOG } from '@/lib/services/serviceCatalog';
import {
  ConfigurableField,
  FieldDataType,
  StatusPipelineStage,
  ConfigurableNavSection,
  ConfigurableNavSectionItem,
  ConfigurableDashboardWidget,
} from '@/lib/blueprint/blueprintModel';

export function BlueprintWorkspaceHub() {
  const {
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
  } = useBlueprint();

  // Active top navigation tab
  const [activeTab, setActiveTab] = useState<
    | 'PROFILE_AND_TYPE'
    | 'SERVICES_TIERS'
    | 'DATA_MODEL'
    | 'TERMINOLOGY'
    | 'NAVIGATION_STUDIO'
    | 'DASHBOARD_STUDIO'
    | 'HEALTH_AUDIT'
    | 'AI_COPILOT'
  >('PROFILE_AND_TYPE');

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustryKey, setSelectedIndustryKey] = useState(blueprint.industry || 'HEALTHCARE');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Field/Record builder modal/forms state
  const [editingRecordId, setEditingRecordId] = useState<string | null>(
    blueprint.recordTypes[0]?.id || null
  );
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldDataType>('TEXT');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  // New Record Type modal
  const [isAddingRecordType, setIsAddingRecordType] = useState(false);
  const [newRecordName, setNewRecordName] = useState('');
  const [newRecordSingular, setNewRecordSingular] = useState('');
  const [newRecordPlural, setNewRecordPlural] = useState('');
  const [newRecordCategory, setNewRecordCategory] = useState('Operations');

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('I run a private dental clinic with 8 staff, 4 operatories, and insurance billing.');

  // JSON Import/Export Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  // Level 2 Customization Studio States
  const [dataModelSubTab, setDataModelSubTab] = useState<'FIELDS' | 'PIPELINES'>('FIELDS');
  const [newStageLabel, setNewStageLabel] = useState('');
  const [newStageColor, setNewStageColor] = useState('#38bdf8');
  const [newStageIsDefault, setNewStageIsDefault] = useState(false);
  const [newStageIsTerminal, setNewStageIsTerminal] = useState(false);

  // Navigation Studio State
  const [isAddingNavItem, setIsAddingNavItem] = useState(false);
  const [targetNavSectionId, setTargetNavSectionId] = useState<string | null>(null);
  const [newNavItemLabel, setNewNavItemLabel] = useState('');
  const [newNavItemHref, setNewNavItemHref] = useState('');
  const [newNavItemBadge, setNewNavItemBadge] = useState('');
  const [isAddingNavSection, setIsAddingNavSection] = useState(false);
  const [newNavSectionTitle, setNewNavSectionTitle] = useState('');

  // Dashboard Studio State
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetType, setNewWidgetType] = useState<ConfigurableDashboardWidget['type']>('KPI');
  const [newWidgetValue, setNewWidgetValue] = useState('');
  const [newWidgetDelta, setNewWidgetDelta] = useState('');
  const [newWidgetSubtext, setNewWidgetSubtext] = useState('');

  // Terminology Studio State
  const [isAddingTerm, setIsAddingTerm] = useState(false);
  const [newTermKey, setNewTermKey] = useState('');
  const [newTermSingular, setNewTermSingular] = useState('');
  const [newTermPlural, setNewTermPlural] = useState('');
  const [newTermVerb, setNewTermVerb] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentTemplate =
    BUSINESS_TYPE_TEMPLATES[blueprint.activeBusinessTypeId] ||
    BUSINESS_TYPE_TEMPLATES['dental_clinic'];

  // All services in catalog grouped by tier
  const coreServices = blueprint.services.filter((s) => s.tier === 'CORE');
  const recommendedServices = blueprint.services.filter((s) => s.tier === 'RECOMMENDED');
  const optionalServices = blueprint.services.filter((s) => s.tier === 'OPTIONAL');
  const advancedServices = blueprint.services.filter((s) => s.tier === 'ADVANCED');

  const selectedRecord = blueprint.recordTypes.find((r) => r.id === editingRecordId);

  const handleAddFieldToRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecordId || !newFieldName) return;

    const generatedKey = newFieldKey.trim() || newFieldName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newField: ConfigurableField = {
      id: `f_${Date.now()}`,
      name: newFieldName,
      label: newFieldName,
      key: generatedKey,
      type: newFieldType,
      required: newFieldRequired,
      visibility: 'ALWAYS',
      searchable: true,
      filterable: true,
      reportable: true,
      inheritanceSource: 'WORKSPACE_CUSTOM',
    };

    const targetRecord = blueprint.recordTypes.find((r) => r.id === editingRecordId);
    if (!targetRecord) return;

    saveRecordType({
      ...targetRecord,
      fields: [...targetRecord.fields, newField],
      inheritanceSource: 'WORKSPACE_CUSTOM',
    });

    setNewFieldName('');
    setNewFieldKey('');
    triggerToast(`Added custom field "${newFieldName}" to ${targetRecord.name}`);
  };

  const handleDeleteField = (fieldId: string) => {
    if (!editingRecordId) return;
    const targetRecord = blueprint.recordTypes.find((r) => r.id === editingRecordId);
    if (!targetRecord) return;
    const updatedFields = targetRecord.fields.filter((f) => f.id !== fieldId);
    updateRecordFields(editingRecordId, updatedFields);
    triggerToast(`Removed field from ${targetRecord.name}`);
  };

  const handleAddStatusStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecordId || !newStageLabel) return;
    const targetRecord = blueprint.recordTypes.find((r) => r.id === editingRecordId);
    if (!targetRecord) return;
    const newStage: StatusPipelineStage = {
      id: `st_${Date.now()}`,
      name: newStageLabel,
      label: newStageLabel,
      color: newStageColor,
      isDefault: newStageIsDefault,
      isTerminal: newStageIsTerminal,
      order: (targetRecord.statuses?.length || 0) + 1,
    };
    const updatedStatuses = [...(targetRecord.statuses || []), newStage];
    updateRecordStatuses(editingRecordId, updatedStatuses);
    setNewStageLabel('');
    triggerToast(`Added status stage "${newStageLabel}"`);
  };

  const handleDeleteStatusStage = (statusId: string) => {
    if (!editingRecordId) return;
    const targetRecord = blueprint.recordTypes.find((r) => r.id === editingRecordId);
    if (!targetRecord) return;
    const updated = (targetRecord.statuses || []).filter((s) => s.id !== statusId);
    updateRecordStatuses(editingRecordId, updated);
    triggerToast('Removed status stage');
  };

  const handleMoveStatus = (index: number, direction: 'up' | 'down') => {
    if (!editingRecordId) return;
    const targetRecord = blueprint.recordTypes.find((r) => r.id === editingRecordId);
    if (!targetRecord || !targetRecord.statuses) return;
    const copy = [...targetRecord.statuses];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= copy.length) return;
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    const reordered = copy.map((s, idx) => ({ ...s, order: idx + 1 }));
    updateRecordStatuses(editingRecordId, reordered);
  };

  const handleMoveNavSection = (index: number, direction: 'up' | 'down') => {
    const copy = [...blueprint.navigation];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= copy.length) return;
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    const reordered = copy.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    updateNavigation(reordered);
    triggerToast('Reordered navigation sections');
  };

  const handleMoveNavItem = (sectionId: string, itemIndex: number, direction: 'up' | 'down') => {
    const sectionIndex = blueprint.navigation.findIndex((s) => s.id === sectionId);
    if (sectionIndex < 0) return;
    const targetSection = blueprint.navigation[sectionIndex];
    const itemsCopy = [...targetSection.items];
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (targetIndex < 0 || targetIndex >= itemsCopy.length) return;
    const temp = itemsCopy[itemIndex];
    itemsCopy[itemIndex] = itemsCopy[targetIndex];
    itemsCopy[targetIndex] = temp;

    const updatedSections = [...blueprint.navigation];
    updatedSections[sectionIndex] = { ...targetSection, items: itemsCopy };
    updateNavigation(updatedSections);
  };

  const handleDeleteNavItem = (sectionId: string, itemId: string) => {
    const updatedSections = blueprint.navigation.map((sec) =>
      sec.id === sectionId
        ? { ...sec, items: sec.items.filter((item) => item.id !== itemId) }
        : sec
    );
    updateNavigation(updatedSections);
    triggerToast('Removed navigation item');
  };

  const handleAddNavItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetNavSectionId || !newNavItemLabel || !newNavItemHref) return;

    const newItem: ConfigurableNavSectionItem = {
      id: `nav_item_${Date.now()}`,
      label: newNavItemLabel,
      href: newNavItemHref,
      iconName: 'Compass',
      badge: newNavItemBadge.trim() || undefined,
    };

    const updatedSections = blueprint.navigation.map((sec) =>
      sec.id === targetNavSectionId
        ? { ...sec, items: [...sec.items, newItem] }
        : sec
    );

    updateNavigation(updatedSections);
    setIsAddingNavItem(false);
    setNewNavItemLabel('');
    setNewNavItemHref('');
    setNewNavItemBadge('');
    triggerToast(`Added "${newNavItemLabel}" to sidebar navigation!`);
  };

  const handleAddNavSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNavSectionTitle) return;

    const newSec: ConfigurableNavSection = {
      id: `sec_${Date.now()}`,
      sectionTitle: newNavSectionTitle,
      iconName: 'Compass',
      order: blueprint.navigation.length + 1,
      items: [],
      defaultExpanded: true,
    };

    updateNavigation([...blueprint.navigation, newSec]);
    setIsAddingNavSection(false);
    setNewNavSectionTitle('');
    triggerToast(`Created new navigation section "${newNavSectionTitle}"!`);
  };

  const handleDeleteNavSection = (sectionId: string) => {
    const updated = blueprint.navigation.filter((s) => s.id !== sectionId);
    updateNavigation(updated);
    triggerToast('Deleted navigation section');
  };

  const handleAddDashboardWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetTitle) return;

    const newWidget: ConfigurableDashboardWidget = {
      id: `w_${Date.now()}`,
      title: newWidgetTitle,
      type: newWidgetType,
      size: 'SMALL',
      metricValue: newWidgetValue || undefined,
      metricDelta: newWidgetDelta || undefined,
      metricSubtext: newWidgetSubtext || undefined,
      iconName: 'BarChart3',
    };

    updateDashboardWidgets([...blueprint.dashboards, newWidget]);
    setIsAddingWidget(false);
    setNewWidgetTitle('');
    setNewWidgetValue('');
    setNewWidgetDelta('');
    setNewWidgetSubtext('');
    triggerToast(`Added dashboard widget "${newWidgetTitle}"!`);
  };

  const handleDeleteDashboardWidget = (widgetId: string) => {
    const updated = blueprint.dashboards.filter((w) => w.id !== widgetId);
    updateDashboardWidgets(updated);
    triggerToast('Removed dashboard widget');
  };

  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const copy = [...blueprint.dashboards];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= copy.length) return;
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    updateDashboardWidgets(copy);
  };

  const handleAddTerminology = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermKey || !newTermSingular) return;
    const cleanKey = newTermKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    updateTerminology(cleanKey, newTermSingular, newTermPlural || `${newTermSingular}s`, newTermVerb || `Add ${newTermSingular}`);
    setIsAddingTerm(false);
    setNewTermKey('');
    setNewTermSingular('');
    setNewTermPlural('');
    setNewTermVerb('');
    triggerToast(`Added custom term mapping for "${cleanKey}"!`);
  };

  const handleCreateRecordType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordName) return;

    const newId = `rec_${Date.now()}`;
    const newType = {
      id: newId,
      name: newRecordName,
      singular: newRecordSingular || newRecordName,
      plural: newRecordPlural || `${newRecordName}s`,
      route: `/customization`,
      iconName: 'Database',
      description: `Custom workspace record type for ${newRecordName}`,
      category: newRecordCategory,
      isCustom: true,
      fields: [
        {
          id: `f_${Date.now()}_id`,
          name: 'name',
          label: `${newRecordSingular || newRecordName} Name / Identifier`,
          key: 'name',
          type: 'TEXT' as FieldDataType,
          required: true,
          visibility: 'ALWAYS' as const,
          searchable: true,
          filterable: true,
          reportable: true,
        },
      ],
      statuses: [
        { id: 'st_1', name: 'Draft', label: 'Draft', color: '#94a3b8', order: 1, isDefault: true },
        { id: 'st_2', name: 'Active', label: 'Active', color: '#10b981', order: 2 },
        { id: 'st_3', name: 'Closed', label: 'Closed', color: '#64748b', order: 3, isTerminal: true },
      ],
      relationships: [],
      views: ['TABLE' as const, 'KANBAN' as const],
      inheritanceSource: 'WORKSPACE_CUSTOM' as const,
    };

    saveRecordType(newType);
    setEditingRecordId(newId);
    setIsAddingRecordType(false);
    setNewRecordName('');
    setNewRecordSingular('');
    setNewRecordPlural('');
    triggerToast(`Created new custom record type "${newRecordName}"!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white p-4 sm:p-6 lg:p-8 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-950/95 border border-emerald-500/50 text-white rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Niche Configuration Blueprint v{blueprint.version}.0
            </span>
            <span className="text-xs text-slate-400">· Layered Inheritance Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/25 border border-emerald-300/30">
              <Compass size={22} />
            </div>
            <span>{blueprint.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            {blueprint.description}
          </p>
        </div>

        {/* Global Blueprint Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              const jsonStr = exportBlueprint();
              const blob = new Blob([jsonStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${blueprint.slug}-blueprint-v${blueprint.version}.json`;
              a.click();
              triggerToast('Exported clean configuration blueprint (all secrets scrubbed)');
            }}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} className="text-emerald-400" />
            <span>Export Blueprint</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Upload size={14} className="text-teal-400" />
            <span>Import</span>
          </button>

          <button
            onClick={() => {
              publishConfiguration();
              triggerToast(`Published Configuration Version v${blueprint.version + 1}!`);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-mono font-bold transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <CheckCircle2 size={16} />
            <span>Publish Configuration</span>
          </button>
        </div>
      </div>

      {/* Layer Inheritance & Context Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Layers size={14} className="text-emerald-400" />
            <span>Configuration Hierarchy:</span>
          </span>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300">Global</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300">{blueprint.industry}</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-emerald-400 font-bold">{currentTemplate.name}</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
              Workspace Blueprint
            </span>
          </div>
        </div>

        {/* Branch & Role Lens Selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-mono">Branch:</span>
            <select
              value={selectedBranchId || ''}
              onChange={(e) => setSelectedBranchId(e.target.value || undefined)}
              className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Main Practice / HQ (Default)</option>
              {blueprint.branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branchName} ({b.city})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-mono">Role Lens:</span>
            <select
              value={selectedRoleId || ''}
              onChange={(e) => setSelectedRoleId(e.target.value || undefined)}
              className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Roles (Executive Master)</option>
              {blueprint.roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Tab Switcher Bar */}
      <div className="border-b border-white/[0.08] overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max pb-1">
          {[
            { id: 'PROFILE_AND_TYPE', label: '1. Business Profile & Type', icon: Building2 },
            { id: 'SERVICES_TIERS', label: '2. Services & Packages', icon: Layers },
            { id: 'DATA_MODEL', label: '3. Records & Fields', icon: Database },
            { id: 'TERMINOLOGY', label: '4. Terminology', icon: Palette },
            { id: 'NAVIGATION_STUDIO', label: '5. Navigation Studio', icon: Compass },
            { id: 'DASHBOARD_STUDIO', label: '6. Dashboard & KPIs', icon: BarChart3 },
            { id: 'HEALTH_AUDIT', label: '7. Health & Audit', icon: Activity, badge: healthReport.overallStatus === 'HEALTHY' ? 'OK' : 'Alert' },
            { id: 'AI_COPILOT', label: 'AI Configuration Copilot', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      tab.badge === 'OK'
                        ? isSelected
                          ? 'bg-zinc-950 text-emerald-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                        : isSelected
                        ? 'bg-red-950 text-red-300'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BUSINESS PROFILE & BUSINESS TYPE SELECTION */}
      {/* ========================================================================= */}
      {activeTab === 'PROFILE_AND_TYPE' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Industry Selection */}
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-400">
              Step 1: Choose Your Industry Domain
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {INDUSTRY_CATALOG.map((ind) => {
                const isSelected = selectedIndustryKey === ind.key;
                return (
                  <button
                    key={ind.key}
                    onClick={() => setSelectedIndustryKey(ind.key)}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                        : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{ind.name}</span>
                      {isSelected && <CheckCircle2 size={16} className="text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{ind.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Business Type Selection */}
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-400">
              Step 2: Choose Your Specific Business Type Blueprint
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INDUSTRY_CATALOG.find((ind) => ind.key === selectedIndustryKey)?.businessTypes.map(
                (bt) => {
                  const template = BUSINESS_TYPE_TEMPLATES[bt.id] || {
                    name: bt.name,
                    description: 'Specialized enterprise operating configuration.',
                    coreServiceIds: ['srv_contacts', 'srv_invoices_billing'],
                    recommendedServiceIds: ['srv_deals_pipeline'],
                  };
                  const isCurrent = blueprint.activeBusinessTypeId === bt.id;

                  return (
                    <div
                      key={bt.id}
                      className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-emerald-950/40 border-emerald-500/60 shadow-xl shadow-emerald-500/10'
                          : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="text-sm font-bold text-white">{template.name}</h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              ACTIVE BLUEPRINT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-4">{template.description}</p>

                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">
                            Core Capabilities:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {template.coreServiceIds.map((sId) => (
                              <span
                                key={sId}
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/[0.06] text-slate-300"
                              >
                                {UNIVERSAL_SERVICE_CATALOG[sId]?.name || sId}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">
                          {template.recordTypes?.length || 2} Records Defined
                        </span>
                        <button
                          onClick={() => {
                            selectIndustryAndType(selectedIndustryKey, bt.id);
                            triggerToast(`Activated blueprint for ${template.name}`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isCurrent
                              ? 'bg-white/[0.08] text-slate-400 cursor-default'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20'
                          }`}
                        >
                          <span>{isCurrent ? 'Current Blueprint' : 'Apply Blueprint'}</span>
                          {!isCurrent && <ArrowRight size={13} />}
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Business Profile Details Form */}
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Business Profile & Organization Parameters</h3>
                <p className="text-xs text-slate-400">
                  The Blueprint Configuration Engine uses these parameters to tailor terminology, tax setups, and service recommendations.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400">Layer 1: Profile Input</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Business Name</label>
                <input
                  type="text"
                  value={blueprint.profile?.businessName || ''}
                  onChange={(e) => updateProfile({ businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Apex Health Systems"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Company Size</label>
                <select
                  value={blueprint.profile?.companySize || 'SMALL_2_10'}
                  onChange={(e) => updateProfile({ companySize: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="SOLO_1">Solo Practitioner (1)</option>
                  <option value="SMALL_2_10">Small Clinic / Team (2 - 10)</option>
                  <option value="GROWTH_11_50">Growth Organization (11 - 50)</option>
                  <option value="MID_51_200">Mid-Market (51 - 200)</option>
                  <option value="ENTERPRISE_201_PLUS">Multi-Divisional Enterprise (201+)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Operating Currency</label>
                <input
                  type="text"
                  value={blueprint.profile?.currency || 'USD ($)'}
                  onChange={(e) => updateProfile({ currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Billing Model</label>
                <select
                  value={blueprint.profile?.billingModel || 'POINT_OF_SALE'}
                  onChange={(e) => updateProfile({ billingModel: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="POINT_OF_SALE">Point of Sale & Co-Pays</option>
                  <option value="INVOICED_NET30">Commercial Net-30 Invoicing</option>
                  <option value="SUBSCRIPTION_RECURRING">SaaS / Retainer Subscriptions</option>
                  <option value="MILESTONE_RETAINER">Milestone SOW Draws</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Customer / Patient Type</label>
                <select
                  value={blueprint.profile?.customerBaseType || 'HEALTHCARE_PATIENTS'}
                  onChange={(e) => updateProfile({ customerBaseType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="HEALTHCARE_PATIENTS">Patients & Clinical Inpatients</option>
                  <option value="B2B">Corporate B2B Accounts</option>
                  <option value="B2C">Individual Shoppers & Consumers</option>
                  <option value="GUESTS">Restaurant & Hospitality Guests</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Business Region</label>
                <input
                  type="text"
                  value={blueprint.profile?.businessRegion || 'Primary Facility'}
                  onChange={(e) => updateProfile({ businessRegion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SERVICES & PACKAGES (CORE, RECOMMENDED, OPTIONAL, ADVANCED) */}
      {/* ========================================================================= */}
      {activeTab === 'SERVICES_TIERS' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Independent Configurable Service Packages</h2>
              <p className="text-xs text-slate-400">
                Each service is an autonomous capability package delivering records, forms, workflows, permissions, and reports.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/10">
              Active Services: <span className="text-emerald-400 font-bold">{blueprint.activeServiceIds.length}</span> / {Object.keys(UNIVERSAL_SERVICE_CATALOG).length}
            </div>
          </div>

          {/* Tier Groups */}
          {[
            { title: 'CORE SERVICES (Essential for Business Type)', list: coreServices, badge: 'CORE', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
            { title: 'RECOMMENDED SERVICES (Operational Excellence)', list: recommendedServices, badge: 'RECOMMENDED', color: 'border-teal-500/40 bg-teal-500/10 text-teal-400' },
            { title: 'OPTIONAL SERVICES (Specialized Capabilities)', list: optionalServices, badge: 'OPTIONAL', color: 'border-slate-500/40 bg-slate-500/10 text-slate-300' },
            { title: 'ADVANCED CAPABILITIES (Multi-location & Scale)', list: advancedServices, badge: 'ADVANCED', color: 'border-purple-500/40 bg-purple-500/10 text-purple-400' },
          ].map((tierGroup) => {
            if (tierGroup.list.length === 0) return null;

            return (
              <div key={tierGroup.title} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${tierGroup.color}`}>
                    {tierGroup.badge}
                  </span>
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    {tierGroup.title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tierGroup.list.map((item) => {
                    const catalogSrv = UNIVERSAL_SERVICE_CATALOG[item.serviceId];
                    if (!catalogSrv) return null;
                    const isEnabled = item.enabled;

                    return (
                      <div
                        key={item.serviceId}
                        className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                          isEnabled
                            ? 'bg-zinc-900/90 border-emerald-500/40 shadow-sm'
                            : 'bg-white/[0.02] border-white/[0.06] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                              {catalogSrv.name}
                            </h4>
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => toggleService(item.serviceId)}
                              className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mb-3">{catalogSrv.shortDesc}</p>

                          {item.whyEnabled && (
                            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[10px] text-emerald-300/90 font-mono mb-2">
                              Reason: {item.whyEnabled}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1">
                            {catalogSrv.records.map((rec) => (
                              <span
                                key={rec}
                                className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/[0.04] text-slate-300"
                              >
                                Record: {rec}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Deps: {catalogSrv.dependencies.length ? catalogSrv.dependencies.length : 'None'}</span>
                          <span className={isEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {isEnabled ? 'Enabled & Provisioned' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DATA MODEL, RECORD TYPES & FIELDS */}
      {/* ========================================================================= */}
      {activeTab === 'DATA_MODEL' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Dynamic Record Types & Custom Field Builder</h2>
              <p className="text-xs text-slate-400">
                Define the core database schemas, custom fields, and status pipelines for this business blueprint.
              </p>
            </div>
            <button
              onClick={() => setIsAddingRecordType(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Custom Record Type</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Record Types Selector Sidebar */}
            <div className="md:col-span-4 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-2">
                Workspace Record Types ({blueprint.recordTypes.length})
              </span>
              {blueprint.recordTypes.map((rec) => {
                const isSelected = editingRecordId === rec.id;
                return (
                  <div
                    key={rec.id}
                    onClick={() => setEditingRecordId(rec.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{rec.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {rec.fields.length} Fields · {rec.statuses?.length || 0} Statuses
                      </div>
                    </div>
                    {rec.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecordType(rec.id);
                          triggerToast(`Deleted record type ${rec.name}`);
                        }}
                        className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Field Configuration Area */}
            <div className="md:col-span-8 space-y-6">
              {selectedRecord ? (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-6">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{selectedRecord.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-slate-300">
                          Route: {selectedRecord.route}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedRecord.description}</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Singular: <strong className="text-white">{selectedRecord.singular}</strong>
                    </span>
                  </div>

                  {/* Studio Subtabs: Fields vs Status Pipelines */}
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
                    <button
                      type="button"
                      onClick={() => setDataModelSubTab('FIELDS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        dataModelSubTab === 'FIELDS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Database size={13} />
                      <span>Fields & Schema ({selectedRecord.fields.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDataModelSubTab('PIPELINES')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        dataModelSubTab === 'PIPELINES'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <GitBranch size={13} />
                      <span>Pipeline Stages & Statuses ({selectedRecord.statuses?.length || 0})</span>
                    </button>
                  </div>

                  {dataModelSubTab === 'FIELDS' ? (
                    <>
                      {/* Active Fields Table */}
                      <div className="space-y-3">
                        <span className="text-xs font-mono font-bold text-slate-300 block">
                          Configured Fields ({selectedRecord.fields.length})
                        </span>
                        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                          {selectedRecord.fields.map((field) => (
                            <div
                              key={field.id}
                              className="p-2.5 rounded-xl bg-zinc-900 border border-white/[0.06] flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-bold text-white flex items-center gap-2">
                                  <span>{field.label}</span>
                                  <span className="text-[10px] font-mono text-emerald-400">
                                    ({field.key})
                                  </span>
                                  {field.required && (
                                    <span className="text-[9px] font-mono text-red-400 bg-red-500/10 px-1 rounded">
                                      REQUIRED
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Type: {field.type} · Visibility: {field.visibility}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500">
                                  {field.inheritanceSource || 'TEMPLATE'}
                                </span>
                                {field.id.startsWith('f_') && !field.required && (
                                  <button
                                    onClick={() => handleDeleteField(field.id)}
                                    className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                                    title="Delete field"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add New Field Form */}
                      <form
                        onSubmit={handleAddFieldToRecord}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3"
                      >
                        <span className="text-xs font-mono font-bold text-emerald-400 block">
                          + Add New Field to {selectedRecord.singular}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">
                              Field Label
                            </label>
                            <input
                              type="text"
                              value={newFieldName}
                              onChange={(e) => {
                                setNewFieldName(e.target.value);
                                setNewFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                              }}
                              placeholder="e.g. Tooth Number"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">
                              Database Key
                            </label>
                            <input
                              type="text"
                              value={newFieldKey}
                              onChange={(e) => setNewFieldKey(e.target.value)}
                              placeholder="tooth_number"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white font-mono"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">
                              Data Type
                            </label>
                            <select
                              value={newFieldType}
                              onChange={(e) => setNewFieldType(e.target.value as FieldDataType)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                            >
                              <option value="TEXT">Text</option>
                              <option value="NUMBER">Number</option>
                              <option value="CURRENCY">Currency ($)</option>
                              <option value="DATE">Date</option>
                              <option value="DROPDOWN">Dropdown</option>
                              <option value="BOOLEAN">Checkbox (Boolean)</option>
                              <option value="PHONE">Phone</option>
                              <option value="EMAIL">Email</option>
                            </select>
                          </div>

                          <div className="flex items-end gap-2">
                            <label className="flex items-center gap-1.5 text-xs text-slate-300 pb-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newFieldRequired}
                                onChange={(e) => setNewFieldRequired(e.target.checked)}
                                className="accent-emerald-500 w-3.5 h-3.5 rounded"
                              />
                              <span>Required</span>
                            </label>
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </form>
                    </>
                  ) : (
                    /* STATUS PIPELINE SUBTAB */
                    <div className="space-y-4">
                      {/* Visual Pipeline Bar */}
                      <div className="p-3 bg-zinc-900/80 rounded-xl border border-white/[0.06] flex items-center gap-1.5 overflow-x-auto pb-2">
                        {selectedRecord.statuses?.map((st, idx) => (
                          <React.Fragment key={st.id}>
                            <div
                              className="px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shrink-0"
                              style={{
                                backgroundColor: `${st.color}20`,
                                color: st.color,
                                border: `1px solid ${st.color}40`,
                              }}
                            >
                              <span>{st.label}</span>
                              {st.isDefault && <span className="text-[8px] opacity-75 font-normal">(Default)</span>}
                              {st.isTerminal && <span className="text-[8px] opacity-75 font-normal">(Terminal)</span>}
                            </div>
                            {idx < (selectedRecord.statuses?.length || 0) - 1 && (
                              <span className="text-zinc-600 text-xs">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Status Stages List */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-mono font-bold text-slate-300 block">
                          Configured Pipeline Stages
                        </span>
                        {selectedRecord.statuses?.map((st, idx) => (
                          <div
                            key={st.id}
                            className="p-2.5 rounded-xl bg-zinc-900 border border-white/[0.06] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: st.color }}
                              />
                              <span className="font-bold text-white">{st.label}</span>
                              {st.isDefault && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300">
                                  DEFAULT ENTRY
                                </span>
                              )}
                              {st.isTerminal && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300">
                                  TERMINAL / CLOSED
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveStatus(idx, 'up')}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                                title="Move Earlier in Pipeline"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (selectedRecord.statuses?.length || 1) - 1}
                                onClick={() => handleMoveStatus(idx, 'down')}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                                title="Move Later in Pipeline"
                              >
                                <ChevronDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStatusStage(st.id)}
                                className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                                title="Remove Status Stage"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Status Form */}
                      <form
                        onSubmit={handleAddStatusStage}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3"
                      >
                        <span className="text-xs font-mono font-bold text-emerald-400 block">
                          + Add New Pipeline Stage
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">
                              Stage Name / Label
                            </label>
                            <input
                              type="text"
                              value={newStageLabel}
                              onChange={(e) => setNewStageLabel(e.target.value)}
                              placeholder="e.g. Underwriting Review"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">
                              Badge Color
                            </label>
                            <div className="flex items-center gap-1.5 pt-1">
                              {['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#64748b'].map((hex) => (
                                <button
                                  key={hex}
                                  type="button"
                                  onClick={() => setNewStageColor(hex)}
                                  className={`w-5 h-5 rounded-full cursor-pointer transition ${
                                    newStageColor === hex ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : 'opacity-70 hover:opacity-100'
                                  }`}
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-end gap-2">
                            <label className="flex items-center gap-1.5 text-xs text-slate-300 pb-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newStageIsTerminal}
                                onChange={(e) => setNewStageIsTerminal(e.target.checked)}
                                className="accent-emerald-500 w-3.5 h-3.5 rounded"
                              />
                              <span>Terminal</span>
                            </label>
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
                            >
                              Add Stage
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">Select a record type to configure its schema.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TERMINOLOGY BUILDER */}
      {/* ========================================================================= */}
      {activeTab === 'TERMINOLOGY' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Universal Terminology & Label Engine</h2>
              <p className="text-xs text-slate-400">
                Customize how system objects (Customer, Deal, Invoice, etc.) are labeled throughout the entire UI.
              </p>
            </div>
            <button
              onClick={() => setIsAddingTerm(!isAddingTerm)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Custom Term Mapping</span>
            </button>
          </div>

          {isAddingTerm && (
            <form
              onSubmit={handleAddTerminology}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3"
            >
              <span className="text-xs font-mono font-bold text-emerald-400 block">
                + Add New Term Mapping
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    System Key (e.g. assets)
                  </label>
                  <input
                    type="text"
                    value={newTermKey}
                    onChange={(e) => setNewTermKey(e.target.value)}
                    placeholder="assets"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Singular Form</label>
                  <input
                    type="text"
                    value={newTermSingular}
                    onChange={(e) => setNewTermSingular(e.target.value)}
                    placeholder="Asset"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Plural Form</label>
                  <input
                    type="text"
                    value={newTermPlural}
                    onChange={(e) => setNewTermPlural(e.target.value)}
                    placeholder="Assets"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Action Verb</label>
                    <input
                      type="text"
                      value={newTermVerb}
                      onChange={(e) => setNewTermVerb(e.target.value)}
                      placeholder="Add Asset"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(blueprint.terminology).map(([key, term]) => (
              <div
                key={key}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                    System Object: {key}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Live UI Preview: <strong className="text-white">{term.singular}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Singular</label>
                    <input
                      type="text"
                      value={term.singular}
                      onChange={(e) =>
                        updateTerminology(key, e.target.value, term.plural, term.verbAdd)
                      }
                      className="w-full px-2 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Plural</label>
                    <input
                      type="text"
                      value={term.plural}
                      onChange={(e) =>
                        updateTerminology(key, term.singular, e.target.value, term.verbAdd)
                      }
                      className="w-full px-2 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Action Verb</label>
                    <input
                      type="text"
                      value={term.verbAdd}
                      onChange={(e) =>
                        updateTerminology(key, term.singular, term.plural, e.target.value)
                      }
                      className="w-full px-2 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: NAVIGATION STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'NAVIGATION_STUDIO' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Sidebar Navigation Studio & Live Preview</h2>
              <p className="text-xs text-slate-400">
                Configure custom navigation sections, reorder items, customize badges, and verify live.
              </p>
            </div>
            <button
              onClick={() => setIsAddingNavSection(!isAddingNavSection)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Navigation Section</span>
            </button>
          </div>

          {isAddingNavSection && (
            <form
              onSubmit={handleAddNavSection}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-end gap-3"
            >
              <div className="flex-1">
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Section Title (e.g. Clinical Operations, Fleet Dispatch, Litigation)
                </label>
                <input
                  type="text"
                  value={newNavSectionTitle}
                  onChange={(e) => setNewNavSectionTitle(e.target.value)}
                  placeholder="e.g. Job Site Management"
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs cursor-pointer"
              >
                Create Section
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNavSection(false)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Configured Sections */}
            <div className="md:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold text-slate-300 block">
                Active Sections ({blueprint.navigation.length})
              </span>
              {blueprint.navigation.map((sec, secIdx) => (
                <div
                  key={sec.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{sec.sectionTitle}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ({sec.items.length} items)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={secIdx === 0}
                        onClick={() => handleMoveNavSection(secIdx, 'up')}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Section Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={secIdx === blueprint.navigation.length - 1}
                        onClick={() => handleMoveNavSection(secIdx, 'down')}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Section Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetNavSectionId(sec.id);
                          setIsAddingNavItem(true);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 text-[10px] font-mono font-bold transition cursor-pointer"
                      >
                        + Add Item
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNavSection(sec.id)}
                        className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                        title="Delete Section"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Add Item to Section Form */}
                  {isAddingNavItem && targetNavSectionId === sec.id && (
                    <form
                      onSubmit={handleAddNavItem}
                      className="p-3 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-2 animate-in fade-in"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] font-mono text-slate-400 block mb-0.5">Item Label</label>
                          <input
                            type="text"
                            value={newNavItemLabel}
                            onChange={(e) => setNewNavItemLabel(e.target.value)}
                            placeholder="e.g. Daily Job Logs"
                            className="w-full px-2 py-1 rounded bg-zinc-950 border border-white/10 text-xs text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-slate-400 block mb-0.5">Target Route / URL</label>
                          <input
                            type="text"
                            value={newNavItemHref}
                            onChange={(e) => setNewNavItemHref(e.target.value)}
                            placeholder="/projects"
                            className="w-full px-2 py-1 rounded bg-zinc-950 border border-white/10 text-xs text-white font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-slate-400 block mb-0.5">Badge (Optional)</label>
                          <input
                            type="text"
                            value={newNavItemBadge}
                            onChange={(e) => setNewNavItemBadge(e.target.value)}
                            placeholder="New / Live"
                            className="w-full px-2 py-1 rounded bg-zinc-950 border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingNavItem(false)}
                          className="px-2.5 py-1 text-slate-400 text-xs font-mono hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-mono font-bold"
                        >
                          Save Item
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Items in Section */}
                  <div className="space-y-1">
                    {sec.items.map((item, itemIdx) => (
                      <div
                        key={item.id}
                        className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.04] text-xs text-slate-300 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{item.label}</span>
                          <span className="text-[10px] font-mono text-slate-500">{item.href}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-1 rounded">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={itemIdx === 0}
                            onClick={() => handleMoveNavItem(sec.id, itemIdx, 'up')}
                            className="p-1 text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={itemIdx === sec.items.length - 1}
                            onClick={() => handleMoveNavItem(sec.id, itemIdx, 'down')}
                            className="p-1 text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNavItem(sec.id, item.id)}
                            className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Navigation Mock Preview */}
            <div className="md:col-span-5 p-5 rounded-3xl bg-zinc-950 border border-white/10 space-y-4 shadow-2xl h-fit sticky top-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">
                Live Sidebar Preview (Real-time)
              </span>
              <div className="w-full space-y-3 text-xs font-mono">
                <div className="text-[11px] text-slate-400 font-bold uppercase pb-1 border-b border-white/[0.06]">
                  {blueprint.profile?.businessName || 'Business OS'}
                </div>
                {blueprint.navigation.map((sec) => (
                  <div key={sec.id} className="space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase font-bold pt-2">
                      {sec.sectionTitle}
                    </div>
                    {sec.items.map((item) => (
                      <div
                        key={item.id}
                        className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white flex items-center justify-between transition cursor-pointer"
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DASHBOARD & KPIS */}
      {/* ========================================================================= */}
      {activeTab === 'DASHBOARD_STUDIO' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Dashboard Widgets & KPI Metrics</h2>
              <p className="text-xs text-slate-400">
                Real-time operational cards configured specifically for this business niche.
              </p>
            </div>
            <button
              onClick={() => setIsAddingWidget(!isAddingWidget)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Dashboard Widget</span>
            </button>
          </div>

          {isAddingWidget && (
            <form
              onSubmit={handleAddDashboardWidget}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 animate-in fade-in"
            >
              <span className="text-xs font-mono font-bold text-emerald-400 block">
                + Configure New Dashboard Metric Card
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Card Title</label>
                  <input
                    type="text"
                    value={newWidgetTitle}
                    onChange={(e) => setNewWidgetTitle(e.target.value)}
                    placeholder="e.g. Active Project Draws"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Widget Type</label>
                  <select
                    value={newWidgetType}
                    onChange={(e) => setNewWidgetType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                  >
                    <option value="KPI">KPI Metric Card</option>
                    <option value="CHART">Visual Chart</option>
                    <option value="TABLE">Data Table</option>
                    <option value="ACTIVITY">Activity Feed</option>
                    <option value="TASKS">Pending Tasks</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Metric Value</label>
                  <input
                    type="text"
                    value={newWidgetValue}
                    onChange={(e) => setNewWidgetValue(e.target.value)}
                    placeholder="$128,400 or 94.2%"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Delta / Growth</label>
                  <input
                    type="text"
                    value={newWidgetDelta}
                    onChange={(e) => setNewWidgetDelta(e.target.value)}
                    placeholder="+14.2% MoM"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Subtext / Context</label>
                  <input
                    type="text"
                    value={newWidgetSubtext}
                    onChange={(e) => setNewWidgetSubtext(e.target.value)}
                    placeholder="e.g. Certified by safety inspector"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingWidget(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs font-mono text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs cursor-pointer"
                  >
                    Save Card
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {blueprint.dashboards.map((widget, idx) => (
              <div
                key={widget.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/30 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    <span>{widget.type}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveWidget(idx, 'up')}
                        className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === blueprint.dashboards.length - 1}
                        onClick={() => handleMoveWidget(idx, 'down')}
                        className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDashboardWidget(widget.id)}
                        className="p-0.5 text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-2">{widget.title}</h4>
                  {widget.metricValue && (
                    <div className="text-2xl font-mono font-extrabold text-emerald-400">
                      {widget.metricValue}
                    </div>
                  )}
                  {widget.metricDelta && (
                    <div className="text-[10px] font-mono text-teal-300 mt-1">
                      {widget.metricDelta}
                    </div>
                  )}
                </div>
                {widget.metricSubtext && (
                  <div className="text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-white/[0.06]">
                    {widget.metricSubtext}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: HEALTH AUDIT & REVISION LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'HEALTH_AUDIT' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Configuration Health & Integrity Diagnostic</h2>
              <p className="text-xs text-slate-400">
                Continuous validation across service dependencies, route targets, database schemas, and workflows.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-black text-emerald-400">
                {healthReport.score} / 100
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Status: <strong className="text-white">{healthReport.overallStatus}</strong>
              </span>
            </div>
          </div>

          {/* Diagnostic Checks List */}
          <div className="space-y-2">
            {healthReport.checks.map((chk, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  {chk.status === 'PASS' ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-white">{chk.name}</span>
                    <p className="text-[11px] text-slate-400">{chk.message}</p>
                  </div>
                </div>
                {chk.remediationAction && (
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-1 rounded">
                    Action: {chk.remediationAction}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Audit Logs */}
          <div className="pt-6 border-t border-white/[0.08] space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Recent Configuration Changes & Audit Trail
            </h3>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-zinc-900 border border-white/[0.04] flex items-center justify-between text-[11px] font-mono"
                  >
                    <div>
                      <span className="text-emerald-400 font-bold">[{log.action}]</span>{' '}
                      <span className="text-white">{log.detail}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-xs">No configuration actions logged yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: AI CONFIGURATION COPILOT */}
      {/* ========================================================================= */}
      {activeTab === 'AI_COPILOT' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-white">AI Configuration Assistant</h2>
            <p className="text-xs text-slate-400">
              Describe your business in plain English. The AI configuration engine will recommend industry, business type, core services, and schemas.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] space-y-4">
            <label className="text-xs font-mono font-bold text-slate-300 block">
              Describe your business model and operational needs:
            </label>
            <textarea
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full p-3 rounded-2xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              placeholder="e.g. I run a commercial real estate agency with 12 agents, specializing in luxury office leases and escrow sales."
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Rule: Generates a configuration draft. Never publishes automatically.
              </span>
              <button
                onClick={() => {
                  applyAiPreset(aiPrompt);
                  triggerToast('AI draft generated! Review the recommended blueprint tabs.');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={15} />
                <span>Generate Blueprint Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Import Configuration Blueprint</h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Paste a valid Blueprint JSON package to load all services, fields, navigation, and records.
            </p>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON here..."
              className="w-full p-3 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  try {
                    importBlueprint(importJsonText);
                    setIsImportModalOpen(false);
                    triggerToast('Imported Blueprint successfully!');
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Record Type Modal */}
      {isAddingRecordType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateRecordType}
            className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4 text-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Create Custom Record Type</h3>
              <button
                type="button"
                onClick={() => setIsAddingRecordType(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Record Type Name
              </label>
              <input
                type="text"
                value={newRecordName}
                onChange={(e) => {
                  setNewRecordName(e.target.value);
                  setNewRecordSingular(e.target.value);
                  setNewRecordPlural(`${e.target.value}s`);
                }}
                placeholder="e.g. Insurance Claim"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Singular</label>
                <input
                  type="text"
                  value={newRecordSingular}
                  onChange={(e) => setNewRecordSingular(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Plural</label>
                <input
                  type="text"
                  value={newRecordPlural}
                  onChange={(e) => setNewRecordPlural(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingRecordType(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold"
              >
                Create Record Type
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
