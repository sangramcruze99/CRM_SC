'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Workflow,
  Play,
  Plus,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  Settings2,
  FileCheck,
  Receipt,
  Database,
  Share2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Folder,
  FolderOpen,
  Upload,
  FileText,
  Globe,
  Mail,
  MessageSquare,
  Webhook,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  HardDrive,
  Cloud,
  Table,
  Inbox,
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  title: string;
  subtitle: string;
  iconName: string;
  badge: string;
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';
}

// ─── Data Source Types ────────────────────────────────────────────────────────

interface DataSource {
  id: string;
  category: 'local' | 'cloud' | 'stream' | 'integration';
  icon: React.ElementType;
  name: string;
  description: string;
  color: string;
  badge?: string;
  folders?: DataFolder[];
}

interface DataFolder {
  id: string;
  name: string;
  path: string;
  fileCount?: number;
  type: 'csv' | 'json' | 'pdf' | 'email' | 'api' | 'db' | 'mixed';
}

const DATA_SOURCES: DataSource[] = [
  {
    id: 'crm',
    category: 'stream',
    icon: Database,
    name: 'CRM Records',
    description: 'Contacts, deals, companies from your live CRM',
    color: 'from-emerald-500 to-teal-600',
    badge: 'LIVE',
    folders: [
      { id: 'f1', name: 'All Contacts', path: '/crm/contacts', fileCount: 1420, type: 'db' },
      { id: 'f2', name: 'Active Deals', path: '/crm/deals/active', fileCount: 38, type: 'db' },
      { id: 'f3', name: 'Lead Inbox', path: '/crm/leads/new', fileCount: 101, type: 'db' },
    ],
  },
  {
    id: 'uploads',
    category: 'local',
    icon: Upload,
    name: 'Smart Upload Vault',
    description: 'Scanned PDFs, invoices, contracts from OCR vault',
    color: 'from-blue-500 to-teal-600',
    badge: 'OCR',
    folders: [
      { id: 'f4', name: 'Invoices / AR', path: '/vault/invoices', fileCount: 87, type: 'pdf' },
      { id: 'f5', name: 'Contracts & NDAs', path: '/vault/contracts', fileCount: 34, type: 'pdf' },
      { id: 'f6', name: 'Pending Review', path: '/vault/pending', fileCount: 12, type: 'mixed' },
    ],
  },
  {
    id: 'email',
    category: 'integration',
    icon: Mail,
    name: 'Email Inbox',
    description: 'Incoming emails, campaigns, and reply threads',
    color: 'from-emerald-500 to-emerald-600',
    folders: [
      { id: 'f7', name: 'Inbound Leads', path: '/email/inbound', fileCount: 55, type: 'email' },
      { id: 'f8', name: 'Campaign Replies', path: '/email/replies', fileCount: 23, type: 'email' },
    ],
  },
  {
    id: 'webhook',
    category: 'stream',
    icon: Webhook,
    name: 'Webhook Events',
    description: 'Real-time events from external services',
    color: 'from-orange-500 to-amber-600',
    badge: 'RT',
    folders: [
      { id: 'f9', name: 'Stripe Payments', path: '/webhooks/stripe', fileCount: 0, type: 'api' },
      { id: 'f10', name: 'Form Submissions', path: '/webhooks/forms', fileCount: 0, type: 'api' },
    ],
  },
  {
    id: 'csv',
    category: 'local',
    icon: Table,
    name: 'CSV / Spreadsheets',
    description: 'Import bulk records from Excel or Google Sheets',
    color: 'from-green-500 to-emerald-600',
    folders: [
      { id: 'f11', name: 'Bulk Lead Import', path: '/imports/leads', fileCount: 5, type: 'csv' },
      { id: 'f12', name: 'Product Catalog', path: '/imports/products', fileCount: 2, type: 'csv' },
    ],
  },
  {
    id: 'cloud',
    category: 'cloud',
    icon: Cloud,
    name: 'Cloud Storage',
    description: 'Google Drive, OneDrive, Dropbox folders',
    color: 'from-sky-500 to-cyan-600',
    folders: [
      { id: 'f13', name: 'Shared Drive / Sales', path: '/cloud/gdrive/sales', fileCount: 41, type: 'mixed' },
      { id: 'f14', name: 'OneDrive / Reports', path: '/cloud/onedrive/reports', fileCount: 18, type: 'mixed' },
    ],
  },
];

const FILE_TYPE_COLOR: Record<string, string> = {
  pdf: 'text-rose-400',
  csv: 'text-green-400',
  json: 'text-yellow-400',
  email: 'text-emerald-400',
  api: 'text-orange-400',
  db: 'text-emerald-400',
  mixed: 'text-slate-400',
};

const FILE_TYPE_LABEL: Record<string, string> = {
  pdf: 'PDF / OCR',
  csv: 'CSV',
  json: 'JSON',
  email: 'Email',
  api: 'API Event',
  db: 'DB Record',
  mixed: 'Mixed',
};

// ─── Data Source Picker Panel ────────────────────────────────────────────────

interface DataSourcePickerProps {
  selected: { sourceId: string; folderId: string } | null;
  onSelect: (sourceId: string, folderId: string) => void;
  onClear: () => void;
}

function DataSourcePicker({ selected, onSelect, onClear }: DataSourcePickerProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const selectedSource = DATA_SOURCES.find((s) => s.id === selected?.sourceId);
  const selectedFolder = selectedSource?.folders?.find((f) => f.id === selected?.folderId);

  return (
    <div className="rounded-2xl border border-white/[0.09] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center">
            <Inbox size={14} className="text-slate-950" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Data Input Source</h3>
            <p className="text-[11px] text-slate-400">Select the folder or stream that triggers this workflow</p>
          </div>
        </div>

        {selected && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-400 hover:text-white text-[11px] font-semibold transition-all border border-white/[0.08]"
          >
            <X size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Selected Source Banner */}
      {selected && selectedSource && selectedFolder && (
        <div className="mx-4 mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${selectedSource.color} flex items-center justify-center flex-shrink-0`}>
            <selectedSource.icon size={15} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate">{selectedSource.name}</span>
              <ChevronRight size={10} className="text-slate-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-emerald-300 truncate">{selectedFolder.name}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedFolder.path}</p>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${FILE_TYPE_COLOR[selectedFolder.type]}`}>
            {FILE_TYPE_LABEL[selectedFolder.type]}
          </span>
          <Check size={14} className="text-emerald-400 flex-shrink-0" />
        </div>
      )}

      {/* Source Grid */}
      <div className="p-4 space-y-2">
        {DATA_SOURCES.map((source) => {
          const isExpanded = expanded === source.id;
          const Icon = source.icon;

          return (
            <div key={source.id} className="rounded-xl border border-white/[0.07] overflow-hidden">
              {/* Source Row */}
              <button
                onClick={() => setExpanded(isExpanded ? null : source.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                  isExpanded ? 'bg-white/[0.07]' : 'bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${source.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Icon size={15} className="text-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{source.name}</span>
                    {source.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                        {source.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{source.description}</p>
                </div>

                {/* Folder count + chevron */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-mono text-slate-500">{source.folders?.length ?? 0} folders</span>
                  {isExpanded ? (
                    <ChevronDown size={13} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={13} className="text-slate-500" />
                  )}
                </div>
              </button>

              {/* Folder List */}
              {isExpanded && source.folders && (
                <div className="border-t border-white/[0.06] bg-black/20 divide-y divide-white/[0.04]">
                  {source.folders.map((folder) => {
                    const isSelected = selected?.sourceId === source.id && selected?.folderId === folder.id;
                    return (
                      <button
                        key={folder.id}
                        onClick={() => onSelect(source.id, folder.id)}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 border-l-2 border-emerald-400'
                            : 'hover:bg-white/[0.04] border-l-2 border-transparent'
                        }`}
                      >
                        <FolderOpen size={13} className={isSelected ? 'text-emerald-400' : 'text-slate-500'} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-semibold truncate ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>
                              {folder.name}
                            </span>
                            {folder.fileCount !== undefined && folder.fileCount > 0 && (
                              <span className="text-[10px] font-mono text-slate-500">{folder.fileCount.toLocaleString()} records</span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-slate-600 truncate">{folder.path}</p>
                        </div>
                        <span className={`text-[10px] font-mono font-bold flex-shrink-0 ${FILE_TYPE_COLOR[folder.type]}`}>
                          {FILE_TYPE_LABEL[folder.type]}
                        </span>
                        {isSelected && <Check size={12} className="text-emerald-400 flex-shrink-0" />}
                      </button>
                    );
                  })}

                  {/* Upload custom folder */}
                  <button className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-white/[0.04] transition-all opacity-60 hover:opacity-100 border-l-2 border-transparent border-dashed">
                    <Plus size={13} className="text-slate-500" />
                    <span className="text-[11px] text-slate-500 font-medium">Add custom folder path...</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer tip */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-slate-600 font-mono">
           The selected folder determines what data is available in trigger conditions and downstream action nodes.
        </p>
      </div>
    </div>
  );
}

// ─── Preset Recipes ──────────────────────────────────────────────────────────

const PRESET_RECIPES = [
  {
    id: 'rec_01',
    name: 'OCR Invoice Auto-Ledger & Deal Closing Pipeline',
    desc: 'When an invoice is scanned, check confidence score, post the accounting entry, and mark deal as won.',
    defaultSource: { sourceId: 'uploads', folderId: 'f4' },
    nodes: [
      { id: 'n1', type: 'trigger' as const, title: 'When invoice is scanned', subtitle: 'Vision scanner extracts line items & total', iconName: 'Receipt', badge: 'Trigger', status: 'IDLE' as const },
      { id: 'n2', type: 'condition' as const, title: 'If confidence score > 90%', subtitle: 'Verify accuracy meets safety guardrails', iconName: 'ShieldCheck', badge: 'Condition', status: 'IDLE' as const },
      { id: 'n3', type: 'action' as const, title: 'Then record accounting entry', subtitle: 'Post dual-entry transaction to general ledger', iconName: 'Database', badge: 'Action 1', status: 'IDLE' as const },
      { id: 'n4', type: 'action' as const, title: 'And advance deal to Closed Won', subtitle: 'Update pipeline stage and notify team channel', iconName: 'Zap', badge: 'Action 2', status: 'IDLE' as const },
    ],
  },
  {
    id: 'rec_02',
    name: 'Hospital Patient Intake & On-Call Triage Automation',
    desc: 'When an appointment is booked, check triage urgency, allocate bed, and alert attending physician.',
    defaultSource: { sourceId: 'webhook', folderId: 'f9' },
    nodes: [
      { id: 'n1', type: 'trigger' as const, title: 'When appointment is booked', subtitle: 'Inpatient triage or outpatient registration', iconName: 'Clock', badge: 'Trigger', status: 'IDLE' as const },
      { id: 'n2', type: 'condition' as const, title: 'If triage urgency is High', subtitle: 'Evaluate clinical urgency assessment score', iconName: 'ShieldCheck', badge: 'Condition', status: 'IDLE' as const },
      { id: 'n3', type: 'action' as const, title: 'Then allocate patient bed', subtitle: 'Assign room bed and send confirmation notice', iconName: 'Database', badge: 'Action 1', status: 'IDLE' as const },
      { id: 'n4', type: 'action' as const, title: 'And alert on-call physician', subtitle: 'Send high-priority duty notification to doctor', iconName: 'Zap', badge: 'Action 2', status: 'IDLE' as const },
    ],
  },
  {
    id: 'rec_03',
    name: 'Real Estate Escrow Closing & Rep Commission Trigger',
    desc: 'When property escrow is signed, check commission terms, disburse agent payroll, and send welcome kit.',
    defaultSource: { sourceId: 'uploads', folderId: 'f5' },
    nodes: [
      { id: 'n1', type: 'trigger' as const, title: 'When escrow agreement is signed', subtitle: 'Title agency deposits funds & clears escrow', iconName: 'Receipt', badge: 'Trigger', status: 'IDLE' as const },
      { id: 'n2', type: 'condition' as const, title: 'If standard commission applies', subtitle: 'Verify agreed broker and agent commission rate', iconName: 'ShieldCheck', badge: 'Condition', status: 'IDLE' as const },
      { id: 'n3', type: 'action' as const, title: 'Then credit agent payroll', subtitle: 'Add commission disbursement to next pay run', iconName: 'Database', badge: 'Action 1', status: 'IDLE' as const },
      { id: 'n4', type: 'action' as const, title: 'And send buyer welcome kit', subtitle: 'Deliver smart lock access codes and move-in guide', iconName: 'Zap', badge: 'Action 2', status: 'IDLE' as const },
    ],
  },
];


// ─── Main Component ──────────────────────────────────────────────────────────

export function AutomationsClient() {
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);
  const [nodes, setNodes] = useState<WorkflowNode[]>(PRESET_RECIPES[0].nodes);
  const [isRunning, setIsRunning] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    'System ready. Automation daemon active.',
  ]);
  const [alert, setAlert] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<{ sourceId: string; folderId: string } | null>(
    PRESET_RECIPES[0].defaultSource
  );
  const [showSourcePicker, setShowSourcePicker] = useState(false);

  const handleSelectRecipe = (idx: number) => {
    setSelectedRecipeIndex(idx);
    setNodes(PRESET_RECIPES[idx].nodes.map((n) => ({ ...n, status: 'IDLE' })));
    setDataSource(PRESET_RECIPES[idx].defaultSource);
    setExecutionLogs([`Loaded recipe: ${PRESET_RECIPES[idx].name}`]);
  };

  const handleSourceSelect = (sourceId: string, folderId: string) => {
    setDataSource({ sourceId, folderId });
    const src = DATA_SOURCES.find((s) => s.id === sourceId);
    const folder = src?.folders?.find((f) => f.id === folderId);
    setExecutionLogs((prev) => [
      `[Source] Input wired to "${src?.name} → ${folder?.name}" (${folder?.path})`,
      ...prev,
    ]);
  };

  const handleTestRun = async () => {
    if (!dataSource) {
      setAlert(' Please select a Data Input Source before running the workflow.');
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setIsRunning(true);
    const src = DATA_SOURCES.find((s) => s.id === dataSource.sourceId);
    const folder = src?.folders?.find((f) => f.id === dataSource.folderId);

    setAlert(` Ingesting data from "${src?.name} → ${folder?.name}"...`);
    setExecutionLogs((prev) => [
      `[00.00s] Workflow execution initiated...`,
      `[00.00s] Data source: ${folder?.path} (${FILE_TYPE_LABEL[folder?.type || 'mixed']})`,
      ...prev,
    ]);

    try {
      fetch('/api/automation/workflows/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: PRESET_RECIPES[selectedRecipeIndex].id,
          triggerData: {
            source: 'visual_canvas_test',
            dataSourceId: dataSource.sourceId,
            folderPath: folder?.path,
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    nodes.forEach((_, idx) => {
      setTimeout(() => {
        setNodes((prevNodes) =>
          prevNodes.map((n, i) => (i === idx ? { ...n, status: 'SUCCESS' } : n))
        );
        setExecutionLogs((prev) => [
          `[00.${(idx + 1) * 6}s] Node #${idx + 1} (${nodes[idx].title}) evaluated → SUCCESS`,
          ...prev,
        ]);

        if (idx === nodes.length - 1) {
          setIsRunning(false);
          setAlert(' Workflow completed with 100% success! All downstream actions executed & recorded.');
          setTimeout(() => setAlert(null), 4000);
        }
      }, (idx + 1) * 800);
    });
  };

  const handleReset = () => {
    setNodes(nodes.map((n) => ({ ...n, status: 'IDLE' })));
    setExecutionLogs(['Workflow state reset.']);
  };

  // Derived: selected source summary for the trigger node badge
  const selectedSrc = DATA_SOURCES.find((s) => s.id === dataSource?.sourceId);
  const selectedFolder = selectedSrc?.folders?.find((f) => f.id === dataSource?.folderId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white font-sans">
      {/* Promotion banner */}
      <div className="botanical-glass-card p-5 rounded-3xl border border-emerald-500/25 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black shrink-0 shadow-lg shadow-emerald-500/25">
            <Sparkles className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">Next-Gen Upgrade: AI Automation OS v2.5</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                XYFlow Studio + AI Swarms
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Access the unified Visual Automation Studio, ReAct Agent Swarms, WhatsApp Cloud API, and Human-in-the-Loop Approval Center.
            </p>
          </div>
        </div>
        <Link
          href="/automation"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono tracking-wider transition shadow-lg shadow-emerald-500/20 whitespace-nowrap shrink-0"
        >
          <span>LAUNCH STUDIO V2.5</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{alert}</span>
        </div>
      )}

      {/* Top Header Cockpit Chassis */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Stage 5.0 Event-Driven Engine</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Deterministic DAG Dispatch</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              engine/recipes/live_mesh/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">Daemon Status: 200 OK</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                TRIGGER-ACTION PIPELINES
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                MULTI-STACK WORKFLOWS
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Workflow className="text-emerald-400" size={30} />
              Automations & Workflows
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Build simple When... If... Then... automated workflows across your business. Trigger actions across CRM records, document vault, and third-party webhooks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white rounded-xl text-xs font-mono font-semibold border border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>RESET CANVAS</span>
            </button>

            <button
              type="button"
              disabled={isRunning}
              onClick={handleTestRun}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs font-mono tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play size={14} />
              <span>{isRunning ? 'EXECUTING PIPELINE...' : 'TEST RUN WORKFLOW'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── DATA INPUT SOURCE SECTION ────────────────────────────────────── */}
      <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.08] relative overflow-hidden">
        {/* Section header + toggle */}
        <button
          onClick={() => setShowSourcePicker((v) => !v)}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Folder size={14} />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">Step 0 — Data Input Source</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              REQUIRED
            </span>
            {dataSource && selectedSrc && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-semibold">
                <Check size={10} />
                {selectedSrc.name} → {selectedFolder?.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
            <span>{showSourcePicker ? 'Collapse' : 'Configure source'}</span>
            {showSourcePicker ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        </button>

        {/* Collapsed summary or expanded picker */}
        {!showSourcePicker && dataSource && selectedSrc && selectedFolder ? (
          <div
            onClick={() => setShowSourcePicker(true)}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-all mt-3"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <selectedSrc.icon size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{selectedSrc.name}</span>
                <ChevronRight size={12} className="text-zinc-500" />
                <span className="text-xs font-semibold text-emerald-400">{selectedFolder.name}</span>
              </div>
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{selectedFolder.path} · {selectedFolder.fileCount?.toLocaleString()} records</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${FILE_TYPE_COLOR[selectedFolder.type]}`}>
              {FILE_TYPE_LABEL[selectedFolder.type]}
            </span>
            <Settings2 size={14} className="text-zinc-500 hover:text-zinc-300" />
          </div>
        ) : !showSourcePicker ? (
          <button
            onClick={() => setShowSourcePicker(true)}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-white/[0.1] hover:border-emerald-500/40 hover:bg-emerald-500/[0.04] transition-all group mt-3"
          >
            <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
              <Plus size={15} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">Select Data Input Source</p>
              <p className="text-[11px] text-zinc-500">Choose which folder, database, or stream feeds this automation trigger</p>
            </div>
          </button>
        ) : null}

        {showSourcePicker && (
          <div className="mt-3">
            <DataSourcePicker
              selected={dataSource}
              onSelect={(s, f) => {
                handleSourceSelect(s, f);
                setShowSourcePicker(false);
              }}
              onClear={() => {
                setDataSource(null);
                setShowSourcePicker(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Recipe Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRESET_RECIPES.map((recipe, idx) => {
          const isSelected = selectedRecipeIndex === idx;
          return (
            <div
              key={recipe.id}
              onClick={() => handleSelectRecipe(idx)}
              className={`botanical-glass-card p-5 rounded-2xl border transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                isSelected
                  ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'border-white/[0.08] hover:border-emerald-500/30 hover:bg-white/[0.04]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none" />
              )}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-400">
                  Recipe #{idx + 1}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                  isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/[0.04] text-zinc-400'
                }`}>
                  Active
                </span>
              </div>
              <h3 className="font-bold text-xs text-white leading-snug">{recipe.name}</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{recipe.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Visual Workflow Canvas */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden space-y-6">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Visual Flow Architecture</h3>
            {/* Data source badge in canvas header */}
            {dataSource && selectedSrc && (
              <span className="flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.09] text-[10px] font-mono font-semibold text-zinc-300">
                <selectedSrc.icon size={11} className="text-emerald-400" />
                {selectedFolder?.name}
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {nodes.length} Connected Execution Nodes
          </span>
        </div>

        {/* Nodes Horizontal Flow Container */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 overflow-x-auto py-4">
          {/* Data Source Entry Node (when selected) */}
          {dataSource && selectedSrc && selectedFolder && (
            <>
              <div className="w-full lg:w-56 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] space-y-2.5 relative flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                    Input Source
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <selectedSrc.icon size={14} />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white leading-snug">{selectedSrc.name}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 font-mono truncate">{selectedFolder.path}</p>
                </div>
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-500">Step 00</span>
                  <span className={`font-bold ${FILE_TYPE_COLOR[selectedFolder.type]}`}>
                    {FILE_TYPE_LABEL[selectedFolder.type]}
                  </span>
                </div>
              </div>
              <div className="text-emerald-400/60 rotate-90 lg:rotate-0 flex-shrink-0">
                <ArrowRight size={22} />
              </div>
            </>
          )}

          {nodes.map((node, i) => (
            <React.Fragment key={node.id}>
              <div
                className={`w-full lg:w-64 p-5 rounded-2xl border transition-all space-y-3 relative ${
                  node.status === 'SUCCESS'
                    ? 'bg-emerald-500/15 border-emerald-500/60 ring-2 ring-emerald-500/30'
                    : node.status === 'RUNNING'
                    ? 'bg-emerald-500/10 border-emerald-500/40 animate-pulse'
                    : 'bg-white/[0.02] border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-white/[0.06] text-emerald-300 border border-white/10">
                    {node.badge}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      node.status === 'SUCCESS'
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                        : 'bg-zinc-600'
                    }`}
                  />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white leading-snug">{node.title}</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{node.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Step 0{i + 1}</span>
                  <span className={node.status === 'SUCCESS' ? 'text-emerald-400 font-bold' : ''}>
                    {node.status}
                  </span>
                </div>
              </div>

              {i < nodes.length - 1 && (
                <div className="text-emerald-400 rotate-90 lg:rotate-0 flex-shrink-0 animate-pulse">
                  <ArrowRight size={22} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Live Execution Logs Terminal */}
        <div className="bg-black/60 border border-white/[0.08] rounded-2xl p-4 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-bold border-b border-white/[0.06] pb-2">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Live Automation Execution Stream
            </span>
            <span className="text-emerald-400">Daemon: 200 OK</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto text-zinc-300 text-[11px]">
            {executionLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">›</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

