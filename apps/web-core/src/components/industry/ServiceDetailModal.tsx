'use client';

import { createPortal } from 'react-dom';
import {
  X,
  CheckCircle2,
  Workflow,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { UniversalService, UNIVERSAL_SERVICE_CATALOG } from '@/lib/services/serviceCatalog';

interface ServiceDetailModalProps {
  service: UniversalService | null;
  isOpen: boolean;
  onClose: () => void;
  isEnabled: boolean;
  onToggle: (serviceId: string) => void;
}

export function ServiceDetailModal({
  service,
  isOpen,
  onClose,
  isEnabled,
  onToggle,
}: ServiceDetailModalProps) {
  if (!isOpen || !service) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950 border border-white/[0.14] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] text-white space-y-6 my-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xl shadow-inner">
              <Layers size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">{service.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/[0.08] text-slate-300 border border-white/[0.1]">
                  {service.categoryName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{service.shortDesc}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
            What It Does &amp; Why It Matters
          </span>
          <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] border border-white/[0.06] p-3.5 rounded-2xl">
            {service.description}
          </p>
        </div>

        {/* Connected Data Models & Records */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            Connected Record Models
          </span>
          <div className="flex flex-wrap gap-2">
            {service.records.map((rec) => (
              <span
                key={rec}
                className="px-2.5 py-1 bg-black/40 border border-white/[0.08] rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-1.5"
              >
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>{rec}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Dependencies Check */}
        {service.dependencies.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
              Required Dependencies
            </span>
            <div className="flex flex-wrap gap-2">
              {service.dependencies.map((depId) => {
                const depSrv = UNIVERSAL_SERVICE_CATALOG[depId];
                return (
                  <span
                    key={depId}
                    className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-medium text-amber-300 flex items-center gap-1.5"
                  >
                    <AlertTriangle size={12} />
                    <span>{depSrv?.name || depId}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Workflows & Automations */}
        {service.workflowTemplates.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold block">
              Available Workflows &amp; Triggers
            </span>
            <div className="space-y-1.5">
              {service.workflowTemplates.map((wf) => (
                <div
                  key={wf.id}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Workflow size={14} className="text-teal-400 shrink-0" />
                    <span className="font-semibold text-white">{wf.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Trigger: {wf.trigger}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Capabilities */}
        {service.aiCapabilities.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
              Embedded AI Autonomy
            </span>
            <div className="flex flex-wrap gap-2">
              {service.aiCapabilities.map((ai) => (
                <span
                  key={ai}
                  className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/25 rounded-xl text-xs font-medium text-purple-300 flex items-center gap-1.5"
                >
                  <Sparkles size={12} className="text-purple-400" />
                  <span>{ai}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Route: <code className="text-emerald-400 font-mono">{service.route}</code>
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onToggle(service.id);
                onClose();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isEnabled
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isEnabled ? 'Disable Service' : 'Enable Service'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
