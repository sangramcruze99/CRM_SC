'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type WorkspaceRole = 'sales' | 'finance' | 'admin' | 'all';

export interface WorkspaceRoleMetadata {
  id: WorkspaceRole;
  title: string;
  badge: string;
  icon: string;
  description: string;
  allowedCategories: number[];
  visiblePaths: string[];
}

export const WORKSPACE_ROLES: Record<WorkspaceRole, WorkspaceRoleMetadata> = {
  all: {
    id: 'all',
    title: 'Enterprise All-in-One',
    badge: 'Master',
    icon: '🌐',
    description: 'Unrestricted access to all 72 platform features across 13 functional pillars.',
    allowedCategories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    visiblePaths: ['/dashboard', '/', '/deals', '/projects', '/invoices', '/quotes', '/subscriptions', '/tickets', '/social', '/email-marketing', '/platform/templates/email', '/lead-prospector', '/ocr-invoice', '/chat', '/documents', '/e-signatures', '/ndas', '/offer-letters', '/compliance', '/developer', '/super-admin', '/customization', '/platform/schema', '/platform/objects', '/platform/roles', '/platform/ai', '/platform/navigation', '/onboarding', '/smart-upload', '/industry', '/lead-qualification', '/idp', '/ai-support', '/content-repurpose', '/data-sync', '/automations', '/banking', '/payment-links', '/qr-payments'],
  },
  sales: {
    id: 'sales',
    title: 'Sales & Growth Workspace',
    badge: 'Sales View',
    icon: '💼',
    description: 'Focuses on pipeline velocity, AI prospecting, social amplification, and contact relationships.',
    allowedCategories: [1, 5, 6, 8, 13],
    visiblePaths: ['/dashboard', '/', '/deals', '/projects', '/tickets', '/social', '/email-marketing', '/platform/templates/email', '/lead-prospector', '/chat', '/chat-widgets', '/contacts', '/onboarding', '/lead-qualification', '/content-repurpose', '/ai-support', '/automations', '/payment-links', '/qr-payments'],
  },
  finance: {
    id: 'finance',
    title: 'Finance & Legal Ops Workspace',
    badge: 'Finance View',
    icon: '⚖️',
    description: 'Focused on Dual Khata ledger reconciliations, OCR billing extraction, subscriptions, NDAs, and CPQ.',
    allowedCategories: [3, 7, 9, 13],
    visiblePaths: ['/dashboard', '/invoices', '/quotes', '/subscriptions', '/price-books', '/payment-links', '/qr-payments', '/banking', '/taxes', '/ocr-invoice', '/smart-upload', '/e-signatures', '/ndas', '/offer-letters', '/compliance', '/documents', '/s3-uploads', '/idp', '/data-sync', '/automations'],
  },
  admin: {
    id: 'admin',
    title: 'Developer & Admin Workspace',
    badge: 'Admin View',
    icon: '🛠️',
    description: 'Focused on low-code schema modeling, custom entities, RBAC permissions, vector AI prompt templates, and API keys.',
    allowedCategories: [2, 4, 10, 11, 13],
    visiblePaths: ['/dashboard', '/platform/schema', '/platform/objects', '/platform/roles', '/platform/ai', '/platform/navigation', '/developer', '/super-admin', '/customization', '/audit-logs', '/search-index', '/localization', '/marketplace', '/industry', '/lead-qualification', '/idp', '/ai-support', '/content-repurpose', '/data-sync', '/automations'],
  },
};

interface RoleWorkspaceContextType {
  currentRole: WorkspaceRole;
  setRole: (role: WorkspaceRole) => void;
  roleConfig: WorkspaceRoleMetadata;
  allRoles: WorkspaceRoleMetadata[];
  isPathVisible: (path: string) => boolean;
}

const RoleWorkspaceContext = createContext<RoleWorkspaceContextType>({
  currentRole: 'all',
  setRole: () => {},
  roleConfig: WORKSPACE_ROLES.all,
  allRoles: Object.values(WORKSPACE_ROLES),
  isPathVisible: () => true,
});

export function RoleWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<WorkspaceRole>('all');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('business_os_workspace_role') as WorkspaceRole;
      if (saved && WORKSPACE_ROLES[saved]) {
        setCurrentRole(saved);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const setRole = (role: WorkspaceRole) => {
    if (WORKSPACE_ROLES[role]) {
      setCurrentRole(role);
      try {
        localStorage.setItem('business_os_workspace_role', role);
      } catch (e) {
        // ignore
      }
    }
  };

  const roleConfig = WORKSPACE_ROLES[currentRole] || WORKSPACE_ROLES.all;
  const allRoles = Object.values(WORKSPACE_ROLES);

  const isPathVisible = (path: string) => {
    if (currentRole === 'all') return true;
    const base = path.split('?')[0].split('#')[0];
    return roleConfig.visiblePaths.some((p) => base === p || (p !== '/' && base.startsWith(p)));
  };

  return (
    <RoleWorkspaceContext.Provider value={{ currentRole, setRole, roleConfig, allRoles, isPathVisible }}>
      {children}
    </RoleWorkspaceContext.Provider>
  );
}

export function useRoleWorkspace() {
  return useContext(RoleWorkspaceContext);
}
