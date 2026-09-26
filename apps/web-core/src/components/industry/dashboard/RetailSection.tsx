'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Scan,
  Printer,
  Layers,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Barcode,
} from 'lucide-react';

export function RetailSection() {
  return (
    <div className="space-y-4">
      {/* 1. Main Retail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Spotlight Card: POS Terminal & Register Revenue */}
        <div className="md:col-span-12 lg:col-span-7 workstation-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold shadow-xs">
                <ShoppingBag size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Omnichannel POS &amp; Inventory
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Point of Sale Registers &amp; Live Barcode Ingestion
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              2 REGISTERS LIVE
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Daily Gross POS</span>
              <div className="text-xl font-mono font-extrabold text-teal-400 mt-0.5">$14,820.00</div>
              <span className="text-[10px] text-zinc-500 font-mono">184 Transactions</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">In-Stock Catalog</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">2,480 SKUs</div>
              <span className="text-[10px] text-emerald-400 font-mono">98.6% In Stock</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Avg Basket Value</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">$80.54</div>
              <span className="text-[10px] text-emerald-400 font-mono">+8.4% vs Last Week</span>
            </div>
          </div>

          {/* Barcode & Inventory Status Bar */}
          <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Scan size={15} className="text-teal-400 shrink-0" />
              <span className="text-zinc-300">Scanner Fleet: USB &amp; Bluetooth Barcode Imagers Paired · Fast SKU Lookup</span>
            </div>
            <Link
              href="/industry/retail"
              className="text-xs font-mono font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 shrink-0 transition"
            >
              <span>Launch POS Client</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 5 Cols: Retail Sub-Tiles */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Tile 1: Barcode Label Maker */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer size={15} className="text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Barcode Printer</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                Thermal
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">SKU &amp; Shelf Labels</span>
              <span className="text-[10px] font-mono text-zinc-400">UPC-A, EAN-13, Code 128 Ready</span>
            </div>
            <Link href="/industry/retail" className="text-xs font-mono text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
              <span>Print Barcodes</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Low-Stock Reorder Alarms */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reorder Alarms</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                6 Low SKUs
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Below Par Safety Threshold</span>
              <span className="text-[10px] font-mono text-zinc-500">Auto-PO drafted for supplier</span>
            </div>
            <Link href="/inventory" className="text-xs font-mono text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
              <span>Inventory POs</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: Omnichannel Shopify Ingestion */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Web Fulfillment</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Sync 100%
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">38 Online Orders Staged</span>
              <span className="text-[10px] font-mono text-zinc-500">In-Store Pickup &amp; Courier Dispatch</span>
            </div>
            <Link href="/industry/retail" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Fulfillment Queue</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: Daily Cash Register Drawers */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Register Cash</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Tender Rec
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">$2,450 Opening Float</span>
              <span className="text-[10px] font-mono text-zinc-500">Shift End Zero Discrepancy</span>
            </div>
            <Link href="/banking" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>Till Reconciliation</span> <ArrowRight size={11} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
