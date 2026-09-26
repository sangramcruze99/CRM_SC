// apps/web-core/src/components/automation/intent/ActionTimingApprovalCard.tsx
'use client';

import React from 'react';
import {
  Clock,
  ShieldCheck,
  Send,
  Database,
  UserCheck,
  AlertTriangle,
  Calendar,
  Check,
  Building,
  Bell,
} from 'lucide-react';
import { DomainPack, StructuredIntent, StructuredAction } from './types';

interface ActionTimingApprovalCardProps {
  intent: StructuredIntent;
  domainPack?: DomainPack;
  onChangeIntent: (updated: StructuredIntent) => void;
}

export function ActionTimingApprovalCard({
  intent,
  domainPack,
  onChangeIntent,
}: ActionTimingApprovalCardProps) {
  const handleToggleApproval = (required: boolean) => {
    onChangeIntent({
      ...intent,
      approvalPolicy: {
        ...intent.approvalPolicy,
        required,
      },
    });
  };

  const handleUpdateApprovalRole = (reviewerRole: string) => {
    onChangeIntent({
      ...intent,
      approvalPolicy: {
        ...intent.approvalPolicy,
        reviewerRole,
      },
    });
  };

  const handleUpdateThresholdAmount = (thresholdAmount: number) => {
    onChangeIntent({
      ...intent,
      approvalPolicy: {
        ...intent.approvalPolicy,
        thresholdAmount,
      },
    });
  };

  const handleUpdateTiming = (timingType: StructuredIntent['trigger']['timing']) => {
    onChangeIntent({
      ...intent,
      trigger: {
        ...intent.trigger,
        timing: timingType,
      },
      timing: {
        ...intent.timing,
        window:
          timingType === 'BUSINESS_HOURS'
            ? 'BUSINESS_HOURS'
            : timingType === 'OUTSIDE_BUSINESS_HOURS'
            ? 'OUTSIDE_BUSINESS_HOURS'
            : 'ALWAYS',
      },
    });
  };

  const handleUpdateDestination = (destinationId: string) => {
    const found = domainPack?.resultDestinations.find((d) => d.id === destinationId);
    if (found) {
      onChangeIntent({
        ...intent,
        resultDestination: {
          id: found.id,
          name: found.name,
          summary: found.description,
        },
      });
    }
  };

  const toggleChannel = (channel: string) => {
    const exists = intent.channels.includes(channel);
    const updatedChannels = exists
      ? intent.channels.filter((c) => c !== channel)
      : [...intent.channels, channel];
    onChangeIntent({ ...intent, channels: updatedChannels });
  };

  const availableChannels = ['Email', 'WhatsApp', 'SMS', 'Slack / Teams', 'Internal CRM Task'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Actions & Execution Timing */}
      <div className="bg-slate-900/90 border border-white/[0.12] rounded-3xl p-6 sm:p-7 shadow-xl backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Execution Cadence & Timing</h3>
            <p className="text-xs text-slate-400">When and how fast actions should execute</p>
          </div>
        </div>

        {/* Timing Window Buttons */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Execution Window
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'IMMEDIATELY', label: ' Immediately', desc: 'Execute in real-time within seconds' },
              { id: 'BUSINESS_HOURS', label: ' Business Hours', desc: 'Mon - Fri, 9:00 AM - 6:00 PM' },
              { id: 'OUTSIDE_BUSINESS_HOURS', label: ' After-Hours', desc: 'Evenings, weekends, holidays' },
              { id: 'AFTER_DELAY', label: ' Smart Cadence', desc: 'Delay 2 days before follow-up' },
            ].map((timingOpt) => {
              const isSelected = intent.trigger.timing === timingOpt.id;
              return (
                <button
                  key={timingOpt.id}
                  type="button"
                  onClick={() => handleUpdateTiming(timingOpt.id as any)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-md shadow-emerald-500/15'
                      : 'bg-slate-950/60 border-white/[0.08] text-slate-300 hover:border-white/[0.15] hover:bg-slate-950/90'
                  }`}
                >
                  <div className="text-xs font-extrabold text-white flex items-center justify-between">
                    <span>{timingOpt.label}</span>
                    {isSelected && <Check size={13} className="text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{timingOpt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Communication Channels */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Communication & Delivery Channels</span>
            <span className="text-[11px] text-slate-500 font-normal">Select active channels</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableChannels.map((channel) => {
              const active = intent.channels.includes(channel);
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {active && <Check size={12} />}
                  <span>{channel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Human Review Policy & Result Destination */}
      <div className="bg-slate-900/90 border border-white/[0.12] rounded-3xl p-6 sm:p-7 shadow-xl backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Human Sign-Off & Results</h3>
            <p className="text-xs text-slate-400">Governance policies and where outputs are stored</p>
          </div>
        </div>

        {/* Human Approval Policy Card */}
        <div className="bg-slate-950/70 border border-white/[0.08] rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white">Require Human Review</span>
              <span className="text-[10px] text-slate-400 font-medium">(Human-in-the-loop)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={intent.approvalPolicy.required}
                onChange={(e) => handleToggleApproval(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {intent.approvalPolicy.required && (
            <div className="space-y-3 pt-3 border-t border-white/[0.06] animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Reviewer Role
                  </label>
                  <input
                    type="text"
                    value={intent.approvalPolicy.reviewerRole || 'Manager'}
                    onChange={(e) => handleUpdateApprovalRole(e.target.value)}
                    placeholder="e.g. Finance Manager, Talent Partner..."
                    className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/80"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Approval Trigger Condition
                  </label>
                  <select
                    value={intent.approvalPolicy.condition}
                    onChange={(e) =>
                      onChangeIntent({
                        ...intent,
                        approvalPolicy: {
                          ...intent.approvalPolicy,
                          condition: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs font-semibold text-emerald-400 focus:outline-none focus:border-emerald-500/80 cursor-pointer"
                  >
                    <option value="THRESHOLD_EXCEEDED">When Amount / Metric Exceeds Threshold</option>
                    <option value="AI_UNSURE">When AI is Unsure / Low Confidence</option>
                    <option value="ALWAYS">Always Require Review</option>
                  </select>
                </div>
              </div>

              {intent.approvalPolicy.condition === 'THRESHOLD_EXCEEDED' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Threshold Amount ($)
                  </label>
                  <input
                    type="number"
                    value={intent.approvalPolicy.thresholdAmount || 5000}
                    onChange={(e) => handleUpdateThresholdAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/80"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Result Destination Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Database size={13} className="text-emerald-400" />
            <span>Where Should Results Be Stored?</span>
          </label>

          <div className="space-y-2">
            {domainPack?.resultDestinations.map((dest) => {
              const isSelected = intent.resultDestination.id === dest.id;
              return (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => handleUpdateDestination(dest.id)}
                  className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                      : 'bg-slate-950/60 border-white/[0.08] text-slate-300 hover:border-white/[0.15]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{dest.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{dest.description}</div>
                  </div>
                  {isSelected && <Check size={16} className="text-emerald-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
