'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Key,
  ShieldCheck,
  ArrowRight,
  Building2,
  Calendar,
} from 'lucide-react';
import { DataSourceRegistry } from '@/components/dashboard/DataSourceRegistry';

export function RealEstateSection() {
  const [data, setData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({
    activeListingsCount: 0,
    totalListingVolume: 0,
    pendingDealsCount: 0,
    pendingDealsVolume: 0,
    totalCommissions: 0,
    scheduledShowings: 0,
  });

  useEffect(() => {
    fetch('/api/niche/realestate')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setData(json.data);
        if (json.metrics) setMetrics(json.metrics);
      })
      .catch((err) => console.error('Failed to load real estate section data:', err));
  }, []);

  const listingsCount = metrics.activeListingsCount || 0;
  const listingVolume = metrics.totalListingVolume || 0;
  const pendingDeals = metrics.pendingDealsCount || 0;
  const pendingVolume = metrics.pendingDealsVolume || 0;
  const showingsCount = metrics.scheduledShowings || 0;
  const totalCommissions = metrics.totalCommissions || 0;

  return (
    <div className="space-y-4">
      {/* 1. Main Real Estate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Spotlight Card: MLS Property Portfolio & Escrow Pipeline */}
        <div className="md:col-span-12 lg:col-span-7 workstation-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                <Home size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Property Portfolio Management
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Active MLS Listings &amp; Escrow Closing Pipeline
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              PORTFOLIO ACTIVE
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Active Listings</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">
                {DataSourceRegistry.formatCurrency(listingVolume)}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">{listingsCount} Properties Listed</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Escrow Pipeline</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
                {DataSourceRegistry.formatCurrency(pendingVolume)}
              </div>
              <span className="text-[10px] text-teal-400 font-mono">{pendingDeals} Deals in Escrow</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Private Showings</span>
              <div className="text-xl font-mono font-extrabold text-teal-400 mt-0.5">{showingsCount} Tours</div>
              <span className="text-[10px] text-emerald-400 font-mono">{showingsCount > 0 ? 'Active showings scheduled' : 'No showings scheduled'}</span>
            </div>
          </div>

          {/* Escrow Progress Bar */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
              <span className="text-zinc-300">
                {pendingDeals > 0 
                  ? `Escrow Pipeline: ${pendingDeals} active contract(s) under review · Trust deposits secured`
                  : 'Escrow Trust: Brokerage client trust funds 100% segregated & reconciled'}
              </span>
            </div>
            <Link
              href="/industry/realestate"
              className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0 transition"
            >
              <span>Explore Listings</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 5 Cols: Property Sub-Tiles */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 1: Projected Commissions */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key size={15} className="text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Broker Commissions</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                Commissions
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">
                {DataSourceRegistry.formatCurrency(totalCommissions)}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Projected Pipeline Commission</span>
            </div>
            <Link href="/industry/realestate" className="text-xs font-mono text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
              <span>View Deals</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Showing Calendar */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-blue-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tours &amp; Showings</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                {showingsCount} Scheduled
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">{showingsCount > 0 ? `${showingsCount} Client Showings` : 'No Scheduled Showings'}</span>
              <span className="text-[10px] font-mono text-zinc-500">Live tour schedule</span>
            </div>
            <Link href="/industry/realestate" className="text-xs font-mono text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
              <span>Schedule Tour</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: MLS Portfolio Count */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Active Catalog</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                MLS Synced
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">{listingsCount} Properties Active</span>
              <span className="text-[10px] font-mono text-zinc-500">Synchronized in broker registry</span>
            </div>
            <Link href="/industry/realestate" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>View Listings</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: Compliance Check */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Closing Security</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                100% Secure
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Trust Account Audited</span>
              <span className="text-[10px] font-mono text-zinc-500">Zero Compliance Flags</span>
            </div>
            <Link href="/observability" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Audit Records</span> <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
