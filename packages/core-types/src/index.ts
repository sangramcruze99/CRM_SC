export interface Contact {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyId?: string;
  customData?: any;
  company?: Company;
}

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  domain?: string;
  industry?: string;
  customData?: any;
}

export * from './events';
