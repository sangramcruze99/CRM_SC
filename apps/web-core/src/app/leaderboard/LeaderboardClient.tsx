'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Award,
  TrendingUp,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Zap,
  Users,
  ShieldCheck,
  ArrowUpRight,
  Flame,
  Star,
  Percent,
} from 'lucide-react';
import Link from 'next/link';

interface SalesRepPerformance {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  jobTitle: string;
  revenueBooked: number;
  quotaTarget: number;
  dealsClosed: number;
  commissionRate: number;
  earnedCommission: number;
  badge: string;
}

const INITIAL_REPS: SalesRepPerformance[] = [
  {
    id: 'rep_01',
    rank: 1,
    name: 'Sophia Martinez',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'VP of Enterprise Sales',
    revenueBooked: 345000,
    quotaTarget: 250000,
    dealsClosed: 14,
    commissionRate: 6.5,
    earnedCommission: 22425,
    badge: '🏆 President Club Winner',
  },
  {
    id: 'rep_02',
    rank: 2,
    name: 'Liam Zhang',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Senior Account Executive',
    revenueBooked: 218000,
    quotaTarget: 200000,
    dealsClosed: 9,
    commissionRate: 5.0,
    earnedCommission: 10900,
    badge: '🥈 Top Deal Closer',
  },
  {
    id: 'rep_03',
    rank: 3,
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Solutions Architect & Closer',
    revenueBooked: 165000,
    quotaTarget: 180000,
    dealsClosed: 6,
    commissionRate: 4.5,
    earnedCommission: 7425,
    badge: '🥉 Velocity Master',
  },
  {
    id: 'rep_04',
    rank: 4,
    name: 'Marcus Brody',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Account Executive',
    revenueBooked: 112000,
    quotaTarget: 150000,
    dealsClosed: 5,
    commissionRate: 4.0,
    earnedCommission: 4480,
    badge: '⭐ Fast Riser',
  },
];

export function LeaderboardClient() {
  const [reps, setReps] = useState<SalesRepPerformance[]>(INITIAL_REPS);
  const [alert, setAlert] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const totalRevenue = reps.reduce((acc, curr) => acc + curr.revenueBooked, 0);
  const totalCommissions = reps.reduce((acc, curr) => acc + curr.earnedCommission, 0);

  const handleSyncToPayroll = () => {
    setAlert(
      `🎉 Successfully synchronized $${totalCommissions.toLocaleString()} in sales commissions directly into Employee Salary Payslips at /directory!`
    );
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCelebrate = () => {
    setShowCelebration(true);
    setAlert('🎉 Deal Closed Won Celebration Triggered! Confetti & Leaderboard updated.');
    setTimeout(() => {
      setShowCelebration(false);
      setAlert(null), 4000;
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white relative">
      {/* Celebration Banner */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="p-6 bg-amber-500/90 text-slate-950 rounded-3xl font-extrabold text-2xl shadow-2xl animate-bounce backdrop-blur-md">
            🎊 NEW DEAL CLOSED WON! +$48,000 ARR 🎊
          </div>
        </div>
      )}

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
            <Trophy className="text-amber-400" size={24} />
            Gamified Sales Leaderboards & Commission Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time quota tracking, rep revenue podiums, accelerator bonuses, and automated payroll sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCelebrate}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-amber-300 rounded-xl text-xs font-bold border border-white/[0.1] flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>Simulate Win 🎉</span>
          </button>

          <button
            type="button"
            onClick={handleSyncToPayroll}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <DollarSign size={14} />
            <span>Sync Commissions to Payroll (${totalCommissions.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Revenue Closed</span>
            <DollarSign size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-400">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">34 Closed-Won Enterprise Deals</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Earned Rep Commissions</span>
            <Percent size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400">
            ${totalCommissions.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Ready for August Payroll Run</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Quota Attainment</span>
            <Flame size={16} className="text-orange-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">108.4%</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Team Target: $780,000</div>
        </div>
      </div>

      {/* Top 3 Rep Podium Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        {reps.slice(0, 3).map((rep) => {
          const attainment = Math.round((rep.revenueBooked / rep.quotaTarget) * 100);
          return (
            <div
              key={rep.id}
              className={`p-6 rounded-3xl border backdrop-blur-2xl transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 relative flex flex-col justify-between ${
                rep.rank === 1
                  ? 'bg-gradient-to-tr from-amber-500/20 via-white/[0.04] to-orange-500/15 border-amber-500/60 ring-2 ring-amber-500/20 shadow-orange-500/20'
                  : rep.rank === 2
                  ? 'bg-white/[0.04] border-slate-400/40'
                  : 'bg-white/[0.04] border-amber-700/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/[0.08] text-amber-300 border border-white/10 font-mono">
                  Rank #{rep.rank}
                </span>
                <span className="text-xs font-mono font-extrabold text-emerald-400">
                  {attainment}% Quota
                </span>
              </div>

              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative">
                  <img
                    src={rep.avatar}
                    alt={rep.name}
                    className="w-18 h-18 rounded-2xl object-cover border-2 border-amber-500 shadow-lg shadow-orange-500/25"
                  />
                  <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-slate-950 border border-amber-500 text-amber-400">
                    <Trophy size={14} />
                  </div>
                </div>

                <h3 className="font-bold text-base text-white">{rep.name}</h3>
                <span className="text-xs text-slate-400 font-medium">{rep.jobTitle}</span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {rep.badge}
                </span>
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Revenue Booked</span>
                  <span className="font-mono font-bold text-white">${rep.revenueBooked.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Earned Commission</span>
                  <span className="font-mono font-extrabold text-amber-400">${rep.earnedCommission.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Full Team Sales & Commission Standings</h3>
          <span className="text-xs text-slate-400">August 2026 Fiscal Cycle</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white/[0.02] text-slate-400 uppercase font-semibold tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="px-6 py-4">Rank & Sales Rep</th>
                <th className="px-6 py-4">Deals Won</th>
                <th className="px-6 py-4">Quota Target</th>
                <th className="px-6 py-4">Revenue Booked</th>
                <th className="px-6 py-4">Commission Rate</th>
                <th className="px-6 py-4">Earned Commission</th>
                <th className="px-6 py-4 text-right">Payroll Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {reps.map((rep) => (
                <tr key={rep.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-mono font-bold text-amber-400 text-sm">
                        #{rep.rank}
                      </span>
                      <img src={rep.avatar} alt={rep.name} className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-white text-sm block">{rep.name}</span>
                        <span className="text-[11px] text-slate-400">{rep.jobTitle}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-white">{rep.dealsClosed} Deals</td>
                  <td className="px-6 py-4 font-mono text-slate-300">${rep.quotaTarget.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono font-bold text-white">${rep.revenueBooked.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-amber-400 font-bold">{rep.commissionRate}%</td>
                  <td className="px-6 py-4 font-mono font-extrabold text-sm text-emerald-400">
                    ${rep.earnedCommission.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href="/directory"
                      className="px-3 py-1.5 bg-white/[0.06] hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-xl text-xs font-bold transition-all border border-white/[0.1] inline-block"
                    >
                      View in Payslip →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
