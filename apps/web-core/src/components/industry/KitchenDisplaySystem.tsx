'use client';

import React, { useState } from 'react';
import { UtensilsCrossed, Clock, CheckCircle2, Flame, Split, AlertCircle, Plus } from 'lucide-react';

interface KitchenTicket {
  id: string;
  tableNumber: string;
  server: string;
  elapsedMinutes: number;
  items: Array<{ name: string; qty: number; note?: string }>;
  status: 'COOKING' | 'READY' | 'EXPEDITED';
}

const INITIAL_TICKETS: KitchenTicket[] = [
  {
    id: 'KOT-402',
    tableNumber: 'Table 4 (VIP Booth)',
    server: 'Isabella C.',
    elapsedMinutes: 8,
    items: [
      { name: 'Pan-Seared Duck Breast with Cherry Glaze', qty: 2, note: 'Medium Rare' },
      { name: 'Truffle & Wild Mushroom Risotto', qty: 1, note: 'Extra Parmesan' },
    ],
    status: 'COOKING',
  },
  {
    id: 'KOT-403',
    tableNumber: 'Table 8',
    server: 'Zoe K.',
    elapsedMinutes: 14,
    items: [
      { name: 'Dry-Aged Wagyu Ribeye Steak (12oz)', qty: 1, note: 'Rare' },
      { name: 'Lobster Bisque & Warm Sourdough', qty: 2 },
    ],
    status: 'COOKING',
  },
  {
    id: 'KOT-404',
    tableNumber: 'Table 2 (Patio)',
    server: 'Isabella C.',
    elapsedMinutes: 3,
    items: [
      { name: 'Artisanal Charcuterie Board', qty: 1 },
      { name: 'Burrata with Heirloom Tomatoes', qty: 1 },
    ],
    status: 'COOKING',
  },
];

export function KitchenDisplaySystem() {
  const [tickets, setTickets] = useState<KitchenTicket[]>(INITIAL_TICKETS);
  const [activeStation, setActiveStation] = useState('ALL');
  const [billTotal, setBillTotal] = useState<number>(385.0);
  const [splitGuests, setSplitGuests] = useState<number>(4);
  const [tipPercent, setTipPercent] = useState<number>(20);
  const [alert, setAlert] = useState<string | null>(null);

  const handleBumpTicket = (id: string) => {
    setTickets(tickets.filter((t) => t.id !== id));
    setAlert(`🔔 Ticket #${id} BUMPED! Order dispatched to expedite station.`);
    setTimeout(() => setAlert(null), 3000);
  };

  const tipAmount = (billTotal * tipPercent) / 100;
  const grandTotal = billTotal + tipAmount;
  const perGuest = splitGuests > 0 ? grandTotal / splitGuests : grandTotal;

  return (
    <div className="bg-white/[0.04] backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6 text-white">
      {/* Alert */}
      {alert && (
        <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Kitchen Display System (KDS) & Multi-Guest Split POS</h3>
            <span className="text-xs text-slate-400">Live Kitchen Bump Bar · Line Cooks Telemetry</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs rounded-full border border-emerald-500/30">
            {tickets.length} Active Tickets in Kitchen
          </span>
        </div>
      </div>

      {/* KDS Live Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="p-5 bg-white/[0.03] border border-amber-500/40 rounded-2xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="font-mono font-extrabold text-amber-400 text-sm">{ticket.id}</span>
                <span className="flex items-center gap-1 text-xs font-mono font-bold text-rose-400">
                  <Clock size={12} /> {ticket.elapsedMinutes} min
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold text-white">{ticket.tableNumber}</span>
                <span className="text-slate-400">Server: {ticket.server}</span>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 pt-2">
                {ticket.items.map((item, idx) => (
                  <div key={idx} className="p-2 bg-white/[0.04] rounded-xl text-xs">
                    <div className="flex justify-between font-bold text-white">
                      <span>{item.name}</span>
                      <span className="text-amber-400 font-mono font-extrabold">x{item.qty}</span>
                    </div>
                    {item.note && (
                      <span className="text-[10px] text-amber-300/80 font-medium block mt-0.5">
                        Note: {item.note}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleBumpTicket(ticket.id)}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer"
            >
              Bump / Order Ready (Serve)
            </button>
          </div>
        ))}
      </div>

      {/* Multi-Guest Table Split-Bill POS Calculator */}
      <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Split size={16} className="text-amber-400" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">
            Table Split-Bill POS Calculator
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Subtotal Bill ($)</label>
            <input
              type="number"
              value={billTotal}
              onChange={(e) => setBillTotal(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl font-mono font-bold text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Tip Percentage (%)</label>
            <input
              type="number"
              value={tipPercent}
              onChange={(e) => setTipPercent(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl font-mono font-bold text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Number of Guests</label>
            <input
              type="number"
              min="1"
              max="20"
              value={splitGuests}
              onChange={(e) => setSplitGuests(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl font-mono font-bold text-white"
            />
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Split Per Guest</span>
            <span className="text-lg font-mono font-extrabold text-amber-400">
              ${perGuest.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
