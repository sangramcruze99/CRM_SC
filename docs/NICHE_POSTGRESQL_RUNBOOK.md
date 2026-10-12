# Business OS — Phase 5: Niche PostgreSQL Persistence Runbook

## Overview
Phase 5 transitions the file-backed JSON store (`niche_store.json`) into fully indexed, transactional PostgreSQL tables (`NicheEntity` and `NicheAuditLog`). This eliminates file concurrency race conditions, guarantees ACID properties, provides tenant isolation, and maintains an immutable audit trail for all niche operations.

---

## 1. Relational Schema Architecture

The Prisma schema defines two dedicated models in `packages/database/prisma/schema.prisma`:

### `NicheEntity`
```prisma
model NicheEntity {
  id         String   @id @default(cuid())
  tenantId   String
  niche      String   // hospital, realestate, restaurant, retail, sme, agency, etc.
  entityType String   // patient, appointment, property, table, kitchenOrder, sale, etc.
  entityId   String   // domain ID (e.g. PT-1002, PROP-701)
  data       String   // JSON payload containing full entity details
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([tenantId, niche, entityType, entityId])
  @@index([tenantId, niche])
  @@index([tenantId, entityType])
}
```

### `NicheAuditLog`
```prisma
model NicheAuditLog {
  id         String   @id @default(cuid())
  tenantId   String
  niche      String
  action     String   // ADMIT_PATIENT, BOOK_SHOWING, SEAT_TABLE, POS_CHECKOUT, etc.
  entityType String
  entityId   String
  details    String
  createdAt  DateTime @default(now())

  @@index([tenantId, niche])
  @@index([tenantId, createdAt])
}
```

---

## 2. Migration Procedure & Verification

### Migration Execution
1. Backup file:
   `packages/database/prisma/niche_store.json.pre-pg-migration.bak`
2. Execution command:
   ```bash
   node scripts/migrate-niche-to-postgres.mjs
   ```
3. Entities migrated:
   - Hospital beds & configuration
   - Real estate properties, showings, deals
   - Restaurant tables, kitchen orders, menu items
   - Retail products, sales, khata credit accounts
   - SME subscriptions & MRR
   - Agency deliverables
   - Generic/dynamic niche records (logistics, construction, legal)

### Automated Test Suite
To verify the migration and ongoing health:
```bash
node scripts/verify-niche-postgres.mjs
```
The test suite validates:
- Schema presence in PostgreSQL.
- Baseline entity counts.
- CRUD across healthcare, retail, restaurant verticals.
- Multi-tenant boundary isolation.
- Next.js Web-Core App Router GET & POST endpoints.
- PostgreSQL `NicheEntity` and `NicheAuditLog` dual persistence.
- Post-test clean teardown.

---

## 3. Operational Maintenance & Rollback

### Fail-Closed Behavior
In production (`NODE_ENV=production`), operations fail closed if the PostgreSQL database connection is interrupted, preventing corrupted or stale in-memory state. In development, a fallback to memory allows local inspection.

### Rollback Strategy
If rollback to the file-backed store is required:
1. Restore JSON backup:
   ```bash
   cp packages/database/prisma/niche_store.json.pre-pg-migration.bak packages/database/prisma/niche_store.json
   ```
2. Re-enable file-only sync in `apps/web-core/src/lib/nicheStorage.ts`.
