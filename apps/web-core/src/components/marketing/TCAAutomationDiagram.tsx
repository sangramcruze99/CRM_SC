'use client';

import React from 'react';
import { Zap, GitBranch, Mail, CheckSquare, Bell, ArrowDown } from 'lucide-react';

export function TCAAutomationDiagram() {
  return (
    <section id="automations" className="py-24 px-6 max-w-5xl mx-auto text-center border-t border-white/[0.06]">
      {/* Eyebrow */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[11px] font-mono text-teal-400 mb-4">
        <Zap size={12} />
        <span>EVENT-DRIVEN ARCHITECTURE</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
        Trigger → Condition → Action
      </h2>
      <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
        Powered by our distributed BullMQ + Redis event bus. When business data changes, complex multi-node workflows execute in milliseconds.
      </p>

      {/* Sequential Flow Nodes */}
      <div className="mt-14 max-w-xl mx-auto space-y-3 text-left">
        {/* Node 1: WHEN Trigger */}
        <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/40 shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs font-mono font-bold">
              ⚡
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                WHEN (Domain Event)
              </span>
              <span className="text-sm font-bold text-white">Deal Stage becomes &quot;Proposal&quot;</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-white/[0.05] px-2 py-1 rounded-md">
            deal.stage_changed
          </span>
        </div>

        <div className="flex justify-center text-emerald-400/60 py-1">
          <ArrowDown size={18} />
        </div>

        {/* Node 2: IF Condition */}
        <div className="p-4 rounded-2xl bg-black/50 border border-teal-500/40 shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 text-xs font-mono font-bold">
              <GitBranch size={14} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider block">
                IF (Condition Gate)
              </span>
              <span className="text-sm font-bold text-white">Deal Value &gt; $10,000 AND Confidence &ge; 85%</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md font-bold">
            PASSED ✓
          </span>
        </div>

        <div className="flex justify-center text-teal-400/60 py-1">
          <ArrowDown size={18} />
        </div>

        {/* Node 3: THEN Actions Array */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.1] shadow-2xl space-y-3">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            THEN (Autonomous Action Sequence)
          </div>

          {/* Sub-action 1 */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center space-x-3">
            <Mail size={16} className="text-emerald-400 flex-shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-white">Generate Personalized Proposal Review Email</div>
              <div className="text-[11px] text-slate-400">Drafted via AI Engine with tenant security whitepaper attached</div>
            </div>
          </div>

          {/* Sub-action 2 */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center space-x-3">
            <CheckSquare size={16} className="text-teal-400 flex-shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-white">Create 48h Executive Follow-up Task</div>
              <div className="text-[11px] text-slate-400">Assigned automatically on account executive Kanban board</div>
            </div>
          </div>

          {/* Sub-action 3 */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center space-x-3">
            <Bell size={16} className="text-amber-400 flex-shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-white">Notify Sales Director &amp; Alert Mobile App</div>
              <div className="text-[11px] text-slate-400">High-value opportunity flagged in team channel</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
