'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Eye,
  Handshake,
  Zap,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface Capability {
  id: string;
  label: string;
  enabled: boolean;
  description: string;
}

interface DepartmentData {
  id: string;
  name: string;
  role: string;
  description: string;
  autonomy: 'RECOMMEND' | 'ASSIST' | 'AUTOPILOT';
  capabilities: Capability[];
  willDo: string[];
  willNotDo: string[];
}

interface AiSetupWizardModalProps {
  isOpen: boolean;
  department: DepartmentData | null;
  onClose: () => void;
  onComplete: (departmentId: string, autonomy: 'RECOMMEND' | 'ASSIST' | 'AUTOPILOT', capabilities: Capability[]) => void;
}

export function AiSetupWizardModal({
  isOpen,
  department,
  onClose,
  onComplete,
}: AiSetupWizardModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAutonomy, setSelectedAutonomy] = useState<'RECOMMEND' | 'ASSIST' | 'AUTOPILOT'>('ASSIST');
  const [capabilities, setCapabilities] = useState<Capability[]>([]);

  React.useEffect(() => {
    if (department) {
      setSelectedAutonomy(department.autonomy);
      setCapabilities([...department.capabilities]);
      setStep(1);
    }
  }, [department]);

  if (!isOpen || !department) return null;

  const toggleCapability = (id: string) => {
    setCapabilities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleFinish = () => {
    onComplete(department.id, selectedAutonomy, capabilities);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Set Up {department.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step {step} of 3 • {step === 1 ? 'Goals' : step === 2 ? 'Autonomy Level' : 'Review & Confirm'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wizard Steps Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: What do you want help with? */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  What would you like {department.name} to handle?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Select the responsibilities you want your digital employee to focus on.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {capabilities.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      c.enabled
                        ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c.enabled}
                      onChange={() => toggleCapability(c.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                        {c.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                        {c.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: How much should AI do? */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  How much should AI do on its own?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  You can change this autonomy level at any time.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* 1. RECOMMEND */}
                <div
                  onClick={() => setSelectedAutonomy('RECOMMEND')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedAutonomy === 'RECOMMEND'
                      ? 'bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/30 dark:bg-blue-950/20'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Eye size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          👀 RECOMMEND
                        </span>
                        {selectedAutonomy === 'RECOMMEND' && (
                          <CheckCircle2 size={16} className="text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        AI watches your business data and gives you suggestions. It never makes changes or sends messages.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. ASSIST */}
                <div
                  onClick={() => setSelectedAutonomy('ASSIST')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedAutonomy === 'ASSIST'
                      ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30 dark:bg-emerald-950/20'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Handshake size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          🤝 ASSIST
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            Recommended
                          </span>
                        </span>
                        {selectedAutonomy === 'ASSIST' && (
                          <CheckCircle2 size={16} className="text-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        AI drafts messages, plans tasks, and stages updates for you to review and approve before anything happens.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. AUTOPILOT */}
                <div
                  onClick={() => setSelectedAutonomy('AUTOPILOT')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedAutonomy === 'AUTOPILOT'
                      ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30 dark:bg-purple-950/20'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Zap size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          ⚡ AUTOPILOT
                        </span>
                        {selectedAutonomy === 'AUTOPILOT' && (
                          <CheckCircle2 size={16} className="text-purple-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        AI completes routine approved actions automatically. High-risk financial or sensitive actions still require approval.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Summary & Real Data Preview */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Your AI {department.name} Summary
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Clear boundaries for what your digital employee will and will not do.
                </p>
              </div>

              {/* Will do & Will not do */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/15 border border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={14} /> AI will:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {department.willDo.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/15 border border-rose-500/20">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={14} /> AI will NOT:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {department.willNotDo.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-600">✕</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Real data preview */}
              <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 mt-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Preview of First Action with Real CRM Data:
                </span>
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      Hyperion Technologies ($24,500 Deal)
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      No recorded communication for 9 days
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    Draft Follow-up Prepared
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="p-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 transition-opacity shadow-md shadow-emerald-500/20"
            >
              <CheckCircle2 size={16} /> Enable {department.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
