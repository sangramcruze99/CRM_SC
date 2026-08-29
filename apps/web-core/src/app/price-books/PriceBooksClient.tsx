'use client';

import { useState } from 'react';
import { Plus, Layers, Search } from 'lucide-react';

interface PriceBookItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  enterprisePrice: number;
  billingFrequency: 'One-Time' | 'Monthly' | 'Yearly';
}

const initialDemoItems: PriceBookItem[] = [
  {
    id: 'pb_01',
    sku: 'BOS-ENT-CORE',
    name: 'Business OS Enterprise License',
    category: 'Core Software',
    unitPrice: 1200,
    enterprisePrice: 950,
    billingFrequency: 'Monthly',
  },
  {
    id: 'pb_02',
    sku: 'BOS-PRO-SEAT',
    name: 'Professional User Addon Seat',
    category: 'Addons',
    unitPrice: 45,
    enterprisePrice: 32,
    billingFrequency: 'Monthly',
  },
  {
    id: 'pb_03',
    sku: 'BOS-AI-TOKEN-PACK',
    name: 'AI Engine Dedicated Compute (10M Tokens)',
    category: 'Compute & AI',
    unitPrice: 250,
    enterprisePrice: 199,
    billingFrequency: 'One-Time',
  },
  {
    id: 'pb_04',
    sku: 'BOS-ONBOARD-VIP',
    name: 'Dedicated Solutions Architect Onboarding',
    category: 'Professional Services',
    unitPrice: 4500,
    enterprisePrice: 3500,
    billingFrequency: 'One-Time',
  },
];

export function PriceBooksClient({ initialPriceBooks = [] }: { initialPriceBooks?: any[] }) {
  const [items, setItems] = useState<PriceBookItem[]>(
    initialPriceBooks.length > 0 ? initialPriceBooks : initialDemoItems
  );
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
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
            <Layers className="text-amber-400" size={24} />
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
                  currency === curr ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
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
                  <div className="text-xs font-mono font-semibold text-amber-400">{item.sku}</div>
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
                <td className="px-6 py-4 font-mono font-extrabold text-amber-400">
                  {currencySymbol}
                  {Math.round(item.enterprisePrice * currencyRate).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs font-medium">{item.billingFrequency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Add Catalog Product / Service</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dedicated Redis Cluster"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Code</label>
                  <input
                    type="text"
                    placeholder="BOS-REDIS-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Core Software">Core Software</option>
                    <option value="Addons">Addons</option>
                    <option value="Compute & AI">Compute & AI</option>
                    <option value="Professional Services">Professional Services</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="250"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Enterprise Price ($)</label>
                  <input
                    type="number"
                    placeholder="199"
                    value={enterprisePrice}
                    onChange={(e) => setEnterprisePrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Billing Frequency</label>
                <select
                  value={frequency}
                  onChange={(e: any) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="One-Time">One-Time</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-orange-500/25 cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
