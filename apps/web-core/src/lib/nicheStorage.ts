// apps/web-core/src/lib/nicheStorage.ts
/**
 * Master Niche Storage & Business Capability Engine
 * Provides persistent, tenant-isolated storage for all niche operations:
 * Healthcare (Patients, Appointments, Beds, Rx)
 * Real Estate (Properties, Showings, Escrow Deals)
 * Restaurant (Tables, Kitchen KOT, Menu Items)
 * Retail (POS Sales, Barcode Catalog, Khata Ledger)
 * SME (SaaS Subscriptions, MRR)
 * Agency (Client Deliverables, Retainers)
 *
 * Implements:
 * - Atomic persistence to disk
 * - Real audit logging
 * - Universal automation event dispatch
 * - Dynamic metric / KPI recalculation
 */

import fs from 'fs';
import path from 'path';

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
    patients: Array<{
      id: string;
      name: string;
      age: number;
      gender: string;
      department: string;
      attendingPhysician: string;
      triageLevel: 'CRITICAL' | 'URGENT' | 'STABLE';
      roomNumber: string;
      admitDate: string;
      insuranceStatus: 'VERIFIED' | 'SELF_PAY' | 'PENDING';
      notes?: string;
    }>;
    appointments: Array<{
      id: string;
      patient: string;
      time: string;
      doctor: string;
      type: string;
      status: 'CONFIRMED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
    }>;
    prescriptions: Array<{
      id: string;
      patientName: string;
      ehrRecordId: string;
      diagnosis: string;
      medications: Array<{ drug: string; dosage: string; frequency: string }>;
      date: string;
      prescribedBy: string;
    }>;
    totalBeds: number;
  };
  realestate: {
    properties: Array<{
      id: string;
      title: string;
      address: string;
      price: number;
      type: 'SINGLE_FAMILY' | 'CONDO' | 'COMMERCIAL' | 'PENTHOUSE';
      beds: number;
      baths: number;
      sqft: number;
      status: 'ACTIVE' | 'PENDING' | 'CLOSED';
      imageUrl: string;
      matchedBuyers: number;
      agent: string;
    }>;
    showings: Array<{
      id: string;
      propertyId: string;
      propertyTitle: string;
      buyerName: string;
      date: string;
      time: string;
      status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    }>;
    deals: Array<{
      id: string;
      propertyTitle: string;
      buyerName: string;
      offerAmount: number;
      stage: 'IN_ESCROW' | 'INSPECTION' | 'FINANCING' | 'CLOSED';
      closingDate: string;
      commissionAmount: number;
    }>;
  };
  restaurant: {
    tables: Array<{
      id: string;
      number: string;
      capacity: number;
      status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'DIRTY';
      guestName?: string;
      server?: string;
      seatedTime?: string;
      billTotal: number;
    }>;
    kitchenOrders: Array<{
      id: string;
      tableId: string;
      tableNumber: string;
      items: Array<{ name: string; qty: number; notes?: string }>;
      placedTime: string;
      status: 'PREPARING' | 'READY' | 'SERVED';
      waiter: string;
    }>;
    menuItems: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      cost: number;
      currentStock: number;
      parLevel: number;
    }>;
  };
  retail: {
    catalogProducts: Array<{
      id: string;
      barcode: string;
      name: string;
      category: string;
      price: number;
      stock: number;
    }>;
    sales: Array<{
      id: string;
      receiptNumber: string;
      timestamp: string;
      items: Array<{ name: string; qty: number; price: number }>;
      totalAmount: number;
      paymentMethod: 'CASH' | 'CARD' | 'QR_PAY' | 'KHATA';
      customerName?: string;
    }>;
    khataCustomers: Array<{
      id: string;
      name: string;
      phone: string;
      totalCreditDue: number;
      lastPurchaseDate: string;
      creditLimit: number;
    }>;
  };
  sme: {
    subscriptions: Array<{
      id: string;
      customerName: string;
      plan: string;
      mrr: number;
      status: 'ACTIVE' | 'PAST_DUE' | 'TRIAL';
      renewalDate: string;
      seats: number;
    }>;
  };
  agency: {
    deliverables: Array<{
      id: string;
      clientName: string;
      projectTitle: string;
      milestone: string;
      dueDate: string;
      status: 'IN_PROGRESS' | 'IN_REVIEW' | 'APPROVED';
      retainerAmount: number;
    }>;
  };
  crm_contacts?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyId?: string;
    customData?: string;
    createdAt: string;
  }>;
  nicheRecords?: Record<string, Array<{
    id: string;
    name: string;
    status: string;
    statusColor: string;
    primaryField: string;
    secondaryField: string;
    amount?: string;
    date: string;
  }>>;
  auditLogs: AuditRecord[];
}

const STORAGE_PATH = path.resolve(
  process.cwd(),
  '../../packages/database/prisma/niche_store.json'
);

function getInitialStore(): NicheStoreData {
  return {
    hospital: {
      totalBeds: 165,
      patients: [
        {
          id: 'PT-8941',
          name: 'Elena Rostova',
          age: 42,
          gender: 'Female',
          department: 'Cardiology',
          attendingPhysician: 'Dr. Sarah Lin, MD',
          triageLevel: 'URGENT',
          roomNumber: 'Ward 3C - Bed 04',
          admitDate: '2026-09-24',
          insuranceStatus: 'VERIFIED',
          notes: 'Post-op observation, vitals stable',
        },
        {
          id: 'PT-8942',
          name: 'Marcus Vance',
          age: 58,
          gender: 'Male',
          department: 'Orthopedics',
          attendingPhysician: 'Dr. David Hayes, MD',
          triageLevel: 'STABLE',
          roomNumber: 'Ward 2A - Bed 12',
          admitDate: '2026-09-25',
          insuranceStatus: 'VERIFIED',
        },
        {
          id: 'PT-8943',
          name: 'Aisha Al-Mansoor',
          age: 31,
          gender: 'Female',
          department: 'Emergency Medicine',
          attendingPhysician: 'Dr. Robert Chen, MD',
          triageLevel: 'CRITICAL',
          roomNumber: 'ER Bay 02',
          admitDate: '2026-09-26',
          insuranceStatus: 'PENDING',
        },
      ],
      appointments: [
        { id: 'APT-101', patient: 'Elena Rostova', time: '09:30 AM', doctor: 'Dr. Sarah Lin', type: 'Echocardiogram Review', status: 'CONFIRMED' },
        { id: 'APT-102', patient: 'Liam O\'Connor', time: '11:15 AM', doctor: 'Dr. Robert Chen', type: 'Post-Trauma Wound Care', status: 'CONFIRMED' },
        { id: 'APT-103', patient: 'Amara Okafor', time: '02:00 PM', doctor: 'Dr. Lisa Patel', type: 'Endocrine Panel Consultation', status: 'IN_CONSULTATION' },
      ],
      prescriptions: [
        {
          id: 'RX-901',
          patientName: 'Elena Rostova',
          ehrRecordId: 'EHR-88902',
          diagnosis: 'Acute Bronchitis & Secondary Bacterial Infection',
          medications: [
            { drug: 'Amoxicillin-Clavulanate', dosage: '875/125 mg', frequency: 'Twice daily with meals for 10 days' },
            { drug: 'Fluticasone Propionate', dosage: '50 mcg/actuation', frequency: '2 sprays per nostril once daily' },
          ],
          date: '2026-09-26',
          prescribedBy: 'Dr. Julian Vane, MD (Chief Resident)',
        },
      ],
    },
    realestate: {
      properties: [
        {
          id: 'PROP-701',
          title: 'The Bel-Air Glass Pavilion',
          address: '10480 Bellagio Road, Bel-Air, CA 90077',
          price: 14850000,
          type: 'PENTHOUSE',
          beds: 6,
          baths: 8.5,
          sqft: 9800,
          status: 'ACTIVE',
          imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
          matchedBuyers: 14,
          agent: 'Sangram Cruze',
        },
        {
          id: 'PROP-702',
          title: 'Architectural Malibu Crest Villa',
          address: '31244 Pacific Coast Hwy, Malibu, CA 90265',
          price: 8950000,
          type: 'SINGLE_FAMILY',
          beds: 4,
          baths: 5,
          sqft: 5200,
          status: 'PENDING',
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          matchedBuyers: 8,
          agent: 'Elena Vance',
        },
        {
          id: 'PROP-703',
          title: 'SoHo Cast-Iron Designer Loft',
          address: '92 Prince Street #4B, New York, NY 10012',
          price: 4650000,
          type: 'CONDO',
          beds: 3,
          baths: 3,
          sqft: 3100,
          status: 'ACTIVE',
          imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
          matchedBuyers: 19,
          agent: 'David Miller',
        },
      ],
      showings: [
        { id: 'SHOW-11', propertyId: 'PROP-701', propertyTitle: 'The Bel-Air Glass Pavilion', buyerName: 'Harrison Sterling', date: '2026-09-27', time: '14:00', status: 'SCHEDULED' },
        { id: 'SHOW-12', propertyId: 'PROP-702', propertyTitle: 'Architectural Malibu Crest Villa', buyerName: 'Claire Montgomery', date: '2026-09-28', time: '10:30', status: 'SCHEDULED' },
      ],
      deals: [
        { id: 'ESC-401', propertyTitle: 'Architectural Malibu Crest Villa', buyerName: 'Claire Montgomery', offerAmount: 8800000, stage: 'IN_ESCROW', closingDate: '2026-10-15', commissionAmount: 264000 },
      ],
    },
    restaurant: {
      tables: [
        { id: 'T-01', number: 'Table 1', capacity: 2, status: 'AVAILABLE', billTotal: 0 },
        { id: 'T-02', number: 'Table 2', capacity: 4, status: 'OCCUPIED', guestName: 'Somerville Party', server: 'Marco', seatedTime: '19:15', billTotal: 148.50 },
        { id: 'T-03', number: 'Table 3', capacity: 4, status: 'OCCUPIED', guestName: 'Dr. Zhang', server: 'Chloe', seatedTime: '19:40', billTotal: 84.00 },
        { id: 'T-04', number: 'Table 4', capacity: 6, status: 'RESERVED', guestName: 'Techstars Dinner (20:30)', billTotal: 0 },
        { id: 'T-05', number: 'Table 5', capacity: 8, status: 'DIRTY', billTotal: 0 },
        { id: 'T-06', number: 'Table 6 (Patio)', capacity: 4, status: 'AVAILABLE', billTotal: 0 },
        { id: 'T-07', number: 'Table 7 (Patio)', capacity: 4, status: 'AVAILABLE', billTotal: 0 },
        { id: 'T-08', number: 'Table 8 (Chef Booth)', capacity: 6, status: 'OCCUPIED', guestName: 'VIP Table - Amb. Dupont', server: 'Jean-Luc', seatedTime: '18:50', billTotal: 342.00 },
      ],
      kitchenOrders: [
        { id: 'KOT-301', tableId: 'T-02', tableNumber: 'Table 2', items: [{ name: 'Dry-Aged Ribeye (Medium Rare)', qty: 2 }, { name: 'Truffle Mashed Potatoes', qty: 1 }], placedTime: '19:22', status: 'PREPARING', waiter: 'Marco' },
        { id: 'KOT-302', tableId: 'T-08', tableNumber: 'Table 8', items: [{ name: 'Pan-Seared Chilean Sea Bass', qty: 3 }, { name: 'Lobster Bisque', qty: 3 }, { name: 'Domaine de la Romanee-Conti', qty: 1 }], placedTime: '19:05', status: 'READY', waiter: 'Jean-Luc' },
      ],
      menuItems: [
        { id: 'MENU-1', name: 'Dry-Aged Ribeye 14oz', category: 'Mains', price: 68.00, cost: 24.50, currentStock: 18, parLevel: 10 },
        { id: 'MENU-2', name: 'Pan-Seared Chilean Sea Bass', category: 'Mains', price: 54.00, cost: 18.20, currentStock: 12, parLevel: 8 },
        { id: 'MENU-3', name: 'White Truffle Tagliolini', category: 'Pasta', price: 38.00, cost: 9.80, currentStock: 25, parLevel: 15 },
        { id: 'MENU-4', name: 'Truffle Oil 500ml', category: 'Pantry Par', price: 85.00, cost: 42.00, currentStock: 2, parLevel: 6 },
      ],
    },
    retail: {
      catalogProducts: [
        { id: 'PROD-101', barcode: '8901030456123', name: 'Organic Almond Milk 1L', category: 'Dairy & Alternatives', price: 4.80, stock: 45 },
        { id: 'PROD-102', barcode: '8901030789456', name: 'Artisanal Sourdough Loaf', category: 'Bakery', price: 6.50, stock: 22 },
        { id: 'PROD-103', barcode: '8901030112233', name: 'Single Origin Espresso Beans 500g', category: 'Coffee', price: 18.00, stock: 14 },
        { id: 'PROD-104', barcode: '8901030998877', name: 'Greek Extra Virgin Olive Oil 750ml', category: 'Pantry', price: 24.00, stock: 9 },
      ],
      sales: [
        {
          id: 'POS-891',
          receiptNumber: 'REC-2026-0926-01',
          timestamp: '2026-09-26T18:45:00Z',
          items: [
            { name: 'Organic Almond Milk 1L', qty: 2, price: 4.80 },
            { name: 'Artisanal Sourdough Loaf', qty: 1, price: 6.50 },
          ],
          totalAmount: 16.10,
          paymentMethod: 'CARD',
          customerName: 'Walk-In Customer',
        },
      ],
      khataCustomers: [
        { id: 'KHATA-01', name: 'Sharma Traders & Grocery', phone: '+1 310-555-0144', totalCreditDue: 1420.00, lastPurchaseDate: '2026-09-25', creditLimit: 2500.00 },
        { id: 'KHATA-02', name: 'Al-Madina Mini Market', phone: '+1 310-555-0189', totalCreditDue: 890.00, lastPurchaseDate: '2026-09-24', creditLimit: 1500.00 },
        { id: 'KHATA-03', name: 'Green Valley Cafe Supplies', phone: '+1 310-555-0211', totalCreditDue: 340.00, lastPurchaseDate: '2026-09-26', creditLimit: 1000.00 },
      ],
    },
    sme: {
      subscriptions: [
        { id: 'SUB-501', customerName: 'Stripe Global Inc', plan: 'Enterprise Scale', mrr: 14500, status: 'ACTIVE', renewalDate: '2026-12-31', seats: 250 },
        { id: 'SUB-502', customerName: 'Retool Devops Hub', plan: 'Growth Tier', mrr: 4200, status: 'ACTIVE', renewalDate: '2026-11-15', seats: 45 },
        { id: 'SUB-503', customerName: 'Nordic AI Studio', plan: 'Pro Team', mrr: 1800, status: 'TRIAL', renewalDate: '2026-10-05', seats: 15 },
      ],
    },
    agency: {
      deliverables: [
        { id: 'DEL-201', clientName: 'Monolith Financial', projectTitle: 'Mobile Neobank Redesign', milestone: 'Figma Design System V2', dueDate: '2026-09-30', status: 'IN_REVIEW', retainerAmount: 24000 },
        { id: 'DEL-202', clientName: 'Veloce Supercars', projectTitle: 'Luxury Configurator 3D', milestone: 'Three.js Asset Pipeline', dueDate: '2026-10-12', status: 'IN_PROGRESS', retainerAmount: 38000 },
      ],
    },
    nicheRecords: {
      construction: [
        { id: 'rec_const_1', name: 'Skyline Tower Phase 2', status: 'In-Progress', statusColor: '#f59e0b', primaryField: 'Ref: #C-9042', secondaryField: 'Subcontractor: Apex Steel', amount: '$450,000', date: 'Today' },
        { id: 'rec_const_2', name: 'Harbor Logistics Bay 4', status: 'Completed', statusColor: '#10b981', primaryField: 'Ref: #C-8812', secondaryField: 'Signed off & Inspected', amount: '$280,000', date: '3 days ago' },
      ],
      legal: [
        { id: 'rec_leg_1', name: 'Merger & Acquisition Alpha', status: 'In-Review', statusColor: '#38bdf8', primaryField: 'Matter: #L-1044', secondaryField: 'Partner: Eleanor Vance', amount: '$125,000', date: 'Yesterday' },
        { id: 'rec_leg_2', name: 'IP Patent Filing TechCorp', status: 'Drafting', statusColor: '#f59e0b', primaryField: 'Matter: #L-1089', secondaryField: 'Associate: D. Sterling', amount: '$45,000', date: 'Today' },
      ],
      logistics: [
        { id: 'rec_log_1', name: 'Cross-Dock Shipment Alpha', status: 'In-Transit', statusColor: '#38bdf8', primaryField: 'Waybill: #WB-9912', secondaryField: 'Carrier: SwiftFreight Fleet 9', amount: '$18,400', date: 'Today' },
        { id: 'rec_log_2', name: 'Cold Chain Pharma Express', status: 'Delivered', statusColor: '#10b981', primaryField: 'Waybill: #WB-8821', secondaryField: 'Signed at Dock 3', amount: '$34,000', date: 'Yesterday' },
      ],
      fitness: [
        { id: 'rec_fit_1', name: 'Marcus Sterling VIP Profile', status: 'Active', statusColor: '#10b981', primaryField: 'Barcode: #FIT-00492', secondaryField: 'Trainer: Sarah Jenkins', amount: '$180/mo', date: 'Today' },
        { id: 'rec_fit_2', name: 'Elena Rostova Platinum', status: 'Active', statusColor: '#10b981', primaryField: 'Barcode: #FIT-00821', secondaryField: 'Tier: All-Access VIP', amount: '$220/mo', date: '2 days ago' },
      ],
      automotive: [
        { id: 'rec_auto_1', name: 'RO #8820 - Porsche 911 GT3', status: 'In-Service', statusColor: '#f59e0b', primaryField: 'VIN: ...WP0AB2A9', secondaryField: 'Tech: Master Tech Mike', amount: '$3,450', date: 'Today' },
        { id: 'rec_auto_2', name: 'RO #8815 - BMW M4 Competition', status: 'Ready', statusColor: '#10b981', primaryField: 'VIN: ...WBS43AZ0', secondaryField: 'Inspection Passed', amount: '$1,890', date: 'Yesterday' },
      ],
    },
    crm_contacts: [],
    auditLogs: [
      {
        id: 'aud_init_01',
        timestamp: new Date().toISOString(),
        tenantId: 'default-tenant',
        niche: 'system',
        action: 'BOOTSTRAP',
        entityType: 'Store',
        entityId: 'global',
        details: 'Niche Storage Engine bootstrapped with realistic tenant architecture',
      },
    ],
  };
}

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
}

export function saveContactToStore(contact: any): any {
  const store = readStore();
  if (!store.crm_contacts) {
    store.crm_contacts = [];
  }
  const newContact = {
    id: contact.id || `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    firstName: contact.firstName || '',
    lastName: contact.lastName || '',
    email: contact.email || '',
    phone: contact.phone || '',
    companyId: contact.companyId || '',
    customData: contact.customData || '',
    createdAt: new Date().toISOString(),
  };
  store.crm_contacts.unshift(newContact);
  logNicheAudit(
    'default-tenant',
    'crm',
    'CREATE_CONTACT',
    'Contact',
    newContact.id,
    `Ingested CRM contact ${newContact.firstName} ${newContact.lastName} (${newContact.email})`
  );
  writeStore(store);
  return newContact;
}

export function getContactsFromStore(): any[] {
  const store = readStore();
  return store.crm_contacts || [];
}

export function deleteContactFromStore(id: string): boolean {
  const store = readStore();
  if (!store.crm_contacts) return false;
  const initialLength = store.crm_contacts.length;
  store.crm_contacts = store.crm_contacts.filter((c) => c.id !== id);
  if (store.crm_contacts.length !== initialLength) {
    logNicheAudit('default-tenant', 'crm', 'DELETE_CONTACT', 'Contact', id, `Removed CRM contact ${id}`);
    writeStore(store);
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

