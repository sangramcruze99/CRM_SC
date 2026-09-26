'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  HeartPulse,
  Bed,
  UserCheck,
  Pill,
  FileText,
  Clock,
  AlertTriangle,
  ArrowRight,
  Activity,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';

export function HospitalSection() {
  return (
    <div className="space-y-4">
      {/* 1. Main Clinical Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Spotlight Card: Inpatient Bed & Ward Capacity */}
        <div className="md:col-span-12 lg:col-span-7 workstation-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-teal-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold shadow-xs">
                <HeartPulse size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Clinical Ward Operations
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Hospital Bed Capacity &amp; Emergency Triage
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              LIVE TRIAGE
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Bed Occupancy</span>
              <div className="text-xl font-mono font-extrabold text-blue-400 mt-0.5">84.2%</div>
              <span className="text-[10px] text-zinc-500 font-mono">168 / 200 Beds Occupied</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">ICU Availability</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">6 Free</div>
              <span className="text-[10px] text-zinc-500 font-mono">18 / 24 ICU Beds Active</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">ER Wait Time</span>
              <div className="text-xl font-mono font-extrabold text-teal-400 mt-0.5">8.4 mins</div>
              <span className="text-[10px] text-emerald-400 font-mono">Optimal Velocity</span>
            </div>
          </div>

          {/* Emergency Triage Status Bar */}
          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-400 shrink-0" />
              <span className="text-zinc-300">Emergency Queue: 12 Admitted · 3 Level-1 Critical Under Physician Care</span>
            </div>
            <Link
              href="/industry/hospital"
              className="text-xs font-mono font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0 transition"
            >
              <span>View Floor Map</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 5 Cols: Clinical Sub-Tiles */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Tile 1: Digital Rx Prescriptions */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill size={15} className="text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Digital Rx Vault</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                Verified
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">142 Prescriptions</span>
              <span className="text-[10px] font-mono text-zinc-400">Dispensed Today (0 Errors)</span>
            </div>
            <Link href="/industry/hospital" className="text-xs font-mono text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
              <span>Issue Digital Rx</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Doctor On-Call Roster */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope size={15} className="text-blue-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Doctor Roster</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                14 On Duty
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Cardiology &amp; Trauma Ready</span>
              <span className="text-[10px] font-mono text-zinc-500">2 Specialists on Tele-Consult</span>
            </div>
            <Link href="/directory" className="text-xs font-mono text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
              <span>Physician Roster</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: Pathology & Lab Orders */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Lab Diagnostics</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Automated
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">34 Lab Panels Completed</span>
              <span className="text-[10px] font-mono text-zinc-500">Auto-synced to Patient Chart</span>
            </div>
            <Link href="/documents" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>Diagnostic Vault</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: HIPAA Compliance Gate */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">HIPAA Isolation</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                100% Secure
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">End-to-End Encryption</span>
              <span className="text-[10px] font-mono text-zinc-500">Zero Patient Data Leakage</span>
            </div>
            <Link href="/observability" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Security Audit</span> <ArrowRight size={11} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
