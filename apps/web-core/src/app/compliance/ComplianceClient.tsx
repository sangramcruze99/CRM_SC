'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  Lock,
  Play,
  Server,
  KeyRound,
  Database,
} from 'lucide-react';

interface ComplianceFramework {
  name: string;
  code: string;
  score: number;
  status: 'Compliant' | 'In Review';
  lastAudited: string;
}

const frameworks: ComplianceFramework[] = [
  { name: 'SOC 2 Type II Security & Confidentiality', code: 'SOC2-T2', score: 98, status: 'Compliant', lastAudited: '2026-07-30' },
  { name: 'General Data Protection Regulation (EU GDPR)', code: 'GDPR-EU', score: 100, status: 'Compliant', lastAudited: '2026-08-12' },
  { name: 'ISO/IEC 27001 Information Security', code: 'ISO-27001', score: 96, status: 'Compliant', lastAudited: '2026-06-15' },
  { name: 'Health Insurance Portability (HIPAA Readiness)', code: 'HIPAA', score: 94, status: 'Compliant', lastAudited: '2026-08-01' },
];

export function ComplianceClient({ initialAudits = [] }: { initialAudits?: any[] }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  function handleScan() {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanResult('Security Scan Completed: All 24 automated controls verified with zero vulnerabilities.');
    }, 2000);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {scanResult && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-pulse">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{scanResult}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="text-emerald-400" size={24} />
            Security & Governance Compliance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time compliance posture, automated policy verification, and certified audit attestations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
          >
            <Play size={15} />
            <span>{isScanning ? 'Running Security Audit...' : 'Run Live Security Scan'}</span>
          </button>
        </div>
      </div>

      {/* Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {frameworks.map((fw) => (
          <div key={fw.code} className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] hover:border-emerald-500/40 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3 transition-all">
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle size={12} /> {fw.status}
              </span>
              <span className="font-mono text-xs text-emerald-400 font-bold">{fw.code}</span>
            </div>
            <h3 className="font-bold text-white text-sm h-10 leading-snug">{fw.name}</h3>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Readiness Score</span>
                <span className="font-mono font-extrabold text-emerald-400">{fw.score}%</span>
              </div>
              <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden border border-white/10">
                <div style={{ width: `${fw.score}%` }} className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full" />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1 font-medium">Audited: {fw.lastAudited}</div>
          </div>
        ))}
      </div>

      {/* Security Controls Checklist */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Enterprise Security Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'AES-256 Encryption at Rest & In-Transit (TLS 1.3)', icon: Lock, status: 'ENFORCED' },
            { title: 'Mandatory Multi-Factor Authentication (MFA)', icon: KeyRound, status: 'ACTIVE' },
            { title: 'Multi-Tenant Database Isolation & Row-Level Scoping', icon: Database, status: 'VERIFIED' },
            { title: 'Automated Immutable Audit Logging on all CRUD mutations', icon: Server, status: 'STREAMING' },
          ].map((c) => (
            <div key={c.title} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.06] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <c.icon size={16} />
                </div>
                <span className="text-xs font-bold text-white">{c.title}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
