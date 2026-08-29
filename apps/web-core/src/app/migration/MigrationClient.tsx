'use client';

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Upload,
  CheckCircle2,
  Sparkles,
  Database,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  Zap,
  Check,
  AlertCircle,
  Clock,
  RotateCcw,
  Sliders,
  FileText,
  Users,
  Briefcase,
  Receipt,
  Ticket,
} from 'lucide-react';
import Link from 'next/link';

interface SourceCrm {
  id: string;
  name: string;
  logoUrl: string;
  badge: string;
  description: string;
  popularObjects: string[];
}

const SUPPORTED_CRMS: SourceCrm[] = [
  {
    id: 'salesforce',
    name: 'Salesforce CRM',
    logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    badge: 'Direct API / CSV Export',
    description: 'Migrate Accounts, Contacts, Opportunities, Leads, Price Books & Custom Fields.',
    popularObjects: ['Leads (2,450)', 'Accounts (890)', 'Opportunities ($4.2M)', 'Activities (12k)'],
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=80',
    badge: '1-Click API Sync',
    description: 'Import Contacts, Companies, Deal Pipelines, Marketing Lists & Helpdesk Tickets.',
    popularObjects: ['Contacts (5,120)', 'Companies (1,200)', 'Deals ($2.8M)', 'Tickets (450)'],
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    logoUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&auto=format&fit=crop&q=80',
    badge: 'API Token / Export',
    description: 'Transfer visual sales stages, Persons, Organizations, Products & Activity notes.',
    popularObjects: ['Persons (3,800)', 'Organizations (940)', 'Pipelines (6)', 'Deals ($1.5M)'],
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    logoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&auto=format&fit=crop&q=80',
    badge: 'Backup Zip / API',
    description: 'Seamless migration of Leads, Contacts, Accounts, Invoices & Vendor Khata entries.',
    popularObjects: ['Leads (4,100)', 'Contacts (2,300)', 'Invoices (890)', 'Vendors (180)'],
  },
  {
    id: 'monday',
    name: 'Monday.com / ClickUp',
    logoUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&auto=format&fit=crop&q=80',
    badge: 'Workspace Board Export',
    description: 'Convert custom boards, Kanban cards, task assignees, and project milestones.',
    popularObjects: ['Boards (18)', 'Tasks (4,200)', 'Milestones (120)', 'Sub-items (850)'],
  },
  {
    id: 'custom_csv',
    name: 'Universal CSV / Excel / JSON',
    logoUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&auto=format&fit=crop&q=80',
    badge: 'AI Smart Auto-Mapper',
    description: 'Upload any spreadsheet or database export. Our neural engine auto-maps headers.',
    popularObjects: ['Any Contacts', 'Any Deals', 'Any Invoices', 'Any Khata Ledger'],
  },
];

interface FieldMapping {
  sourceHeader: string;
  targetField: string;
  sampleValue: string;
  confidence: number;
}

const DEFAULT_MAPPINGS: FieldMapping[] = [
  { sourceHeader: 'Full_Name / Name', targetField: 'firstName + lastName', sampleValue: 'Sarah Connor', confidence: 99 },
  { sourceHeader: 'Account_Name / Company', targetField: 'company.name', sampleValue: 'Cyberdyne Systems Corp', confidence: 98 },
  { sourceHeader: 'Email_Address / Work_Email', targetField: 'email', sampleValue: 'sarah.connor@cyberdyne.io', confidence: 100 },
  { sourceHeader: 'Mobile_Phone / Direct_Dial', targetField: 'phone', sampleValue: '+1 (555) 019-2834', confidence: 96 },
  { sourceHeader: 'Deal_Amount_USD / Value', targetField: 'deals.amount', sampleValue: '$48,000.00', confidence: 97 },
  { sourceHeader: 'Pipeline_Stage / Status', targetField: 'deals.stage', sampleValue: 'Proposal / Negotiation', confidence: 95 },
  { sourceHeader: 'Ledger_Balance / Credit_Debt', targetField: 'khata.currentBalance', sampleValue: '$4,850.00', confidence: 94 },
];

interface MigrationHistoryItem {
  id: string;
  sourceCrm: string;
  recordsImported: number;
  entities: string;
  completedAt: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
}

const INITIAL_HISTORY: MigrationHistoryItem[] = [
  {
    id: 'mig_01',
    sourceCrm: 'HubSpot CRM',
    recordsImported: 6840,
    entities: 'Contacts (5,120), Deals (1,270), Invoices (450)',
    completedAt: 'Yesterday, 03:45 PM',
    status: 'COMPLETED',
  },
  {
    id: 'mig_02',
    sourceCrm: 'Salesforce Enterprise',
    recordsImported: 14250,
    entities: 'Accounts (890), Leads (8,200), Deals (5,160)',
    completedAt: 'Aug 24, 2026',
    status: 'COMPLETED',
  },
];

export function MigrationClient() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedCrm, setSelectedCrm] = useState<SourceCrm>(SUPPORTED_CRMS[0]);
  const [mappings, setMappings] = useState<FieldMapping[]>(DEFAULT_MAPPINGS);
  const [isMigrating, setIsMigrating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [history, setHistory] = useState<MigrationHistoryItem[]>(INITIAL_HISTORY);
  const [alert, setAlert] = useState<string | null>(null);

  const handleStartMigration = () => {
    setIsMigrating(true);
    setCurrentStep(3);
    setProgressPercent(0);
    setAlert(`🚀 Initiating high-speed parallel migration pipeline from ${selectedCrm.name}...`);

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setIsMigrating(false);

        const newHistory: MigrationHistoryItem = {
          id: `mig_${Date.now()}`,
          sourceCrm: selectedCrm.name,
          recordsImported: 4890,
          entities: 'Contacts (3,420), Deals (890), Khata Balances (580)',
          completedAt: 'Just now',
          status: 'COMPLETED',
        };
        setHistory([newHistory, ...history]);
        setAlert(`🎉 Migration Complete! 4,890 records from ${selectedCrm.name} successfully imported, deduplicated, and mapped to Business OS!`);
      }
      setProgressPercent(current);
    }, 500);
  };

  const handleRollback = (id: string) => {
    setHistory(history.filter((h) => h.id !== id));
    setAlert('↩️ Successfully rolled back migration run. All imported records safely reverted.');
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ArrowRightLeft className="text-amber-400" size={24} />
            Legacy CRM Data Migration & Universal Auto-Mapper
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Seamlessly switch from Salesforce, HubSpot, Pipedrive, Zoho, or CSV files with zero downtime and AI field mapping.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Zero Data Loss Guarantee</span>
          </span>
        </div>
      </div>

      {/* 3-Step Progress Indicator Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { step: 1, title: '1. Select Source CRM', subtitle: 'Salesforce, HubSpot, Zoho, CSV' },
          { step: 2, title: '2. AI Field Auto-Mapping', subtitle: 'Header schema normalization' },
          { step: 3, title: '3. Execute & Live Verify', subtitle: 'Parallel ingestion & Khata sync' },
        ].map((item) => (
          <div
            key={item.step}
            onClick={() => !isMigrating && setCurrentStep(item.step)}
            className={`p-4 rounded-3xl border transition-all cursor-pointer ${
              currentStep === item.step
                ? 'bg-gradient-to-r from-amber-500/20 via-white/[0.04] to-orange-500/15 border-amber-500/60 ring-2 ring-amber-500/20 shadow-orange-500/15'
                : currentStep > item.step
                ? 'bg-white/[0.04] border-emerald-500/40 text-slate-300'
                : 'bg-white/[0.02] border-white/[0.06] text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">{item.title}</span>
              {currentStep > item.step && (
                <CheckCircle2 size={16} className="text-emerald-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{item.subtitle}</p>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* STEP 1: Select Source CRM Platform or File Upload */}
      {/* ========================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SUPPORTED_CRMS.map((crm) => {
              const isSelected = selectedCrm.id === crm.id;
              return (
                <div
                  key={crm.id}
                  onClick={() => setSelectedCrm(crm)}
                  className={`p-6 rounded-3xl border backdrop-blur-2xl transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/80 ring-2 ring-amber-500/30'
                      : 'bg-white/[0.04] border-white/[0.08] hover:border-white/[0.18]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shadow-md bg-white/5">
                        <img src={crm.logoUrl} alt={crm.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/[0.08] text-amber-300 border border-white/10">
                        {crm.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-white">{crm.name}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{crm.description}</p>
                    </div>

                    {/* Popular Objects Pills */}
                    <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Detected Migration Objects
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {crm.popularObjects.map((obj, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] rounded-md text-[10px] font-mono text-slate-300"
                          >
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-amber-400 font-bold">
                      {isSelected ? '✓ Selected as Source' : 'Click to select'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCrm(crm);
                        setCurrentStep(2);
                      }}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      <span>Proceed to Mapping</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Universal Dropzone Card */}
          <div className="p-8 bg-white/[0.03] border-2 border-dashed border-white/[0.15] hover:border-amber-500/50 rounded-3xl text-center space-y-3 transition-colors cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Drag & Drop any CSV, Excel (.xlsx), or JSON Data Export
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Upload your exported zip archive or files from any CRM, ERP, or SQL database. Our neural pipeline will parse entities automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCrm(SUPPORTED_CRMS[5]);
                setCurrentStep(2);
              }}
              className="px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold rounded-xl text-xs border border-white/[0.1] inline-flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet size={15} className="text-amber-400" />
              <span>Browse Spreadsheet File</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: AI Field Mapping & Data Sanitization */}
      {/* ========================================================= */}
      {currentStep === 2 && (
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.06] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-400" size={18} />
                <h3 className="font-bold text-base text-white">
                  AI Field Schema Auto-Mapper ({selectedCrm.name} ➔ Business OS)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Our neural schema engine analyzed the export columns and achieved an average <strong>97.2% matching confidence</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3.5 py-1.5 bg-white/[0.06] text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Change Source
              </button>
              <button
                type="button"
                onClick={handleStartMigration}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Zap size={15} />
                <span>Confirm & Start Migration</span>
              </button>
            </div>
          </div>

          {/* Schema Mapping Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-white/[0.02] text-slate-400 uppercase font-semibold tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="px-6 py-4">Source Header ({selectedCrm.name})</th>
                  <th className="px-6 py-4">Mapped Business OS Field</th>
                  <th className="px-6 py-4">Sample Data Record</th>
                  <th className="px-6 py-4">AI Match Confidence</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {mappings.map((map, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-amber-300">
                      {map.sourceHeader}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white flex items-center gap-2">
                      <ArrowRight size={13} className="text-amber-400" />
                      <span>{map.targetField}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 italic">{map.sampleValue}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-white/[0.1] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400"
                            style={{ width: `${map.confidence}%` }}
                          />
                        </div>
                        <span className="font-mono text-emerald-400 font-bold text-[11px]">
                          {map.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Auto-Matched ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: Execution, Progress Bar & Live Telemetry */}
      {/* ========================================================= */}
      {currentStep === 3 && (
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6 text-center">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
              {isMigrating ? (
                <RefreshCw size={28} className="animate-spin text-amber-400" />
              ) : (
                <CheckCircle2 size={32} className="text-emerald-400" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                {isMigrating
                  ? `Migrating Data from ${selectedCrm.name}...`
                  : `Migration from ${selectedCrm.name} Complete!`}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isMigrating
                  ? 'Executing parallel schema normalization, deduplicating emails, and creating Dual Khata ledgers...'
                  : '4,890 records successfully imported into Business OS. Contacts, Deals & Invoices are live.'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-slate-400">Pipeline Ingestion</span>
                <span className="text-amber-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-white/[0.08] rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {!isMigrating && (
              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href="/"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 flex items-center gap-1.5"
                >
                  <Users size={14} />
                  <span>View Imported Contacts</span>
                </Link>
                <Link
                  href="/deals"
                  className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] flex items-center gap-1.5"
                >
                  <Briefcase size={14} />
                  <span>View Imported Deals</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Migration Runs Audit History & Rollback Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Migration Run Logs & Audit History</h3>
            <span className="text-xs text-slate-400">Full rollback safety logs with immutable timestamps</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-500/30">
            {history.length} Successful Migrations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white/[0.02] text-slate-400 uppercase font-semibold tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="px-6 py-4">Source CRM</th>
                <th className="px-6 py-4">Records Imported</th>
                <th className="px-6 py-4">Entity Breakdown</th>
                <th className="px-6 py-4">Execution Timestamp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Safety Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {history.map((run) => (
                <tr key={run.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{run.sourceCrm}</td>
                  <td className="px-6 py-4 font-mono font-extrabold text-amber-400">
                    {run.recordsImported.toLocaleString()} Records
                  </td>
                  <td className="px-6 py-4 text-slate-300">{run.entities}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">{run.completedAt}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {run.status} ✓
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleRollback(run.id)}
                      className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Undo / Rollback</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
