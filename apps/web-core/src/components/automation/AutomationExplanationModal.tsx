'use client';

import React from 'react';
import { Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface AutomationExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowName: string;
  explanation?: string;
  triggerSummary?: string;
  rulesSummary?: string[];
  actionsSummary?: string[];
  approvalSummary?: string;
  destinationSummary?: string;
}

export function AutomationExplanationModal({
  isOpen,
  onClose,
  workflowName,
  explanation,
  triggerSummary,
  rulesSummary = [],
  actionsSummary = [],
  approvalSummary,
  destinationSummary,
}: AutomationExplanationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="botanical-glass-card border border-white/[0.12] rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Plain English Explanation</h3>
              <p className="text-xs text-zinc-400 font-mono">{workflowName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] font-mono cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
          {explanation ? (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] text-white">
              <p>{explanation}</p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-3">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block">1. What starts it</span>
                <p className="text-white">{triggerSummary || 'Watches for incoming events or scheduled triggers.'}</p>
              </div>

              {rulesSummary.length > 0 && (
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block">2. What it checks</span>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-300">
                    {rulesSummary.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {actionsSummary.length > 0 && (
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block">3. What it does</span>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-300">
                    {actionsSummary.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {approvalSummary && (
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-amber-400 uppercase font-bold block">4. Human safety review</span>
                  <p className="text-zinc-300">{approvalSummary}</p>
                </div>
              )}

              {destinationSummary && (
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block">5. Where results go</span>
                  <p className="text-zinc-300">{destinationSummary}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/20"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
