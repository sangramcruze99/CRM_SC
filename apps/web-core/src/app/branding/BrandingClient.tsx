'use client';

import React, { useState } from 'react';
import {
  Palette,
  Globe,
  Upload,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  Mail,
  Building,
  Lock,
  RotateCcw,
} from 'lucide-react';

interface ColorTheme {
  id: string;
  name: string;
  primaryHex: string;
  accentHex: string;
  badgeBg: string;
}

const COLOR_THEMES: ColorTheme[] = [
  { id: 'amber', name: 'Executive Amber & Gold (Default)', primaryHex: '#f59e0b', accentHex: '#ea580c', badgeBg: 'bg-amber-500/20 text-amber-300' },
  { id: 'emerald', name: 'Emerald Jade & Forest', primaryHex: '#10b981', accentHex: '#059669', badgeBg: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'sapphire', name: 'Sapphire Cobalt & Cyan', primaryHex: '#3b82f6', accentHex: '#06b6d4', badgeBg: 'bg-blue-500/20 text-blue-300' },
  { id: 'amethyst', name: 'Amethyst Violet & Rose', primaryHex: '#8b5cf6', accentHex: '#ec4899', badgeBg: 'bg-purple-500/20 text-purple-300' },
  { id: 'obsidian', name: 'Monochrome Silver Titanium', primaryHex: '#e2e8f0', accentHex: '#94a3b8', badgeBg: 'bg-slate-500/20 text-slate-300' },
];

export function BrandingClient() {
  const [companyName, setCompanyName] = useState('Acme Global Enterprises');
  const [customDomain, setCustomDomain] = useState('crm.acmeglobal.io');
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [supportEmail, setSupportEmail] = useState('concierge@acmeglobal.io');
  const [whiteLabelFooter, setWhiteLabelFooter] = useState('Powered by Acme Enterprise OS · All rights reserved.');
  const [sslStatus, setSslStatus] = useState<'ACTIVE' | 'PENDING_DNS'>('ACTIVE');
  const [alert, setAlert] = useState<string | null>(null);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(`🎉 White-Label Settings & Custom CNAME (${customDomain}) saved and propagated across client portals!`);
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Palette className="text-amber-400" size={24} />
            Enterprise White-Label & Custom Domain Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Personalize client portal branding, custom CNAME domains, SSL certificates, color themes, and email sender signatures.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>White-Label Active</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Left Settings (7 cols), Right Live Portal Mockup (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Branding Configuration Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveBranding} className="luxe-box rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Building size={16} className="text-amber-400" />
                <span>Brand Identity & Organization Name</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Step 1 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Brand / Workspace Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs font-bold text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Support & Concierge Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:bg-white/[0.08]"
                />
              </div>
            </div>

            {/* Custom CNAME Domain & SSL */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] uppercase font-bold text-slate-400">
                  Custom Domain CNAME (e.g. crm.yourcompany.com)
                </label>
                <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Lock size={11} /> Auto-SSL TLS v1.3
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs font-mono font-bold text-amber-400 focus:outline-none focus:bg-white/[0.08]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAlert(`🌐 DNS CNAME verified for ${customDomain} pointing to edge.business-os.cloud!`);
                    setTimeout(() => setAlert(null), 3000);
                  }}
                  className="px-3.5 py-2 bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-xs rounded-xl border border-white/[0.1] cursor-pointer"
                >
                  Verify DNS
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Add a DNS <strong>CNAME</strong> record pointing <code className="text-amber-300 font-mono">{customDomain}</code> to <code className="text-slate-300 font-mono">cname.business-os.cloud</code>.
              </p>
            </div>

            {/* Brand Accent Color Themes */}
            <div className="pt-3 border-t border-white/[0.06] space-y-3">
              <label className="block text-[10px] uppercase font-bold text-slate-400">
                Primary Brand Accent Theme
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = selectedTheme.id === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-white/[0.08] border-white/30 ring-2 ring-white/20'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-5 h-5 rounded-full shadow-md border border-white/20"
                          style={{ background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.accentHex})` }}
                        />
                        <span className="text-xs font-semibold text-white">{theme.name.split('(')[0]}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={15} className="text-amber-400" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* White-Label Footer */}
            <div className="pt-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Custom Extranet Footer Copyright
              </label>
              <input
                type="text"
                value={whiteLabelFooter}
                onChange={(e) => setWhiteLabelFooter(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-slate-300 focus:outline-none focus:bg-white/[0.08]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Zap size={15} />
              <span>Save & Publish White-Label Workspace</span>
            </button>
          </form>
        </div>

        {/* Right Column: Live Client Portal Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="luxe-box rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-amber-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Live Client Portal Preview
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                https://{customDomain}
              </span>
            </div>

            {/* Simulated Client Browser Window */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950/90 shadow-2xl space-y-3 p-4 text-xs">
              {/* Browser Address Bar */}
              <div className="flex items-center gap-2 p-2 bg-white/[0.04] rounded-xl border border-white/[0.06] text-[11px] font-mono text-slate-400">
                <Lock size={12} className="text-emerald-400" />
                <span className="text-white">https://{customDomain}/portal</span>
              </div>

              {/* Portal Content Mockup */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xs"
                      style={{ backgroundColor: selectedTheme.primaryHex }}
                    >
                      {companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-white text-xs">{companyName}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    Client Access
                  </span>
                </div>

                <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] space-y-1">
                  <span className="text-[10px] text-slate-400 block">Pending Invoices</span>
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-extrabold text-sm text-white">$14,500.00</span>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg font-bold text-[10px] text-slate-950"
                      style={{ backgroundColor: selectedTheme.primaryHex }}
                    >
                      Pay Now
                    </button>
                  </div>
                </div>

                <div className="text-center pt-2 text-[10px] text-slate-500 border-t border-white/[0.06]">
                  {whiteLabelFooter}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
