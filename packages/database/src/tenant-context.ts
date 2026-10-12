import { PrismaClient } from '@prisma/client';

/**
 * Executes a callback within a strict, tenant-isolated transactional boundary.
 * In PostgreSQL with connection pooling, session-level variables (`SET app.current_tenant_id`)
 * can leak across requests when connections are returned to the pool.
 * 
 * By using `SET LOCAL`, the tenant context is strictly bound to the transaction
 * lifecycle and is guaranteed to be cleared by PostgreSQL upon COMMIT or ROLLBACK.
 */
export async function withTenantContext<T>(
  prisma: PrismaClient,
  tenantId: string,
  callback: (tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]) => Promise<T>
): Promise<T> {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('Tenant context isolation error: Valid tenantId is required.');
  }

  // Prevent SQL injection in tenant identifier
  const sanitizedTenantId = tenantId.replace(/[^a-zA-Z0-9_\-\.]/g, '');

  return await prisma.$transaction(async (tx) => {
    // Set transaction-local session variable for RLS policies
    await (tx as any).$executeRawUnsafe(
      `SET LOCAL app.current_tenant_id = '${sanitizedTenantId}';`
    );

    return await callback(tx);
  });
}
