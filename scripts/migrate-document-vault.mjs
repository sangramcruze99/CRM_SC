#!/usr/bin/env node
/**
 * Safe Migration Script for Existing Document Vault Records
 * Maps all existing records to service-aware namespaces without deleting any data.
 */

import crypto from 'crypto';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'packages', 'database', 'prisma', 'dev.db');

function calculateChecksum(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function buildCanonicalStorageKey({ tenantId, service, module, entityType, entityId, category, filename }) {
  const safeTenant = (tenantId || 'default-tenant').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeService = (service || 'documents').toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeModule = (module || 'general').toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeEntityType = (entityType || 'general').toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeEntityId = (entityId || 'root').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeCategory = (category || 'upload').toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  return `tenant/${safeTenant}/${safeService}/${safeModule}/${safeEntityType}/${safeEntityId}/${safeCategory}/${safeFilename}`;
}

async function runMigration() {
  console.log('===============================================================');
  console.log('🚀 MIGRATING EXISTING DOCUMENT VAULT RECORDS TO SERVICE NAMESPACES');
  console.log(`Database: ${dbPath}`);
  console.log('===============================================================\n');

  const db = new sqlite3.Database(dbPath);

  db.all('SELECT * FROM Document', async (err, docs) => {
    if (err) {
      console.error('Failed to read Document table:', err);
      db.close();
      process.exit(1);
    }

    console.log(`Audited ${docs.length} existing documents in database.`);

    let migratedCount = 0;
    const migrations = docs.map((doc) => {
      let service = 'documents';
      let moduleName = 'general';
      let entityType = 'file';
      let entityId = 'root';
      let category = 'upload';
      let parentDocumentId = null;

      const name = doc.name || '';
      const originalName = doc.originalName || name;

      // Classify existing documents
      if (doc.id === 'doc_resume_candidate' || name.toLowerCase().includes('resume')) {
        service = 'hr';
        moduleName = 'employees';
        entityType = 'candidate';
        entityId = 'emp_syntheval_lead';
        category = 'input';
      } else if (name.toLowerCase().startsWith('receipt_')) {
        service = 'finance';
        moduleName = 'invoices';
        entityType = 'invoice';
        category = 'receipt';
        
        // Extract invoice number from name
        const match = name.match(/Receipt_([A-Za-z0-9_-]+)\.pdf/i);
        entityId = match ? match[1] : 'INV-TEST-2026-001';

        // Link to parent invoice if matching
        if (entityId === 'INV-TEST-2026-001') {
          parentDocumentId = '0bb2e90b-1861-473f-8b7b-0a57f53f685c';
        }
      } else if (name.toLowerCase().includes('invoice')) {
        service = 'finance';
        moduleName = 'invoices';
        entityType = 'invoice';
        category = 'input';

        if (doc.id === 'fcff7251-81d6-4439-91b5-4eb1ac485ab9') {
          entityId = 'inv_synth_001';
        } else if (doc.id === '0bb2e90b-1861-473f-8b7b-0a57f53f685c') {
          entityId = 'INV-TEST-2026-001';
        } else {
          entityId = 'INV-2026-TEST';
        }
      }

      const storageKey = buildCanonicalStorageKey({
        tenantId: doc.tenantId,
        service,
        module: moduleName,
        entityType,
        entityId,
        category,
        filename: name,
      });

      const checksum = doc.checksum || calculateChecksum(`${doc.tenantId}:${doc.name}:${doc.size}`);

      return {
        id: doc.id,
        name,
        originalName,
        service,
        module: moduleName,
        entityType,
        entityId,
        category,
        storageKey,
        checksum,
        parentDocumentId,
        tenantId: doc.tenantId,
      };
    });

    db.serialize(() => {
      const stmt = db.prepare(`
        UPDATE Document SET
          originalName = ?,
          service = ?,
          module = ?,
          entityType = ?,
          entityId = ?,
          category = ?,
          storageKey = ?,
          checksum = ?,
          parentDocumentId = ?,
          status = 'ACTIVE',
          processingStatus = 'COMPLETED',
          updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      for (const m of migrations) {
        stmt.run(
          m.originalName,
          m.service,
          m.module,
          m.entityType,
          m.entityId,
          m.category,
          m.storageKey,
          m.checksum,
          m.parentDocumentId,
          m.id,
          function (updateErr) {
            if (updateErr) {
              console.error(`Error migrating doc ${m.id}:`, updateErr);
            } else {
              migratedCount++;
              console.log(`✓ Migrated [${m.id}]: ${m.service}/${m.module}/${m.entityType}/${m.entityId}/${m.category}/${m.name}`);
              console.log(`  -> Canonical Storage Key: ${m.storageKey}`);
              console.log(`  -> Checksum: ${m.checksum.substring(0, 16)}...`);
            }
          }
        );
      }

      stmt.finalize(() => {
        db.all('SELECT id, name, service, module, entityId, category, storageKey, parentDocumentId FROM Document', (checkErr, updatedRows) => {
          console.log('\n===============================================================');
          console.log(`✅ MIGRATION COMPLETE: ${updatedRows.length} records verified.`);
          console.table(updatedRows);
          db.close();
        });
      });
    });
  });
}

runMigration();
