'use client';

import React, { useState } from 'react';
import { Check, Zap, X, Shield, Sparkles, Star } from 'lucide-react';
import { useRoleWorkspace, WorkspaceRole } from '@/components/platform/RoleWorkspaceContext';

interface TieredPackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TieredPackagingModal({ isOpen, onClose }: TieredPackagingModalProps) {
  const { currentRole, setRole } = useRoleWorkspace();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-white my-8 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-400" size={22} />
              <h2 className="text-xl font-bold text-white">Tiered Product Packaging & Workspace Editions</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select a specialized functional edition or unlock the complete 67-feature Business OS suite.
            </p>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Billing Cycle Switcher */}
        <div className="flex justify-center">
          <div className="flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[9px]">
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
                    ? 'bg-gradient-to-b from-amber-500/10 via-white/[0.04] to-white/[0.02] border-amber-500/50 shadow-lg shadow-orange-500/10'
                    : isCurrent
                    ? 'bg-white/[0.06] border-amber-400/40'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Star size={10} fill="currentColor" /> Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {tier.badge}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{tier.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{tier.description}</p>
                  </div>

                  <div>
                    <span className="text-3xl font-extrabold font-mono text-white">${tier.price}</span>
                    <span className="text-xs text-slate-400 font-medium"> / seat / mo</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Included Modules:
                    </span>
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <Check size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
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
                        ? 'bg-white/[0.08] text-amber-300 border border-amber-500/30'
                        : tier.popular
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-orange-500/25'
                        : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1]'
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
    </div>
  );
}
