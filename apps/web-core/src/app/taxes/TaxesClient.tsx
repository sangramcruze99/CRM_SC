'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Percent, Scale, Globe, MapPin, Sparkles, X, ShieldCheck } from 'lucide-react';

interface TaxRule {
  id: string;
  name: string;
  country: string;
  region: string;
  rate: number;
  type: 'VAT' | 'Sales Tax' | 'GST' | 'Customs';
  isCompound: boolean;
  isActive: boolean;
}

const initialDemoTaxes: TaxRule[] = [];

export function TaxesClient({ initialTaxes = [] }: { initialTaxes?: any[] }) {
  const [taxes, setTaxes] = useState<TaxRule[]>(
    initialTaxes.length > 0 ? initialTaxes : initialDemoTaxes
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);
  const [country, setCountry] = useState('United States (US)');
  const [region, setRegion] = useState('');
  const [rate, setRate] = useState('');
  const [type, setType] = useState<'VAT' | 'Sales Tax' | 'GST' | 'Customs'>('VAT');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !rate) return;

    const newTax: TaxRule = {
      id: `tax_${Math.floor(100 + Math.random() * 900)}`,
      name,
      country,
      region: region || 'Nationwide',
      rate: parseFloat(rate),
      type,
      isCompound: false,
      isActive: true,
    };

    setTaxes([...taxes, newTax]);
    setIsModalOpen(false);
    setName('');
    setRegion('');
    setRate('');
  }

  function handleToggle(id: string) {
    setTaxes(
      taxes.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Scale className="text-emerald-400" size={24} />
            Global Tax & VAT Nexus Rules
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated tax calculation, multi-jurisdiction VAT/GST compliance, and invoice exemption rules.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Tax Nexus Rule</span>
        </button>
      </div>

      {/* Tax Rules Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">Jurisdiction & Rule Name</th>
              <th className="px-6 py-4">Country & Region</th>
              <th className="px-6 py-4">Tax Type</th>
              <th className="px-6 py-4">Standard Rate</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {taxes.map((tax) => (
              <tr key={tax.id} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-sm">{tax.name}</div>
                  <div className="text-xs font-mono text-slate-500">{tax.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-white text-xs">{tax.country}</div>
                  <div className="text-xs text-slate-400">{tax.region}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {tax.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-extrabold text-emerald-400 text-base">
                  {tax.rate}%
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleToggle(tax.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tax.isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/[0.06] text-slate-400 border border-white/10'
                    }`}
                  >
                    {tax.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
              </tr>
            ))}
            {taxes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                    No tax rules configured yet. Click <span className="text-emerald-400 font-bold">"New Tax Nexus Rule"</span> to establish your first jurisdiction.
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
                  <Scale size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                      TAX JURISDICTION
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Configure Tax Nexus Rule</h2>
                  <p className="text-xs text-slate-400 font-medium">Establish statutory VAT, Sales Tax, or GST automated rate rules</p>
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
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Rule Name</label>
                <div className="relative">
                  <ShieldCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Texas Commercial SaaS Tax"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Country Jurisdiction</label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0c1411] border border-white/[0.12] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      <option value="United States (US)">United States (US)</option>
                      <option value="United Kingdom (UK)">United Kingdom (UK)</option>
                      <option value="European Union (EU)">European Union (EU)</option>
                      <option value="Canada (CA)">Canada (CA)</option>
                      <option value="India (IN)">India (IN)</option>
                      <option value="Australia (AU)">Australia (AU)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Tax Type</label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e: any) => setType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0c1411] border border-white/[0.12] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      <option value="Sales Tax">Sales Tax</option>
                      <option value="VAT">VAT</option>
                      <option value="GST">GST</option>
                      <option value="Customs">Customs</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Region / State</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Texas (TX)"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Tax Percentage (%)</label>
                  <div className="relative">
                    <Percent size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="8.25"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 font-mono font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
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
                  <span>Save Tax Rule</span>
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
