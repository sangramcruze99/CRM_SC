#!/usr/bin/env node
/**
 * scripts/cleanup-demo-workflows.mjs
 * Safe, intentional cleanup of seeded demo / test workflow records.
 *
 * SAFETY RULES (hard-coded — never bypassed):
 *   ✅ PROTECTED: isSystem=true, type='SYSTEM_WORKFLOW'
 *   ✅ PROTECTED: type='TEMPLATE'
 *   ✅ PROTECTED: workflows created or modified within the last 7 days
 *   ✅ PROTECTED: workflows with ≥ 3 node steps (likely real user work)
 *
 * Usage:
 *   node scripts/cleanup-demo-workflows.mjs --dry-run       ← always start here
 *   node scripts/cleanup-demo-workflows.mjs --confirm       ← actually deletes
 *   node scripts/cleanup-demo-workflows.mjs --dry-run --domain sales
 *   node scripts/cleanup-demo-workflows.mjs --older-than 30  ← only records older than 30 days
 */

import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);
process.env.DATABASE_URL = process.env.DATABASE_URL || ('file:' + path.resolve('packages/database/prisma/dev.db').replace(/\\/g, '/'));
const { PrismaClient } = require('../packages/database');

const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ─── Heuristic patterns for demo / seeded records ────────────────────────────
const DEMO_PATTERNS = [
  /^demo\b/i, /\btest\b/i, /\bsample\b/i, /\bseed/i,
  /\bexample\b/i, /placeholder/i, /untitled/i,
  /^new automation workflow$/i,
  /enterprise lead qualification & whatsapp pipeline/i,
];

function isLikelyDemo(name) {
  return DEMO_PATTERNS.some((rx) => rx.test(name));
}

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
  const DRY_RUN = args.includes('--dry-run') || !args.includes('--confirm');
  const domainFilter = args.includes('--domain') ? args[args.indexOf('--domain') + 1]?.toLowerCase() : null;
  const olderThanDays = args.includes('--older-than')
    ? parseInt(args[args.indexOf('--older-than') + 1] || '14', 10)
    : 14;

  const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  console.log('\n🧹  WORKFLOW CLEANUP SCRIPT');
  console.log('════════════════════════════════════════════════════════');
  console.log(`Mode           : ${DRY_RUN ? '🔍 DRY RUN (no data will be changed)' : '⚠️  LIVE DELETE — this will permanently remove records'}`);
  console.log(`Older than     : ${olderThanDays} days (before ${cutoffDate.toISOString().split('T')[0]})`);
  if (domainFilter) console.log(`Domain filter  : ${domainFilter}`);
  console.log('────────────────────────────────────────────────────────');
  console.log('PROTECTED (will never be deleted):');
  console.log('  • isSystem=true or type=SYSTEM_WORKFLOW');
  console.log('  • type=TEMPLATE');
  console.log('  • Modified in the last 7 days');
  console.log('  • Has 3 or more node steps (likely real user work)');
  console.log('════════════════════════════════════════════════════════\n');

  if (!DRY_RUN) {
    console.log('🚨 LIVE MODE activated. You have 5 seconds to press Ctrl+C to abort...\n');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // Fetch candidates — only records older than cutoff, not system, not template
  const candidates = await prisma.workflow.findMany({
    where: {
      isSystem: { not: true },
      type: { notIn: ['SYSTEM_WORKFLOW', 'TEMPLATE'] },
      updatedAt: { lt: cutoffDate },
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      type: true,
      category: true,
      isActive: true,
      isSystem: true,
      triggerData: true,
      version: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Apply domain filter
  const filtered = domainFilter
    ? candidates.filter((w) => (w.category || '').toLowerCase().includes(domainFilter))
    : candidates;

  // Apply safety filters — build the actual delete list
  const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const toDelete = [];
  const protected_ = [];

  for (const wf of filtered) {
    const nodes = nodeCount(wf);
    const recentlyModified = new Date(wf.updatedAt) > recentCutoff;
    const hasRealWork = nodes >= 3;
    const looksDemo = isLikelyDemo(wf.name || '');

    const reasons = [];
    if (recentlyModified) reasons.push('modified < 7 days ago');
    if (hasRealWork) reasons.push(`${nodes} steps (real work threshold)`);

    if (reasons.length > 0) {
      protected_.push({ ...wf, _nodes: nodes, _protectedReasons: reasons });
    } else if (looksDemo) {
      toDelete.push({ ...wf, _nodes: nodes });
    } else {
      // Non-demo but meets no protection — flag for manual review only
      protected_.push({ ...wf, _nodes: nodes, _protectedReasons: ['name does not match demo patterns — manual review required'] });
    }
  }

  // ─── Report ───────────────────────────────────────────────────────────────
  console.log(`📊 ANALYSIS RESULTS`);
  console.log(`  Candidates fetched    : ${filtered.length}`);
  console.log(`  PROTECTED (skip)      : ${protected_.length}`);
  console.log(`  DEMO → WILL DELETE    : ${toDelete.length}`);
  console.log('');

  if (protected_.length > 0) {
    console.log('🟢 PROTECTED (will not be touched):');
    protected_.forEach((wf) => {
      console.log(`  ${wf.id}  "${wf.name}"  nodes:${wf._nodes}  → ${wf._protectedReasons.join(', ')}`);
    });
    console.log('');
  }

  if (toDelete.length === 0) {
    console.log('✅ Nothing to delete. All candidates are protected or not demo records.');
    await prisma.$disconnect();
    return;
  }

  console.log('🟡 DEMO RECORDS FLAGGED FOR DELETION:');
  toDelete.forEach((wf) => {
    const ago = Math.round((Date.now() - new Date(wf.createdAt).getTime()) / 86400000);
    console.log(`  ${wf.id}  "${wf.name}"  nodes:${wf._nodes}  ${ago}d old`);
  });
  console.log('');

  if (DRY_RUN) {
    console.log('────────────────────────────────────────────────────────');
    console.log(`🔍 DRY RUN complete. ${toDelete.length} record(s) would be deleted.`);
    console.log('   Review the list above carefully.');
    console.log('   To proceed with actual deletion, run:');
    console.log('     node scripts/cleanup-demo-workflows.mjs --confirm');
    console.log('────────────────────────────────────────────────────────\n');
    await prisma.$disconnect();
    return;
  }

  // ─── Live deletion ────────────────────────────────────────────────────────
  const ids = toDelete.map((wf) => wf.id);
  let deleted = 0;
  let failed = 0;

  for (const id of ids) {
    try {
      await prisma.workflow.delete({ where: { id } });
      deleted++;
      process.stdout.write(`  Deleted ${id}\n`);
    } catch (err) {
      failed++;
      process.stdout.write(`  ⚠️  Failed to delete ${id}: ${err.message}\n`);
    }
  }

  console.log('');
  console.log(`✅ Cleanup complete: ${deleted} deleted, ${failed} failed.`);
  console.log('Run the audit script to verify:');
  console.log('  node scripts/audit-workflows.mjs\n');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Cleanup script failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
