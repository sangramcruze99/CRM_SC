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
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#080d0b] flex flex-col">
      <AiNavigationTabs />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
              <Users size={28} className="text-emerald-500" />
              My AI Team
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Your intelligent digital employees. Configure responsibilities and how much autonomy each assistant has.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-400 uppercase tracking-wider">
              Autonomy Controls:
            </span>
            <span className="flex items-center gap-1 text-blue-600 font-medium">
              <Eye size={14} /> Recommend
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <Handshake size={14} /> Assist
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1 text-purple-600 font-medium">
              <Zap size={14} /> Autopilot
            </span>
          </div>
        </div>

        {/* Team Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 size={32} className="animate-spin text-emerald-500" />
            <span className="text-sm font-medium">Loading your AI team roster...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {team.map((dept) => {
              const Icon = DEPARTMENT_ICONS[dept.id] || Sparkles;
              const isUpdating = updatingDeptId === dept.id;

              return (
                <div
                  key={dept.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6 hover:border-slate-300 dark:hover:border-white/20 transition-all"
                >
                  {/* Department Title & Role */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${dept.avatarColor} flex items-center justify-center text-white shadow-md`}
                        >
                          <Icon size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                              {dept.name}
                            </h2>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 font-bold">
                              {dept.codename}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {dept.role}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDeptForWizard(dept);
                          setWizardOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
                      >
                        <Sliders size={13} />
                        <span>Setup Wizard</span>
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {dept.description}
                    </p>

                    {/* Today's Key Metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {dept.todayStats?.map((stat: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5"
                        >
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                            {stat.label}
                          </span>
                          <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Autonomy Level Control */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Autonomy Level
                      </span>
                      {isUpdating && <Loader2 size={14} className="animate-spin text-emerald-500" />}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'RECOMMEND', label: 'Recommend', icon: Eye, color: 'text-blue-600' },
                        { key: 'ASSIST', label: 'Assist', icon: Handshake, color: 'text-emerald-600' },
                        { key: 'AUTOPILOT', label: 'Autopilot', icon: Zap, color: 'text-purple-600' },
                      ].map((lvl) => {
                        const LvlIcon = lvl.icon;
                        const isSelected = dept.autonomy === lvl.key;

                        return (
                          <button
                            key={lvl.key}
                            onClick={() => handleAutonomyChange(dept.id, lvl.key as any)}
                            disabled={isUpdating}
                            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                              isSelected
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm'
                                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            <LvlIcon size={14} className={isSelected ? 'text-emerald-400' : lvl.color} />
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
      </main>

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
