'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Zap, X, Shield, Sparkles, Star } from 'lucide-react';
import { useRoleWorkspace, WorkspaceRole } from '@/components/platform/RoleWorkspaceContext';

interface TieredPackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TieredPackagingModal({ isOpen, onClose }: TieredPackagingModalProps) {
  const { currentRole, setRole } = useRoleWorkspace();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const tiers = [
    {
      id: 'sales' as WorkspaceRole,
      title: 'Sales & Marketing Edition',
      badge: 'Growth Tier',
      price: billingCycle === 'annual' ? 49 : 59,
      description: 'Ideal for outbound sales teams, marketing agencies, and high-velocity SDR pipelines.',
      features: [
        'Core CRM & Pipeline Velocity (Cat. 1)',
        'Social Media Multi-Post Studio (Cat. 5)',
        'B2B Lead Prospector & Ingestion (Cat. 6)',
        'Team Chat & Live Chat Widgets (Cat. 8)',
        '1,000 Free B2B Lead Credits/mo',
        '25,000 AI Copilot Tokens/mo',
      ],
      cta: 'Switch to Sales Edition',
      popular: false,
    },
    {
      id: 'finance' as WorkspaceRole,
      title: 'Finance & Legal Operations',
      badge: 'Finance Tier',
      price: billingCycle === 'annual' ? 79 : 89,
      description: 'Designed for CFOs, controllers, legal counsels, and billing operations.',
      features: [
        'Invoices & Dual Khata Ledger (Cat. 3)',
        'Neural Vision OCR Invoice Scanner (Cat. 7)',
        'E-Signatures & Mutual NDAs (Cat. 9)',
        'SaaS Subscription & MRR Engine',
        '100 Neural OCR Scans/mo',
        'Automated SOC2 Financial Audits',
      ],
      cta: 'Switch to Finance Edition',
      popular: false,
    },
    {
      id: 'admin' as WorkspaceRole,
      title: 'Enterprise Customization',
      badge: 'Platform Tier',
      price: billingCycle === 'annual' ? 129 : 149,
      description: 'Engineered for enterprises requiring custom data schemas, granular ABAC, and AI vectors.',
      features: [
        'Low-Code Schema & Entity Builder (Cat. 10)',
        'Vector Embeddings AI Engine (Cat. 2)',
        'Multi-Industry Adaptation Hubs (Cat. 4)',
        'Granular RBAC & SOC2 Controls (Cat. 11)',
        'Developer API & Webhooks',
        'Unlimited Custom Objects & Fields',
      ],
      cta: 'Switch to Customization Edition',
      popular: false,
    },
    {
      id: 'all' as WorkspaceRole,
      title: 'Business OS Ultimate',
      badge: 'All-Inclusive',
      price: billingCycle === 'annual' ? 199 : 229,
      description: 'Unlocks all 67 platform features with maximum resource quotas and dedicated support.',
      features: [
        'Complete 67 Platform Features (All 12 Pillars)',
        'Cross-Module Autonomous Agent Workflows',
        'Unlimited Role Workspace Switching',
        'High-Performance Partitioned Dual Ledger',
        '5,000 B2B Leads + 500 OCR Scans/mo',
        '250,000 Autonomous AI Tokens/mo',
      ],
      cta: 'Active Ultimate Plan',
      popular: true,
    },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-slate-950/98 dark:to-slate-950/99 border border-slate-200 dark:border-white/[0.14] rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl space-y-6 text-slate-900 dark:text-white my-8 animate-in zoom-in-95 overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent pointer-events-none" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 border border-emerald-300/30">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tiered Product Packaging & Workspace Editions</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 uppercase">
                  Subscriptions
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select a specialized functional edition or unlock the complete 67-feature Business OS suite
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Billing Cycle Switcher */}
        <div className="flex justify-center">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] rounded-2xl">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 rounded-md text-[9px] font-extrabold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => {
            const isCurrent = currentRole === tier.id;

            return (
              <div
                key={tier.id}
                className={`p-5 rounded-3xl border flex flex-col justify-between transition-all relative ${
                  tier.popular
                    ? 'bg-emerald-500/[0.06] dark:bg-gradient-to-b dark:from-emerald-500/15 dark:via-black/40 dark:to-black/60 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : isCurrent
                    ? 'bg-slate-50 dark:bg-black/50 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-white dark:bg-black/30 border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/30 dark:hover:border-white/[0.18]'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Star size={10} fill="currentColor" /> Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      {tier.badge}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{tier.title}</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{tier.description}</p>
                  </div>

                  <div>
                    <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">${tier.price}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium"> / seat / mo</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Included Modules:
                    </span>
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                        <Check size={13} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setRole(tier.id);
                      onClose();
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-extrabold'
                        : tier.popular
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 font-extrabold'
                        : 'bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.1]'
                    }`}
                  >
                    {isCurrent ? '✓ Current Workspace' : tier.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
