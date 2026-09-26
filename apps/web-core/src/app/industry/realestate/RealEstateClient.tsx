// apps/web-core/src/app/industry/realestate/RealEstateClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2,
  X,
  Building,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { MortgageAmortizationCalculator } from '@/components/industry/MortgageAmortizationCalculator';
import { UniversalDashboard } from '@/components/dashboard/UniversalDashboard';
import { getDashboardConfig } from '@/components/dashboard/dashboardConfig';
import { DashboardAttentionItem } from '@/components/dashboard/dashboard.types';
import { useIndustry } from '@/components/industry/IndustryContext';

export function RealEstateClient() {
  const { activeServiceIds } = useIndustry();
  const [mounted, setMounted] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [showings, setShowings] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    activeListingsCount: 0,
    totalListingVolume: 0,
    pendingDealsCount: 0,
    pendingDealsVolume: 0,
    totalCommissions: 0,
    scheduledShowings: 0,
  });
  const [role, setRole] = useState('admin');
  const [mode, setMode] = useState<'OPERATIONS' | 'ANALYTICS'>('OPERATIONS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newType, setNewType] = useState<'SINGLE_FAMILY' | 'CONDO' | 'COMMERCIAL' | 'PENTHOUSE'>('SINGLE_FAMILY');
  const [newBeds, setNewBeds] = useState('4');
  const [newBaths, setNewBaths] = useState('3.5');
  const [newSqft, setNewSqft] = useState('3200');

  const fetchRealEstateData = async () => {
    try {
      const res = await fetch('/api/niche/realestate');
      if (res.ok) {
        const json = await res.json();
        if (json.data?.properties) setProperties(json.data.properties);
        if (json.data?.showings) setShowings(json.data.showings);
        if (json.metrics) setMetrics(json.metrics);
      }
    } catch (e) {
      console.error('Failed to fetch real estate data:', e);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchRealEstateData();
  }, []);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    try {
      const res = await fetch('/api/niche/realestate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_property',
          payload: {
            title: newTitle,
            address: newAddress || '100 Sunset Blvd, Los Angeles, CA',
            price: parseFloat(newPrice) || 1200000,
            type: newType,
            beds: parseInt(newBeds) || 3,
            baths: parseFloat(newBaths) || 2,
            sqft: parseInt(newSqft) || 2400,
            agent: 'Sangram Cruze',
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.record) {
          setProperties((prev) => [json.record, ...prev]);
        }
        fetchRealEstateData();
      }
    } catch (err) {
      console.error('Create property failed:', err);
    }

    setIsModalOpen(false);
    setNewTitle('');
    setNewPrice('');
    setAlert(`Property "${newTitle}" published to MLS registry successfully!`);
    setTimeout(() => setAlert(null), 4000);
  };

  const handleAttentionAction = (item: DashboardAttentionItem) => {
    setAlert(`Opening detail review for attention item: "${item.title}".`);
    setTimeout(() => setAlert(null), 4000);
  };

  const dashboardConfig = getDashboardConfig(
    'realestate',
    role,
    mode,
    {
      data: { properties, showings, deals: metrics.deals || [] },
      metrics,
    },
    {
      onGeneralAction: (action) => {
        if (action === 'CREATE_LISTING') setIsModalOpen(true);
        else if (action === 'SCHEDULE_SHOWING') setIsModalOpen(true);
      },
    },
    activeServiceIds
  );

  return (
    <>
      <UniversalDashboard
        config={dashboardConfig}
        onRoleChange={setRole}
        onModeChange={setMode}
        onAttentionAction={handleAttentionAction}
        headerSlot={
          alert ? (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{alert}</span>
            </div>
          ) : null
        }
        customModals={
          <>
            {/* Create Listing Modal via Portal */}
            {mounted &&
              isModalOpen &&
              createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                  <div className="relative w-full max-w-lg bg-slate-950/90 border border-white/[0.12] rounded-3xl p-6 shadow-2xl space-y-5 backdrop-blur-2xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                            MLS LISTING REGISTRY
                          </span>
                          <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Publish New Listing</h2>
                          <p className="text-xs text-slate-400 font-medium">Add residential or commercial property to brokerage portfolio</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={handleCreateProperty} className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Property Title</label>
                        <div className="relative">
                          <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Waterfront Luxury Villa"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Street Address</label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="1200 Pacific Coast Hwy, Malibu, CA"
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Listing Price ($)</label>
                          <div className="relative">
                            <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="number"
                              required
                              placeholder="1250000"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono font-medium text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Property Type</label>
                          <select
                            value={newType}
                            onChange={(e: any) => setNewType(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                          >
                            <option value="SINGLE_FAMILY">Single Family</option>
                            <option value="CONDO">Luxury Condo</option>
                            <option value="PENTHOUSE">Penthouse</option>
                            <option value="COMMERCIAL">Commercial Office</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Beds</label>
                          <div className="relative">
                            <Bed size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="number"
                              value={newBeds}
                              onChange={(e) => setNewBeds(e.target.value)}
                              className="w-full pl-8 pr-2.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Baths</label>
                          <div className="relative">
                            <Bath size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="text"
                              value={newBaths}
                              onChange={(e) => setNewBaths(e.target.value)}
                              className="w-full pl-8 pr-2.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Sq Ft</label>
                          <div className="relative">
                            <Maximize2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="number"
                              value={newSqft}
                              onChange={(e) => setNewSqft(e.target.value)}
                              className="w-full pl-8 pr-2.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles size={13} />
                          <span>Publish Listing</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>,
                document.body
              )}

            {/* Mortgage Amortization & MLS Calculator */}
            <MortgageAmortizationCalculator />
          </>
        }
      />
    </>
  );
}
