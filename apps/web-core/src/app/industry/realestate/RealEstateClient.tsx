'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Home,
  Plus,
  DollarSign,
  Users,
  Calendar,
  Search,
  CheckCircle2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  FileSignature,
  X,
  Sparkles,
  Building,
  FileText,
} from 'lucide-react';
import { MortgageAmortizationCalculator } from '@/components/industry/MortgageAmortizationCalculator';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: 'SINGLE_FAMILY' | 'CONDO' | 'COMMERCIAL' | 'PENTHOUSE';
  beds: number;
  baths: number;
  sqft: number;
  status: 'ACTIVE' | 'PENDING' | 'CLOSED';
  imageUrl: string;
  matchedBuyers: number;
  agent: string;
}

const initialProperties: Property[] = [];
const initialShowings: any[] = [];

export function RealEstateClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [showings, setShowings] = useState(initialShowings);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newType, setNewType] = useState<'SINGLE_FAMILY' | 'CONDO' | 'COMMERCIAL' | 'PENTHOUSE'>('SINGLE_FAMILY');
  const [newBeds, setNewBeds] = useState('4');
  const [newBaths, setNewBaths] = useState('3.5');
  const [newSqft, setNewSqft] = useState('3200');

  const totalListingVolume = properties.reduce((acc, p) => acc + p.price, 0);

  const filtered = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase()) ||
      p.agent.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const newProp: Property = {
      id: `PROP-${Math.floor(705 + Math.random() * 50)}`,
      title: newTitle,
      address: newAddress || '100 Sunset Blvd, Los Angeles, CA',
      price: parseFloat(newPrice) || 1200000,
      type: newType,
      beds: parseInt(newBeds) || 3,
      baths: parseFloat(newBaths) || 2,
      sqft: parseInt(newSqft) || 2400,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      matchedBuyers: Math.floor(4 + Math.random() * 15),
      agent: 'Sangram Cruze',
    };

    setProperties([newProp, ...properties]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewPrice('');
    setAlert(`🏡 Listing "${newTitle}" published to brokerage MLS!`);
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              REAL ESTATE BROKERAGE CRM
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 mt-1">
            <Home className="text-emerald-600 dark:text-emerald-400" size={24} />
            Properties, MLS Inventory & Deal Escrow
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage high-value luxury listings, automated buyer-to-property matchmaking, site showings, and digital escrow closing pipelines.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={15} />
          <span>Add Property Listing</span>
        </button>
      </div>

      {/* Real Estate KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Inventory Volume</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            ${(totalListingVolume / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">{properties.length} Exclusive Properties</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Escrow Closings</span>
            <FileSignature size={18} className="text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">$1.89M</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Est. Commission: $56,700</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Buyer Matchmaker</span>
            <Users size={18} className="text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">41 Buyers</div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">Auto-matched with MLS inventory</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Showings This Week</span>
            <Calendar size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">18 Showings</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">6 Open Houses scheduled</div>
        </div>
      </div>

      {/* Properties Grid & Showings Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Properties Listings Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by address, agent, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-white/[0.08] font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((prop) => (
              <div
                key={prop.id}
                className="bg-white/95 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 rounded-3xl overflow-hidden shadow-md dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md ${
                        prop.status === 'ACTIVE'
                          ? 'bg-emerald-500/90 text-slate-950'
                          : 'bg-amber-500/90 text-slate-950'
                      }`}
                    >
                      {prop.status === 'ACTIVE' ? 'EXCLUSIVE' : 'PENDING'}
                    </span>
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-emerald-400 font-mono font-extrabold text-sm shadow-sm border border-white/10">
                      ${prop.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">{prop.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400 dark:text-slate-500" />
                      <span className="truncate">{prop.address}</span>
                    </p>

                    <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-white/[0.06]">
                      <span className="flex items-center gap-1"><Bed size={13} className="text-emerald-600 dark:text-emerald-400" /> {prop.beds} Beds</span>
                      <span className="flex items-center gap-1"><Bath size={13} className="text-emerald-600 dark:text-emerald-400" /> {prop.baths} Baths</span>
                      <span className="flex items-center gap-1"><Maximize2 size={13} className="text-emerald-600 dark:text-emerald-400" /> {prop.sqft} SqFt</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 dark:border-white/[0.06] mt-2 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">{prop.matchedBuyers} Buyers Matched</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Agent: {prop.agent}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-xs font-medium text-slate-500 border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-3xl">
                No active property listings. Click <span className="text-emerald-600 dark:text-emerald-400 font-bold">"List New Property"</span> above to add your first real estate listing.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Site Showings Schedule & Lead Matchmaker (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/95 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-md dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Upcoming Site Showings</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Live</span>
            </h3>

            <div className="space-y-3">
              {showings.map((sh) => (
                <div
                  key={sh.id}
                  className="p-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-2xl space-y-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{sh.property}</span>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                      {sh.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Buyer: {sh.client}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/[0.06]">
                    <span>Host: {sh.agent}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Confirmed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Remodeled Luxury Glass Portal Modal */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-slate-950/98 dark:to-slate-950/99 border border-slate-200 dark:border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-2xl dark:shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-slate-900 dark:text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Specular Flare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header with category badge */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Home size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-700 dark:text-emerald-300 uppercase">
                    REAL ESTATE MLS LISTING
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">Add Property Listing</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Publish property to brokerage catalog & MLS matrix</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-4 text-xs relative z-10">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Property Title</label>
                <div className="relative">
                  <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Waterfront Luxury Villa"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Street Address</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="1200 Pacific Coast Hwy, Malibu, CA"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Listing Price ($)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      required
                      placeholder="1250000"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono font-medium text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Property Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
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
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Beds</label>
                  <div className="relative">
                    <Bed size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      value={newBeds}
                      onChange={(e) => setNewBeds(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Baths</label>
                  <div className="relative">
                    <Bath size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={newBaths}
                      onChange={(e) => setNewBaths(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Sq Ft</label>
                  <div className="relative">
                    <Maximize2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      value={newSqft}
                      onChange={(e) => setNewSqft(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
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
    </div>
  );
}
