'use client';

import { useState } from 'react';
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
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              REAL ESTATE BROKERAGE CRM
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 mt-1">
            <Home className="text-emerald-400" size={24} />
            Properties, MLS Inventory & Deal Escrow
          </h1>
          <p className="text-sm text-slate-400 mt-1">
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
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by address, agent, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((prop) => (
              <div
                key={prop.id}
                className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] hover:border-emerald-500/40 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-2xl transition-all flex flex-col justify-between group"
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
                    <h3 className="font-bold text-xs text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">{prop.title}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-500" />
                      <span className="truncate">{prop.address}</span>
                    </p>

                    <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-slate-300 border-t border-white/[0.06]">
                      <span className="flex items-center gap-1"><Bed size={13} className="text-emerald-400" /> {prop.beds} Beds</span>
                      <span className="flex items-center gap-1"><Bath size={13} className="text-emerald-400" /> {prop.baths} Baths</span>
                      <span className="flex items-center gap-1"><Maximize2 size={13} className="text-emerald-400" /> {prop.sqft} SqFt</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-white/[0.06] mt-2 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold text-[11px]">{prop.matchedBuyers} Buyers Matched</span>
                  <span className="text-slate-400 text-[11px] font-medium">Agent: {prop.agent}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-xs font-medium text-slate-500 border-2 border-dashed border-white/[0.08] rounded-3xl">
                No active property listings. Click <span className="text-emerald-400 font-bold">"List New Property"</span> above to add your first real estate listing.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Site Showings Schedule & Lead Matchmaker (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-400" />
                <span>Upcoming Site Showings</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live</span>
            </h3>

            <div className="space-y-3">
              {showings.map((sh) => (
                <div
                  key={sh.id}
                  className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-1.5 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{sh.property}</span>
                    <span className="font-mono text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                      {sh.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">Buyer: {sh.client}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-white/[0.06]">
                    <span>Host: {sh.agent}</span>
                    <span className="text-emerald-400 font-bold">Confirmed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Add Property Listing to Brokerage</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Waterfront Luxury Villa"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="1200 Pacific Coast Hwy, Malibu, CA"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Listing Price ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="1250000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Property Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-medium"
                  >
                    <option value="SINGLE_FAMILY">Single Family</option>
                    <option value="CONDO">Luxury Condo</option>
                    <option value="PENTHOUSE">Penthouse</option>
                    <option value="COMMERCIAL">Commercial Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Beds</label>
                  <input
                    type="number"
                    value={newBeds}
                    onChange={(e) => setNewBeds(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Baths</label>
                  <input
                    type="text"
                    value={newBaths}
                    onChange={(e) => setNewBaths(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sq Ft</label>
                  <input
                    type="number"
                    value={newSqft}
                    onChange={(e) => setNewSqft(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Mortgage Amortization & MLS Calculator */}
      <MortgageAmortizationCalculator />
    </div>
  );
}
