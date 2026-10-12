// apps/web-core/src/lib/nicheStorage.ts
/**
 * Master Niche Storage & Business Capability Engine
 * PostgreSQL Relational Persistence Layer (with JSON fallback & dual-sync)
 *
 * Supported Verticals:
 * - Healthcare (Patients, Appointments, Prescriptions, Beds)
 * - Real Estate (Properties, Showings, Escrow Deals)
 * - Restaurant (Tables, Kitchen Orders, Menu Items)
 * - Retail (POS Sales, Barcode Catalog, Khata Credit)
 * - SME (Subscriptions, MRR)
 * - Agency (Client Deliverables, Retainers)
 * - Dynamic / Generic Verticals (Construction, Legal, Logistics, Fitness, Automotive)
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@repo/database';

export interface AuditRecord {
  id: string;
  timestamp: string;
  tenantId: string;
  niche: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

export interface NicheStoreData {
  hospital: {
    patients: Array<any>;
    appointments: Array<any>;
    prescriptions: Array<any>;
    totalBeds: number;
  };
  realestate: {
    properties: Array<any>;
    showings: Array<any>;
    deals: Array<any>;
  };
  restaurant: {
    tables: Array<any>;
    kitchenOrders: Array<any>;
    menuItems: Array<any>;
  };
  retail: {
    catalogProducts: Array<any>;
    sales: Array<any>;
    khataCustomers: Array<any>;
  };
  sme: {
    subscriptions: Array<any>;
  };
  agency: {
    deliverables: Array<any>;
  };
  crm_contacts?: Array<any>;
  nicheRecords?: Record<string, Array<any>>;
  auditLogs: AuditRecord[];
}

const STORAGE_PATH = path.resolve(
  process.cwd(),
  '../../packages/database/prisma/niche_store.json'
);

// Global PrismaClient singleton for Next.js App Router
declare global {
  var __nichePrisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  global.__nichePrisma ||
  new PrismaClient({
    datasourceUrl:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres_password@127.0.0.1:5432/business_os?schema=public&connection_limit=20&pool_timeout=20',
  });

if (process.env.NODE_ENV !== 'production') {
  global.__nichePrisma = prisma;
}

export function getPrismaClient(): PrismaClient {
  return prisma;
}

function getInitialStore(): NicheStoreData {
  return {
    hospital: {
      totalBeds: 165,
      patients: [],
      appointments: [],
      prescriptions: [],
    },
    realestate: {
      properties: [],
      showings: [],
      deals: [],
    },
    restaurant: {
      tables: [
        { id: 'T-01', number: 'Table 1', capacity: 2, status: 'AVAILABLE', billTotal: 0 },
        { id: 'T-02', number: 'Table 2', capacity: 4, status: 'AVAILABLE', billTotal: 0 },
        { id: 'T-03', number: 'Table 3', capacity: 4, status: 'AVAILABLE', billTotal: 0 },
        { id: 'T-04', number: 'Table 4', capacity: 6, status: 'AVAILABLE', billTotal: 0 },
        { id: 'T-05', number: 'Table 5', capacity: 8, status: 'AVAILABLE', billTotal: 0 },
        { id: 'T-06', number: 'Table 6 (Patio)', capacity: 4, status: 'AVAILABLE', billTotal: 0 },
        { id: 'T-07', number: 'Table 7 (Patio)', capacity: 4, status: 'AVAILABLE', billTotal: 0 },
        { id: 'T-08', number: 'Table 8 (Chef Booth)', capacity: 6, status: 'AVAILABLE', billTotal: 0 },
      ],
      kitchenOrders: [],
      menuItems: [],
    },
    retail: {
      catalogProducts: [],
      sales: [],
      khataCustomers: [],
    },
    sme: {
      subscriptions: [],
    },
    agency: {
      deliverables: [],
    },
    nicheRecords: {
      construction: [],
      legal: [],
      logistics: [],
      fitness: [],
      automotive: [],
    },
    crm_contacts: [],
    auditLogs: [],
  };
}

// ----------------------------------------------------------------------------
// POSTGRESQL ASYNCHRONOUS ENGINE
// ----------------------------------------------------------------------------

/**
 * Fetch all scoped entities for a niche directly from PostgreSQL.
 */
export async function getScopedNicheDataAsync(
  niche: string,
  tenantId: string = 'default-tenant'
): Promise<any> {
  try {
    const records = await prisma.nicheEntity.findMany({
      where: {
        tenantId,
        niche,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      // Return defaults if none yet created for standard niches
      const defaults = getInitialStore();
      const raw = (defaults as any)[niche];
      if (raw) return raw;
      if (defaults.nicheRecords && defaults.nicheRecords[niche]) {
        return { records: defaults.nicheRecords[niche] };
      }
      return null;
    }

    // Parse JSON records grouped by entityType
    const grouped: Record<string, any[]> = {};
    let configData: any = null;

    for (const r of records) {
      try {
        const parsed = JSON.parse(r.data);
        if (r.entityType === 'config') {
          configData = parsed;
          continue;
        }
        if (!grouped[r.entityType]) {
          grouped[r.entityType] = [];
        }
        grouped[r.entityType].push(parsed);
      } catch {
        // Skip unparseable
      }
    }

    // Structure standard responses based on vertical
    if (niche === 'hospital') {
      return {
        totalBeds: configData?.totalBeds || 165,
        patients: grouped['patient'] || [],
        appointments: grouped['appointment'] || [],
        prescriptions: grouped['prescription'] || [],
      };
    }

    if (niche === 'realestate') {
      return {
        properties: grouped['property'] || [],
        showings: grouped['showing'] || [],
        deals: grouped['deal'] || [],
      };
    }

    if (niche === 'restaurant') {
      const defaults = getInitialStore().restaurant;
      return {
        tables: grouped['table'] && grouped['table'].length > 0 ? grouped['table'] : defaults.tables,
        kitchenOrders: grouped['kitchenOrder'] || [],
        menuItems: grouped['menuItem'] || [],
      };
    }

    if (niche === 'retail') {
      return {
        catalogProducts: grouped['catalogProduct'] || [],
        sales: grouped['sale'] || [],
        khataCustomers: grouped['khataCustomer'] || [],
      };
    }

    if (niche === 'sme') {
      return {
        subscriptions: grouped['subscription'] || [],
      };
    }

    if (niche === 'agency') {
      return {
        deliverables: grouped['deliverable'] || [],
      };
    }

    // Generic niches
    return {
      records: grouped['record'] || [],
    };
  } catch (err: any) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[POSTGRESQL ERROR] Failed fetching niche data: ${err.message}`);
      throw err;
    }
    console.warn(`[POSTGRESQL FALLBACK] Fallback to memory for niche ${niche}: ${err.message}`);
    return getScopedNicheData(niche, tenantId);
  }
}

/**
 * Save or update a niche entity in PostgreSQL (atomic upsert).
 */
export async function saveNicheEntityAsync(
  tenantId: string,
  niche: string,
  entityType: string,
  entityId: string,
  data: any
): Promise<any> {
  const safeTenantId = tenantId || 'default-tenant';
  const payload = { ...data, id: entityId, tenantId: safeTenantId };

  try {
    const updated = await prisma.nicheEntity.upsert({
      where: {
        tenantId_niche_entityType_entityId: {
          tenantId: safeTenantId,
          niche,
          entityType,
          entityId,
        },
      },
      update: {
        data: JSON.stringify(payload),
        updatedAt: new Date(),
      },
      create: {
        tenantId: safeTenantId,
        niche,
        entityType,
        entityId,
        data: JSON.stringify(payload),
      },
    });

    // Mirror to JSON in background for compatibility only in non-production
    if (process.env.NODE_ENV !== 'production') {
      try {
        syncEntityToJson(safeTenantId, niche, entityType, entityId, payload);
      } catch {}
    }

    return JSON.parse(updated.data);
  } catch (err: any) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[POSTGRESQL ERROR] Failed saving niche entity: ${err.message}`);
      throw err;
    }
    console.warn(`[POSTGRESQL FALLBACK] Failed saving to PG, writing to JSON: ${err.message}`);
    syncEntityToJson(safeTenantId, niche, entityType, entityId, payload);
    return payload;
  }
}

/**
 * Delete a niche entity from PostgreSQL.
 */
export async function deleteNicheEntityAsync(
  tenantId: string,
  niche: string,
  entityType: string,
  entityId: string
): Promise<boolean> {
  const safeTenantId = tenantId || 'default-tenant';
  try {
    const res = await prisma.nicheEntity.deleteMany({
      where: {
        tenantId: safeTenantId,
        niche,
        entityType,
        entityId,
      },
    });
    return res.count > 0;
  } catch (err: any) {
    console.error(`[POSTGRESQL ERROR] Failed deleting niche entity: ${err.message}`);
    if (process.env.NODE_ENV === 'production') {
      throw err;
    }
    return false;
  }
}

/**
 * Record an audit log entry in PostgreSQL.
 */
export async function logNicheAuditAsync(
  tenantId: string,
  niche: string,
  action: string,
  entityType: string,
  entityId: string,
  details: string
): Promise<void> {
  const safeTenantId = tenantId || 'default-tenant';
  try {
    await prisma.nicheAuditLog.create({
      data: {
        tenantId: safeTenantId,
        niche,
        action,
        entityType,
        entityId,
        details,
        timestamp: new Date(),
      },
    });
  } catch (err: any) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[POSTGRESQL AUDIT ERROR] Could not write audit log: ${err.message}`);
      throw err;
    }
    console.warn(`[POSTGRESQL AUDIT WARN] Could not write audit log: ${err.message}`);
    logNicheAudit(safeTenantId, niche, action, entityType, entityId, details);
  }
}

/**
 * Fetch latest audit logs from PostgreSQL.
 */
export async function getScopedAuditLogsAsync(
  tenantId: string = 'default-tenant'
): Promise<AuditRecord[]> {
  try {
    const logs = await prisma.nicheAuditLog.findMany({
      where: { tenantId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return logs.map((l) => ({
      id: l.id,
      timestamp: l.timestamp.toISOString(),
      tenantId: l.tenantId,
      niche: l.niche,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      details: l.details,
    }));
  } catch (err: any) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[POSTGRESQL AUDIT ERROR] Could not fetch audit logs: ${err.message}`);
      throw err;
    }
    return getScopedAuditLogs(tenantId);
  }
}

// ----------------------------------------------------------------------------
// SYNCHRONOUS COMPATIBILITY & DUAL-SYNC LAYER
// ----------------------------------------------------------------------------

export function readStore(): NicheStoreData {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.nicheRecords) {
        const initial = getInitialStore();
        parsed.nicheRecords = initial.nicheRecords;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to read niche store file:', e);
  }

  const initial = getInitialStore();
  writeStore(initial);
  return initial;
}

export function writeStore(data: NicheStoreData): void {
  try {
    const dir = path.dirname(STORAGE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write niche store file:', e);
  }
}

export function logNicheAudit(
  tenantId: string,
  niche: string,
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  targetStore?: NicheStoreData
): void {
  const store = targetStore || readStore();
  const entry: AuditRecord = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    tenantId,
    niche,
    action,
    entityType,
    entityId,
    details,
  };
  if (!store.auditLogs) {
    store.auditLogs = [];
  }
  store.auditLogs.unshift(entry);
  if (store.auditLogs.length > 200) {
    store.auditLogs = store.auditLogs.slice(0, 200);
  }
  if (!targetStore) {
    writeStore(store);
  }

  // Asynchronously record to PostgreSQL
  prisma.nicheAuditLog.create({
    data: {
      id: entry.id,
      tenantId,
      niche,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date(entry.timestamp),
    },
  }).catch(() => {});
}

export function getScopedNicheData(niche: string, tenantId: string = 'default-tenant'): any {
  const store = readStore();
  const rawData = (store as any)[niche];

  if (!rawData && store.nicheRecords && store.nicheRecords[niche]) {
    const records = store.nicheRecords[niche];
    if (tenantId === 'default-tenant') {
      return { records: records.filter((r: any) => !r.tenantId || r.tenantId === 'default-tenant') };
    }
    return { records: records.filter((r: any) => r.tenantId === tenantId) };
  }

  if (!rawData) {
    return null;
  }

  const scopedData: Record<string, any> = {};
  for (const [key, value] of Object.entries(rawData)) {
    if (Array.isArray(value)) {
      if (tenantId === 'default-tenant') {
        scopedData[key] = value.filter((item: any) => !item.tenantId || item.tenantId === 'default-tenant');
      } else {
        const tenantItems = value.filter((item: any) => item.tenantId === tenantId);
        if (tenantItems.length === 0 && (key === 'menuItems' || key === 'catalogProducts' || key === 'tables')) {
          scopedData[key] = value.filter((item: any) => !item.tenantId || item.tenantId === 'default-tenant');
        } else {
          scopedData[key] = tenantItems;
        }
      }
    } else {
      scopedData[key] = value;
    }
  }

  return scopedData;
}

export function getScopedAuditLogs(tenantId: string = 'default-tenant'): AuditRecord[] {
  const store = readStore();
  const logs = store.auditLogs || [];
  if (tenantId === 'default-tenant') {
    return logs.slice(0, 50);
  }
  return logs.filter((l) => l.tenantId === tenantId).slice(0, 50);
}

export function saveContactToStore(contact: any, tenantId: string = 'default-tenant'): any {
  const store = readStore();
  if (!store.crm_contacts) {
    store.crm_contacts = [];
  }
  const newContact = {
    id: contact.id || `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    tenantId,
    firstName: contact.firstName || '',
    lastName: contact.lastName || '',
    email: contact.email || '',
    phone: contact.phone || '',
    companyId: contact.companyId || '',
    customData: contact.customData || '',
    createdAt: new Date().toISOString(),
  };
  store.crm_contacts.unshift(newContact);
  writeStore(store);

  // Sync to PostgreSQL
  saveNicheEntityAsync(tenantId, 'crm', 'contact', newContact.id, newContact).catch(() => {});
  logNicheAuditAsync(tenantId, 'crm', 'CREATE_CONTACT', 'Contact', newContact.id, `Ingested CRM contact ${newContact.firstName} ${newContact.lastName}`).catch(() => {});

  return newContact;
}

export function getContactsFromStore(tenantId: string = 'default-tenant'): any[] {
  const store = readStore();
  const contacts = store.crm_contacts || [];
  if (tenantId === 'default-tenant') {
    return contacts;
  }
  return contacts.filter((c: any) => c.tenantId === tenantId);
}

export function deleteContactFromStore(id: string, tenantId: string = 'default-tenant'): boolean {
  const store = readStore();
  if (!store.crm_contacts) return false;
  const initialLength = store.crm_contacts.length;
  store.crm_contacts = store.crm_contacts.filter((c) => c.id !== id);
  if (store.crm_contacts.length !== initialLength) {
    writeStore(store);
    deleteNicheEntityAsync(tenantId, 'crm', 'contact', id).catch(() => {});
    return true;
  }
  return false;
}

export async function emitNicheAutomationEvent(
  niche: string,
  action: string,
  record: any,
  tenantId = 'default-tenant'
): Promise<void> {
  try {
    const payload = {
      type: `${niche.toUpperCase()}_${action.toUpperCase()}`,
      aggregateType: niche,
      aggregateId: record?.id || `agg_${Date.now()}`,
      payload: {
        ...record,
        emittedAt: new Date().toISOString(),
        tenantId,
      },
    };

    fetch('http://localhost:3009/workflows/events/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // Non-blocking
  }
}

function syncEntityToJson(
  tenantId: string,
  niche: string,
  entityType: string,
  entityId: string,
  payload: any
) {
  const store = readStore();
  const targetNiche = (store as any)[niche];

  if (targetNiche) {
    const pluralKey = `${entityType}s`;
    if (Array.isArray(targetNiche[pluralKey])) {
      const idx = targetNiche[pluralKey].findIndex((item: any) => item.id === entityId);
      if (idx !== -1) {
        targetNiche[pluralKey][idx] = payload;
      } else {
        targetNiche[pluralKey].unshift(payload);
      }
      writeStore(store);
      return;
    }
  }

  if (store.nicheRecords && store.nicheRecords[niche]) {
    const idx = store.nicheRecords[niche].findIndex((item: any) => item.id === entityId);
    if (idx !== -1) {
      store.nicheRecords[niche][idx] = payload;
    } else {
      store.nicheRecords[niche].unshift(payload);
    }
    writeStore(store);
  }
}
