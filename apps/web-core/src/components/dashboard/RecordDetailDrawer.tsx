// apps/web-core/src/components/dashboard/RecordDetailDrawer.tsx
'use client';

import React from 'react';
import {
  X,
  User,
  ShieldCheck,
  Clock,
  Sparkles,
  FileText,
  Activity,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Building2,
  Send,
} from 'lucide-react';
import { DashboardOperationalRecord } from './dashboard.types';

interface RecordDetailDrawerProps {
  record: DashboardOperationalRecord | null;
  onClose: () => void;
  onAction?: (action: string, record: DashboardOperationalRecord) => void;
}

export function RecordDetailDrawer({ record, onClose, onAction }: RecordDetailDrawerProps) {
  if (!record) return null;

  const raw = record.raw || {};

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950/95 border-l border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col justify-between text-white animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Record Details · {record.id}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">{record.primaryText}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{record.secondaryText}</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                  record.priority === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : record.priority === 'URGENT'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {record.priority}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/5 text-slate-300 border border-white/10 uppercase">
                {record.status}
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Operational Attributes Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Department / Team</span>
                <span className="text-xs font-bold text-white block">{record.groupText || 'General Care'}</span>
              </div>
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Attending Provider</span>
                <span className="text-xs font-bold text-white block">{record.ownerText || 'Unassigned'}</span>
              </div>
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Location / Ward</span>
                <span className="text-xs font-bold text-white block">{record.location || 'Pending Rooming'}</span>
              </div>
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Verification</span>
                <span className="text-xs font-bold text-emerald-400 block">{raw.insuranceStatus || 'Verified & Active'}</span>
              </div>
            </div>

            {/* Clinical / Operational Notes */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <FileText size={14} className="text-emerald-400" />
                <span>Operational Brief & Notes</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {raw.notes || 'Inpatient admission registered under primary attending care. Vitals recorded, room assigned, and insurance entitlement validated against EHR vault.'}
              </p>
            </div>

            {/* Connected Context Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" />
                <span>Recent Milestone Activity</span>
              </h3>
              <div className="space-y-2 border-l border-white/10 pl-3 ml-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-bold text-white">Admitted to {record.location}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block pl-4">Today · Verified by System Dispatch</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400/50" />
                    <span className="text-[11px] font-medium text-slate-300">Triage Evaluated: {record.priority}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block pl-4">Today · Assigned to {record.ownerText}</span>
                </div>
              </div>
            </div>

            {/* Cross-Service Quick Context */}
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                <div>
                  <div className="font-bold text-white">Ask AI Copilot</div>
                  <div className="text-[10px] text-slate-400">Summarize history & clinical guidance</div>
                </div>
              </div>
              <button
                onClick={() => onAction && onAction('ASK_AI', record)}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Summarize
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
            <button
              onClick={() => onAction && onAction('CREATE_TASK', record)}
              className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all text-center cursor-pointer"
            >
              Add Task
            </button>
            <button
              onClick={() => onAction && onAction('ADVANCE_STATUS', record)}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all text-center cursor-pointer"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
