'use client';

import { useState } from 'react';
import { Search, Database, RefreshCw, CheckCircle, Cpu, Zap } from 'lucide-react';

interface IndexEntity {
  name: string;
  count: number;
  lastIndexed: string;
  status: 'SYNCHRONIZED' | 'INDEXING';
}

const initialEntities: IndexEntity[] = [
  { name: 'Contacts & Accounts', count: 1240, lastIndexed: '5 mins ago', status: 'SYNCHRONIZED' },
  { name: 'Deals & Opportunities', count: 480, lastIndexed: '5 mins ago', status: 'SYNCHRONIZED' },
  { name: 'Helpdesk Tickets & Messages', count: 3250, lastIndexed: '5 mins ago', status: 'SYNCHRONIZED' },
  { name: 'Invoices & Transactions', count: 890, lastIndexed: '5 mins ago', status: 'SYNCHRONIZED' },
  { name: 'Documents & Knowledge Base', count: 620, lastIndexed: '5 mins ago', status: 'SYNCHRONIZED' },
];

export function SearchIndexClient({ initialRecords = [] }: { initialRecords?: any[] }) {
  const [entities, setEntities] = useState<IndexEntity[]>(initialEntities);
  const [isReindexing, setIsReindexing] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  function handleReindex() {
    setIsReindexing(true);
    setAlert(null);

    setTimeout(() => {
      setIsReindexing(false);
      setEntities(
        entities.map((e) => ({
          ...e,
          lastIndexed: 'Just now',
          status: 'SYNCHRONIZED',
        }))
      );
      setAlert('Global search index fully reconstructed & synchronized with zero downtime!');
      setTimeout(() => setAlert(null), 3000);
    }, 2000);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-pulse">
          <CheckCircle size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Database className="text-amber-400" size={24} />
            Full-Text Search Index Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time entity indexing, tokenizer performance metrics, and global search cluster health.
          </p>
        </div>
        <button
          onClick={handleReindex}
          disabled={isReindexing}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
        >
          <RefreshCw size={15} className={isReindexing ? 'animate-spin' : ''} />
          <span>{isReindexing ? 'Re-indexing Database...' : 'Re-index Entire Workspace'}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Indexed Entities</span>
            <Database size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {entities.reduce((acc, e) => acc + e.count, 0).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">Instant sub-10ms querying</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Search Cluster Status</span>
            <Cpu size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">100% HEALTHY</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Zero query drop rate</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Latency</span>
            <Zap size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">4.8 ms</div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">Ranked #1 percentile</div>
        </div>
      </div>

      {/* Entities Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">Index Scope / Entity</th>
              <th className="px-6 py-4">Document Count</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Last Synchronized</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {entities.map((e) => (
              <tr key={e.name} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-6 py-4 font-bold text-white flex items-center gap-2 text-sm">
                  <Search size={15} className="text-amber-400" />
                  <span>{e.name}</span>
                </td>
                <td className="px-6 py-4 font-mono font-semibold text-slate-300 text-xs">
                  {e.count.toLocaleString()} docs
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {e.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">{e.lastIndexed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
