'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Workflow,
  Plus,
  Play,
  Copy,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCw,
  ChevronRight,
  AlertTriangle,
  Archive,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  Bell,
  Eye,
  PauseCircle,
  PlayCircle,
  Filter,
} from 'lucide-react';

// ─── Human-friendly trigger label map ────────────────────────────────────────
const TRIGGER_LABELS: Record<string, string> = {
  'trigger:manual': 'Run manually on demand',
  'trigger:candidate_applied': 'When a candidate applies',
  'trigger:lead_created': 'When a new lead arrives',
  'trigger:invoice_received': 'When an invoice is received',
  'trigger:ticket_opened': 'When a support ticket opens',
  'trigger:schedule': 'Runs on a schedule',
  'trigger:webhook': 'On webhook event',
  'trigger:form_submitted': 'When a form is submitted',
};

function humanTrigger(triggerType: string): string {
  return TRIGGER_LABELS[triggerType] || triggerType?.replace('trigger:', '').replace(/_/g, ' ') || 'Unknown trigger';
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'MY_AUTOMATIONS', label: 'My Automations', icon: Workflow, types: ['USER_WORKFLOW'], description: 'Automations you built or own' },
  { id: 'TEMPLATES', label: 'Templates', icon: Sparkles, types: ['TEMPLATE'], description: 'Pre-built starting points' },
  { id: 'SYSTEM', label: 'System', icon: ShieldCheck, types: ['SYSTEM_WORKFLOW'], description: 'Platform-managed automations' },
  { id: 'ARCHIVED', label: 'Archived', icon: Archive, types: ['ARCHIVED'], description: 'Deactivated & retired flows' },
] as const;

type TabId = typeof TABS[number]['id'];

const DOMAIN_PILLS = ['ALL', 'Recruitment', 'Sales', 'Support', 'Finance', 'HR', 'Voice', 'E-Commerce', 'Marketing', 'Documents'];

// ─── Status badge helper ──────────────────────────────────────────────────────
function StatusBadge({ wf }: { wf: any }) {
  if (!wf.isActive) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        PAUSED
      </span>
    );
  }
  if (wf.lastRunStatus === 'ERROR' || wf.status === 'ERROR') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        ERROR
      </span>
    );
  }
  if (wf.status === 'WAITING_FOR_APPROVAL') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse">
        AWAITING APPROVAL
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
      ACTIVE
    </span>
  );
}

// ─── Needs Attention Inbox ────────────────────────────────────────────────────
function NeedsAttentionInbox({ workflows, onResume, onDismiss }: { workflows: any[]; onResume: (id: string) => void; onDismiss: (id: string) => void }) {
  const attention = workflows.filter(
    (w) => !w.isActive || w.lastRunStatus === 'ERROR' || w.status === 'ERROR' || w.status === 'WAITING_FOR_APPROVAL',
  );

  if (attention.length === 0) return null;

  return (
    <div className="botanical-glass-card rounded-2xl border border-amber-500/25 bg-amber-500/[0.03] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
            Needs Attention ({attention.length})
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 font-mono">Paused, failed, or awaiting human review</span>
      </div>

      <div className="space-y-2">
        {attention.map((wf) => {
          const isError = wf.lastRunStatus === 'ERROR' || wf.status === 'ERROR';
          const isApproval = wf.status === 'WAITING_FOR_APPROVAL';
          const isPaused = !wf.isActive;

          const reason = isApproval
            ? 'Waiting for human approval to continue'
            : isError
            ? 'Last run encountered an error — review logs'
            : 'Paused — automation is not running';

          return (
            <div
              key={wf.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/30 border border-white/[0.06]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isError ? 'bg-rose-400' : isApproval ? 'bg-orange-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{wf.name}</p>
                  <p className="text-[11px] text-zinc-400 font-mono">{reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isApproval && (
                  <Link
                    href={`/automation/workflows/${wf.id}`}
                    className="px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 text-[11px] font-mono font-bold border border-orange-500/30 transition"
                  >
                    Review
                  </Link>
                )}
                {isPaused && !isApproval && (
                  <button
                    onClick={() => onResume(wf.id)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-mono font-bold border border-emerald-500/30 transition flex items-center gap-1"
                  >
                    <PlayCircle className="w-3 h-3" /> Resume
                  </button>
                )}
                {isError && (
                  <Link
                    href={`/automation/workflows/${wf.id}`}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px] font-mono font-bold border border-rose-500/30 transition flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> Inspect
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Workflow Card ─────────────────────────────────────────────────────────────
function WorkflowCard({
  wf,
  onToggle,
  onDuplicate,
  onDelete,
  onRun,
}: {
  wf: any;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRun: () => void;
}) {
  const steps = useMemo(() => {
    try {
      const td = typeof wf.triggerData === 'string' ? JSON.parse(wf.triggerData) : wf.triggerData;
      return Array.isArray(td?.nodes) ? td.nodes.length : null;
    } catch {
      return null;
    }
  }, [wf.triggerData]);

  return (
    <div className="p-5 rounded-2xl botanical-glass-card border border-white/[0.08] hover:border-emerald-500/25 transition-all flex flex-col gap-4 group relative overflow-hidden">
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/[0.03] group-hover:to-teal-500/[0.02] transition-all pointer-events-none rounded-2xl" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <Workflow className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition leading-tight line-clamp-1">
              {wf.name}
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              {humanTrigger(wf.triggerType)}
            </p>
          </div>
        </div>
        <StatusBadge wf={wf} />
      </div>

      {/* Description */}
      <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
        {wf.description || 'Processes data through configured nodes, applies business rules, and routes outcomes to the appropriate destination.'}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
        {steps !== null && (
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" /> {steps} step{steps !== 1 ? 's' : ''}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" /> v{wf.version || 1}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(wf.updatedAt || wf.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Action row */}
      <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
        {/* Toggle active / paused */}
        <button
          onClick={onToggle}
          className={`flex items-center gap-1.5 text-[11px] font-mono font-bold transition cursor-pointer ${
            wf.isActive
              ? 'text-amber-400 hover:text-amber-300'
              : 'text-emerald-400 hover:text-emerald-300'
          }`}
          title={wf.isActive ? 'Pause this automation' : 'Resume this automation'}
        >
          {wf.isActive ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
          {wf.isActive ? 'Pause' : 'Resume'}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onRun}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-300 transition cursor-pointer"
            title="Run Now"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition cursor-pointer"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 transition cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <Link
            href={`/automation/workflows/${wf.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-mono font-semibold text-[11px] transition cursor-pointer"
          >
            <span>Open Studio</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function WorkflowsListPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('MY_AUTOMATIONS');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [alert, setAlert] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/automation/workflows');
      if (res.ok) {
        const data = await res.json();
        setWorkflows(Array.isArray(data) ? data : []);
      } else {
        setWorkflows([]);
      }
    } catch {
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkflows(); }, []);

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;
    try {
      const res = await fetch('/api/automation/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkflowName,
          isActive: true,
          triggerType: 'trigger:manual',
          triggerData: JSON.stringify({
            nodes: [
              { id: '1', type: 'trigger:candidate_applied', position: { x: 100, y: 150 }, data: { title: 'Candidate Applied', category: 'TRIGGER', iconName: 'UserCheck', badge: 'Trigger' } },
              { id: '2', type: 'ai:candidate_screening', position: { x: 450, y: 150 }, data: { title: 'AI Screening', category: 'RECRUITMENT_AI', iconName: 'Sparkles', badge: 'AI Screening' } },
            ],
            edges: [{ id: 'e1-2', source: '1', target: '2' }],
          }),
        }),
      });
      if (res.ok) {
        setNewWorkflowName('');
        setIsCreateModalOpen(false);
        fetchWorkflows();
        setAlert('Workflow created successfully!');
        setTimeout(() => setAlert(null), 3000);
      }
    } catch {}
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const endpoint = currentStatus ? `/api/automation/workflows/${id}/pause` : `/api/automation/workflows/${id}/resume`;
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        setWorkflows((prev) => prev.map((w) => (w.id === id ? { ...w, isActive: !currentStatus } : w)));
      }
    } catch {}
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/workflows/${id}/clone`, { method: 'POST' });
      if (res.ok) {
        fetchWorkflows();
        setAlert('Workflow cloned successfully!');
        setTimeout(() => setAlert(null), 3000);
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      const res = await fetch(`/api/automation/workflows/${id}`, { method: 'DELETE' });
      if (res.ok) setWorkflows((prev) => prev.filter((w) => w.id !== id));
    } catch {}
  };

  const handleTriggerRun = async (id: string, name: string) => {
    setAlert(`Executing test run for "${name}"...`);
    try {
      const res = await fetch(`/api/automation/workflows/${id}/execute-graph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerPayload: { candidate: { name: 'Alex Morgan', email: 'alex.morgan@example.com', role: 'Senior Distributed Systems Engineer' } } }),
      });
      setAlert(res.ok ? `Workflow "${name}" executed successfully!` : `Workflow "${name}" completed with warnings.`);
    } catch {
      setAlert('Failed executing workflow run.');
    }
    setTimeout(() => setAlert(null), 4000);
  };

  // ─── Tab counts ───────────────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    const counts: Record<TabId, number> = { MY_AUTOMATIONS: 0, TEMPLATES: 0, SYSTEM: 0, ARCHIVED: 0 };
    workflows.forEach((w) => {
      const t = w.type || 'USER_WORKFLOW';
      if (t === 'USER_WORKFLOW' && w.isActive !== false) counts.MY_AUTOMATIONS++;
      if (t === 'TEMPLATE') counts.TEMPLATES++;
      if (t === 'SYSTEM_WORKFLOW' || w.isSystem) counts.SYSTEM++;
      if (t === 'ARCHIVED' || w.isArchived) counts.ARCHIVED++;
    });
    return counts;
  }, [workflows]);

  // ─── Filtered list ────────────────────────────────────────────────────────
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      const t = w.type || 'USER_WORKFLOW';
      if (activeTab === 'MY_AUTOMATIONS' && (t !== 'USER_WORKFLOW' || w.isArchived)) return false;
      if (activeTab === 'TEMPLATES' && t !== 'TEMPLATE') return false;
      if (activeTab === 'SYSTEM' && t !== 'SYSTEM_WORKFLOW' && !w.isSystem) return false;
      if (activeTab === 'ARCHIVED' && t !== 'ARCHIVED' && !w.isArchived) return false;

      if (selectedDomain !== 'ALL') {
        const cat = (w.category || 'General').toLowerCase();
        if (!cat.includes(selectedDomain.toLowerCase())) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ok = w.name?.toLowerCase().includes(q) || w.description?.toLowerCase().includes(q) || w.triggerType?.toLowerCase().includes(q);
        if (!ok) return false;
      }

      return true;
    });
  }, [workflows, activeTab, selectedDomain, searchQuery]);

  const activeWorkflows = workflows.filter((w) => (w.type || 'USER_WORKFLOW') === 'USER_WORKFLOW');

  return (
    <div className="space-y-5 text-white font-sans">
      {/* Toast alert */}
      {alert && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs shadow-xl shadow-emerald-500/20 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{alert}</span>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Status strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Workflow Engine Online</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Deterministic DAG Runtime</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              vault/automation/workflows/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">{activeWorkflows.filter(w => w.isActive).length} Active DAGs</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                AUTONOMOUS WORKFLOW ENGINES
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Workflow className="text-emerald-400" size={28} />
              Automation Library
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              One universal execution engine for recruitment, sales, support, finance, and multi-agent coordination.
              Build outcomes in plain English — the engine handles the rest.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search automations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-52 transition"
              />
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Automation</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Needs Attention Inbox ────────────────────────────────────────── */}
      <NeedsAttentionInbox
        workflows={activeWorkflows}
        onResume={(id) => handleToggleActive(id, false)}
        onDismiss={() => {}}
      />

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <div className="botanical-glass-card rounded-2xl p-3 border border-white/[0.08]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.description}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-zinc-950 text-emerald-400' : 'bg-white/10 text-zinc-400'}`}>
                    {tabCounts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Domain pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full md:max-w-xl">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            {DOMAIN_PILLS.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedDomain(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition shrink-0 cursor-pointer ${
                  selectedDomain === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/[0.03] text-zinc-500 hover:text-zinc-200 border border-white/[0.05]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content Area ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <RotateCw className="w-6 h-6 text-emerald-400 animate-spin" />
          <span className="text-xs font-mono text-zinc-400">Loading automations...</span>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-8 rounded-2xl botanical-glass-card border border-white/[0.08] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
            {activeTab === 'ARCHIVED' ? <Archive className="w-8 h-8 text-zinc-500" /> : <Workflow className="w-8 h-8 text-emerald-400" />}
          </div>
          <h3 className="text-base font-bold text-white">
            {activeTab === 'ARCHIVED' ? 'No archived automations' : 'No automations yet'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
            {activeTab === 'TEMPLATES'
              ? 'No templates match your filters. Try clearing the domain filter.'
              : activeTab === 'ARCHIVED'
              ? 'Deactivated automations will appear here.'
              : 'Describe your goal in plain English and let the AI build your first automation.'}
          </p>
          {activeTab === 'MY_AUTOMATIONS' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Automation</span>
              </button>
              <Link
                href="/automation/workflows/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-mono font-semibold text-xs transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Build with Intent Studio</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkflows.map((wf) => (
            <WorkflowCard
              key={wf.id}
              wf={wf}
              onToggle={() => handleToggleActive(wf.id, wf.isActive)}
              onDuplicate={() => handleDuplicate(wf.id)}
              onDelete={() => handleDelete(wf.id)}
              onRun={() => handleTriggerRun(wf.id, wf.name)}
            />
          ))}
        </div>
      )}

      {/* ── Create Modal ─────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg botanical-glass-card border border-white/[0.12] rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Create Automation</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                  Simple First
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Describe what you want in plain words — or start with a named blank canvas.
              </p>
            </div>

            {/* Option A: Intent Studio */}
            <Link
              href="/automation/workflows/new"
              onClick={() => setIsCreateModalOpen(false)}
              className="block p-4 rounded-2xl bg-white/[0.04] border border-emerald-500/40 hover:border-emerald-400 transition-all group cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/25">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Intent Studio</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-400 text-zinc-950">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Describe your goal in plain English. AI structures the rules, timing, and DAG wiring.
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </Link>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/[0.08]" />
              <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">or name it first</span>
              <div className="flex-grow border-t border-white/[0.08]" />
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">Workflow Name</label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous Senior Engineer Screener"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Create Blank Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
