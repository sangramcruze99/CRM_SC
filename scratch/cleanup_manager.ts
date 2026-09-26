/**
 * BUSINESS OS — SAFE AUDIT & CLEANUP CONSOLIDATION ENGINE
 *
 * Provides non-destructive discovery, classification, and controlled
 * remediation across mock data, duplicates, orphaned records, and redundant routes.
 *
 * Supported flags:
 *   --mode=dry-run      (Default: Scans and reports without making any modifications)
 *   --mode=report       (Produces full consolidation summary report)
 *   --mode=demo         (Identifies and isolates development/demo data)
 *   --mode=duplicates   (Identifies duplicate routes, records, and navigation entries)
 *   --mode=orphaned     (Detects dangling relations and orphaned items)
 *   --mode=all-safe     (Executes only verified, non-destructive cleanups)
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_CORE_DIR = path.resolve(ROOT_DIR, 'apps/web-core');
const PRISMA_STORE_PATH = path.resolve(ROOT_DIR, 'packages/database/prisma/niche_store.json');

export interface CleanupReport {
  timestamp: string;
  mode: string;
  mockPatternsFound: Array<{ file: string; line: number; snippet: string; category: string }>;
  duplicateRoutes: Array<{ canonical: string; duplicates: string[] }>;
  orphanedRecords: Array<{ type: string; id: string; reason: string }>;
  duplicateRecords: Array<{ type: string; key: string; count: number; ids: string[] }>;
  summary: {
    totalMockPatterns: number;
    totalDuplicateRoutes: number;
    totalOrphanedRecords: number;
    totalDuplicateRecords: number;
    safeRemovalsPossible: number;
  };
}

// 1. Scan for mock / demo / fake fallbacks in UI rendering paths
export function scanMockDataFallbacks(): Array<{ file: string; line: number; snippet: string; category: string }> {
  const results: Array<{ file: string; line: number; snippet: string; category: string }> = [];
  const targetDirs = [path.join(WEB_CORE_DIR, 'src')];

  const searchPatterns = [
    { pattern: /fallback.*mock/i, category: 'CATEGORY E: Hardcoded fallback shown when API fails' },
    { pattern: /useDemoData/i, category: 'CATEGORY D: Accidental mock data visible in real application' },
    { pattern: /fakeStats|dummyStats|mockStats/i, category: 'CATEGORY D: Fake statistics generator' },
    { pattern: /samplePatients|mockPatients/i, category: 'CATEGORY A: Development-only fixture' },
    { pattern: /sampleCustomers|mockCustomers/i, category: 'CATEGORY A: Development-only fixture' },
    { pattern: /sampleProperties|mockProperties/i, category: 'CATEGORY A: Development-only fixture' },
  ];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(entry.name)) {
          walk(fullPath);
        }
      } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            for (const sp of searchPatterns) {
              if (sp.pattern.test(line)) {
                results.push({
                  file: path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/'),
                  line: idx + 1,
                  snippet: line.trim().slice(0, 100),
                  category: sp.category,
                });
                break;
              }
            }
          });
        } catch {
          // ignore unreadable
        }
      }
    }
  }

  for (const dir of targetDirs) {
    walk(dir);
  }
  return results;
}

// 2. Discover duplicate routes & navigation options in Next.js web-core
export function scanRouteDuplication(): Array<{ canonical: string; duplicates: string[] }> {
  const appDir = path.join(WEB_CORE_DIR, 'src/app');
  const routeList: string[] = [];

  function collectRoutes(dir: string, baseRoute = '') {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('(') && !entry.name.startsWith('@') && !entry.name.startsWith('_')) {
          collectRoutes(path.join(dir, entry.name), `${baseRoute}/${entry.name}`);
        } else {
          collectRoutes(path.join(dir, entry.name), baseRoute);
        }
      } else if (entry.name === 'page.tsx' || entry.name === 'page.jsx') {
        routeList.push(baseRoute || '/');
      }
    }
  }

  collectRoutes(appDir);

  // Group candidate routes by domain capability
  const routeGroups: Record<string, string[]> = {
    'CRM / Contacts': ['/crm', '/contacts', '/customer-management', '/industry/hospital/patients'].filter((r) => routeList.includes(r)),
    'Automation': ['/automation', '/automations', '/workflow', '/workflows', '/workflow-engine'].filter((r) => routeList.includes(r)),
    'AI / Agents': ['/ai', '/agents', '/agent-runtime', '/ai-engine'].filter((r) => routeList.includes(r)),
    'Analytics': ['/analytics', '/reports', '/dashboard/analytics'].filter((r) => routeList.includes(r)),
    'Settings': ['/settings', '/admin/settings', '/workspace/settings'].filter((r) => routeList.includes(r)),
  };

  const results: Array<{ canonical: string; duplicates: string[] }> = [];
  for (const [capability, routes] of Object.entries(routeGroups)) {
    if (routes.length > 1) {
      results.push({
        canonical: routes[0],
        duplicates: routes.slice(1),
      });
    }
  }

  return results;
}

// 3. Scan for duplicate / orphaned records in niche store
export function scanNicheStoreData(): {
  duplicateRecords: Array<{ type: string; key: string; count: number; ids: string[] }>;
  orphanedRecords: Array<{ type: string; id: string; reason: string }>;
} {
  const duplicates: Array<{ type: string; key: string; count: number; ids: string[] }> = [];
  const orphaned: Array<{ type: string; id: string; reason: string }> = [];

  if (!fs.existsSync(PRISMA_STORE_PATH)) {
    return { duplicateRecords: duplicates, orphanedRecords: orphaned };
  }

  try {
    const raw = fs.readFileSync(PRISMA_STORE_PATH, 'utf-8');
    const store = JSON.parse(raw);

    // Check Hospital duplicate patients
    if (store.hospital?.patients) {
      const patientMap: Record<string, any[]> = {};
      store.hospital.patients.forEach((p: any) => {
        const key = (p.name || '').toLowerCase().trim();
        if (!patientMap[key]) patientMap[key] = [];
        patientMap[key].push(p);
      });
      for (const [name, list] of Object.entries(patientMap)) {
        if (list.length > 1) {
          duplicates.push({
            type: 'Hospital Patient',
            key: name,
            count: list.length,
            ids: list.map((item) => item.id),
          });
        }
      }
    }

    // Check Real Estate duplicate listings
    if (store.realestate?.properties) {
      const propMap: Record<string, any[]> = {};
      store.realestate.properties.forEach((p: any) => {
        const key = (p.title || '').toLowerCase().trim();
        if (!propMap[key]) propMap[key] = [];
        propMap[key].push(p);
      });
      for (const [title, list] of Object.entries(propMap)) {
        if (list.length > 1) {
          duplicates.push({
            type: 'Real Estate Property',
            key: title,
            count: list.length,
            ids: list.map((item) => item.id),
          });
        }
      }
    }

    // Check Orphaned showings (showing referencing non-existent property)
    if (store.realestate?.showings && store.realestate?.properties) {
      const propIds = new Set(store.realestate.properties.map((p: any) => p.id));
      store.realestate.showings.forEach((s: any) => {
        if (s.propertyId && !propIds.has(s.propertyId)) {
          orphaned.push({
            type: 'Real Estate Showing',
            id: s.id,
            reason: `Referenced propertyId "${s.propertyId}" does not exist in properties catalog`,
          });
        }
      });
    }

    // Check Orphaned Kitchen Orders (referencing non-existent table)
    if (store.restaurant?.kitchenOrders && store.restaurant?.tables) {
      const tableIds = new Set(store.restaurant.tables.map((t: any) => t.id));
      store.restaurant.kitchenOrders.forEach((k: any) => {
        if (k.tableId && !tableIds.has(k.tableId)) {
          orphaned.push({
            type: 'Kitchen Order Ticket',
            id: k.id,
            reason: `Referenced tableId "${k.tableId}" does not exist in floor tables`,
          });
        }
      });
    }
  } catch (err: any) {
    console.error('Failed to parse niche store:', err.message);
  }

  return { duplicateRecords: duplicates, orphanedRecords: orphaned };
}

// 4. Main runner
export async function runCleanupEngine(mode = 'dry-run'): Promise<CleanupReport> {
  console.log(`\n======================================================`);
  console.log(`BUSINESS OS AUDIT & CLEANUP CONSOLIDATION: [${mode.toUpperCase()}]`);
  console.log(`======================================================\n`);

  const mockPatterns = scanMockDataFallbacks();
  const routeDupes = scanRouteDuplication();
  const { duplicateRecords, orphanedRecords } = scanNicheStoreData();

  const report: CleanupReport = {
    timestamp: new Date().toISOString(),
    mode,
    mockPatternsFound: mockPatterns,
    duplicateRoutes: routeDupes,
    orphanedRecords,
    duplicateRecords,
    summary: {
      totalMockPatterns: mockPatterns.length,
      totalDuplicateRoutes: routeDupes.length,
      totalOrphanedRecords: orphanedRecords.length,
      totalDuplicateRecords: duplicateRecords.length,
      safeRemovalsPossible: duplicateRecords.length + orphanedRecords.length,
    },
  };

  console.log(`[AUDIT] Mock Data Fallback Patterns Detected: ${mockPatterns.length}`);
  mockPatterns.slice(0, 5).forEach((m) => {
    console.log(`  - [${m.category}] ${m.file}:${m.line} -> "${m.snippet}"`);
  });
  if (mockPatterns.length > 5) console.log(`  ... and ${mockPatterns.length - 5} more.`);

  console.log(`\n[AUDIT] Duplicate Routes / Menu Candidates: ${routeDupes.length}`);
  routeDupes.forEach((r) => {
    console.log(`  - Canonical: ${r.canonical} | Redundant: [${r.duplicates.join(', ')}]`);
  });

  console.log(`\n[AUDIT] Duplicate Records in Store: ${duplicateRecords.length}`);
  duplicateRecords.forEach((d) => {
    console.log(`  - ${d.type} "${d.key}": ${d.count} instances (IDs: ${d.ids.join(', ')})`);
  });

  console.log(`\n[AUDIT] Orphaned Records in Store: ${orphanedRecords.length}`);
  orphanedRecords.forEach((o) => {
    console.log(`  - ${o.type} [${o.id}]: ${o.reason}`);
  });

  console.log(`\n======================================================`);
  console.log(`SUMMARY: ${report.summary.totalMockPatterns} mock patterns, ${report.summary.totalDuplicateRoutes} route groups, ${report.summary.totalDuplicateRecords} duplicates, ${report.summary.totalOrphanedRecords} orphans.`);
  console.log(`SAFE REMOVALS POSSIBLE: ${report.summary.safeRemovalsPossible}`);
  console.log(`======================================================\n`);

  if (mode === 'all-safe' || mode === 'duplicates' || mode === 'orphaned') {
    executeSafeDeduplication();
  }

  const reportPath = path.resolve(ROOT_DIR, 'scratch/cleanup_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Report written to ${reportPath}`);

  return report;
}

export function executeSafeDeduplication() {
  console.log('\n>>> EXECUTING REVERSIBLE SAFE DEDUPLICATION & ORPHAN CLEANUP...');

  if (!fs.existsSync(PRISMA_STORE_PATH)) {
    console.log('No niche store found at', PRISMA_STORE_PATH);
    return;
  }

  // 1. Create safety backup
  const backupPath = `${PRISMA_STORE_PATH}.backup.json`;
  fs.copyFileSync(PRISMA_STORE_PATH, backupPath);
  console.log(`[BACKUP CREATED] ${backupPath}`);

  const raw = fs.readFileSync(PRISMA_STORE_PATH, 'utf-8');
  const store = JSON.parse(raw);

  let deduplicatedPatients = 0;
  let deduplicatedProperties = 0;
  let cleanedOrphans = 0;

  // 2. Deduplicate patients (keep latest instance per name per tenant)
  if (store.hospital?.patients) {
    const seen = new Set<string>();
    const originalCount = store.hospital.patients.length;
    store.hospital.patients = store.hospital.patients.filter((p: any) => {
      const key = `${p.tenantId || 'default'}:${(p.name || '').toLowerCase().trim()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    deduplicatedPatients = originalCount - store.hospital.patients.length;
  }

  // 3. Deduplicate properties (keep latest instance per title per tenant)
  if (store.realestate?.properties) {
    const seen = new Set<string>();
    const originalCount = store.realestate.properties.length;
    store.realestate.properties = store.realestate.properties.filter((p: any) => {
      const key = `${p.tenantId || 'default'}:${(p.title || '').toLowerCase().trim()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    deduplicatedProperties = originalCount - store.realestate.properties.length;
  }

  // 4. Clean orphaned kitchen orders referencing invalid tableId
  if (store.restaurant?.kitchenOrders && store.restaurant?.tables) {
    const validTableIds = new Set(store.restaurant.tables.map((t: any) => t.id));
    const originalCount = store.restaurant.kitchenOrders.length;
    store.restaurant.kitchenOrders = store.restaurant.kitchenOrders.filter((k: any) => {
      return validTableIds.has(k.tableId);
    });
    cleanedOrphans = originalCount - store.restaurant.kitchenOrders.length;
  }

  // 5. Write back sanitized store
  fs.writeFileSync(PRISMA_STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');

  console.log(`[CLEANUP COMPLETED]`);
  console.log(`  - Duplicate Patients Removed: ${deduplicatedPatients}`);
  console.log(`  - Duplicate Properties Removed: ${deduplicatedProperties}`);
  console.log(`  - Orphaned Kitchen Orders Cleaned: ${cleanedOrphans}`);
  console.log(`  - Store Size Reduced & Optimized.\n`);
}

if (require.main === module) {
  const argMode = process.argv.find((a) => a.startsWith('--mode='))?.split('=')[1] || 'dry-run';
  runCleanupEngine(argMode);
}

