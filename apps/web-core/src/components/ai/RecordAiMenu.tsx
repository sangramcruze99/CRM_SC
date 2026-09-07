'use client';

import React, { useState } from 'react';
import { Sparkles, FileText, ArrowRight, Mail, CheckSquare, HelpCircle, Loader2, X } from 'lucide-react';

interface RecordAiMenuProps {
  entityType: 'deal' | 'contact' | 'invoice' | 'project' | 'ticket';
  entityId: string;
  entityName?: string;
  entityData?: Record<string, any>;
}

export function RecordAiMenu({ entityType, entityId, entityName, entityData }: RecordAiMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');

  const actions = [
    { id: 'summarize', label: 'Summarize record', icon: FileText, prompt: `Summarize the current status and key history of ${entityType} "${entityName || entityId}".` },
    { id: 'recommend', label: 'Recommend next step', icon: ArrowRight, prompt: `What is the single most important next action to take on ${entityType} "${entityName || entityId}"?` },
    { id: 'draft', label: 'Draft personalized message', icon: Mail, prompt: `Draft a professional follow-up message regarding ${entityType} "${entityName || entityId}".` },
    { id: 'task', label: 'Create recommended task', icon: CheckSquare, prompt: `Suggest an actionable follow-up task with deadline for ${entityType} "${entityName || entityId}".` },
  ];

  const handleTriggerAction = async (action: typeof actions[0]) => {
    setIsOpen(false);
    setActiveAction(action.label);
    setModalOpen(true);
    setLoading(true);
    setAiResult('');

    try {
      const res = await fetch('/api/ai/control/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: action.prompt,
          context: { entityType, entityId, entityName, ...entityData },
        }),
      });
      const data = await res.json();
      setAiResult(data.answer || 'Completed successfully.');
    } catch {
      setAiResult('Unable to retrieve AI recommendation at this time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-600/10 hover:from-emerald-500/20 hover:to-emerald-600/20 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-sm transition-all"
        >
          <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span>✨ AI Actions</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl z-30 py-1.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">
              AI Assistant
            </div>
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={() => handleTriggerAction(act)}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white text-left transition-colors"
                >
                  <Icon size={14} className="text-emerald-500 shrink-0" />
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Result Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeAction}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-400">
                  <Loader2 size={24} className="animate-spin text-emerald-500" />
                  <span className="text-xs">AI Assistant is analyzing {entityName || entityType}...</span>
                </div>
              ) : (
                aiResult
              )}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-white/10 flex justify-end bg-slate-50/50 dark:bg-white/[0.02]">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
