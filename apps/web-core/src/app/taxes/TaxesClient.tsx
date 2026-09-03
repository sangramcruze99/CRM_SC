'use client';

import { useState } from 'react';
import { Plus, Percent, Scale } from 'lucide-react';

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
  const [name, setName] = useState('');
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Configure Tax Nexus Rule</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Texas Commercial SaaS Tax"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="United States (US)">United States (US)</option>
                    <option value="United Kingdom (UK)">United Kingdom (UK)</option>
                    <option value="European Union (EU)">European Union (EU)</option>
                    <option value="Canada (CA)">Canada (CA)</option>
                    <option value="India (IN)">India (IN)</option>
                    <option value="Australia (AU)">Australia (AU)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tax Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Sales Tax">Sales Tax</option>
                    <option value="VAT">VAT</option>
                    <option value="GST">GST</option>
                    <option value="Customs">Customs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Region / State</label>
                  <input
                    type="text"
                    placeholder="Texas (TX)"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tax Percentage (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="8.25"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>
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
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  Save Tax Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
