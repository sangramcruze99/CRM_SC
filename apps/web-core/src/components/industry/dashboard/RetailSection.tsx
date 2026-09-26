'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Scan,
  CreditCard,
  Layers,
  ArrowRight,
  Barcode,
} from 'lucide-react';
import { DataSourceRegistry } from '@/components/dashboard/DataSourceRegistry';

export function RetailSection() {
  const [data, setData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({
    totalProducts: 0,
    todayReceiptsCount: 0,
    totalSalesRevenue: 0,
    khataOutstandingDues: 0,
    lowStockSkus: 0,
  });

  useEffect(() => {
    fetch('/api/niche/retail')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setData(json.data);
        if (json.metrics) setMetrics(json.metrics);
      })
      .catch((err) => console.error('Failed to load retail section data:', err));
  }, []);

  const totalSales = metrics.totalSalesRevenue || 0;
  const receiptsCount = metrics.todayReceiptsCount || 0;
  const productsCount = metrics.totalProducts || 0;
  const khataDues = metrics.khataOutstandingDues || 0;
  const lowStock = metrics.lowStockSkus || 0;

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
              REGISTER ONLINE
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Daily Gross POS</span>
              <div className="text-xl font-mono font-extrabold text-teal-400 mt-0.5">
                {DataSourceRegistry.formatCurrency(totalSales)}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">{receiptsCount} Transactions</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">In-Stock Catalog</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
                {productsCount} SKUs
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">{lowStock > 0 ? `${lowStock} Low Stock Alert(s)` : 'All SKUs In Stock'}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Khata Receivables</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">
                {DataSourceRegistry.formatCurrency(khataDues)}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Store credit ledger</span>
            </div>
          </div>

          {/* Barcode & Inventory Status Bar */}
          <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Scan size={15} className="text-teal-400 shrink-0" />
              <span className="text-zinc-300">
                {receiptsCount > 0 
                  ? `POS Activity: ${receiptsCount} receipt(s) settled today · Thermal receipts & barcode tags verified`
                  : 'Scanner Fleet: Barcode imagers paired & ready · Cash drawer connected'}
              </span>
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
          {/* Tile 1: Khata Accounts */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={15} className="text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Khata Ledger</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                Accounts
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">
                {DataSourceRegistry.formatCurrency(khataDues)}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Total Credit Due</span>
            </div>
            <Link href="/industry/retail" className="text-xs font-mono text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
              <span>View Ledger</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Thermal Barcode Printer */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Barcode Tags</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Thermal
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">{productsCount} Barcode SKUs Active</span>
              <span className="text-[10px] font-mono text-zinc-500">EAN-13 &amp; Code-128 Ready</span>
            </div>
            <Link href="/industry/retail" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>Print Barcodes</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: Low Stock Alerts */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-amber-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Stock Warnings</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Restock
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">{lowStock > 0 ? `${lowStock} SKUs Under Safety Level` : 'Safety Stock Safe'}</span>
              <span className="text-[10px] font-mono text-zinc-500">Auto PO generation</span>
            </div>
            <Link href="/industry/retail" className="text-xs font-mono text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
              <span>Restock Catalog</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: Register Hardware */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Register Hardware</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Paired
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Stripe Terminal &amp; ESC/POS</span>
              <span className="text-[10px] font-mono text-zinc-500">Thermal receipt engine ready</span>
            </div>
            <Link href="/industry/retail" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Open POS</span> <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
