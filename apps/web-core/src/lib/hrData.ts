import { IndustryNiche } from '@/components/industry/IndustryContext';

export interface EmployeeNode {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  level: number; // 0: CEO/Director, 1: Manager/VP, 2: Team Lead/Supervisor, 3: Clerk/Staff/Associate
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
