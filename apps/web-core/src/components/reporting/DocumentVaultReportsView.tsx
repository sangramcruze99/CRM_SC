'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  ShieldCheck,
  Calendar,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Lock,
  RefreshCw,
  FolderArchive,
  Layers,
} from 'lucide-react';

interface ReportRunRecord {
  id: string;
  reportDefinitionId?: string;
  title: string;
  periodType: string;
  startDate: string;
  endDate: string;
  status: string;
  version: number;
  documentVaultId?: string;
  generatedBy?: string;
  createdAt: string;
}

interface DocumentVaultReportsViewProps {
  onGenerateClick: () => void;
}

export function DocumentVaultReportsView({
  onGenerateClick,
}: DocumentVaultReportsViewProps) {
  const [reports, setReports] = useState<ReportRunRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bi/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Failed to load reports archive:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExport = async (report: ReportRunRecord, format: 'csv' | 'json') => {
    setDownloadSuccess(`Exporting "${report.title}" as ${format.toUpperCase()}...`);
    try {
      const res = await fetch(`/api/bi/reports/${report.id}/export?format=${format}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_v${report.version}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadSuccess(`"${report.title}" exported successfully!`);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err: any) {
      setDownloadSuccess(`Export failed: ${err.message}`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadSuccess && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <FolderArchive size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Central Document Vault — Business Reports Archive</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold uppercase">
                IMMUTABLE VAULT
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Official finalized reports securely archived in Central Document Vault with audit versioning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
            title="Refresh Archive"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-400' : ''} />
          </button>
          <button
            onClick={onGenerateClick}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={15} />
            <span>Generate Official Snapshot</span>
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">Official Report Title</th>
              <th className="px-6 py-4">Period Type</th>
              <th className="px-6 py-4">Coverage Dates</th>
              <th className="px-6 py-4">Vault Status</th>
              <th className="px-6 py-4">Version</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs font-mono">
                  Loading Document Vault reports...
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs">
                  No official reports generated yet. Click &quot;Generate Official Snapshot&quot; to freeze a business period report.
                </td>
              </tr>
            ) : (
              reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <FileText size={15} className="text-emerald-400 shrink-0" />
                      <span>{rep.title}</span>
                    </div>
                    {rep.documentVaultId && (
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>Vault ID: {rep.documentVaultId}</span>
                        <Link
                          href={`/documents?id=${rep.documentVaultId}`}
                          className="text-emerald-400/80 hover:text-emerald-300 hover:underline flex items-center gap-0.5"
                        >
                          <ExternalLink size={10} />
                          <span>view in vault</span>
                        </Link>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/[0.05] text-slate-300 border border-white/[0.08] font-mono">
                      {rep.periodType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-xs font-mono">
                    {rep.startDate?.split('T')[0]} to {rep.endDate?.split('T')[0]}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                      <CheckCircle2 size={11} />
                      <span>{rep.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                    v{rep.version}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleExport(rep, 'csv')}
                        className="px-3 py-1 bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.08] inline-flex items-center gap-1.5 cursor-pointer"
                        title="Download CSV spreadsheet"
                      >
                        <Download size={12} />
                        <span>CSV</span>
                      </button>
                      <button
                        onClick={() => handleExport(rep, 'json')}
                        className="px-3 py-1 bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.08] inline-flex items-center gap-1.5 cursor-pointer"
                        title="Export JSON snapshot"
                      >
                        <Download size={12} />
                        <span>JSON</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
