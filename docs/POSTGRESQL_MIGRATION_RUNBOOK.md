# Business OS — Production PostgreSQL Migration & Operations Runbook

## Document Overview
- **Service Mesh:** Business OS Enterprise Architecture (28 NestJS Microservices + Next.js Web Core)
- **Database Engine:** PostgreSQL 16+ (x64)
- **ORM / Migrations:** Prisma 5.22.0
- **Scope:** Zero-downtime cutover, data reconciliation, backup/recovery, and connection pool isolation.

---

## 1. Architecture & Ownership Boundaries

The database architecture maintains strict boundaries across the service mesh:
- All 28 microservices access database models via `@repo/database`, which wraps `PrismaClient` with `audit.middleware.ts`.
- Multi-tenancy is enforced at the query boundary through explicit `tenantId` filtering and transaction-scoped context (`withTenantContext`).
- Mutating queries are audited in `AuditLog` with sensitive fields (`password`, `token`, `secret`, `creditcard`) automatically redacted.
- Transactional mutations emit business events to the unified event bus (`AUTOMATION_URL/workflows/events/publish`).

---

## 2. Migration Execution & Baseline Schema

### 2.1 Prisma Schema Configuration
The datasource in `packages/database/prisma/schema.prisma` is configured for PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2.2 Versioned Migration
- Migration directory: `packages/database/prisma/migrations/20261012161012_init_postgresql/`
- Applied tables: 130 tables including `Tenant`, `User`, `WorkspaceSettings`, `Project`, `Channel`, `ChartOfAccount`, `Agent`, `Workflow`, `AuditLog`, etc.
- Migration lockfile: `packages/database/prisma/migrations/migration_lock.toml` (`provider = "postgresql"`).

### 2.3 Applying Migrations in Staging / Production
```bash
# In packages/database directory
npx prisma migrate deploy
```

---

## 3. Data Migration & Reconciliation Process

### 3.1 Migration Command
```bash
node scripts/migrate-sqlite-to-postgres.mjs
```

### 3.2 Topological Foreign-Key Order
Data extraction and insertion follow this strict topological dependency hierarchy:
1. `Tenant`
2. `User` (references Tenant)
3. `WorkspaceSettings` (references Tenant)
4. `Project` (references Tenant, User)
5. `Channel` (references Tenant)
6. `ChartOfAccount` (references Tenant)
7. `AiBudget`, `AiKillSwitch` (references Tenant)
8. `Plugin`, `Connector`, `MarketplaceItem`, `Plan`, `ModelRegistry`
9. `ToolDefinition`, `Agent`, `AgentRegistryEntry`, `AgentVersion`
10. `AgentDataset`, `DatasetExample`, `AgentGoldenScenario`
11. `WorkflowTemplate`, `Workflow`, `WorkflowVersion`

### 3.3 Verification & Reconciliation Results
The migration script automatically runs count reconciliation:
```
✓ Tenant                   : SQLite = 1,  PostgreSQL = 1  (MATCH)
✓ User                     : SQLite = 1,  PostgreSQL = 1  (MATCH)
✓ WorkspaceSettings        : SQLite = 1,  PostgreSQL = 1  (MATCH)
✓ Project                  : SQLite = 1,  PostgreSQL = 1  (MATCH)
✓ Channel                  : SQLite = 1,  PostgreSQL = 1  (MATCH)
✓ ChartOfAccount           : SQLite = 12, PostgreSQL = 12 (MATCH)
✓ AiBudget                 : SQLite = 1,  PostgreSQL = 1  (MATCH)
✓ AiKillSwitch             : SQLite = 2,  PostgreSQL = 2  (MATCH)
✓ Plugin                   : SQLite = 4,  PostgreSQL = 4  (MATCH)
✓ Connector                : SQLite = 13, PostgreSQL = 13 (MATCH)
✓ MarketplaceItem          : SQLite = 6,  PostgreSQL = 6  (MATCH)
✓ Plan                     : SQLite = 5,  PostgreSQL = 5  (MATCH)
✓ ModelRegistry            : SQLite = 5,  PostgreSQL = 5  (MATCH)
✓ ToolDefinition           : SQLite = 25, PostgreSQL = 25 (MATCH)
✓ Agent                    : SQLite = 9,  PostgreSQL = 9  (MATCH)
✓ AgentRegistryEntry       : SQLite = 10, PostgreSQL = 10 (MATCH)
✓ AgentVersion             : SQLite = 10, PostgreSQL = 10 (MATCH)
✓ AgentDataset             : SQLite = 3,  PostgreSQL = 3  (MATCH)
✓ DatasetExample           : SQLite = 88, PostgreSQL = 88 (MATCH)
✓ AgentGoldenScenario      : SQLite = 4,  PostgreSQL = 4  (MATCH)
✓ WorkflowTemplate         : SQLite = 22, PostgreSQL = 22 (MATCH)
✓ Workflow                 : SQLite = 13, PostgreSQL = 13 (MATCH)
✓ WorkflowVersion          : SQLite = 3,  PostgreSQL = 3  (MATCH)
======================================================================
RECONCILIATION RESULT: 240/240 rows reconciled (100% match)
```

---

## 4. Connection Pooling & Tenant Context Isolation

### 4.1 Connection Pool Settings
Connection strings configure connection limits and pool timeouts:
```env
DATABASE_URL="postgresql://postgres:postgres_password@127.0.0.1:5432/business_os?schema=public&connection_limit=20&pool_timeout=20"
```

### 4.2 Preventing Context Bleed across Pooled Connections
In connection pools (Prisma pool, PgBouncer transaction mode), physical connections are reused across HTTP requests from different tenants.

**Rule:** Never use session-level `SET app.current_tenant_id = '...'` outside a transaction.

**Solution:** Use `withTenantContext`:
```typescript
import { withTenantContext } from '@repo/database';

await withTenantContext(prisma, tenantId, async (tx) => {
  // SET LOCAL is strictly scoped to this transaction block.
  // PostgreSQL clears it upon COMMIT or ROLLBACK.
  return await tx.deal.findMany();
});
```

### 4.3 Row-Level Security (RLS) Evaluation
- When RLS policies are attached to PostgreSQL tables using `current_setting('app.current_tenant_id', true)`, policies evaluate correctly when paired with `withTenantContext`.
- For standard ORM operations, Prisma's application-level query scoping (`where: { tenantId }`) provides primary tenant boundary enforcement, while RLS serves as defense-in-depth inside `withTenantContext` transactions.

---

## 5. Automated Backup & Recovery Procedures

### 5.1 Automated Backup
To take a full, consistent backup with SHA-256 integrity hash:
```bash
node scripts/pg-backup.mjs
```
- Output SQL archive: `backups/postgres/backup_business_os_<TIMESTAMP>.sql`
- Output metadata file: `backups/postgres/backup_business_os_<TIMESTAMP>.json`
- Flags used: `--clean --if-exists --no-owner --no-privileges`

### 5.2 Automated Restore & Verification
To restore into a target database and verify checksum:
```bash
node scripts/pg-restore.mjs <TARGET_DATABASE_NAME> [OPTIONAL_BACKUP_FILE_PATH]
```
Example:
```bash
node scripts/pg-restore.mjs business_os_recovery
```
The script validates:
1. Cryptographic SHA-256 checksum matching metadata JSON.
2. Complete schema restore into target database.
3. Row count validation on core entities (`User`, `Tenant`).

---

## 6. Cutover & Rollback Runbook

### 6.1 Pre-Cutover Checklist
- [x] Full backup of SQLite `dev.db` to `packages/database/prisma/dev.db.pre-pg-migration.bak`.
- [x] PostgreSQL 16 daemon active on port 5432.
- [x] Versioned migration `20261012161012_init_postgresql` deployed.
- [x] All 240 baseline rows migrated and reconciled.
- [x] Full Turborepo build passes (31/31 packages).
- [x] 29/29 security regression tests pass.
- [x] 7/7 PostgreSQL infrastructure and isolation tests pass.
- [x] All 29 microservices and Web Core nodes online.

### 6.2 Rollback Procedure (Emergency Only)
If an unrecoverable database fault occurs during cutover:
1. Stop backend services:
   ```powershell
   Stop-Process -Name node, ts-node -Force
   ```
2. Revert `packages/database/prisma/schema.prisma` datasource:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. Revert `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="file:E:/businessos/packages/database/prisma/dev.db"
   ```
4. Regenerate Prisma Client:
   ```bash
   pnpm --filter @repo/database run generate
   pnpm --filter @repo/database run build
   ```
5. Restart microservices mesh:
   ```bash
   node scripts/dev-services.mjs --mode=fast
   pnpm --filter @repo/web-core dev
   ```
6. Restore original SQLite file if modified:
   ```powershell
   Copy-Item "packages\database\prisma\dev.db.pre-pg-migration.bak" "packages\database\prisma\dev.db" -Force
   ```
