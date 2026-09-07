/**
 * Centralized Service Document Registry
 * Configures service namespaces, modules, and permitted document categories across the platform.
 * Database metadata is the authoritative source of truth.
 */

export type DocumentCategory = 'input' | 'upload' | 'receipt' | 'output';

export interface ModuleConfig {
  allowedCategories: DocumentCategory[];
  description?: string;
  defaultCategory?: DocumentCategory;
}

export interface ServiceDocumentConfig {
  service: string;
  displayName: string;
  modules: Record<string, ModuleConfig>;
}

export const ALL_DOCUMENT_CATEGORIES: DocumentCategory[] = ['input', 'upload', 'receipt', 'output'];

export const DOCUMENT_SERVICE_REGISTRY: Record<string, ServiceDocumentConfig> = {
  finance: {
    service: 'finance',
    displayName: 'Finance & Billing',
    modules: {
      invoices: {
        allowedCategories: ['input', 'receipt', 'output'],
        defaultCategory: 'input',
        description: 'Vendor bills, client invoices, and payment receipts',
      },
      expenses: {
        allowedCategories: ['input', 'receipt', 'output'],
        defaultCategory: 'input',
        description: 'Employee expense claims, vendor receipts',
      },
      reports: {
        allowedCategories: ['upload', 'output'],
        defaultCategory: 'output',
        description: 'Financial audits, balance sheets, ledger exports',
      },
      general: {
        allowedCategories: ['upload', 'input', 'receipt', 'output'],
        defaultCategory: 'upload',
      },
    },
  },
  crm: {
    service: 'crm',
    displayName: 'CRM & Pipeline',
    modules: {
      deals: {
        allowedCategories: ['input', 'upload', 'output'],
        defaultCategory: 'upload',
        description: 'Pitch decks, contracts, RFPs, deal documentation',
      },
      contacts: {
        allowedCategories: ['input', 'upload'],
        defaultCategory: 'upload',
        description: 'Contact verification docs, business cards, identity records',
      },
      companies: {
        allowedCategories: ['input', 'upload', 'output'],
        defaultCategory: 'upload',
        description: 'Company profiles, vendor agreements',
      },
      general: {
        allowedCategories: ['upload', 'input', 'receipt', 'output'],
        defaultCategory: 'upload',
      },
    },
  },
  sales: {
    service: 'sales',
    displayName: 'Sales & Quotes',
    modules: {
      quotes: {
        allowedCategories: ['input', 'upload', 'output'],
        defaultCategory: 'output',
        description: 'Price quotes, custom pricing agreements',
      },
      contracts: {
        allowedCategories: ['input', 'upload', 'output'],
        defaultCategory: 'upload',
        description: 'Master services agreements, statement of work',
      },
      proposals: {
        allowedCategories: ['input', 'upload', 'output'],
        defaultCategory: 'upload',
        description: 'Sales pitches, responses to proposals',
      },
      general: {
        allowedCategories: ['upload', 'input', 'receipt', 'output'],
        defaultCategory: 'upload',
      },
    },
  },
  hr: {
    service: 'hr',
    displayName: 'Human Resources',
    modules: {
      employees: {
        allowedCategories: ['input', 'upload', 'output'],
        defaultCategory: 'upload',
        description: 'Employee contracts, certifications, passports',
      },
      candidates: {
        allowedCategories: ['input', 'output'],
        defaultCategory: 'input',
        description: 'Candidate resumes, portfolio files, background checks',
      },
      policies: {
        allowedCategories: ['upload', 'output'],
        defaultCategory: 'upload',
        description: 'Company handbooks, compliance manuals',
      },
      general: {
        allowedCategories: ['upload', 'input', 'receipt', 'output'],
        defaultCategory: 'upload',
      },
    },
  },
  helpdesk: {
    service: 'helpdesk',
    displayName: 'Helpdesk & Support',
    modules: {
      tickets: {
        allowedCategories: ['input', 'upload', 'output'],
        defaultCategory: 'upload',
        description: 'Issue screenshots, error dumps, support correspondence',
      },
      knowledgebase: {
        allowedCategories: ['input', 'upload', 'output'],
        defaultCategory: 'upload',
        description: 'Troubleshooting guides, FAQs',
      },
      general: {
        allowedCategories: ['upload', 'input', 'receipt', 'output'],
        defaultCategory: 'upload',
      },
    },
  },
  projects: {
    service: 'projects',
    displayName: 'Project Management',
    modules: {
      tasks: {
        allowedCategories: ['input', 'upload', 'output'],
        defaultCategory: 'upload',
        description: 'Task specifications, delivery assets, review feedback',
      },
      deliverables: {
        allowedCategories: ['upload', 'output'],
        defaultCategory: 'output',
        description: 'Milestone deliverables, sign-off certificates',
      },
      general: {
        allowedCategories: ['upload', 'input', 'receipt', 'output'],
        defaultCategory: 'upload',
      },
    },
  },
  inventory: {
    service: 'inventory',
    displayName: 'Inventory & Supply Chain',
    modules: {
      items: {
        allowedCategories: ['upload', 'receipt'],
        defaultCategory: 'upload',
        description: 'Product manuals, spec sheets, compliance certificates',
      },
      purchase_orders: {
        allowedCategories: ['input', 'receipt', 'output'],
        defaultCategory: 'input',
        description: 'Supplier POs, delivery dockets, bill of lading',
      },
      general: {
        allowedCategories: ['upload', 'input', 'receipt', 'output'],
        defaultCategory: 'upload',
      },
    },
  },
  ai: {
    service: 'ai',
    displayName: 'AI & Automation Engine',
    modules: {
      ocr: {
        allowedCategories: ['input', 'receipt', 'output'],
        defaultCategory: 'output',
        description: 'OCR input raw documents, intermediate receipts, parsed JSON',
      },
      rag: {
        allowedCategories: ['input', 'output'],
        defaultCategory: 'input',
        description: 'Knowledge base chunking, vector embeddings source',
      },
      general: {
        allowedCategories: ['upload', 'input', 'receipt', 'output'],
        defaultCategory: 'output',
      },
    },
  },
  admin: {
    service: 'admin',
    displayName: 'Administration & Security',
    modules: {
      compliance: {
        allowedCategories: ['upload', 'output'],
        defaultCategory: 'upload',
        description: 'SOC2, ISO27001, audit trail backups',
      },
      backups: {
        allowedCategories: ['output'],
        defaultCategory: 'output',
        description: 'Tenant export archives, database snapshots',
      },
      general: {
        allowedCategories: ['upload', 'input', 'receipt', 'output'],
        defaultCategory: 'upload',
      },
    },
  },
  documents: {
    service: 'documents',
    displayName: 'Central Document Vault',
    modules: {
      general: {
        allowedCategories: ['upload', 'input', 'receipt', 'output'],
        defaultCategory: 'upload',
        description: 'General vault storage',
      },
    },
  },
};

/**
 * Service Registry Validator & Helper Functions
 */
export class DocumentServiceRegistry {
  /**
   * Normalizes and validates service name
   */
  static normalizeService(service?: string): string {
    const s = (service || 'documents').toLowerCase().trim();
    return DOCUMENT_SERVICE_REGISTRY[s] ? s : 'documents';
  }

  /**
   * Normalizes and validates module name within a service
   */
  static normalizeModule(service: string, moduleName?: string): string {
    const s = this.normalizeService(service);
    const serviceConfig = DOCUMENT_SERVICE_REGISTRY[s];
    const m = (moduleName || 'general').toLowerCase().trim();
    if (serviceConfig.modules[m]) {
      return m;
    }
    return 'general';
  }

  /**
   * Validates if a category is allowed for a given service and module
   */
  static isCategoryAllowed(service: string, moduleName: string, category: string): boolean {
    const s = this.normalizeService(service);
    const m = this.normalizeModule(s, moduleName);
    const moduleConfig = DOCUMENT_SERVICE_REGISTRY[s].modules[m];
    return moduleConfig.allowedCategories.includes(category as DocumentCategory);
  }

  /**
   * Normalizes category, falling back to module default if disallowed or empty
   */
  static normalizeCategory(service: string, moduleName: string, category?: string): DocumentCategory {
    const s = this.normalizeService(service);
    const m = this.normalizeModule(s, moduleName);
    const moduleConfig = DOCUMENT_SERVICE_REGISTRY[s].modules[m];

    if (category && this.isCategoryAllowed(s, m, category)) {
      return category as DocumentCategory;
    }
    return moduleConfig.defaultCategory || moduleConfig.allowedCategories[0] || 'upload';
  }

  /**
   * Validates full document placement and returns sanitized tuple
   */
  static validatePlacement(input: {
    service?: string;
    module?: string;
    entityType?: string;
    entityId?: string;
    category?: string;
  }) {
    const service = this.normalizeService(input.service);
    const moduleName = this.normalizeModule(service, input.module);
    const category = this.normalizeCategory(service, moduleName, input.category);
    const entityType = (input.entityType || 'general').toLowerCase().replace(/[^a-z0-9_-]/gi, '');
    const entityId = (input.entityId || 'root').replace(/[^a-zA-Z0-9_-]/g, '_');

    return {
      service,
      module: moduleName,
      category,
      entityType,
      entityId,
    };
  }

  /**
   * Returns list of all registered services
   */
  static getAllServices() {
    return Object.values(DOCUMENT_SERVICE_REGISTRY).map((s) => ({
      service: s.service,
      displayName: s.displayName,
      modules: Object.keys(s.modules),
    }));
  }
}
