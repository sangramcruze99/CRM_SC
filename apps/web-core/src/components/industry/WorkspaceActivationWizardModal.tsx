'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Building2,
  Check,
  AlertTriangle,
  ShieldCheck,
  Workflow,
  Receipt,
  Users,
} from 'lucide-react';
import { IndustryNiche, useIndustry, NicheIcon } from './IndustryContext';
import { NICHE_CONFIGURATIONS_2, NicheConfiguration2 } from '@/lib/industry/nicheRegistry2';
import {
  UNIVERSAL_SERVICE_CATALOG,
  UniversalService,
  resolveRequiredDependencies,
  getServicesForNiche,
} from '@/lib/services/serviceCatalog';

interface WorkspaceActivationWizardModalProps {
  nicheId: IndustryNiche;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceActivationWizardModal({
  nicheId,
  isOpen,
  onClose,
}: WorkspaceActivationWizardModalProps) {
  const { activateWorkspace, currentNiche } = useIndustry();
  const [step, setStep] = useState<number>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [businessName, setBusinessName] = useState<string>('');
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const config2: NicheConfiguration2 = NICHE_CONFIGURATIONS_2[nicheId] || NICHE_CONFIGURATIONS_2.all;
  const availableServices = getServicesForNiche(nicheId);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize selected services with core + recommended when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const defaults = Array.from(new Set([...config2.coreServiceIds, ...config2.recommendedServiceIds]));
      setSelectedServices(defaults);
      setBusinessName(`My ${config2.shortName}`);
    }
  }, [isOpen, nicheId, config2]);

  if (!isOpen || !mounted) return null;

  const handleToggleService = (serviceId: string) => {
    const isCore = config2.coreServiceIds.includes(serviceId);
    if (isCore) return; // Core cannot be disabled

    if (selectedServices.includes(serviceId)) {
      setSelectedServices((prev) => prev.filter((id) => id !== serviceId));
    } else {
      // Auto-include missing dependencies
      const deps = resolveRequiredDependencies(serviceId, selectedServices);
      setSelectedServices((prev) => Array.from(new Set([...prev, serviceId, ...deps])));
    }
  };

  const handleFinishActivation = () => {
    setIsActivating(true);
    setTimeout(() => {
      activateWorkspace(nicheId, selectedServices);
      setIsActivating(false);
      onClose();
    }, 700);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 animate-in fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isActivating) onClose();
      }}
    >
      <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950 border border-white/[0.14] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.2)] text-white space-y-6 my-8 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
              <NicheIcon niche={nicheId} size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Workspace Activation Wizard — {config2.name}
              </h2>
              <span className="text-xs text-slate-400">
                Step {step} of 4: {step === 1 ? 'Business Classification' : step === 2 ? 'Select Services & Dependencies' : step === 3 ? 'Operational Terminology' : 'Review & Activate'}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={isActivating}
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-white/[0.08]'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: Business Classification */}
        {step === 1 && (
          <div className="space-y-4 py-2 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                Target Operating Environment
              </span>
              <h3 className="text-sm font-bold text-white">{config2.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{config2.description}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Workspace Organization Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Metro General Hospital, Apex Realty Brokerage, Bistro 44..."
                className="w-full px-4 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Recommended For:</span>
              <div className="flex flex-wrap gap-2">
                {config2.recommendedFor.map((rec) => (
                  <span
                    key={rec}
                    className="px-2.5 py-1 bg-white/[0.05] border border-white/[0.08] rounded-xl text-xs font-medium text-slate-300 flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span>{rec}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Select Services & Dependencies */}
        {step === 2 && (
          <div className="space-y-3 py-1 flex-1 overflow-y-auto pr-1 max-h-[50vh] animate-in fade-in">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>{selectedServices.length} Services Selected</span>
              <span className="text-[11px] text-emerald-400 font-medium">Core services are locked on</span>
            </div>

            <div className="space-y-2">
              {availableServices.map((srv) => {
                const isSelected = selectedServices.includes(srv.id);
                const isCore = config2.coreServiceIds.includes(srv.id);
                const isRec = config2.recommendedServiceIds.includes(srv.id);

                return (
                  <div
                    key={srv.id}
                    onClick={() => handleToggleService(srv.id)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'border border-white/20'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-white truncate">{srv.name}</h4>
                          {isCore && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              CORE
                            </span>
                          )}
                          {isRec && !isCore && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{srv.shortDesc}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {srv.records.join(', ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Operational Terminology Preview */}
        {step === 3 && (
          <div className="space-y-4 py-2 animate-in fade-in">
            <p className="text-xs text-slate-400">
              Your navigation, record labels, and action prompts will automatically adapt to industry-standard nomenclature:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Generic: Customers</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <Users size={14} />
                  <span>{config2.terminology.contacts}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Generic: Pipeline / Deals</span>
                <span className="text-sm font-bold text-teal-400 flex items-center gap-1.5">
                  <Workflow size={14} />
                  <span>{config2.terminology.deals}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Generic: Billing &amp; Invoices</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <Receipt size={14} />
                  <span>{config2.terminology.invoices}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Generic: Sprints / Tasks</span>
                <span className="text-sm font-bold text-teal-400 flex items-center gap-1.5">
                  <Building2 size={14} />
                  <span>{config2.terminology.projects}</span>
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
              <Sparkles size={16} className="text-emerald-400 shrink-0" />
              <span>
                Autonomous AI persona <strong className="text-white font-bold">{config2.aiPersona.name}</strong> ({config2.aiPersona.role}) will be designated as your workspace assistant.
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Activate */}
        {step === 4 && (
          <div className="space-y-4 py-2 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-slate-900 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.1] pb-3">
                <div>
                  <h3 className="text-base font-black text-white">{businessName}</h3>
                  <span className="text-xs text-emerald-400 font-semibold">{config2.name}</span>
                </div>
                <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black rounded-full text-xs">
                  READY TO DEPLOY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Enabled Services:</span>
                  <span className="font-mono font-bold text-white">{selectedServices.length} Active Services</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Record Types:</span>
                  <span className="font-mono font-bold text-white">{config2.recordTypes.length} Schemas</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Curated Reports:</span>
                  <span className="font-mono font-bold text-white">{config2.reportCatalog.length} Templates</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Workflows Seeded:</span>
                  <span className="font-mono font-bold text-white">{config2.workflowTemplates.length} Automations</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Clicking <strong>Activate Workspace</strong> will immediately reorganize your left navigation, initialize industry dashboard telemetry, and apply the customized operating rules without breaking existing data records.
            </p>
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              disabled={isActivating}
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isActivating}
              onClick={handleFinishActivation}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/30 cursor-pointer disabled:opacity-50"
            >
              {isActivating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Deploying Workspace...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Activate Workspace</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
