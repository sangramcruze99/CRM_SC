#!/usr/bin/env node
/**
 * scripts/audit-workflows.mjs
 * Safe read-only audit of all workflow records in the database.
 * Zero writes, zero deletions. Safe to run in production at any time.
 *
 * Usage:
 *   node scripts/audit-workflows.mjs
 *   node scripts/audit-workflows.mjs --json            # machine-readable output
 *   node scripts/audit-workflows.mjs --domain sales     # filter by category
 */

import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);
process.env.DATABASE_URL = process.env.DATABASE_URL || ('file:' + path.resolve('packages/database/prisma/dev.db').replace(/\\/g, '/'));
const { PrismaClient } = require('../packages/database');

const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ─── Classify a workflow record ───────────────────────────────────────────────
function classify(wf) {
  const name = (wf.name || '').toLowerCase();
  const type = (wf.type || '').toLowerCase();

  if (type === 'system_workflow' || wf.isSystem === true) return 'SYSTEM';
  if (type === 'template') return 'TEMPLATE';
  if (type === 'archived' || wf.status === 'ARCHIVED') return 'ARCHIVED';

  // Demo/seeded detection heuristics — never delete based on these alone
  const DEMO_PATTERNS = [
    /demo/i, /test/i, /sample/i, /seed/i, /example/i, /placeholder/i, /untitled/i,
    /new automation workflow/i, /enterprise lead qualification/i,
  ];
  const isLikelyDemo = DEMO_PATTERNS.some((rx) => rx.test(name));

  return isLikelyDemo ? 'LIKELY_DEMO' : 'USER_WORKFLOW';
}

// ─── Parse node count from triggerData ───────────────────────────────────────
function nodeCount(wf) {
  try {
    const td = typeof wf.triggerData === 'string' ? JSON.parse(wf.triggerData) : wf.triggerData;
    return Array.isArray(td?.nodes) ? td.nodes.length : 0;
  } catch {
    return 0;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const domainFilter = args.includes('--domain') ? args[args.indexOf('--domain') + 1]?.toLowerCase() : null;

  if (!jsonMode) {
    console.log('\n📋  WORKFLOW AUDIT REPORT');
    console.log('════════════════════════════════════════════════════════');
    console.log('Mode: READ-ONLY. No data will be modified or deleted.');
    console.log('════════════════════════════════════════════════════════\n');
  }

  const allWorkflows = await prisma.workflow.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      type: true,
      category: true,
      isActive: true,
      isSystem: true,
      status: true,
      triggerType: true,
      triggerData: true,
      version: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Apply domain filter
  const workflows = domainFilter
    ? allWorkflows.filter((w) => (w.category || '').toLowerCase().includes(domainFilter))
    : allWorkflows;

  // Classify and group
  const groups = {
    SYSTEM: [],
    TEMPLATE: [],
    USER_WORKFLOW: [],
    LIKELY_DEMO: [],
    ARCHIVED: [],
  };

  for (const wf of workflows) {
    const cat = classify(wf);
    groups[cat].push({ ...wf, _class: cat, _nodeCount: nodeCount(wf) });
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  const summary = {
    total: workflows.length,
    system: groups.SYSTEM.length,
    templates: groups.TEMPLATE.length,
    userWorkflows: groups.USER_WORKFLOW.length,
    likelyDemo: groups.LIKELY_DEMO.length,
    archived: groups.ARCHIVED.length,
    active: workflows.filter((w) => w.isActive).length,
    paused: workflows.filter((w) => !w.isActive).length,
    zeroStepWorkflows: workflows.filter((w) => nodeCount(w) === 0).length,
  };

  if (jsonMode) {
    console.log(JSON.stringify({ summary, groups }, null, 2));
    await prisma.$disconnect();
    return;
  }

  console.log('SUMMARY');
  console.log(`  Total records      : ${summary.total}`);
  console.log(`  Active             : ${summary.active}`);
  console.log(`  Paused             : ${summary.paused}`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  System workflows   : ${summary.system}   (PROTECTED — never delete)`);
  console.log(`  Templates          : ${summary.templates}   (PROTECTED — never delete)`);
  console.log(`  User workflows     : ${summary.userWorkflows}   (REAL USER DATA — do not touch)`);
  console.log(`  Likely demo/seeded : ${summary.likelyDemo}   (Candidates for cleanup — review first)`);
  console.log(`  Archived           : ${summary.archived}`);
  console.log(`  Zero-step (empty)  : ${summary.zeroStepWorkflows}   (Candidates for cleanup)`);
  console.log('');

  // ─── Detailed lists ───────────────────────────────────────────────────────
  const printGroup = (label, items, safe) => {
    const icon = safe ? '🟢' : '🟡';
    console.log(`\n${icon} ${label} (${items.length})`);
    if (items.length === 0) {
      console.log('  (none)');
      return;
    }
    items.forEach((wf) => {
      const ago = Math.round((Date.now() - new Date(wf.createdAt).getTime()) / 86400000);
      console.log(
        `  [${wf.isActive ? 'ACTIVE' : 'PAUSED'}] ${wf.id}  "${wf.name}"  nodes:${wf._nodeCount}  v${wf.version || 1}  ${ago}d ago`,
      );
    });
  };

  printGroup('SYSTEM (protected)', groups.SYSTEM, true);
  printGroup('TEMPLATES (protected)', groups.TEMPLATE, true);
  printGroup('USER WORKFLOWS (real data)', groups.USER_WORKFLOW, true);
  printGroup('LIKELY DEMO / SEEDED', groups.LIKELY_DEMO, false);
  printGroup('ARCHIVED', groups.ARCHIVED, false);

  console.log('\n════════════════════════════════════════════════════════');
  console.log('⚠️  To clean up LIKELY_DEMO records, run:');
  console.log('     node scripts/cleanup-demo-workflows.mjs --dry-run');
  console.log('   Review the dry-run output carefully before using --confirm.');
  console.log('════════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Audit failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
