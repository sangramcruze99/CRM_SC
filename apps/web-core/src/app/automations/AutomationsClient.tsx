'use client';

import React, { useState } from 'react';
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

const PRESET_RECIPES = [
  {
    id: 'rec_01',
    name: 'OCR Invoice Auto-Ledger & Deal Closing Pipeline',
    desc: 'When OCR scans an invoice, auto-create Dual Khata debit, advance deal to Won, and notify team chat.',
    nodes: [
      { id: 'n1', type: 'trigger' as const, title: 'Trigger: OCR Invoice Scanned', subtitle: 'Neural Vision detects line-items and totals', iconName: 'Receipt', badge: 'Source: OCR', status: 'IDLE' as const },
      { id: 'n2', type: 'condition' as const, title: 'Condition: AI Confidence > 90%', subtitle: 'Verify financial guardrail threshold', iconName: 'ShieldCheck', badge: 'Gate', status: 'IDLE' as const },
      { id: 'n3', type: 'action' as const, title: 'Action: Post Dual Khata Debit', subtitle: 'Reconcile ledger accounts automatically', iconName: 'Database', badge: 'Accounting', status: 'IDLE' as const },
      { id: 'n4', type: 'action' as const, title: 'Action: Advance Deal to Won & Notify', subtitle: 'Calculate rep commission and alert channel', iconName: 'Zap', badge: 'CRM Sync', status: 'IDLE' as const },
    ],
  },
  {
    id: 'rec_02',
    name: 'Hospital Patient Intake & On-Call Triage Automation',
    desc: 'When an appointment is booked, send SMS confirmation, allocate bed, and alert attending doctor.',
    nodes: [
      { id: 'n1', type: 'trigger' as const, title: 'Trigger: Patient Appointment Booked', subtitle: 'Inpatient triage or surgical calendar event', iconName: 'Clock', badge: 'Source: Portal', status: 'IDLE' as const },
      { id: 'n2', type: 'condition' as const, title: 'Condition: Triage Severity == High/Critical', subtitle: 'Evaluate clinical urgency score', iconName: 'ShieldCheck', badge: 'Gate', status: 'IDLE' as const },
      { id: 'n3', type: 'action' as const, title: 'Action: Dispatch WhatsApp & Bed Allocation', subtitle: 'Assign EHR telemetry & hospital bed number', iconName: 'Database', badge: 'EHR System', status: 'IDLE' as const },
      { id: 'n4', type: 'action' as const, title: 'Action: Alert On-Call Specialist Doctor', subtitle: 'Push notification to attending physician', iconName: 'Zap', badge: 'Duty Alert', status: 'IDLE' as const },
    ],
  },
  {
    id: 'rec_03',
    name: 'Real Estate Escrow Closing & Rep Commission Trigger',
    desc: 'When property escrow closes, generate signed bill of sale, disburse agent commission, and send keys alert.',
    nodes: [
      { id: 'n1', type: 'trigger' as const, title: 'Trigger: Real Estate Escrow Signed', subtitle: 'Title agency deposits funds & clears title', iconName: 'Receipt', badge: 'Source: Escrow', status: 'IDLE' as const },
      { id: 'n2', type: 'condition' as const, title: 'Condition: Commission Rate == 3%', subtitle: 'Calculate broker & agent commission split', iconName: 'ShieldCheck', badge: 'Gate', status: 'IDLE' as const },
      { id: 'n3', type: 'action' as const, title: 'Action: Sync to Payroll Payslip', subtitle: 'Add commission earnings to agent payroll in /directory', iconName: 'Database', badge: 'HR Payroll', status: 'IDLE' as const },
      { id: 'n4', type: 'action' as const, title: 'Action: Send Buyer Welcome Kit via WhatsApp', subtitle: 'Disburse smart lock access codes & warranty', iconName: 'Zap', badge: 'Buyer Hub', status: 'IDLE' as const },
    ],
  },
];

export function AutomationsClient() {
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);
  const [nodes, setNodes] = useState<WorkflowNode[]>(PRESET_RECIPES[0].nodes);
  const [isRunning, setIsRunning] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    'System ready. Automation daemon active.',
  ]);
  const [alert, setAlert] = useState<string | null>(null);

  const handleSelectRecipe = (idx: number) => {
    setSelectedRecipeIndex(idx);
    setNodes(PRESET_RECIPES[idx].nodes.map((n) => ({ ...n, status: 'IDLE' })));
    setExecutionLogs([`Loaded recipe: ${PRESET_RECIPES[idx].name}`]);
  };

  const handleTestRun = () => {
    setIsRunning(true);
    setAlert('⚡ Starting visual workflow execution simulation...');
    setExecutionLogs((prev) => ['[00.00s] Workflow execution initiated...', ...prev]);

    nodes.forEach((_, idx) => {
      setTimeout(() => {
        setNodes((prevNodes) =>
          prevNodes.map((n, i) => (i === idx ? { ...n, status: 'SUCCESS' } : n))
        );
        setExecutionLogs((prev) => [
          `[00.${(idx + 1) * 6}s] Node #${idx + 1} (${nodes[idx].title}) evaluated -> SUCCESS`,
          ...prev,
        ]);

        if (idx === nodes.length - 1) {
          setIsRunning(false);
          setAlert('🎉 Workflow completed with 100% success! All downstream actions executed.');
          setTimeout(() => setAlert(null), 4000);
        }
      }, (idx + 1) * 800);
    });
  };

  const handleReset = () => {
    setNodes(nodes.map((n) => ({ ...n, status: 'IDLE' })));
    setExecutionLogs(['Workflow state reset.']);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Workflow className="text-amber-400" size={24} />
            Visual No-Code Automation Workflow Engine (Built-In Zapier / Make)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build autonomous trigger ➔ condition ➔ multi-app action recipes with instant execution testing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset Canvas</span>
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={handleTestRun}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Play size={14} />
            <span>{isRunning ? 'Executing Pipeline...' : 'Test Run Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Recipe Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRESET_RECIPES.map((recipe, idx) => (
          <div
            key={recipe.id}
            onClick={() => handleSelectRecipe(idx)}
            className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-2 ${
              selectedRecipeIndex === idx
                ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-orange-500/15'
                : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Recipe #{idx + 1}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                Active
              </span>
            </div>
            <h3 className="font-bold text-xs text-white leading-snug">{recipe.name}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">{recipe.desc}</p>
          </div>
        ))}
      </div>

      {/* Visual Workflow Canvas */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white">Visual Flow Architecture</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {nodes.length} Connected Execution Nodes
          </span>
        </div>

        {/* Nodes Horizontal Flow Container */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 overflow-x-auto py-6">
          {nodes.map((node, i) => (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div
                className={`w-full lg:w-64 p-5 rounded-2xl border transition-all space-y-3 relative ${
                  node.status === 'SUCCESS'
                    ? 'bg-emerald-500/15 border-emerald-500/60 ring-2 ring-emerald-500/30'
                    : node.status === 'RUNNING'
                    ? 'bg-amber-500/15 border-amber-500/60 animate-pulse'
                    : 'bg-white/[0.04] border-white/[0.09]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-white/[0.08] text-amber-300 border border-white/10">
                    {node.badge}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      node.status === 'SUCCESS'
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                        : 'bg-slate-600'
                    }`}
                  />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white leading-snug">{node.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{node.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Step 0{i + 1}</span>
                  <span className={node.status === 'SUCCESS' ? 'text-emerald-300 font-bold' : ''}>
                    {node.status}
                  </span>
                </div>
              </div>

              {/* Connecting Arrow between nodes */}
              {i < nodes.length - 1 && (
                <div className="text-amber-400 rotate-90 lg:rotate-0 flex-shrink-0 animate-pulse">
                  <ArrowRight size={22} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Live Execution Logs Terminal */}
        <div className="bg-slate-950/80 border border-white/[0.08] rounded-2xl p-4 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold border-b border-white/[0.06] pb-2">
            <span>Live Automation Execution Stream</span>
            <span className="text-emerald-400">Daemon: 200 OK</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto text-slate-300 text-[11px]">
            {executionLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-amber-400">❯</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
