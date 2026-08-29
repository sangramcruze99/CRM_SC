'use client';

import { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Users,
  DollarSign,
  ChefHat,
  Zap,
  CheckCircle2,
  Flame,
  Check,
} from 'lucide-react';
import { KitchenDisplaySystem } from '@/components/industry/KitchenDisplaySystem';

interface DiningTable {
  id: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILLING';
  guestName?: string;
  partySize?: number;
  currentBill: number;
  seatedAt?: string;
  server: string;
}

interface KitchenOrder {
  id: string;
  table: string;
  items: string[];
  status: 'COOKING' | 'READY' | 'EXPEDITED';
  elapsedMins: number;
  specialInstructions?: string;
}

const initialTables: DiningTable[] = [
  { id: 'T-01', tableNumber: 'Table 1', capacity: 2, status: 'OCCUPIED', guestName: 'Miller (Anniversary)', partySize: 2, currentBill: 142.50, seatedAt: '45 mins ago', server: 'Marco' },
  { id: 'T-02', tableNumber: 'Table 2', capacity: 4, status: 'AVAILABLE', currentBill: 0, server: 'Elena' },
  { id: 'T-03', tableNumber: 'Table 3', capacity: 6, status: 'OCCUPIED', guestName: 'Apex Tech Dinner', partySize: 6, currentBill: 380.00, seatedAt: '1h 10m ago', server: 'Elena' },
  { id: 'T-04', tableNumber: 'Booth 1', capacity: 4, status: 'RESERVED', guestName: 'Sophia Jenkins (8:00 PM)', currentBill: 0, server: 'Marco' },
  { id: 'T-05', tableNumber: 'Booth 2', capacity: 4, status: 'BILLING', guestName: 'Dr. David Cho', partySize: 3, currentBill: 215.00, seatedAt: '1h 30m ago', server: 'Leo' },
  { id: 'T-06', tableNumber: 'Patio 1', capacity: 4, status: 'AVAILABLE', currentBill: 0, server: 'Leo' },
];

const initialKitchenOrders: KitchenOrder[] = [
  { id: 'KOT-104', table: 'Table 1', items: ['1x Wagyu Ribeye (Med Rare)', '1x Truffle Risotto', '2x Chianti Classico'], status: 'COOKING', elapsedMins: 14, specialInstructions: 'Gluten Allergy on Risotto' },
  { id: 'KOT-105', table: 'Table 3', items: ['2x Burrata Salad', '1x Lobster Tail Tagliatelle', '2x Prime Filet Mignon'], status: 'COOKING', elapsedMins: 8 },
  { id: 'KOT-106', table: 'Booth 2', items: ['1x Chocolate Soufflé Tart', '2x Espresso Doppio'], status: 'READY', elapsedMins: 22 },
];

export function RestaurantClient() {
  const [tables, setTables] = useState<DiningTable[]>(initialTables);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>(initialKitchenOrders);
  const [alert, setAlert] = useState<string | null>(null);

  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILLING').length;
  const totalFloorRevenue = tables.reduce((acc, t) => acc + t.currentBill, 0);

  const handleTableStatusChange = (tableId: string, newStatus: DiningTable['status']) => {
    setTables(
      tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: newStatus,
              guestName: newStatus === 'AVAILABLE' ? undefined : t.guestName || 'Walk-in Guests',
              currentBill: newStatus === 'AVAILABLE' ? 0 : t.currentBill || 55.0,
            }
          : t
      )
    );
    setAlert(`Table ${tableId} updated to ${newStatus}`);
    setTimeout(() => setAlert(null), 3000);
  };

  const handleOrderMarkReady = (kotId: string) => {
    setKitchenOrders(
      kitchenOrders.map((k) => (k.id === kotId ? { ...k, status: 'READY' } : k))
    );
    setAlert(`🍽️ Order ${kotId} marked as READY for server expediters!`);
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
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
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              HOSPITALITY & RESTAURANT POS
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 mt-1">
            <UtensilsCrossed className="text-amber-400" size={24} />
            Restaurant, Café & Floor Plan Management OS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visual table floor management, live kitchen order tickets (KOT) queue, server delegation, and instant bill generation.
          </p>
        </div>
      </div>

      {/* Restaurant KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Floor Occupancy</span>
            <Users size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {occupiedCount} / {tables.length} Tables
          </div>
          <div className="text-xs text-amber-400 mt-2 font-bold">{Math.round((occupiedCount / tables.length) * 100)}% Capacity Seated</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Tables Revenue</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            ${totalFloorRevenue.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Unsettled live dining tabs</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kitchen Queue (KOT)</span>
            <ChefHat size={18} className="text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {kitchenOrders.length} Active
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Avg prep time: 16 mins</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Table QR Turnover</span>
            <Zap size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">4.2 min</div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">Fastest contactless settlement</div>
        </div>
      </div>

      {/* Main Floor Plan Layout & Kitchen Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Visual Floor Plan (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Main Dining Room Floor Plan
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Click any table to manage status or settle bill</span>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ● Available
                </span>
                <span className="flex items-center gap-1 text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                  ● Occupied
                </span>
                <span className="flex items-center gap-1 text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30">
                  ● Reserved
                </span>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tables.map((t) => {
                const isOccupied = t.status === 'OCCUPIED' || t.status === 'BILLING';
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      t.status === 'AVAILABLE'
                        ? 'border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400/60'
                        : t.status === 'OCCUPIED'
                        ? 'border-amber-500/30 bg-amber-500/10 hover:border-amber-400/60'
                        : t.status === 'BILLING'
                        ? 'border-rose-500/30 bg-rose-500/10 hover:border-rose-400/60'
                        : 'border-purple-500/30 bg-purple-500/10 hover:border-purple-400/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-extrabold text-base text-white font-mono">{t.tableNumber}</span>
                        <span className="text-[10px] text-slate-400 font-medium block">Seats {t.capacity}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          t.status === 'AVAILABLE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : t.status === 'OCCUPIED'
                            ? 'bg-amber-500/20 text-amber-300'
                            : t.status === 'BILLING'
                            ? 'bg-rose-500/20 text-rose-300 animate-pulse'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      {isOccupied ? (
                        <>
                          <p className="font-bold text-white truncate">{t.guestName}</p>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">{t.seatedAt}</span>
                            <span className="font-mono font-extrabold text-emerald-400">
                              ${t.currentBill.toFixed(2)}
                            </span>
                          </div>
                        </>
                      ) : t.status === 'RESERVED' ? (
                        <p className="font-semibold text-purple-300 text-[11px] line-clamp-2">{t.guestName}</p>
                      ) : (
                        <p className="text-slate-500 text-[11px]">Ready for seating</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-1">
                      <button
                        onClick={() => handleTableStatusChange(t.id, t.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE')}
                        className="w-full py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-[10px] font-bold text-slate-200 transition-colors cursor-pointer"
                      >
                        {t.status === 'AVAILABLE' ? 'Seat Guests' : 'Clear & Reset'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Kitchen Order Tickets (KOT) Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="flex items-center gap-1.5">
                <Flame size={14} className="text-rose-400" />
                <span>Live Kitchen Order Tickets (KOT)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Station 1</span>
            </h3>

            <div className="space-y-3">
              {kitchenOrders.map((kot) => (
                <div
                  key={kot.id}
                  className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                        {kot.id}
                      </span>
                      <span className="font-extrabold text-xs text-white font-mono">
                        Table {kot.table}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        kot.status === 'READY'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {kot.status} · {kot.elapsedMins}m
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    {kot.items.map((item, idx) => (
                      <div key={idx} className="font-medium text-slate-200">
                        • {item}
                      </div>
                    ))}
                  </div>

                  {kot.specialInstructions && (
                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/30 text-[10px] font-semibold text-amber-300">
                      ⚠️ Note: {kot.specialInstructions}
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/[0.06] flex justify-end">
                    {kot.status !== 'READY' ? (
                      <button
                        onClick={() => handleOrderMarkReady(kot.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={12} />
                        <span>Mark Dish Ready</span>
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-xs font-bold">Ready for Server Pickup ✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Kitchen Display System & Table Split Calculator */}
      <KitchenDisplaySystem />
    </div>
  );
}
