'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Plus, Languages, Search, X, Sparkles, Key, FileText, Globe2 } from 'lucide-react';

interface TranslationKey {
  id: string;
  keyName: string;
  namespace: string;
  en: string;
  es: string;
  fr: string;
  de: string;
}

const initialDemoTranslations: TranslationKey[] = [
  {
    id: 'tr_01',
    keyName: 'dashboard.welcome_banner',
    namespace: 'dashboard',
    en: 'Welcome back to your Business OS workspace',
    es: 'Bienvenido de nuevo a su espacio de trabajo de Business OS',
    fr: 'Bienvenue dans votre espace de travail Business OS',
    de: 'Willkommen zurück in Ihrem Business OS-Arbeitsbereich',
  },
  {
    id: 'tr_02',
    keyName: 'contacts.create_new',
    namespace: 'crm',
    en: 'Create New Contact',
    es: 'Crear Nuevo Contacto',
    fr: 'Créer un Nouveau Contact',
    de: 'Neuen Kontakt erstellen',
  },
  {
    id: 'tr_03',
    keyName: 'deals.pipeline_stage_won',
    namespace: 'sales',
    en: 'Closed Won Deal',
    es: 'Trato Ganado',
    fr: 'Affaire Gagnée',
    de: 'Gewonnener Abschluss',
  },
  {
    id: 'tr_04',
    keyName: 'helpdesk.ticket_status_resolved',
    namespace: 'support',
    en: 'Ticket Resolved Successfully',
    es: 'Ticket Resuelto Exitosamente',
    fr: 'Ticket Résolu avec Succès',
    de: 'Ticket erfolgreich gelöst',
  },
];

export function LocalizationClient({ initialLocales = [] }: { initialLocales?: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [translations, setTranslations] = useState<TranslationKey[]>(
    initialLocales.length > 0 ? initialLocales : initialDemoTranslations
  );
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'es' | 'fr' | 'de'>('en');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [enVal, setEnVal] = useState('');
  const [esVal, setEsVal] = useState('');
  const [frVal, setFrVal] = useState('');
  const [deVal, setDeVal] = useState('');

  const filtered = translations.filter(
    (t) =>
      t.keyName.toLowerCase().includes(search.toLowerCase()) ||
      t.en.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!keyName || !enVal) return;

    const newKey: TranslationKey = {
      id: `tr_${Math.floor(10 + Math.random() * 90)}`,
      keyName,
      namespace: keyName.split('.')[0] || 'common',
      en: enVal,
      es: esVal || enVal,
      fr: frVal || enVal,
      de: deVal || enVal,
    };

    setTranslations([...translations, newKey]);
    setIsModalOpen(false);
    setKeyName('');
    setEnVal('');
    setEsVal('');
    setFrVal('');
    setDeVal('');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Languages className="text-emerald-400" size={24} />
            Internationalization & Localization
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage multi-language translation strings, fallback dictionaries, and localized CRM copy.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Translation Key</span>
        </button>
      </div>

      {/* Language Switcher Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.04] backdrop-blur-2xl p-4 rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search translation keys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Globe size={15} className="text-slate-400 hidden sm:block" />
          {[
            { code: 'en', label: 'English (US)' },
            { code: 'es', label: 'Spanish (ES)' },
            { code: 'fr', label: 'French (FR)' },
            { code: 'de', label: 'German (DE)' },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => setActiveLanguage(l.code as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeLanguage === l.code
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">Key Identifier</th>
              <th className="px-6 py-4">Namespace</th>
              <th className="px-6 py-4">English Base</th>
              <th className="px-6 py-4">Active Locale String ({activeLanguage.toUpperCase()})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-emerald-400 text-xs">{t.keyName}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.08] text-slate-300 border border-white/10">
                    {t.namespace}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs font-medium">{t.en}</td>
                <td className="px-6 py-4 font-semibold text-white text-xs">{t[activeLanguage]}</td>
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
                  <Globe2 size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                    I18N LOCALIZATION ENGINE
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Add Translation Key</h2>
                  <p className="text-xs text-slate-400 font-medium">Register dynamic multilingual dictionary tokens</p>
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
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Key Identifier</label>
                <div className="relative">
                  <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. invoices.button_pay_now"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">English (EN)</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Pay Invoice Now"
                    value={enVal}
                    onChange={(e) => setEnVal(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Spanish (ES)</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Pagar Factura Ahora"
                    value={esVal}
                    onChange={(e) => setEsVal(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
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
                  <span>Save Translation</span>
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
