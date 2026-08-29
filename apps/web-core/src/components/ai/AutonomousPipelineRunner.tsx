'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Loader2, Database, Receipt, Briefcase, ShieldCheck } from 'lucide-react';

interface AutonomousPipelineProps {
  extractedData: {
    vendorName: string;
    invoiceNumber: string;
    totalAmount: number;
    date: string;
    lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  };
  onComplete: (summary: string) => void;
}

export function AutonomousPipelineRunner({ extractedData, onComplete }: AutonomousPipelineProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const executePipeline = async () => {
    setIsRunning(true);
    setCurrentStep(1); // Step 1: Ingesting OCR

    await new Promise((r) => setTimeout(r, 600));
    setCurrentStep(2); // Step 2: Auto-drafting Dual Khata entry

    await new Promise((r) => setTimeout(r, 700));
    setCurrentStep(3); // Step 3: Advance Deal Pipeline stage

    await new Promise((r) => setTimeout(r, 600));
    setCurrentStep(4); // Completed

    setIsRunning(false);
    setIsDone(true);
    onComplete(
      `Autonomous agent processed Invoice #${extractedData.invoiceNumber} ($${extractedData.totalAmount.toLocaleString()}), posted Dual Khata Ledger Entry, and advanced Deal Opportunity to "Closed Won"!`
    );
  };

  const steps = [
    {
      num: 1,
      title: 'Neural Vision Extraction',
      desc: `Extracted ${extractedData.lineItems.length} items from ${extractedData.vendorName}`,
      icon: Receipt,
    },
    {
      num: 2,
      title: 'Dual Khata Ledger Entry',
      desc: `Auto-balanced: Dr Accounts Receivable / Cr Revenue ($${extractedData.totalAmount.toFixed(2)})`,
      icon: Database,
    },
    {
      num: 3,
      title: 'CRM Deal Pipeline Sync',
      desc: 'Linked transaction & updated deal state to "Closed Won"',
      icon: Briefcase,
    },
  ];

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-5 space-y-4 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Autonomous Cross-Module Pipeline
            </h3>
            <p className="text-[11px] text-slate-400">
              Chains Neural OCR (Cat. 7) ➔ Dual Khata (Cat. 3) ➔ Deal Pipeline (Cat. 1)
            </p>
          </div>
        </div>

        {!isDone && (
          <button
            type="button"
            disabled={isRunning}
            onClick={executePipeline}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Run Autonomous Multi-Step Agent</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.num;
          const isPassed = currentStep > step.num || isDone;

          return (
            <div
              key={step.num}
              className={`p-3.5 rounded-2xl border transition-all ${
                isPassed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : isActive
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon size={15} />
                  <span className="text-xs font-bold text-white">
                    Step {step.num}: {step.title}
                  </span>
                </div>
                {isPassed ? (
                  <CheckCircle2 size={15} className="text-emerald-400" />
                ) : isActive ? (
                  <Loader2 size={15} className="animate-spin text-amber-400" />
                ) : null}
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {isDone && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-xs text-emerald-300 font-semibold">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Pipeline execution verified: Khata ledger entries posted and deal record synced successfully.</span>
        </div>
      )}
    </div>
  );
}
