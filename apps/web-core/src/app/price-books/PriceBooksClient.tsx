'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Layers, Search, Tag, DollarSign, Sparkles, X, Package } from 'lucide-react';

interface PriceBookItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  enterprisePrice: number;
  billingFrequency: 'One-Time' | 'Monthly' | 'Yearly';
}

const initialDemoItems: PriceBookItem[] = [];

export function PriceBooksClient({ initialPriceBooks = [] }: { initialPriceBooks?: any[] }) {
  const [items, setItems] = useState<PriceBookItem[]>(
    initialPriceBooks.length > 0 ? initialPriceBooks : initialDemoItems
  );
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Core Software');
  const [unitPrice, setUnitPrice] = useState('');
  const [enterprisePrice, setEnterprisePrice] = useState('');
  const [frequency, setFrequency] = useState<'One-Time' | 'Monthly' | 'Yearly'>('Monthly');

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  const currencyRate = currency === 'USD' ? 1 : currency === 'EUR' ? 0.92 : 0.78;

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !unitPrice) return;

    const newItem: PriceBookItem = {
      id: `pb_${Math.floor(100 + Math.random() * 900)}`,
      sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      category,
      unitPrice: parseFloat(unitPrice),
      enterprisePrice: enterprisePrice ? parseFloat(enterprisePrice) : parseFloat(unitPrice) * 0.85,
      billingFrequency: frequency,
    };

    setItems([...items, newItem]);
    setIsModalOpen(false);
    setName('');
    setSku('');
    setUnitPrice('');
    setEnterprisePrice('');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="text-emerald-400" size={24} />
            Price Books & SKU Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Standard rate cards, enterprise tiered pricing, and multi-currency rate catalogs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1 shadow-2xs backdrop-blur-xl">
            {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  currency === curr ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Catalog Item</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search products, SKUs, or categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] transition-all font-medium shadow-xs"
        />
      </div>

      {/* Catalog Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">Item & SKU</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Standard Unit Price</th>
              <th className="px-6 py-4">Enterprise Tier Rate</th>
              <th className="px-6 py-4">Billing Frequency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-sm">{item.name}</div>
                  <div className="text-xs font-mono font-semibold text-emerald-400">{item.sku}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.08] text-slate-300 border border-white/10">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-white">
                  {currencySymbol}
                  {Math.round(item.unitPrice * currencyRate).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-mono font-extrabold text-emerald-400">
                  {currencySymbol}
                  {Math.round(item.enterprisePrice * currencyRate).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs font-medium">{item.billingFrequency}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                  No products or services in catalog yet. Click <span className="text-emerald-400 font-bold">"Add Product / SKU"</span> to create your first rate card.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Specular Glow Lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Layers size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                      PRICE BOOK CATALOG
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Add Catalog Product / Service</h2>
                  <p className="text-xs text-slate-400 font-medium">Define standard SKU rates, enterprise pricing tiers, and billing schedule</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs relative z-10">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Item Title / Description</label>
                <div className="relative">
                  <Package size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dedicated Redis Cluster"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">SKU Code</label>
                  <div className="relative">
                    <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="BOS-REDIS-01"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 font-mono font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0c1411] border border-white/[0.12] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      <option value="Core Software">Core Software</option>
                      <option value="Addons">Addons</option>
                      <option value="Compute & AI">Compute & AI</option>
                      <option value="Professional Services">Professional Services</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Standard Price ($)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      required
                      placeholder="250"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 font-mono font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Enterprise Rate ($)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      placeholder="199"
                      value={enterprisePrice}
                      onChange={(e) => setEnterprisePrice(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 font-mono font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Billing Frequency</label>
                <div className="relative">
                  <select
                    value={frequency}
                    onChange={(e: any) => setFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0c1411] border border-white/[0.12] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="Monthly">Monthly Recurring</option>
                    <option value="Yearly">Yearly Contract</option>
                    <option value="One-Time">One-Time Fee</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3 relative z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>Save Catalog Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
