'use client';

import { useState } from 'react';
import { Globe, Plus, Languages, Search } from 'lucide-react';

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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Add Translation Key</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Key Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. invoices.button_pay_now"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">English (EN)</label>
                <input
                  type="text"
                  required
                  placeholder="Pay Invoice Now"
                  value={enVal}
                  onChange={(e) => setEnVal(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Spanish (ES)</label>
                <input
                  type="text"
                  placeholder="Pagar Factura Ahora"
                  value={esVal}
                  onChange={(e) => setEsVal(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  Save Translation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
