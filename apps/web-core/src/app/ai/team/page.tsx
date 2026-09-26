'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Zap,
  MessageSquare,
  Workflow,
  Eye,
  Handshake,
  CheckCircle2,
  Sliders,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';
import { AiNavigationTabs } from '@/components/ai/AiNavigationTabs';
import { AiSetupWizardModal } from '@/components/ai/AiSetupWizardModal';

const DEPARTMENT_ICONS: Record<string, any> = {
  sales: TrendingUp,
  cs: ShieldCheck,
  finance: Landmark,
  support: MessageSquare,
  operations: Workflow,
  marketing: Zap,
};

export default function MyAiTeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptForWizard, setSelectedDeptForWizard] = useState<any | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [updatingDeptId, setUpdatingDeptId] = useState<string | null>(null);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/control/team');
      const data = await res.json();
      setTeam(data.team || []);
    } catch (err) {
      console.error('Failed to load AI team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleAutonomyChange = async (
    departmentId: string,
    autonomy: 'RECOMMEND' | 'ASSIST' | 'AUTOPILOT'
  ) => {
    setUpdatingDeptId(departmentId);
    try {
      await fetch('/api/ai/control/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId, autonomy }),
      });
      setTeam((prev) =>
        prev.map((d) => (d.id === departmentId ? { ...d, autonomy } : d))
      );
    } catch (err) {
      console.error('Failed to update autonomy:', err);
    } finally {
      setUpdatingDeptId(null);
    }
  };

  const handleWizardComplete = async (
    departmentId: string,
    autonomy: 'RECOMMEND' | 'ASSIST' | 'AUTOPILOT',
    capabilities: any[]
  ) => {
    try {
      await fetch('/api/ai/control/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId, autonomy, capabilities }),
      });
      fetchTeam();
    } catch (err) {
      console.error('Failed to complete wizard:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white font-sans">
      <AiNavigationTabs />

      {/* Top Header Cockpit Chassis */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">AI Agent Roster Active</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Governed Autonomous Roles</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              vault/ai/fleet_roster/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">HITL Governance: 100%</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                STAGE 5.0 AUTONOMOUS FLEET
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                DIGITAL EMPLOYEE SWARM
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Users className="text-emerald-400" size={30} />
              My AI Team
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Your intelligent digital employees. Configure responsibilities and how much autonomy each assistant has.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.08] flex items-center gap-3 text-xs font-mono text-zinc-400 shrink-0">
            <span className="font-semibold text-zinc-500 uppercase tracking-wider">
              Controls:
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Eye size={13} /> Recommend
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Handshake size={13} /> Assist
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Zap size={13} /> Autopilot
            </span>
          </div>
        </div>
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400 font-mono">
          <Loader2 size={32} className="animate-spin text-emerald-400" />
          <span className="text-xs">Loading AI team roster...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {team.map((dept) => {
            const Icon = DEPARTMENT_ICONS[dept.id] || Sparkles;
            const isUpdating = updatingDeptId === dept.id;

            return (
              <div
                key={dept.id}
                className="botanical-glass-card rounded-2xl p-6 border border-white/[0.08] relative overflow-hidden flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold font-mono text-white">
                            {dept.name}
                          </h2>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.08] font-bold">
                            {dept.codename}
                          </span>
                        </div>
                        <p className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">
                          {dept.role}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDeptForWizard(dept);
                        setWizardOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer shrink-0"
                    >
                      <Sliders size={13} />
                      <span>Setup</span>
                    </button>
                  </div>

                  <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                    {dept.description}
                  </p>

                  {/* Today's Key Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {dept.todayStats?.map((stat: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-black/40 border border-white/[0.06]"
                      >
                        <span className="text-[11px] font-mono text-zinc-500 block truncate">
                          {stat.label}
                        </span>
                        <span className="text-base font-bold text-white font-mono mt-0.5 block">
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Autonomy Level Control */}
                <div className="pt-4 border-t border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      Autonomy Level
                    </span>
                    {isUpdating && <Loader2 size={14} className="animate-spin text-emerald-400" />}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'RECOMMEND', label: 'Recommend', icon: Eye },
                      { key: 'ASSIST', label: 'Assist', icon: Handshake },
                      { key: 'AUTOPILOT', label: 'Autopilot', icon: Zap },
                    ].map((lvl) => {
                      const LvlIcon = lvl.icon;
                      const isSelected = dept.autonomy === lvl.key;

                      return (
                        <button
                          key={lvl.key}
                          onClick={() => handleAutonomyChange(dept.id, lvl.key as any)}
                          disabled={isUpdating}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                              : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                          }`}
                        >
                          <LvlIcon size={14} className={isSelected ? 'text-zinc-950' : 'text-emerald-400'} />
                          <span>{lvl.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3-Step Setup Wizard Modal */}
      <AiSetupWizardModal
        isOpen={wizardOpen}
        department={selectedDeptForWizard}
        onClose={() => {
          setWizardOpen(false);
          setSelectedDeptForWizard(null);
        }}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}

