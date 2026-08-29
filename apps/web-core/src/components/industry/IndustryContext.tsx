'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ALL_67_FEATURES, FeatureItem } from '@/lib/featureCatalog';

export type IndustryNiche =
  | 'all'
  | 'hospital'
  | 'realestate'
  | 'restaurant'
  | 'retail'
  | 'sme'
  | 'agency'
  | 'custom';

export interface NicheMetadata {
  id: IndustryNiche;
  name: string;
  shortName: string;
  tagline: string;
  icon: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  terminology: {
    contacts: string;
    deals: string;
    projects: string;
    invoices: string;
    products: string;
    tickets: string;
  };
  navigationSections: {
    sectionTitle: string;
    items: {
      label: string;
      href: string;
      iconName: string;
      badge?: string;
    }[];
  }[];
}

export const NICHE_CONFIGS: Record<IndustryNiche, NicheMetadata> = {
  all: {
    id: 'all',
    name: 'Master Enterprise (All Modules)',
    shortName: 'Enterprise Master',
    tagline: 'Unfiltered access to all 67 enterprise CRM, platform, and revenue modules.',
    icon: '🌐',
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200/80',
    terminology: {
      contacts: 'Contacts & Accounts',
      deals: 'Deals Pipeline',
      projects: 'Sprint Projects',
      invoices: 'Commercial Invoices',
      products: 'Price Books',
      tickets: 'Helpdesk Support',
    },
    navigationSections: [
      {
        sectionTitle: 'Core CRM',
        items: [
          { label: 'Executive Dashboard', href: '/dashboard', iconName: 'LayoutDashboard' },
          { label: 'Contacts & Accounts', href: '/', iconName: 'Users' },
          { label: 'Deals Pipeline', href: '/deals', iconName: 'Briefcase' },
          { label: 'Sprint Projects', href: '/projects', iconName: 'ClipboardList' },
          { label: 'Commercial Invoices', href: '/invoices', iconName: 'Receipt' },
          { label: 'AI OCR Invoice Maker', href: '/ocr-invoice', iconName: 'Scan', badge: 'OCR' },
          { label: 'Helpdesk Support', href: '/tickets', iconName: 'Ticket' },
          { label: 'Employee Directory', href: '/directory', iconName: 'Contact' },
          { label: 'Document Vault', href: '/documents', iconName: 'Folder' },
        ],
      },
      {
        sectionTitle: 'Marketing & Growth',
        items: [
          { label: 'Lead Prospector (Apollo/Zoom)', href: '/lead-prospector', iconName: 'Database', badge: '275M+' },
          { label: 'Enterprise AI Studio', href: '/ai-studio', iconName: 'Brain', badge: 'v4.8' },
          { label: 'Social Media Studio', href: '/social', iconName: 'Share2', badge: 'AI' },
          { label: 'Email Marketing & Builder', href: '/email-marketing', iconName: 'Mail', badge: 'New' },
        ],
      },
      {
        sectionTitle: 'Industry Workspaces',
        items: [
          { label: 'Niche Profile Studio', href: '/industry', iconName: 'Sparkles', badge: 'Active' },
          { label: '🏥 Hospital & Healthcare', href: '/industry/hospital', iconName: 'Stethoscope' },
          { label: '🏡 Real Estate & Brokerage', href: '/industry/realestate', iconName: 'Home' },
          { label: '🍽️ Restaurant & Floor Plan', href: '/industry/restaurant', iconName: 'UtensilsCrossed' },
          { label: '🛍️ Local Retail & POS', href: '/industry/retail', iconName: 'ShoppingBag' },
        ],
      },
      {
        sectionTitle: 'Platform & Operations',
        items: [
          { label: 'SaaS Subscriptions', href: '/subscriptions', iconName: 'DollarSign' },
          { label: 'Commercial Quotes', href: '/quotes', iconName: 'FileBadge' },
          { label: 'Price Books', href: '/price-books', iconName: 'Layers' },
          { label: 'Instant Payment Links', href: '/payment-links', iconName: 'Zap' },
          { label: 'E-Signatures', href: '/e-signatures', iconName: 'FileSignature' },
          { label: 'SOC2 Compliance', href: '/compliance', iconName: 'ShieldAlert' },
          { label: 'Customization & Studio', href: '/customization', iconName: 'Sliders', badge: 'v4.8' },
          { label: 'Developer API & Webhooks', href: '/developer', iconName: 'Code2' },
          { label: 'Super Admin Switcher', href: '/super-admin', iconName: 'Building' },
        ],
      },
    ],
  },
  hospital: {
    id: 'hospital',
    name: 'Hospital, Clinic & Healthcare OS',
    shortName: 'Hospital & Clinic',
    tagline: 'Tailored for medical centers, hospitals, private clinics, and diagnostic labs.',
    icon: '🏥',
    accentColor: 'rose',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200/80',
    terminology: {
      contacts: 'Patients & EHR',
      deals: 'Treatment Care Plans',
      projects: 'Surgical Schedules',
      invoices: 'Medical Billing & Invoices',
      products: 'Pharmacy & Drug Formulary',
      tickets: 'Triage & Patient Inquiries',
    },
    navigationSections: [
      {
        sectionTitle: 'Clinical Operations',
        items: [
          { label: 'Clinical Command Hub', href: '/industry/hospital', iconName: 'Stethoscope', badge: 'Live' },
          { label: 'Patients Directory (EHR)', href: '/', iconName: 'Users' },
          { label: 'Doctor Appointment Queue', href: '/industry/hospital#appointments', iconName: 'Calendar' },
          { label: 'Patient Inquiries & Triage', href: '/tickets', iconName: 'Ticket' },
        ],
      },
      {
        sectionTitle: 'Billing & Pharmacy',
        items: [
          { label: 'Medical Invoices & Copay', href: '/invoices', iconName: 'Receipt' },
          { label: 'Pharmacy Drug Catalog', href: '/price-books', iconName: 'Layers' },
          { label: 'Patient Consent Signatures', href: '/e-signatures', iconName: 'FileSignature' },
          { label: 'Medical Documents Vault', href: '/documents', iconName: 'Folder' },
        ],
      },
      {
        sectionTitle: 'Staff & Compliance',
        items: [
          { label: 'Physicians & Staff Roster', href: '/directory', iconName: 'Contact' },
          { label: 'HIPAA Security Controls', href: '/compliance', iconName: 'ShieldCheck' },
          { label: 'Automated Patient SMS/Email', href: '/email-marketing', iconName: 'Mail' },
        ],
      },
    ],
  },
  realestate: {
    id: 'realestate',
    name: 'Real Estate Brokerage & Property OS',
    shortName: 'Real Estate & Property',
    tagline: 'Optimized for real estate agents, commercial brokerages, property developers, and landlords.',
    icon: '🏡',
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200/80',
    terminology: {
      contacts: 'Buyers, Sellers & Tenants',
      deals: 'Property Sales & Escrow',
      projects: 'Site Visits & Inspections',
      invoices: 'Commission & Rental Billing',
      products: 'Property Listings & Units',
      tickets: 'Tenant Maintenance Requests',
    },
    navigationSections: [
      {
        sectionTitle: 'Real Estate CRM',
        items: [
          { label: 'Property Command Center', href: '/industry/realestate', iconName: 'Home', badge: 'MLS' },
          { label: 'Buyer & Seller Directory', href: '/', iconName: 'Users' },
          { label: 'Sales & Escrow Pipeline', href: '/deals', iconName: 'Briefcase' },
          { label: 'Property Showings & Tasks', href: '/projects', iconName: 'ClipboardList' },
        ],
      },
      {
        sectionTitle: 'Listings & Contracts',
        items: [
          { label: 'Property Inventory Catalog', href: '/price-books', iconName: 'Layers' },
          { label: 'Buyer Proposals & Quotes', href: '/quotes', iconName: 'FileBadge' },
          { label: 'Purchase Agreements & Deeds', href: '/e-signatures', iconName: 'FileSignature' },
          { label: 'Confidentiality NDAs', href: '/ndas', iconName: 'FileCheck' },
          { label: 'Floor Plans & Media Vault', href: '/documents', iconName: 'Folder' },
        ],
      },
      {
        sectionTitle: 'Marketing & Commissions',
        items: [
          { label: 'Social Property Ads Studio', href: '/social', iconName: 'Share2' },
          { label: 'Email Newsletter to Buyers', href: '/email-marketing', iconName: 'Mail' },
          { label: 'Brokerage Commission Ledger', href: '/invoices', iconName: 'Receipt' },
          { label: 'Licensed Agents Directory', href: '/directory', iconName: 'Contact' },
        ],
      },
    ],
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant, Café & Hospitality OS',
    shortName: 'Restaurant & Café',
    tagline: 'Customized for dining restaurants, cafés, cloud kitchens, bars, and catering businesses.',
    icon: '🍽️',
    accentColor: 'amber',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200/80',
    terminology: {
      contacts: 'Guests & VIP Diners',
      deals: 'Private Dining & Catering',
      projects: 'Kitchen Orders (KOT)',
      invoices: 'Dining & Delivery Bills',
      products: 'Food & Beverage Menu',
      tickets: 'Guest Feedback & Reviews',
    },
    navigationSections: [
      {
        sectionTitle: 'Floor & Kitchen Operations',
        items: [
          { label: 'Table Floor Plan & Host Desk', href: '/industry/restaurant', iconName: 'UtensilsCrossed', badge: 'Live' },
          { label: 'Kitchen Orders Queue (KOT)', href: '/projects', iconName: 'ClipboardList' },
          { label: 'VIP Guests & Regulars', href: '/', iconName: 'Users' },
          { label: 'Guest Feedback & Support', href: '/tickets', iconName: 'Ticket' },
        ],
      },
      {
        sectionTitle: 'Menu & POS Invoicing',
        items: [
          { label: 'Food & Beverage Menu', href: '/price-books', iconName: 'Layers' },
          { label: 'Dining & Takeaway Bills', href: '/invoices', iconName: 'Receipt' },
          { label: 'Table QR Payment Links', href: '/payment-links', iconName: 'Zap' },
          { label: 'Catering & Event Inquiries', href: '/deals', iconName: 'Briefcase' },
        ],
      },
      {
        sectionTitle: 'Staff & Promos',
        items: [
          { label: 'Social Food Promo Studio', href: '/social', iconName: 'Share2' },
          { label: 'Weekly Special Email Blast', href: '/email-marketing', iconName: 'Mail' },
          { label: 'Chefs & Waitstaff Roster', href: '/directory', iconName: 'Contact' },
        ],
      },
    ],
  },
  retail: {
    id: 'retail',
    name: 'Local Retail, Shop & Supermarket POS',
    shortName: 'Retail & Khata Shop',
    tagline: 'Engineered for retail stores, supermarkets, grocery outlets, wholesalers, and traders.',
    icon: '🛍️',
    accentColor: 'teal',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-200/80',
    terminology: {
      contacts: 'Store Customers',
      deals: 'Wholesale B2B Orders',
      projects: 'Stock Delivery Audits',
      invoices: 'Retail Sales Receipts',
      products: 'Barcode Inventory SKUs',
      tickets: 'Customer Returns & Claims',
    },
    navigationSections: [
      {
        sectionTitle: 'Point of Sale & Shop Counter',
        items: [
          { label: 'Cashier POS & Register', href: '/industry/retail', iconName: 'ShoppingBag', badge: 'POS' },
          { label: 'Customer Khata Credit Book', href: '/', iconName: 'Users' },
          { label: 'Retail Sales Ledger', href: '/invoices', iconName: 'Receipt' },
          { label: 'Product Stock & Barcodes', href: '/price-books', iconName: 'Layers' },
        ],
      },
      {
        sectionTitle: 'Customer Engagement',
        items: [
          { label: 'Instant Payment Links', href: '/payment-links', iconName: 'Zap' },
          { label: 'WhatsApp Receipts & Promos', href: '/social', iconName: 'Share2' },
          { label: 'Discount Email Campaigns', href: '/email-marketing', iconName: 'Mail' },
          { label: 'Customer Returns Support', href: '/tickets', iconName: 'Ticket' },
        ],
      },
      {
        sectionTitle: 'Store Management',
        items: [
          { label: 'Cashiers & Staff Roster', href: '/directory', iconName: 'Contact' },
          { label: 'Sales & Inventory Reports', href: '/reports', iconName: 'Activity' },
          { label: 'Tax & GST Settings', href: '/taxes', iconName: 'Receipt' },
        ],
      },
    ],
  },
  sme: {
    id: 'sme',
    name: 'SME & Tech B2B SaaS OS',
    shortName: 'SME & Tech SaaS',
    tagline: 'Built for software companies, high-growth B2B startups, consultants, and scale-ups.',
    icon: '🏢',
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200/80',
    terminology: {
      contacts: 'Accounts & Leads',
      deals: 'Sales Pipeline',
      projects: 'Sprint Boards',
      invoices: 'Recurring Invoices',
      products: 'Plan Pricing Catalog',
      tickets: 'Customer Success Helpdesk',
    },
    navigationSections: [
      {
        sectionTitle: 'Revenue & Sales CRM',
        items: [
          { label: 'Executive Revenue Dashboard', href: '/dashboard', iconName: 'LayoutDashboard' },
          { label: 'Accounts & Key Contacts', href: '/', iconName: 'Users' },
          { label: 'Multi-Stage Deals Pipeline', href: '/deals', iconName: 'Briefcase' },
          { label: 'Sprint Projects & Tasks', href: '/projects', iconName: 'ClipboardList' },
        ],
      },
      {
        sectionTitle: 'Subscriptions & Contracts',
        items: [
          { label: 'MRR SaaS Subscriptions', href: '/subscriptions', iconName: 'DollarSign' },
          { label: 'Enterprise Quotes', href: '/quotes', iconName: 'FileBadge' },
          { label: 'Contract E-Signatures', href: '/e-signatures', iconName: 'FileSignature' },
          { label: 'Customer Success Tickets', href: '/tickets', iconName: 'Ticket' },
        ],
      },
      {
        sectionTitle: 'Growth & Developer Platform',
        items: [
          { label: 'Social Growth Studio', href: '/social', iconName: 'Share2' },
          { label: 'Email Marketing & Sequences', href: '/email-marketing', iconName: 'Mail' },
          { label: 'Developer API & Webhooks', href: '/developer', iconName: 'Code2' },
          { label: 'SOC2 Audit Compliance', href: '/compliance', iconName: 'ShieldAlert' },
        ],
      },
    ],
  },
  agency: {
    id: 'agency',
    name: 'Creative Agency & Services OS',
    shortName: 'Creative Agency',
    tagline: 'Tailored for digital agencies, marketing studios, dev shops, and consultancy firms.',
    icon: '🎨',
    accentColor: 'purple',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200/80',
    terminology: {
      contacts: 'Client Accounts',
      deals: 'Pitch & Retainer Proposals',
      projects: 'Client Deliverables & Sprints',
      invoices: 'Milestone & Retainer Bills',
      products: 'Service Rate Cards',
      tickets: 'Client Support Tickets',
    },
    navigationSections: [
      {
        sectionTitle: 'Client Operations',
        items: [
          { label: 'Client Accounts & Stakeholders', href: '/', iconName: 'Users' },
          { label: 'Pitch & Retainer Proposals', href: '/deals', iconName: 'Briefcase' },
          { label: 'Client Sprints & Deliverables', href: '/projects', iconName: 'ClipboardList' },
          { label: 'Client Requests & Revisions', href: '/tickets', iconName: 'Ticket' },
        ],
      },
      {
        sectionTitle: 'Contracts & Billing',
        items: [
          { label: 'Agency Service Rate Cards', href: '/price-books', iconName: 'Layers' },
          { label: 'Client Proposals & SOWs', href: '/quotes', iconName: 'FileBadge' },
          { label: 'Milestone & Retainer Invoices', href: '/invoices', iconName: 'Receipt' },
          { label: 'Client MSA E-Signatures', href: '/e-signatures', iconName: 'FileSignature' },
          { label: 'Agency Creative Vault', href: '/documents', iconName: 'Folder' },
        ],
      },
      {
        sectionTitle: 'Marketing & Showcase',
        items: [
          { label: 'Social Agency Studio', href: '/social', iconName: 'Share2' },
          { label: 'Case Study Email Blasts', href: '/email-marketing', iconName: 'Mail' },
          { label: 'Agency Talent Directory', href: '/directory', iconName: 'Contact' },
        ],
      },
    ],
  },
  custom: {
    id: 'custom',
    name: 'Custom Tailored Workspace',
    shortName: 'Custom Niche',
    tagline: 'Bespoke workspace configured with user-selected features from the 67-feature catalog.',
    icon: '⚡',
    accentColor: 'amber',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200/80',
    terminology: {
      contacts: 'Contacts & Accounts',
      deals: 'Sales & Deals',
      projects: 'Tasks & Projects',
      invoices: 'Invoices & Billing',
      products: 'Catalog & Products',
      tickets: 'Support & Inquiries',
    },
    navigationSections: [
      {
        sectionTitle: 'My Selected Features',
        items: [
          { label: 'Executive Dashboard', href: '/dashboard', iconName: 'LayoutDashboard' },
          { label: 'Contacts & Accounts', href: '/', iconName: 'Users' },
          { label: 'AI OCR Invoice Maker', href: '/ocr-invoice', iconName: 'Scan' },
          { label: 'Lead Prospector', href: '/lead-prospector', iconName: 'Database' },
          { label: 'Social Media Studio', href: '/social', iconName: 'Share2' },
        ],
      },
    ],
  },
};

function getDefaultFeaturesForNiche(niche: IndustryNiche): string[] {
  if (niche === 'all') {
    return ALL_67_FEATURES.map((f) => f.id);
  }
  return ALL_67_FEATURES.filter((f) => f.defaultInNiches.includes(niche)).map((f) => f.id);
}

interface IndustryContextType {
  currentNiche: IndustryNiche;
  setNiche: (niche: IndustryNiche) => void;
  nicheConfig: NicheMetadata;
  allNiches: NicheMetadata[];
  activeFeatureIds: string[];
  activeFeatures: FeatureItem[];
  toggleFeature: (featureId: string) => void;
  setNicheFeatures: (featureIds: string[]) => void;
  isFeatureEnabled: (featureId: string) => boolean;
  resetToNicheDefaults: (niche?: IndustryNiche) => void;
}

const IndustryContext = createContext<IndustryContextType>({
  currentNiche: 'all',
  setNiche: () => {},
  nicheConfig: NICHE_CONFIGS.all,
  allNiches: Object.values(NICHE_CONFIGS),
  activeFeatureIds: ALL_67_FEATURES.map((f) => f.id),
  activeFeatures: ALL_67_FEATURES,
  toggleFeature: () => {},
  setNicheFeatures: () => {},
  isFeatureEnabled: () => true,
  resetToNicheDefaults: () => {},
});

export function IndustryProvider({ children }: { children: React.ReactNode }) {
  const [currentNiche, setCurrentNicheState] = useState<IndustryNiche>('all');
  const [nicheFeatureMap, setNicheFeatureMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    try {
      const savedNiche = localStorage.getItem('business_os_niche') as IndustryNiche;
      if (savedNiche && NICHE_CONFIGS[savedNiche]) {
        setCurrentNicheState(savedNiche);
      }

      const savedMap = localStorage.getItem('business_os_niche_features');
      if (savedMap) {
        setNicheFeatureMap(JSON.parse(savedMap));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveNicheFeatureMap = (updated: Record<string, string[]>) => {
    setNicheFeatureMap(updated);
    try {
      localStorage.setItem('business_os_niche_features', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const setNiche = (niche: IndustryNiche) => {
    if (NICHE_CONFIGS[niche]) {
      setCurrentNicheState(niche);
      try {
        localStorage.setItem('business_os_niche', niche);
      } catch (e) {
        // ignore
      }
    }
  };

  // Get active features for current niche (from custom map or defaults)
  const activeFeatureIds =
    nicheFeatureMap[currentNiche] || getDefaultFeaturesForNiche(currentNiche);

  const activeFeatures = ALL_67_FEATURES.filter((f) => activeFeatureIds.includes(f.id));

  const toggleFeature = (featureId: string) => {
    const currentList = activeFeatureIds;
    const exists = currentList.includes(featureId);
    const updated = exists
      ? currentList.filter((id) => id !== featureId)
      : [...currentList, featureId];

    saveNicheFeatureMap({
      ...nicheFeatureMap,
      [currentNiche]: updated,
    });
  };

  const setNicheFeatures = (featureIds: string[]) => {
    saveNicheFeatureMap({
      ...nicheFeatureMap,
      [currentNiche]: featureIds,
    });
  };

  const resetToNicheDefaults = (niche?: IndustryNiche) => {
    const target = niche || currentNiche;
    const defaults = getDefaultFeaturesForNiche(target);
    const updated = { ...nicheFeatureMap };
    delete updated[target];
    saveNicheFeatureMap(updated);
  };

  const isFeatureEnabled = (featureId: string) => {
    return activeFeatureIds.includes(featureId);
  };

  const nicheConfig = NICHE_CONFIGS[currentNiche] || NICHE_CONFIGS.all;
  const allNiches = Object.values(NICHE_CONFIGS);

  return (
    <IndustryContext.Provider
      value={{
        currentNiche,
        setNiche,
        nicheConfig,
        allNiches,
        activeFeatureIds,
        activeFeatures,
        toggleFeature,
        setNicheFeatures,
        isFeatureEnabled,
        resetToNicheDefaults,
      }}
    >
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry() {
  return useContext(IndustryContext);
}
