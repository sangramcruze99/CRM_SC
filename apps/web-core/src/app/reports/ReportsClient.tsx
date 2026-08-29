'use client';

import { useState } from 'react';
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
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Top Notification */}
      {downloadSuccess && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle size={16} className="text-amber-400" />
          <span>{downloadSuccess} Complete! Download initiated.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="text-amber-400" size={24} />
            Analytics & Executive BI Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time pipeline analytics, financial performance summaries, and custom export generation.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
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
            <DollarSign size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">$1,480,000</div>
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
            <Calendar size={18} className="text-amber-400" />
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
              <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
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
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Generate Executive BI Report</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Report Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Executive ARR Forecast"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Analytics Domain</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="Sales">Sales & Opportunities</option>
                  <option value="Finance">Finance & MRR</option>
                  <option value="Helpdesk">Helpdesk & Support SLAs</option>
                  <option value="Executive">Executive Operations</option>
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
                  Run Query & Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
