'use client';

import React from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  ChefHat,
  Clock,
  Flame,
  DollarSign,
  CheckCircle2,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export function RestaurantSection() {
  return (
    <div className="space-y-4">
      {/* 1. Main Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Spotlight Card: Live KDS Active Orders & Prep Velocity */}
        <div className="md:col-span-12 lg:col-span-7 workstation-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shadow-xs">
                <ChefHat size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Kitchen Display System (KDS)
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Live Prep Line &amp; Table Floor Management
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              13 ACTIVE TICKETS
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Daily Covers</span>
              <div className="text-xl font-mono font-extrabold text-amber-400 mt-0.5">248 Covers</div>
              <span className="text-[10px] text-zinc-500 font-mono">Lunch &amp; Dinner Service</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Table Utilization</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">82.4%</div>
              <span className="text-[10px] text-emerald-400 font-mono">28 / 34 Tables Seated</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Average Ticket</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">$68.50</div>
              <span className="text-[10px] text-emerald-400 font-mono">+12.5% Beverage Attach</span>
            </div>
          </div>

          {/* KDS Live Station Status */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-amber-400 shrink-0" />
              <span className="text-zinc-300">Station Throughput: Grill: 4m · Saute: 6m · Expo Pass: 1.5m (0 Bottlenecks)</span>
            </div>
            <Link
              href="/industry/restaurant"
              className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0 transition"
            >
              <span>Open KDS Screen</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 5 Cols: F&B Sub-Tiles */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Tile 1: Table Reservations */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={15} className="text-amber-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reservations</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Tonight
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">42 Bookings</span>
              <span className="text-[10px] font-mono text-zinc-400">94.8% Capacity Locked</span>
            </div>
            <Link href="/industry/restaurant" className="text-xs font-mono text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
              <span>Host Stand</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Food Cost Par Levels */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Food Cost %</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                28.4%
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Inventory Par Levels OK</span>
              <span className="text-[10px] font-mono text-zinc-500">Produce &amp; Proteins Replenished</span>
            </div>
            <Link href="/inventory" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Par Inventory</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: Omnichannel Delivery Feeds */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Delivery Hub</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                Live Sync
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">UberEats · DoorDash · Direct</span>
              <span className="text-[10px] font-mono text-zinc-500">6 Orders in Driver Route</span>
            </div>
            <Link href="/industry/restaurant" className="text-xs font-mono text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
              <span>Delivery Orders</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: Instant Table QR Pay */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">QR Table Pay</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Contactless
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">$4,890 Settled Today</span>
              <span className="text-[10px] font-mono text-zinc-500">Zero-Wait Checkout at Table</span>
            </div>
            <Link href="/qr-payments" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>QR Terminal</span> <ArrowRight size={11} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
