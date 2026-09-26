'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChefHat,
  Flame,
  ArrowRight,
  Clock,
  Layers,
  UtensilsCrossed,
} from 'lucide-react';
import { DataSourceRegistry } from '@/components/dashboard/DataSourceRegistry';

export function RestaurantSection() {
  const [data, setData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({
    totalTables: 8,
    occupiedTablesCount: 0,
    liveGrossSales: 0,
    pendingKitchenTickets: 0,
    lowParStockItems: 0,
  });

  useEffect(() => {
    fetch('/api/niche/restaurant')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setData(json.data);
        if (json.metrics) setMetrics(json.metrics);
      })
      .catch((err) => console.error('Failed to load restaurant section data:', err));
  }, []);

  const totalTables = metrics.totalTables || 8;
  const occupiedTables = metrics.occupiedTablesCount || 0;
  const liveSales = metrics.liveGrossSales || 0;
  const pendingTickets = metrics.pendingKitchenTickets || 0;
  const lowStock = metrics.lowParStockItems || 0;

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
              {pendingTickets > 0 ? `${pendingTickets} ACTIVE TICKETS` : 'LINE READY'}
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Live Floor Sales</span>
              <div className="text-xl font-mono font-extrabold text-amber-400 mt-0.5">
                {DataSourceRegistry.formatCurrency(liveSales)}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Open Tables Subtotal</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Floor Utilization</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
                {totalTables > 0 ? `${((occupiedTables / totalTables) * 100).toFixed(0)}%` : '0%'}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">{occupiedTables} / {totalTables} Tables Seated</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Active Kitchen Tickets</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">{pendingTickets} Tickets</div>
              <span className="text-[10px] text-emerald-400 font-mono">{pendingTickets > 0 ? 'Orders in prep' : 'Kitchen pass clear'}</span>
            </div>
          </div>

          {/* KDS Live Station Status */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-amber-400 shrink-0" />
              <span className="text-zinc-300">
                {pendingTickets > 0 
                  ? `Station Throughput: ${pendingTickets} kitchen ticket(s) currently expedited on prep line` 
                  : 'Floor State: Dining floor stations ready · POS terminals synchronized'}
              </span>
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

        {/* Right 5 Cols: Restaurant Sub-Tiles */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 1: Seated Tables */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={15} className="text-amber-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dining Tables</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Floor Map
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">{occupiedTables} Seated</span>
              <span className="text-[10px] font-mono text-zinc-400">{Math.max(0, totalTables - occupiedTables)} Tables Available</span>
            </div>
            <Link href="/industry/restaurant" className="text-xs font-mono text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
              <span>Floor Management</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Active KOT Queue */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-orange-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Active KOT Tickets</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                {pendingTickets} Prep
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">{pendingTickets > 0 ? `${pendingTickets} Tickets Cooking` : 'Zero Backlogged Tickets'}</span>
              <span className="text-[10px] font-mono text-zinc-500">Expedite queue</span>
            </div>
            <Link href="/industry/restaurant" className="text-xs font-mono text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1">
              <span>View KOT Board</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: Low Par Stock Items */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-yellow-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pantry Par Stock</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                Inventory
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">{lowStock > 0 ? `${lowStock} Items Below Par` : 'All Stock Healthy'}</span>
              <span className="text-[10px] font-mono text-zinc-500">Kitchen pantry par level</span>
            </div>
            <Link href="/industry/restaurant" className="text-xs font-mono text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-1">
              <span>Manage Menu</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: POS Billing & Settlement */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">POS Checkout</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Split-Bill &amp; Cashier Ready</span>
              <span className="text-[10px] font-mono text-zinc-500">Automated guest receipt generation</span>
            </div>
            <Link href="/industry/restaurant" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Checkout Screen</span> <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
