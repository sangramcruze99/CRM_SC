'use client';

import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Zap,
  Activity,
  UserCheck,
  TrendingUp,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Search,
  Globe,
  Clock,
  Eye,
  MousePointerClick,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Flame,
  Building,
} from 'lucide-react';

interface AnonymousVisitor {
  id: string;
  ip: string;
  location: string;
  firstSeen: string;
  duration: string;
  pageViews: { url: string; time: string; count: number }[];
  status: 'ANONYMOUS' | 'RESOLVED';
  resolvedEmail?: string;
  resolvedName?: string;
  resolvedCompany?: string;
  calculatedScore: number;
}

const INITIAL_VISITORS: AnonymousVisitor[] = [
  {
    id: 'vis_1',
    ip: '198.51.100.42',
    location: 'San Francisco, CA, United States',
    firstSeen: '12 minutes ago',
    duration: '6m 40s',
    pageViews: [
      { url: '/pricing', time: '12m ago', count: 3 },
      { url: '/telephony/ai-softphone', time: '8m ago', count: 2 },
      { url: '/roi-calculator', time: '3m ago', count: 1 },
    ],
    status: 'ANONYMOUS',
    calculatedScore: 65,
  },
  {
    id: 'vis_2',
    ip: '203.0.113.19',
    location: 'London, United Kingdom',
    firstSeen: '28 minutes ago',
    duration: '4m 15s',
    pageViews: [
      { url: '/enterprise-security', time: '28m ago', count: 1 },
      { url: '/whitepaper/hipaa-compliance', time: '14m ago', count: 2 },
    ],
    status: 'ANONYMOUS',
    calculatedScore: 40,
  },
  {
    id: 'vis_3',
    ip: '192.0.2.88',
    location: 'Munich, Germany',
    firstSeen: '1 hour ago',
    duration: '14m 20s',
    pageViews: [
      { url: '/pricing', time: '55m ago', count: 4 },
      { url: '/demo', time: '40m ago', count: 1 },
      { url: '/docs/api-webhooks', time: '20m ago', count: 3 },
    ],
    status: 'RESOLVED',
    resolvedEmail: 'm.schmidt@bavariasolutions.de',
    resolvedName: 'Marcus Schmidt',
    resolvedCompany: 'Bavaria Enterprise Cloud',
    calculatedScore: 92,
  },
];

interface ScoringRule {
  id: string;
  action: string;
  category: 'WEB_VISIT' | 'EMAIL_INTERACTION' | 'INTENT_ACTION' | 'INACTIVITY';
  points: number;
  enabled: boolean;
}

const INITIAL_SCORING_RULES: ScoringRule[] = [
  { id: 'rule_1', action: 'Visitor views /pricing page (per visit)', category: 'WEB_VISIT', points: 15, enabled: true },
  { id: 'rule_2', action: 'Visitor uses Interactive ROI Calculator', category: 'INTENT_ACTION', points: 25, enabled: true },
  { id: 'rule_3', action: 'Visitor views API or Security Compliance docs', category: 'WEB_VISIT', points: 10, enabled: true },
  { id: 'rule_4', action: 'Lead opens Marketing Newsletter email', category: 'EMAIL_INTERACTION', points: 5, enabled: true },
  { id: 'rule_5', action: 'Lead clicks embedded Video or CTA Link in email', category: 'EMAIL_INTERACTION', points: 15, enabled: true },
  { id: 'rule_6', action: 'Lead submits Demo Request or Inbound Form', category: 'INTENT_ACTION', points: 35, enabled: true },
  { id: 'rule_7', action: 'Lead remains inactive with 0 visits for 14 days', category: 'INACTIVITY', points: -10, enabled: true },
];

export function TrackingPixelAndScoringStudio() {
  const [visitors, setVisitors] = useState<AnonymousVisitor[]>(INITIAL_VISITORS);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>(INITIAL_SCORING_RULES);
  const [copiedCode, setCopiedCode] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [testEmailInput, setTestEmailInput] = useState('elena.rostova@hyperion.com');
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionSuccess, setResolutionSuccess] = useState<string | null>(null);

  const pixelSnippet = `<!-- Business OS Behavioral Tracking & Identity Resolution Pixel -->
<script async src="https://telemetry.businessos.io/pixel.js" data-site-id="bos_live_7942819" data-resolve-identity="true" data-auto-track-pages="true"></script>`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(pixelSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleToggleRule = (id: string) => {
    setScoringRules(
      scoringRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleUpdateRulePoints = (id: string, newPoints: number) => {
    setScoringRules(
      scoringRules.map((r) => (r.id === id ? { ...r, points: newPoints } : r))
    );
  };

  const handleSimulateIdentityResolution = () => {
    if (!testEmailInput) return;
    setIsResolving(true);

    setTimeout(() => {
      // Resolve visitor 1
      setVisitors((prev) =>
        prev.map((v) =>
          v.id === 'vis_1'
            ? {
                ...v,
                status: 'RESOLVED',
                resolvedEmail: testEmailInput,
                resolvedName: 'Elena Rostova',
                resolvedCompany: 'Hyperion Global Operations',
                calculatedScore: 90,
              }
            : v
        )
      );
      setIsResolving(false);
      setResolutionSuccess(
        `🎉 Successfully resolved IP 198.51.100.42 to "${testEmailInput}". Linked 6 past anonymous page views and updated Lead Score to 90 (High MQL Threshold Reached)!`
      );
      setTimeout(() => setResolutionSuccess(null), 6000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="luxe-box rounded-3xl p-6 bg-gradient-to-r from-[#0b1324] via-[#0f172a] to-[#0a1b24] border border-emerald-500/20 shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Globe size={11} />
                Behavioral Telemetry & Identity Resolution
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Pixel Active: 99.98% Ingest Rate
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-emerald-400" size={22} />
              Tracking Pixel & Dynamic Lead Scoring Matrix
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Track anonymous visitor activity, bind browsing history to CRM leads upon email submission, and automatically score intent to trigger instantaneous sales rep notifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySnippet}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/15 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
            >
              {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedCode ? 'Pixel Code Copied!' : 'Copy Pixel Script Tag'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/[0.08]">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Live Tracked Visitors</span>
            <span className="text-base font-extrabold text-white font-mono">1,842</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Identities Resolved</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">68.4%</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Alert Threshold</span>
            <span className="text-base font-extrabold text-amber-400 font-mono">{alertThreshold} Points</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Scoring Rules</span>
            <span className="text-base font-extrabold text-cyan-400 font-mono">
              {scoringRules.filter((r) => r.enabled).length} of {scoringRules.length}
            </span>
          </div>
        </div>
      </div>

      {resolutionSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{resolutionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Pixel & Resolution Demo (6 cols) + Scoring Rules (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pixel Snippet & Identity Resolution Simulator (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Tracking Pixel Installation Box */}
          <div className="luxe-box rounded-3xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Code size={14} className="text-emerald-400" />
                <span>Behavioral Tracking Pixel Embed</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Site ID: bos_live_7942819
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Place this snippet inside the <code className="text-emerald-300 bg-white/[0.06] px-1 py-0.5 rounded font-mono">&lt;head&gt;</code> of your marketing website or web app to track visitor page views, time-on-page, button clicks, and anonymous sessions.
            </p>

            <div className="relative rounded-2xl bg-black/60 border border-white/10 p-3.5 font-mono text-[11px] text-emerald-300 leading-relaxed overflow-x-auto">
              {pixelSnippet}
            </div>
          </div>

          {/* Identity Resolution Live Simulator */}
          <div className="luxe-box rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <UserCheck size={14} className="text-cyan-400" />
                <span>Identity Resolution Simulator</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                Anonymous &rarr; Known
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              When an anonymous visitor submits any newsletter form, book-a-demo link, or gated asset, Business OS binds their past anonymous browsing history directly to their new CRM profile.
            </p>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
              <label className="block text-[10px] uppercase font-bold text-slate-400">
                Simulate Lead Form Submission on Web Page:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder="Enter email to resolve identity..."
                  className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleSimulateIdentityResolution}
                  disabled={isResolving}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>{isResolving ? 'Resolving...' : 'Submit & Resolve'}</span>
                </button>
              </div>
            </div>

            {/* Live Visitor Stream Feed */}
            <div className="space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Recent Anonymous & Resolved Visitors Stream:
              </span>

              {visitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    visitor.status === 'RESOLVED'
                      ? 'bg-emerald-500/[0.06] border-emerald-500/30'
                      : 'bg-white/[0.02] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{visitor.ip}</span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[9px] font-bold font-mono ${
                            visitor.status === 'RESOLVED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {visitor.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{visitor.location} &bull; Active {visitor.duration}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-extrabold text-emerald-400 block">
                        Score: {visitor.calculatedScore}
                      </span>
                      {visitor.calculatedScore >= alertThreshold && (
                        <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5 justify-end">
                          <Flame size={10} /> MQL Alert!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attached Page Visits */}
                  <div className="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center gap-1.5 flex-wrap">
                    {visitor.pageViews.map((pv, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] text-slate-300 font-mono">
                        {pv.url} <strong className="text-emerald-400">({pv.count}x)</strong>
                      </span>
                    ))}
                  </div>

                  {visitor.status === 'RESOLVED' && visitor.resolvedEmail && (
                    <div className="mt-2 pt-2 border-t border-emerald-500/20 text-[10px] text-emerald-300 flex items-center justify-between">
                      <span>
                        Resolved to: <strong>{visitor.resolvedName}</strong> ({visitor.resolvedEmail})
                      </span>
                      <span className="text-slate-400 font-mono">{visitor.resolvedCompany}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Lead Scoring Matrix (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="luxe-box rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span>Dynamic Lead Scoring Matrix</span>
                </h3>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  Automatically assign points based on digital behavioral signals.
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Real-Time Recalculation
              </span>
            </div>

            {/* Alert Threshold Slider */}
            <div className="p-4 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <PhoneCall size={14} />
                  <span>Sales Rep Softphone Alert Threshold:</span>
                </label>
                <span className="text-sm font-mono font-extrabold text-amber-400">{alertThreshold} Points</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block leading-tight">
                When a lead score crosses {alertThreshold} points, Business OS automatically places a WebRTC softphone call trigger and generates a battlecard for the sales rep.
              </span>
            </div>

            {/* Scoring Rules Table */}
            <div className="space-y-2.5">
              {scoringRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    rule.enabled
                      ? 'bg-white/[0.03] border-white/[0.08]'
                      : 'bg-white/[0.01] border-white/[0.03] opacity-50'
                  }`}
                >
                  <div className="space-y-0.5 flex-1">
                    <span className="text-xs font-bold text-white block">{rule.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Category: {rule.category}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateRulePoints(rule.id, rule.points - 5)}
                        className="w-6 h-6 rounded bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span
                        className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded ${
                          rule.points > 0
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {rule.points > 0 ? `+${rule.points}` : rule.points} pts
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateRulePoints(rule.id, rule.points + 5)}
                        className="w-6 h-6 rounded bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        rule.enabled
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}
                    >
                      {rule.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
