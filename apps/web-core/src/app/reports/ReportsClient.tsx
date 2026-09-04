'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  CheckCircle,
  Sparkles,
  X,
  FileText,
  Layers,
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  category: 'Sales' | 'Finance' | 'Helpdesk' | 'Executive';
  generatedDate: string;
  generatedBy: string;
  recordsCount: number;
  status: 'Ready' | 'Processing';
}

const initialDemoReports: Report[] = [
  {
    id: 'rep_901',
    title: 'Q3 Enterprise Pipeline & Won Revenue Analysis',
    category: 'Sales',
    generatedDate: '2026-08-28',
    generatedBy: 'Sangram Cruze',
    recordsCount: 428,
    status: 'Ready',
  },
  {
    id: 'rep_902',
    title: 'Monthly Recurring Revenue & Cohort Retention',
    category: 'Finance',
    generatedDate: '2026-08-25',
    generatedBy: 'Automated System',
    recordsCount: 184,
    status: 'Ready',
  },
  {
    id: 'rep_903',
    title: 'Helpdesk SLA Performance & Resolution Velocity',
    category: 'Helpdesk',
    generatedDate: '2026-08-20',
    generatedBy: 'Support Lead',
    recordsCount: 1250,
    status: 'Ready',
  },
  {
    id: 'rep_904',
    title: 'Global Employee Headcount & Department Distribution',
    category: 'Executive',
    generatedDate: '2026-08-15',
    generatedBy: 'HR Director',
    recordsCount: 78,
    status: 'Ready',
  },
];

export function ReportsClient({ initialReports = [] }: { initialReports?: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [reports, setReports] = useState<Report[]>(
    initialReports.length > 0 ? initialReports : initialDemoReports
  );
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Sales' | 'Finance' | 'Helpdesk' | 'Executive'>('Sales');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const filteredReports = reports.filter(
    (r) => selectedCategory === 'ALL' || r.category === selectedCategory
  );

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;

    const newReport: Report = {
      id: `rep_${Math.floor(100 + Math.random() * 900)}`,
      title,
      category,
      generatedDate: new Date().toISOString().split('T')[0],
      generatedBy: 'Sangram Cruze',
      recordsCount: Math.floor(50 + Math.random() * 500),
      status: 'Ready',
    };

    setReports([newReport, ...reports]);
    setIsModalOpen(false);
    setTitle('');
  }

  function handleDownload(reportTitle: string) {
    setDownloadSuccess(`Exporting "${reportTitle}"...`);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 2500);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-white">
      {/* Top Notification */}
      {downloadSuccess && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>{downloadSuccess} Complete! Download initiated.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Activity className="text-emerald-600 dark:text-emerald-400" size={24} />
            Analytics & Executive BI Reports
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time pipeline analytics, financial performance summaries, and custom export generation.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
        >
          <Sparkles size={16} className="text-slate-950" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Pipeline Value</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">$1,480,000</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 mt-2 font-bold">
            <TrendingUp size={14} /> +22.8% vs last quarter
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Deals Won</span>
            <BarChart3 size={18} className="text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">$640,000</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">34 closed enterprise deals</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Conversion Rate</span>
            <PieChart size={18} className="text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">28.4%</div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">+3.2% lead-to-win</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Sales Cycle</span>
            <Calendar size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">18.2 Days</div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">-4 days velocity</div>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenue Performance (Past 6 Months)</h3>
          <span className="text-xs font-semibold text-slate-400">Values in Thousands ($K USD)</span>
        </div>
        <div className="grid grid-cols-6 gap-3.5 items-end h-44 pt-4 border-b border-white/[0.06] pb-2">
          {[
            { month: 'Mar', val: 65, height: '45%' },
            { month: 'Apr', val: 82, height: '58%' },
            { month: 'May', val: 110, height: '72%' },
            { month: 'Jun', val: 95, height: '62%' },
            { month: 'Jul', val: 135, height: '88%' },
            { month: 'Aug', val: 154, height: '100%' },
          ].map((bar) => (
            <div key={bar.month} className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
              <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">
                ${bar.val}k
              </span>
              <div
                style={{ height: bar.height }}
                className="w-full bg-gradient-to-t from-amber-500/20 to-orange-500/80 rounded-t-xl group-hover:from-amber-500/40 group-hover:to-orange-500 transition-all shadow-md shadow-orange-500/10 border-t border-amber-400"
              />
              <span className="text-xs text-slate-400 font-semibold">{bar.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">Report Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Generated By</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filteredReports.map((rep) => (
              <tr key={rep.id} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-sm">{rep.title}</div>
                  <div className="text-xs font-mono text-slate-500">{rep.recordsCount} total records</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {rep.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300 text-xs">{rep.generatedBy}</td>
                <td className="px-6 py-4 text-slate-400 text-xs font-medium">{rep.generatedDate}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDownload(rep.title)}
                    className="px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.1] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Remodeled Luxury Glass Portal Modal */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Specular Flare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header with category badge */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                    ANALYTICS & BI ENGINE
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Generate Executive BI Report</h2>
                  <p className="text-xs text-slate-400 font-medium">Query cross-tenant analytics data with automated charting</p>
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
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Report Title</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 Executive ARR Forecast & Cohort Retention"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Analytics Domain</label>
                <div className="relative">
                  <Layers size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  >
                    <option value="Sales">Sales & Deals Pipeline</option>
                    <option value="Finance">Finance & MRR Khata</option>
                    <option value="Helpdesk">Helpdesk & Support SLAs</option>
                    <option value="Executive">Executive Operations</option>
                  </select>
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
                  <span>Run Query & Generate</span>
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
