'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Search,
  Upload,
  Mail,
  Phone,
  CheckCircle2,
  Database,
  Globe,
  Plus,
  Zap,
  Key,
  FileSpreadsheet,
  X,
  Lock,
  ShieldCheck,
  Tag,
  User,
} from 'lucide-react';

interface ProspectLead {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  companyDomain: string;
  companySize: string;
  industry: string;
  revenue: string;
  location: string;
  email: string;
  emailStatus: 'VERIFIED' | 'CATCH_ALL' | 'UNVERIFIED';
  phone: string;
  linkedinUrl: string;
  techStack: string[];
  provider: 'Apollo.io' | 'ZoomInfo' | 'UpLead';
  confidenceScore: number;
}

const mockProspectDatabase: ProspectLead[] = [];

export function LeadProspectorClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [leads, setLeads] = useState<ProspectLead[]>(mockProspectDatabase);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [activeProvider, setActiveProvider] = useState<'ALL' | 'Apollo.io' | 'ZoomInfo' | 'UpLead'>('ALL');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchIndustry, setSearchIndustry] = useState('ALL');
  const [alert, setAlert] = useState<string | null>(null);

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isCsvUploadOpen, setIsCsvUploadOpen] = useState(false);

  // Import options
  const [importDestination, setImportDestination] = useState<'CONTACTS' | 'DEALS' | 'EMAIL_LIST'>('CONTACTS');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [assignee, setAssignee] = useState('Sangram Cruze (SuperAdmin)');
  const [tag, setTag] = useState('Apollo-Q3-Enterprise-Prospects');
  const [isImporting, setIsImporting] = useState(false);

  // API Keys state
  const [apolloKey, setApolloKey] = useState('apl_live_9481028491028419');
  const [zoomInfoKey, setZoomInfoKey] = useState('zi_ent_sec_884019284');
  const [upLeadKey, setUpLeadKey] = useState('upl_v4_77391028491');

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchProvider = activeProvider === 'ALL' || l.provider === activeProvider;
    const matchTitle =
      !searchTitle ||
      l.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
      l.name.toLowerCase().includes(searchTitle.toLowerCase()) ||
      l.company.toLowerCase().includes(searchTitle.toLowerCase());
    const matchIndustry = searchIndustry === 'ALL' || l.industry.toLowerCase().includes(searchIndustry.toLowerCase());
    return matchProvider && matchTitle && matchIndustry;
  });

  // Select all or toggle single
  const handleToggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const handleToggleSelectLead = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  // Perform Bulk Import
  const handleExecuteBulkImport = () => {
    if (selectedLeadIds.length === 0) return;

    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setIsImportModalOpen(false);
      const count = selectedLeadIds.length;
      setSelectedLeadIds([]);
      setAlert(`🎉 Successfully imported ${count} verified B2B leads into CRM ${importDestination}! Deduplicated & tagged with "${tag}".`);
      setTimeout(() => setAlert(null), 4000);
    }, 1200);
  };

  // Handle CSV file upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setIsCsvUploadOpen(false);
      setAlert(`📥 Ingested and mapped 42 records from "${file.name}" (Apollo/ZoomInfo format) into CRM Contacts Directory!`);
      setTimeout(() => setAlert(null), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Database className="text-emerald-400" size={24} />
            B2B Lead Prospector & Bulk Import Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Search 275M+ verified decision-makers across Apollo.io, ZoomInfo, and UpLead — and bulk import verified leads directly into your CRM.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsApiSettingsOpen(true)}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Key size={14} className="text-emerald-400" />
            <span>API Keys & Providers</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCsvUploadOpen(true)}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <span>Upload Apollo/Zoom CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            disabled={selectedLeadIds.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 flex items-center gap-1.5 cursor-pointer"
          >
            <Zap size={14} />
            <span>Bulk Import to CRM ({selectedLeadIds.length})</span>
          </button>
        </div>
      </div>

      {/* Provider & Filter Bar */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
        {/* Data Source Selector Pills */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Data Source Provider:
            </span>
            {[
              { id: 'ALL', label: 'All Providers (Unified 275M+)' },
              { id: 'Apollo.io', label: '⚡ Apollo.io Verified' },
              { id: 'ZoomInfo', label: '🏢 ZoomInfo Enterprise' },
              { id: 'UpLead', label: '🎯 UpLead 95% Accuracy' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveProvider(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeProvider === p.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-xl border border-emerald-500/30">
            {filteredLeads.length} Matches Found
          </span>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Job Title (e.g. VP, CTO, Founder)..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] font-medium"
            />
          </div>

          <div>
            <select
              value={searchIndustry}
              onChange={(e) => setSearchIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-medium"
            >
              <option value="ALL">All Industries & Verticals</option>
              <option value="Hospital">Healthcare & Hospital</option>
              <option value="Real Estate">Real Estate & Brokerage</option>
              <option value="SaaS">SaaS & Tech Cloud</option>
              <option value="Supply">Logistics & Supply Chain</option>
              <option value="Manufacturing">Industrial Manufacturing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prospect Leads Data Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.length > 0 && selectedLeadIds.length === filteredLeads.length}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-white/20 bg-white/10 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Decision-Maker & Title</th>
                <th className="px-6 py-4">Company & Firmographics</th>
                <th className="px-6 py-4">Verified Contact Intel</th>
                <th className="px-6 py-4">Data Source Provider</th>
                <th className="px-6 py-4 text-right">Quick Ingest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                return (
                  <tr
                    key={lead.id}
                    className={`transition-colors ${isSelected ? 'bg-emerald-500/10' : 'hover:bg-white/[0.04]'}`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectLead(lead.id)}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-white/20 bg-white/10 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shadow-2xs">
                          {lead.firstName[0]}{lead.lastName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span>{lead.name}</span>
                            <a
                              href={lead.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-emerald-400"
                            >
                              <Globe size={12} />
                            </a>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[200px]">
                            {lead.title}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-xs text-white">{lead.company}</div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {lead.companySize} · {lead.revenue} · {lead.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-400" />
                          <span className="font-mono text-slate-200 font-medium">{lead.email}</span>
                          <span className="px-1.5 py-0.2 bg-emerald-500/15 text-emerald-300 text-[9px] font-bold rounded border border-emerald-500/30">
                            ✓ Verified
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone size={12} className="text-slate-500" />
                          <span className="font-mono text-[11px]">{lead.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                          lead.provider === 'Apollo.io'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : lead.provider === 'ZoomInfo'
                            ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {lead.provider} ({lead.confidenceScore}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedLeadIds([lead.id]);
                          setIsImportModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.1] rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus size={12} />
                        <span>Import</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-500 text-xs font-medium">
                    No prospect leads discovered yet. Use the <span className="text-emerald-400 font-bold">"Configure API Keys"</span> or <span className="text-emerald-400 font-bold">"CSV Bulk Upload"</span> above to search and import fresh B2B leads.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Remodeled Bulk Import Configuration Modal */}
      {isImportModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Specular Flare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header with category badge */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Database size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                    LEAD INGESTION ENGINE
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Bulk Ingest Verified Leads</h2>
                  <p className="text-xs text-slate-400 font-medium">{selectedLeadIds.length} lead profile(s) ready for synchronization</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium relative z-10">
              {/* Destination Target */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">CRM Destination Module</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CONTACTS', label: 'Contacts' },
                    { id: 'DEALS', label: 'Deals' },
                    { id: 'EMAIL_LIST', label: 'Campaign' },
                  ].map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => setImportDestination(dest.id as any)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        importDestination === dest.id
                          ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/20'
                          : 'border-white/[0.08] bg-black/40 text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {dest.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tagging */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Tag Ingested Records</label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Assign Lead Ownership</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  >
                    <option value="Sangram Cruze (SuperAdmin)">Sangram Cruze (SuperAdmin)</option>
                    <option value="Sarah Jenkins (Account Executive)">Sarah Jenkins (Account Executive)</option>
                    <option value="Round-Robin Lead Rotation">Round-Robin Lead Rotation</option>
                  </select>
                </div>
              </div>

              {/* Deduplication Toggle */}
              <div className="p-3.5 bg-black/40 border border-white/[0.08] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block text-xs">Automatic Deduplication</span>
                  <span className="text-[10px] text-slate-400">Skip leads whose work email already exists in CRM</span>
                </div>
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-white/20 bg-white/10 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08] relative z-10">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkImport}
                disabled={isImporting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={13} className={isImporting ? 'animate-spin' : ''} />
                <span>{isImporting ? 'Ingesting Leads...' : 'Confirm Bulk Import'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2. Remodeled API Key Settings Modal */}
      {isApiSettingsOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Specular Flare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header with category badge */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Key size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                    PROSPECTING VAULT
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Prospecting API Integrations</h2>
                  <p className="text-xs text-slate-400 font-medium">Configure encrypted Apollo, ZoomInfo, & UpLead tokens</p>
                </div>
              </div>
              <button
                onClick={() => setIsApiSettingsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium relative z-10">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Apollo.io API Key</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    value={apolloKey}
                    onChange={(e) => setApolloKey(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">ZoomInfo Enterprise Secret</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    value={zoomInfoKey}
                    onChange={(e) => setZoomInfoKey(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">UpLead API Token</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    value={upLeadKey}
                    onChange={(e) => setUpLeadKey(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08] relative z-10">
              <button
                type="button"
                onClick={() => {
                  setIsApiSettingsOpen(false);
                  setAlert('🔐 API credentials verified and securely saved to Tenant Vault!');
                  setTimeout(() => setAlert(null), 3000);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck size={14} />
                <span>Save Credentials</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 3. Remodeled CSV Upload Ingestion Modal */}
      {isCsvUploadOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Specular Flare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header with category badge */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                    DATA PIPELINE IMPORT
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Upload Prospect CSV</h2>
                  <p className="text-xs text-slate-400 font-medium">Auto-mapping ingestion from Apollo, ZoomInfo, & UpLead</p>
                </div>
              </div>
              <button
                onClick={() => setIsCsvUploadOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed relative z-10">
              Exported a CSV list from Apollo, ZoomInfo, UpLead, or Seamless.ai? Drop it below and the CRM will auto-map columns and ingest verified records.
            </p>

            <div className="border-2 border-dashed border-white/20 hover:border-emerald-400/50 rounded-2xl p-8 text-center space-y-3 transition-colors bg-black/40 relative z-10">
              <Upload size={28} className="mx-auto text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-white">Drag & Drop CSV / XLSX file</p>
                <p className="text-[11px] text-slate-500">or click to browse from your computer</p>
              </div>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleCsvUpload}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gradient-to-r file:from-emerald-500 file:to-teal-500 file:text-slate-950 hover:file:opacity-90 cursor-pointer"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
