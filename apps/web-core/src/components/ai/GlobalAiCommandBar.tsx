'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Search,
  X,
  ArrowRight,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Zap,
  Loader2,
  Bot,
} from 'lucide-react';

export function GlobalAiCommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Global hotkey: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setResponse(null);
    }
  }, [isOpen]);

  const handleSubmit = async (textToSubmit?: string) => {
    const q = textToSubmit || query;
    if (!q.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/control/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setResponse(data);
    } catch {
      setResponse({
        department: 'AI Team',
        answer: 'I encountered an error connecting to your AI team. Please check your network connection.',
        suggestedActions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (actionItem: any) => {
    if (actionItem.action === 'NAVIGATE' && actionItem.path) {
      setIsOpen(false);
      router.push(actionItem.path);
    } else if (actionItem.action === 'SUBMIT_PROMPT' && actionItem.prompt) {
      setQuery(actionItem.prompt);
      handleSubmit(actionItem.prompt);
    } else {
      setIsOpen(false);
      router.push('/ai');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Search input bar */}
        <div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            placeholder="Ask your AI team anything... (e.g. Which deals need attention?)"
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none"
          />
          {loading ? (
            <Loader2 size={18} className="animate-spin text-emerald-500" />
          ) : query ? (
            <button
              onClick={() => handleSubmit()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors"
            >
              Ask
            </button>
          ) : (
            <kbd className="px-2 py-1 text-[11px] font-mono bg-slate-100 dark:bg-white/10 text-slate-500 rounded border border-slate-200 dark:border-white/10">
              ESC
            </kbd>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Response or Suggested Prompts */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {response ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  {response.department || 'AI Assistant'}
                </span>
                <span className="text-xs text-slate-400">Response</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {response.answer}
              </div>

              {response.suggestedActions && response.suggestedActions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Suggested Next Steps:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {response.suggestedActions.map((action: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleAction(action)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-colors"
                      >
                        <span>{action.label}</span>
                        <ArrowRight size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Suggested questions:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { text: 'Which deals should I focus on today?', icon: TrendingUp },
                  { text: 'Show me overdue invoices', icon: Landmark },
                  { text: 'Find customers who might churn', icon: ShieldCheck },
                  { text: 'Give me my daily briefing', icon: Zap },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(item.text);
                        handleSubmit(item.text);
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl text-left bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Icon size={14} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{item.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
