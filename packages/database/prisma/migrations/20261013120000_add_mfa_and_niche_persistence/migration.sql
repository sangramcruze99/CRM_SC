-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfaRecoveryCodes" TEXT,
ADD COLUMN     "mfaSecret" TEXT;

-- CreateTable
CREATE TABLE "NicheEntity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default-tenant',
    "niche" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NicheEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicheAuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'default-tenant',
    "niche" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NicheAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NicheEntity_tenantId_niche_entityType_idx" ON "NicheEntity"("tenantId", "niche", "entityType");

-- CreateIndex
CREATE INDEX "NicheEntity_tenantId_niche_idx" ON "NicheEntity"("tenantId", "niche");

-- CreateIndex
CREATE INDEX "NicheEntity_tenantId_entityId_idx" ON "NicheEntity"("tenantId", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "NicheEntity_tenantId_niche_entityType_entityId_key" ON "NicheEntity"("tenantId", "niche", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "NicheAuditLog_tenantId_niche_idx" ON "NicheAuditLog"("tenantId", "niche");

-- CreateIndex
CREATE INDEX "NicheAuditLog_tenantId_timestamp_idx" ON "NicheAuditLog"("tenantId", "timestamp");
