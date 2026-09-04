'use client';

import React, { useState } from 'react';
import { UtensilsCrossed, Clock, CheckCircle2, Flame, Split, AlertCircle, Plus, Users, Percent, DollarSign } from 'lucide-react';

interface KitchenTicket {
  id: string;
  tableNumber: string;
  server: string;
  elapsedMinutes: number;
  items: Array<{ name: string; qty: number; note?: string }>;
  status: 'COOKING' | 'READY' | 'EXPEDITED';
}

const INITIAL_TICKETS: KitchenTicket[] = [];

export function KitchenDisplaySystem() {
  const [tickets, setTickets] = useState<KitchenTicket[]>(INITIAL_TICKETS);
  const [activeStation, setActiveStation] = useState('ALL');
  const [billTotal, setBillTotal] = useState<number>(0);
  const [splitGuests, setSplitGuests] = useState<number>(1);
  const [tipPercent, setTipPercent] = useState<number>(15);
  const [alert, setAlert] = useState<string | null>(null);

  const handleBumpTicket = (id: string) => {
    setTickets(tickets.filter((t) => t.id !== id));
    setAlert(`✅ Ticket ${id} bumped to Expedited/Served!`);
    setTimeout(() => setAlert(null), 3000);
  };

  const handleCreateTestTicket = () => {
    const newKOT: KitchenTicket = {
      id: `KOT-${Math.floor(100 + Math.random() * 900)}`,
      tableNumber: `Table ${Math.floor(1 + Math.random() * 12)}`,
      server: 'Floor Staff',
      elapsedMinutes: 1,
      items: [
        { name: 'Chef Special Main Course', qty: 2, note: 'Freshly Prepared' },
        { name: 'Beverage & Side Salad', qty: 2 },
      ],
      status: 'COOKING',
    };
    setTickets([...tickets, newKOT]);
    setAlert(`🔔 New Order ${newKOT.id} sent to Kitchen Display!`);
    setTimeout(() => setAlert(null), 3000);
  };

  const totalWithTip = billTotal * (1 + tipPercent / 100);
  const perGuest = splitGuests > 0 ? totalWithTip / splitGuests : totalWithTip;

  return (
    <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(245,158,11,0.15)] backdrop-blur-2xl space-y-6 text-white overflow-hidden">
      {/* Top Specular Glow Lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-500/10 blur-3xl rounded-full" />

      {/* Alert */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 relative z-10">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.08] pb-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[9px] font-black tracking-widest text-amber-300 uppercase">
                HOSPITALITY KDS
              </span>
            </div>
            <h3 className="font-bold text-base text-white tracking-tight mt-0.5">
              Live Kitchen Display System (KDS) & Floor Order Queue
            </h3>
            <span className="text-xs text-slate-400 font-medium">Live KOT Orders · Kitchen Stations & Course Routing</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreateTestTicket}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/25 cursor-pointer transition-all active:scale-[0.98] border border-amber-400/40"
          >
            <Plus size={14} />
            <span>Send New Order</span>
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-black/40 border border-white/[0.12] hover:border-amber-400/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-lg"
            >
              <div>
                <div className="flex justify-between items-start border-b border-white/[0.08] pb-3 mb-3">
                  <div>
                    <span className="font-mono font-black text-amber-400 text-sm">{ticket.id}</span>
                    <span className="text-xs text-white block font-bold">{ticket.tableNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {ticket.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 flex items-center gap-1 justify-end font-medium">
                      <Clock size={11} /> {ticket.elapsedMinutes}m ago
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {ticket.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-slate-200">
                      <div>
                        <span className="font-bold text-white mr-1.5">{item.qty}x</span>
                        <span className="font-medium">{item.name}</span>
                        {item.note && (
                          <span className="block text-[10px] text-amber-300 italic font-medium">Note: {item.note}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleBumpTicket(ticket.id)}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.98]"
              >
                Bump / Order Ready (Serve)
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-white/[0.08] rounded-2xl relative z-10">
          <UtensilsCrossed size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="font-bold text-slate-300">Kitchen Display is Clean & Ready</p>
          <p className="text-[11px] text-slate-500 mt-0.5">No pending food orders. New orders will appear live in this queue.</p>
        </div>
      )}

      {/* Multi-Guest Table Split-Bill POS Calculator */}
      <div className="p-5 bg-black/40 border border-white/[0.1] rounded-2xl space-y-4 relative z-10">
        <div className="flex items-center gap-2">
          <Split size={16} className="text-amber-400" />
          <h4 className="font-black text-xs uppercase tracking-wider text-amber-400">
            Table Split-Bill POS Calculator
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-xs">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Subtotal Bill ($)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="number"
                value={billTotal === 0 ? '' : billTotal}
                placeholder="0"
                onChange={(e) => setBillTotal(Number(e.target.value))}
                className="w-full pl-9 pr-3.5 py-2.5 bg-black/50 border border-white/[0.12] rounded-xl font-mono font-bold text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Tip Percentage (%)</label>
            <div className="relative">
              <Percent size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="number"
                value={tipPercent}
                onChange={(e) => setTipPercent(Number(e.target.value))}
                className="w-full pl-9 pr-3.5 py-2.5 bg-black/50 border border-white/[0.12] rounded-xl font-mono font-bold text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Number of Guests</label>
            <div className="relative">
              <Users size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="number"
                min="1"
                max="20"
                value={splitGuests}
                onChange={(e) => setSplitGuests(Number(e.target.value))}
                className="w-full pl-9 pr-3.5 py-2.5 bg-black/50 border border-white/[0.12] rounded-xl font-mono font-bold text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-amber-500/15 via-black/40 to-black/60 border border-amber-500/30 rounded-xl flex flex-col justify-center shadow-inner">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Split Per Guest</span>
            <span className="text-xl font-mono font-black text-amber-400">
              ${perGuest.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
