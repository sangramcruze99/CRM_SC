'use client';

import React from 'react';
import {
  X,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  Crosshair,
  Layers,
  Percent,
} from 'lucide-react';
import { ProvenanceRecord } from '@/lib/document-intelligence/types';

interface ProvenanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  provenanceList: ProvenanceRecord[];
  selectedFieldKey?: string;
}

export function ProvenanceDrawer({
  isOpen,
  onClose,
  provenanceList,
  selectedFieldKey,
}: ProvenanceDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                "Why This Value?" Extraction Provenance
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Audit Mode
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Structured evidence, spatial location, and mathematical cross-checks behind extracted fields.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
          {provenanceList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <FileSearch size={32} className="mx-auto text-slate-500 mb-2 opacity-50" />
              <p>No provenance records available yet. Scan a document to inspect extraction evidence.</p>
            </div>
          ) : (
            provenanceList.map((item, idx) => {
              const isSelected = selectedFieldKey && item.field === selectedFieldKey;
              const valStatus = item.validationStatus || item.validationCheck || 'PASS';
              const sourceText = item.sourceText || item.rawTextSnippet || 'Direct Value';
              const extractedVal = item.extractedValue !== undefined ? item.extractedValue : item.value;
              const boxStr = item.boundingBox
                ? Array.isArray(item.boundingBox)
                  ? item.boundingBox.join(', ')
                  : `${(item.boundingBox as any).x}, ${(item.boundingBox as any).y}, ${(item.boundingBox as any).width}, ${(item.boundingBox as any).height}`
                : null;
              const rule = item.ruleApplied || item.reasoning;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                        {item.field.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] font-bold text-white font-mono bg-white/[0.06] px-2 py-0.5 rounded-md">
                        = {String(extractedVal)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        valStatus === 'PASS'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        Validation: {valStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Source Text & Page */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Source Grounding
                      </span>
                      <p className="font-mono text-slate-200 bg-black/40 px-2 py-1 rounded border border-white/5 truncate">
                        "{sourceText}"
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Source: Page {item.pageNumber || 1}
                        {boxStr && ` · Box: [${boxStr}]`}
                      </p>
                    </div>

                    {/* Multi-tier Confidence Scores */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Confidence Breakdown
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                        <div className="bg-white/[0.03] p-1.5 rounded border border-white/5">
                          <span className="text-slate-400 block text-[9px]">OCR Optical</span>
                          <span className="text-emerald-400 font-bold">{Math.round(item.ocrConfidence * 100)}%</span>
                        </div>
                        <div className="bg-white/[0.03] p-1.5 rounded border border-white/5">
                          <span className="text-slate-400 block text-[9px]">Semantic Logic</span>
                          <span className="text-teal-400 font-bold">{Math.round(item.semanticConfidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {rule && (
                    <div className="mt-2.5 pt-2 border-t border-white/[0.04] text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">Rule Applied: </span>
                      <span className="font-mono">{rule}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] pt-3 shrink-0 flex justify-between items-center text-[11px] text-slate-400">
          <span>Deterministic validation eliminates black-box hallucinations.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
