'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  Database,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  HelpCircle,
  Check,
  Building,
  Briefcase,
  Layers,
  Sliders,
  Bell,
  Mail,
  MessageSquare,
  Phone,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  DomainPack,
  StructuredIntent,
  StructuredRule,
  RuleGroup,
  AtLeastNRule,
  StructuredAction,
} from './types';
import { BusinessRuleEditor } from './BusinessRuleEditor';

interface GuidedModeBuilderProps {
  intent: StructuredIntent;
  domainPack?: DomainPack;
  onChangeIntent: (updated: StructuredIntent) => void;
  onOpenTest: () => void;
  onCompileAndActivate: () => void;
  isCompiling: boolean;
  onSwitchToAdvanced?: () => void;
}

export function GuidedModeBuilder({
  intent,
  domainPack,
  onChangeIntent,
  onOpenTest,
  onCompileAndActivate,
  isCompiling,
  onSwitchToAdvanced,
}: GuidedModeBuilderProps) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [newActionType, setNewActionType] = useState<string>('');

  const STEPS = [
    { number: 1, title: '1. Goal', desc: 'What this automation achieves' },
    { number: 2, title: '2. When', desc: 'Trigger event that starts the flow' },
    { number: 3, title: '3. Look At', desc: 'Data and context fields examined' },
    { number: 4, title: '4. Rules', desc: 'Decision logic and criteria' },
    { number: 5, title: '5. Do', desc: 'Actions executed upon qualification' },
    { number: 6, title: '6. Wait', desc: 'Delays and execution schedule' },
    { number: 7, title: '7. Ask a Person', desc: 'Human-in-the-loop approvals' },
    { number: 8, title: '8. Handle Exceptions', desc: 'What happens if data is unclear' },
    { number: 9, title: '9. Result Destination', desc: 'Where output records are saved' },
    { number: 10, title: '10. Test', desc: 'Simulate with sample data' },
    { number: 11, title: '11. Activate', desc: 'Review & publish workflow' },
  ];

  const TRIGGER_OPTIONS = [
    { type: `${intent.domain}:candidate_applied`, label: 'A candidate submits an application or resume' },
    { type: `${intent.domain}:invoice_received`, label: 'An invoice or receipt is uploaded' },
    { type: `${intent.domain}:lead_created`, label: 'A new lead or inquiry enters CRM' },
    { type: `${intent.domain}:ticket_created`, label: 'A customer support message arrives' },
    { type: `${intent.domain}:call_incoming`, label: 'An incoming customer phone call arrives' },
    { type: `${intent.domain}:order_placed`, label: 'A new e-commerce order is placed' },
    { type: `${intent.domain}:document_uploaded`, label: 'A new file is saved in Document Vault' },
    { type: `${intent.domain}:scheduled_time`, label: 'A scheduled recurring time arrives' },
    { type: `${intent.domain}:manual_trigger`, label: 'I manually start this automation' },
  ];

  const EXCEPTION_OPTIONS = [
    { id: 'ASK_HUMAN', label: 'Ask a person (Send to Review Queue)' },
    { id: 'RETRY', label: 'Wait and try again' },
    { id: 'STOP', label: 'Halt workflow and log alert' },
    { id: 'FALLBACK', label: 'Route to fallback secondary step' },
  ];

  return (
    <div className="space-y-6">
      {/* Step Navigation Pill Bar */}
      <div className="botanical-glass-card rounded-2xl p-2.5 border border-white/[0.08] overflow-x-auto scrollbar-none flex items-center gap-1">
        {STEPS.map((s) => {
          const isActive = activeStep === s.number;
          return (
            <button
              key={s.number}
              type="button"
              onClick={() => setActiveStep(s.number)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: GOAL */}
      {activeStep === 1 && (
        <div className="botanical-glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                STEP 1 OF 11
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Automation Goal & Objective</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Plain Business English</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-medium text-zinc-300">
              What outcome do you want this automation to accomplish?
            </label>
            <textarea
              rows={3}
              value={intent.goal}
              onChange={(e) => onChangeIntent({ ...intent, goal: e.target.value })}
              className="w-full bg-black/40 border border-white/[0.08] rounded-2xl p-4 text-xs font-sans text-white focus:outline-none focus:border-emerald-500/50"
              placeholder="e.g. When a candidate applies, screen them for minimum qualifications, invite top matches to interview, and route borderline profiles to human review."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
            >
              Next: When (Trigger) →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: WHEN (TRIGGER) */}
      {activeStep === 2 && (
        <div className="botanical-glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                STEP 2 OF 11
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">When does this automation run?</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Event Trigger</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TRIGGER_OPTIONS.map((opt) => {
              const isSelected = intent.trigger.description.toLowerCase().includes(opt.label.toLowerCase().slice(0, 15));
              return (
                <div
                  key={opt.type}
                  onClick={() =>
                    onChangeIntent({
                      ...intent,
                      trigger: {
                        ...intent.trigger,
                        type: opt.type,
                        description: opt.label,
                      },
                    })
                  }
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-black/30 border-white/[0.06] text-zinc-400 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="text-xs font-medium">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
            >
              Next: Look At (Fields) →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LOOK AT (CONTEXT FIELDS) */}
      {activeStep === 3 && (
        <div className="botanical-glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                STEP 3 OF 11
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">What data should the AI examine?</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Context Fields</span>
          </div>

          <p className="text-xs text-zinc-400">
            Available data fields for {domainPack?.name || 'this domain'}:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(domainPack?.fields || []).map((f) => (
              <div key={f.id} className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                <span className="text-xs font-bold text-white block">{f.name}</span>
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                  <span className="px-1.5 py-0.2 rounded bg-white/[0.05] text-emerald-400">{f.category}</span>
                  <span>Type: {f.type}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
            >
              Next: Rules (Criteria) →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RULES */}
      {activeStep === 4 && (
        <div className="space-y-5">
          <div className="botanical-glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  STEP 4 OF 11
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Decision Criteria &amp; Rules</h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">Condition Builder</span>
            </div>

            <BusinessRuleEditor
              intent={intent}
              domainPack={domainPack}
              onChangeIntent={onChangeIntent}
            />

            <div className="flex justify-between pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
              >
                Next: Do (Actions) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: DO (ACTIONS) */}
      {activeStep === 5 && (
        <div className="botanical-glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                STEP 5 OF 11
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">What actions should be taken?</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Business Actions</span>
          </div>

          <div className="space-y-3">
            {intent.actions.map((act, index) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{act.name}</h4>
                    <p className="text-[11px] text-zinc-400">{act.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onChangeIntent({
                      ...intent,
                      actions: intent.actions.filter((a) => a.id !== act.id),
                    })
                  }
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Available Action from Pack */}
          <div className="pt-2">
            <label className="text-xs font-mono text-zinc-400 block mb-2">Add action from library:</label>
            <div className="flex flex-wrap gap-2">
              {(domainPack?.actions || []).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    const newAct: StructuredAction = {
                      id: `act_${Date.now().toString(36)}`,
                      type: opt.id,
                      name: opt.name,
                      description: opt.description,
                      config: {},
                    };
                    onChangeIntent({
                      ...intent,
                      actions: [...intent.actions, newAct],
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-300 border border-white/[0.06] text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus size={12} />
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
            >
              Next: Wait (Timing) →
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: WAIT (TIMING) */}
      {activeStep === 6 && (
        <div className="botanical-glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                STEP 6 OF 11
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Execution Timing &amp; Delays</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Scheduling</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'IMMEDIATELY', label: 'Immediately (Real-time)', desc: 'Run instantly as soon as event occurs' },
              { id: 'BUSINESS_HOURS', label: 'During Business Hours', desc: 'Monday to Friday, 9:00 AM - 6:00 PM' },
              { id: 'AFTER_DELAY', label: 'Wait Period', desc: 'Hold for 1 hour or 2 days before follow-up' },
            ].map((timing) => {
              const isSelected = intent.trigger.timing === timing.id;
              return (
                <div
                  key={timing.id}
                  onClick={() =>
                    onChangeIntent({
                      ...intent,
                      trigger: { ...intent.trigger, timing: timing.id as any },
                    })
                  }
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-black/30 border-white/[0.06] text-zinc-400 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{timing.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400">{timing.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(5)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(7)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
            >
              Next: Ask a Person (Approvals) →
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: ASK A PERSON (APPROVALS) */}
      {activeStep === 7 && (
        <div className="botanical-glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                STEP 7 OF 11
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">When should a person review this?</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Safety Gate</span>
          </div>

          <div className="space-y-3">
            {[
              { id: 'NEVER', label: 'Never (Full Autonomous)', desc: 'Execute automatically without human approval' },
              { id: 'AI_UNSURE', label: 'When AI is Unsure or Data is Missing', desc: 'Human-in-the-loop fallback for ambiguous cases' },
              { id: 'THRESHOLD_EXCEEDED', label: 'Above a Money or Risk Threshold', desc: 'e.g. Invoices over $5,000 or high discounts' },
              { id: 'EXTERNAL_COMMUNICATION', label: 'Before External Communication', desc: 'Review outbound emails or WhatsApp drafts before sending' },
              { id: 'ALWAYS', label: 'Always', desc: 'Hold every execution in queue until an operator clicks Approve' },
            ].map((opt) => {
              const isSelected = intent.approvalPolicy.condition === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() =>
                    onChangeIntent({
                      ...intent,
                      approvalPolicy: {
                        ...intent.approvalPolicy,
                        required: opt.id !== 'NEVER',
                        condition: opt.id as any,
                      },
                    })
                  }
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-black/30 border-white/[0.06] text-zinc-400 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block text-white">{opt.label}</span>
                    <span className="text-[11px] text-zinc-400">{opt.desc}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(8)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
            >
              Next: Handle Exceptions →
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: HANDLE EXCEPTIONS */}
      {activeStep === 8 && (
        <div className="botanical-glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                STEP 8 OF 11
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">What if something goes wrong?</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Exception Strategy</span>
          </div>

          <div className="space-y-3">
            {EXCEPTION_OPTIONS.map((opt) => {
              const isSelected = intent.exceptions.onFailure === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() =>
                    onChangeIntent({
                      ...intent,
                      exceptions: {
                        ...intent.exceptions,
                        onFailure: opt.id as any,
                      },
                    })
                  }
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-black/30 border-white/[0.06] text-zinc-400 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="text-xs font-medium text-white">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(7)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(9)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
            >
              Next: Result Destination →
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: RESULT DESTINATION */}
      {activeStep === 9 && (
        <div className="botanical-glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                STEP 9 OF 11
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Where should the result go?</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Destination</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(domainPack?.resultDestinations || []).map((dest) => {
              const isSelected = intent.resultDestination.id === dest.id;
              return (
                <div
                  key={dest.id}
                  onClick={() =>
                    onChangeIntent({
                      ...intent,
                      resultDestination: {
                        id: dest.id,
                        name: dest.name,
                        summary: dest.description,
                      },
                    })
                  }
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-black/30 border-white/[0.06] text-zinc-400 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{dest.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400">{dest.description}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(8)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(10)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
            >
              Next: Test Workflow →
            </button>
          </div>
        </div>
      )}

      {/* STEP 10: TEST */}
      {activeStep === 10 && (
        <div className="botanical-glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                STEP 10 OF 11
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Test &amp; Simulate with Sample Data</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Zero-Risk Dry Run</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Run a dry simulation through the AI parser, business conditions, and action branches. No real emails or messages will be sent.
          </p>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Interactive Simulation Studio</span>
              <span className="text-[11px] text-zinc-400">Step-by-step trace of AI reasoning and outcome branch</span>
            </div>
            <button
              type="button"
              onClick={onOpenTest}
              className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Play size={13} />
              <span>Launch Simulator</span>
            </button>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(9)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(11)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
            >
              Next: Review &amp; Activate →
            </button>
          </div>
        </div>
      )}

      {/* STEP 11: ACTIVATE */}
      {activeStep === 11 && (
        <div className="botanical-glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                STEP 11 OF 11
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Review &amp; Publish Automation</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Final Verification</span>
          </div>

          {/* Summary Box */}
          <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-3">
            <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase">Automation Specification Summary</h4>
            <div className="space-y-1 text-xs">
              <div><strong className="text-zinc-400">Goal:</strong> <span className="text-white">{intent.goal}</span></div>
              <div><strong className="text-zinc-400">When:</strong> <span className="text-white">{intent.trigger.description}</span></div>
              <div><strong className="text-zinc-400">Actions:</strong> <span className="text-white">{intent.actions.map(a => a.name).join(', ')}</span></div>
              <div><strong className="text-zinc-400">Approval:</strong> <span className="text-white">{intent.approvalPolicy.required ? 'Human Review Gate' : 'Automated'}</span></div>
              <div><strong className="text-zinc-400">Destination:</strong> <span className="text-white">{intent.resultDestination.name}</span></div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveStep(10)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              ← Back to Test
            </button>

            <div className="flex items-center gap-3">
              {onSwitchToAdvanced && (
                <button
                  type="button"
                  onClick={onSwitchToAdvanced}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-mono transition cursor-pointer"
                >
                  Open in Advanced Canvas
                </button>
              )}

              <button
                type="button"
                disabled={isCompiling}
                onClick={onCompileAndActivate}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCompiling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Compiling Workflow...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Compile &amp; Activate Workflow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
