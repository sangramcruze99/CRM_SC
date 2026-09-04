import { IndustryNiche } from '@/components/industry/IndustryContext';

export type EmployeeTier = 'TIER_A' | 'TIER_B' | 'TIER_C' | 'TIER_D';

export interface EmployeeNode {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  tier: EmployeeTier;
  level: number; // 0: Tier A (Upper Mgmt), 1: Tier B (Middle Mgmt), 2: Tier C (Operations), 3: Tier D (Support)
  managerId: string | null;
  email: string;
  phone: string;
  avatar: string;
  startDate: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contractor';
  salary: {
    baseMonthly: number;
    allowances: number;
    bonus: number;
    taxDeductions: number;
    netMonthly: number;
    currency: string;
    paymentStatus: 'PAID' | 'PROCESSING' | 'PENDING';
    lastPayDate: string;
  };
  niche: IndustryNiche;
}

export interface TierDefinition {
  tier: EmployeeTier;
  level: number;
  code: string;
  title: string;
  subtitle: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorder: string;
  glowColor: string;
  examples: string;
}

export const TIER_DEFINITIONS: Record<EmployeeTier, TierDefinition> = {
  TIER_A: {
    tier: 'TIER_A',
    level: 0,
    code: 'TIER A',
    title: 'Upper Management',
    subtitle: 'Executive Leadership & C-Suite',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/50',
    cardBorder: 'border-amber-500/60 ring-1 ring-amber-500/30',
    glowColor: 'shadow-amber-500/15',
    examples: 'CEO, CFO, CTO, Managing Directors, Medical Directors, Managing Brokers',
  },
  TIER_B: {
    tier: 'TIER_B',
    level: 1,
    code: 'TIER B',
    title: 'Middle Management',
    subtitle: 'General Managers & Department Leads',
    badgeBg: 'bg-sky-500/20',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-500/50',
    cardBorder: 'border-sky-500/40 hover:border-sky-400/60',
    glowColor: 'shadow-sky-500/15',
    examples: 'General Managers, Department Leads, Supervisors, Head Chefs, Store Managers',
  },
  TIER_C: {
    tier: 'TIER_C',
    level: 2,
    code: 'TIER C',
    title: 'Operations',
    subtitle: 'Specialists, Engineers & Technicians',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/50',
    cardBorder: 'border-emerald-500/40 hover:border-emerald-400/60',
    glowColor: 'shadow-emerald-500/15',
    examples: 'Doctors, Software Engineers, Senior Agents, Sous Chefs, Cashiers, Designers',
  },
  TIER_D: {
    tier: 'TIER_D',
    level: 3,
    code: 'TIER D',
    title: 'Support Staff',
    subtitle: 'Clerks, Janitors & Facility Maintenance',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-500/50',
    cardBorder: 'border-purple-500/40 hover:border-purple-400/60',
    glowColor: 'shadow-purple-500/15',
    examples: 'Records Clerks, Custodians, Sanitization Workers, Porters, Receptionists',
  },
};

export const getTierFromLevel = (level: number): EmployeeTier => {
  switch (level) {
    case 0:
      return 'TIER_A';
    case 1:
      return 'TIER_B';
    case 2:
      return 'TIER_C';
    case 3:
      return 'TIER_D';
    default:
      return 'TIER_C';
  }
};

// CLEAN SLATE: Default all industry niches to empty arrays
export const INITIAL_NICHE_EMPLOYEES: Record<IndustryNiche, EmployeeNode[]> = {
  all: [],
  hospital: [],
  realestate: [],
  restaurant: [],
  retail: [],
  sme: [],
  agency: [],
  custom: [],
};
