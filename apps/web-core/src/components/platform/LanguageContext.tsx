'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'es' | 'fr' | 'ar' | 'de' | 'hi';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية (RTL)', flag: '🇦🇪', dir: 'rtl' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
];

const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    workspace: 'Workspace',
    dashboard: 'Executive Dashboard',
    contacts: 'Contacts & Accounts',
    deals: 'Deals Pipeline',
    invoices: 'Commercial Invoices',
    directory: 'Employee Directory',
    telephony: 'AI Voice & Softphone',
    inbox: 'Omnichannel Inbox',
    automations: 'Automations',
    banking: 'Bank & Forex',
    migration: 'CRM Migration',
    switchNiche: 'Switch Niche',
    totalBalance: 'Total Balance',
    grossEarnings: 'Gross Earnings',
    expenses: 'Monthly Expenses',
    searchPlaceholder: 'Search leads, deals, or press ⌘K...',
  },
  es: {
    workspace: 'Espacio de Trabajo',
    dashboard: 'Panel Ejecutivo',
    contacts: 'Contactos y Cuentas',
    deals: 'Embudo de Ventas',
    invoices: 'Facturas Comerciales',
    directory: 'Directorio de Empleados',
    telephony: 'Voz IA y Telefonía',
    inbox: 'Buzón Omnicanal',
    automations: 'Automatizaciones',
    banking: 'Banca y Divisas',
    migration: 'Migración de CRM',
    switchNiche: 'Cambiar Nicho',
    totalBalance: 'Balance Total',
    grossEarnings: 'Ingresos Brutos',
    expenses: 'Gastos Mensuales',
    searchPlaceholder: 'Buscar clientes o presione ⌘K...',
  },
  fr: {
    workspace: 'Espace de Travail',
    dashboard: 'Tableau de Bord',
    contacts: 'Contacts et Comptes',
    deals: 'Pipeline de Ventes',
    invoices: 'Factures Commerciales',
    directory: 'Annuaire des Employés',
    telephony: 'Téléphonie et IA Voix',
    inbox: 'Boîte de Réception',
    automations: 'Automatisations',
    banking: 'Banque et Devises',
    migration: 'Migration CRM',
    switchNiche: 'Changer de Secteur',
    totalBalance: 'Solde Total',
    grossEarnings: 'Revenus Bruts',
    expenses: 'Dépenses Mensuelles',
    searchPlaceholder: 'Rechercher des prospects ou ⌘K...',
  },
  ar: {
    workspace: 'مساحة العمل',
    dashboard: 'لوحة التحكم التنفيذية',
    contacts: 'جهات الاتصال والحسابات',
    deals: 'مسار الصفقات',
    invoices: 'الفواتير التجارية',
    directory: 'دليل الموظفين',
    telephony: 'الهاتف الصوتي والذكاء الاصطناعي',
    inbox: 'صندوق الوارد الموحد',
    automations: 'الأتمتة الذكية',
    banking: 'المصارف والعملات',
    migration: 'نقل بيانات النظام',
    switchNiche: 'تغيير قطاع العمل',
    totalBalance: 'إجمالي الرصيد',
    grossEarnings: 'إجمالي الأرباح',
    expenses: 'المصروفات الشهرية',
    searchPlaceholder: 'ابحث عن العملاء أو اضغط ⌘K...',
  },
  de: {
    workspace: 'Arbeitsbereich',
    dashboard: 'Vorstands-Dashboard',
    contacts: 'Kontakte & Konten',
    deals: 'Deal-Pipeline',
    invoices: 'Handelsrechnungen',
    directory: 'Mitarbeiterverzeichnis',
    telephony: 'KI-Telefonie & Softphone',
    inbox: 'Omnichannel-Posteingang',
    automations: 'Automatisierungen',
    banking: 'Banken & Devisen',
    migration: 'CRM-Datenmigration',
    switchNiche: 'Branche Wechseln',
    totalBalance: 'Gesamtsaldo',
    grossEarnings: 'Bruttoeinnahmen',
    expenses: 'Monatliche Ausgaben',
    searchPlaceholder: 'Leads oder Deals suchen mit ⌘K...',
  },
  hi: {
    workspace: 'कार्यक्षेत्र',
    dashboard: 'कार्यकारी डैशबोर्ड',
    contacts: 'संपर्क और खाते',
    deals: 'डील पाइपलाइन',
    invoices: 'व्यावसायिक चालान',
    directory: 'कर्मचारी निर्देशिका',
    telephony: 'एआई वॉयस टेलीफोनी',
    inbox: 'एकीकृत इनबॉक्स',
    automations: 'स्वचालन कार्यप्रवाह',
    banking: 'खाता और विदेशी मुद्रा',
    migration: 'सीआरएम डेटा माइग्रेशन',
    switchNiche: 'उद्योग बदलें',
    totalBalance: 'कुल शेष राशि',
    grossEarnings: 'सकल कमाई',
    expenses: 'मासिक खर्च',
    searchPlaceholder: 'खोजें या ⌘K दबाएं...',
  },
};

interface LanguageContextType {
  currentLang: LanguageOption;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentCode, setCurrentCode] = useState<LanguageCode>('en');

  useEffect(() => {
    const saved = localStorage.getItem('business_os_lang') as LanguageCode;
    if (saved && TRANSLATIONS[saved]) {
      setCurrentCode(saved);
      document.documentElement.dir = SUPPORTED_LANGUAGES.find((l) => l.code === saved)?.dir || 'ltr';
    }
  }, []);

  const setLanguage = (code: LanguageCode) => {
    setCurrentCode(code);
    localStorage.setItem('business_os_lang', code);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (langObj) {
      document.documentElement.dir = langObj.dir;
    }
  };

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentCode) || SUPPORTED_LANGUAGES[0];

  const t = (key: string, fallback?: string): string => {
    return TRANSLATIONS[currentCode]?.[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
