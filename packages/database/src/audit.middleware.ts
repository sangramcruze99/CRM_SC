import { Prisma, PrismaClient } from '@prisma/client';

export function applyAuditMiddleware(prisma: PrismaClient) {
  if (typeof (prisma as any).$use !== 'function') return;

  try {
    (prisma as any).$use(async (params: any, next: any) => {
      let result;
      try {
        result = await next(params);
      } catch (err) {
        throw err;
      }
      
      // Only log mutations
      if (['create', 'update', 'delete', 'createMany', 'updateMany', 'deleteMany'].includes(params.action)) {
        // Don't recursively audit the AuditLog table
        if (params.model === 'AuditLog') {
          return result;
        }
        
        const args = params.args || {};
        const data = args.data || {};
        
        // Extract tenantId
        let tenantId = data.tenantId;
        if (!tenantId && args.where && args.where.tenantId) {
          tenantId = args.where.tenantId;
        }
        if (!tenantId) {
          tenantId = 'system';
        }

        // Extract entity ID if possible
        let entityId = result?.id;
        if (!entityId && args.where && args.where.id) {
          entityId = args.where.id;
        }
        
        try {
          // Run audit logging asynchronously without blocking the main request
          (prisma as any).auditLog?.create({
            data: {
              tenantId,
              action: `${params.model?.toUpperCase()}_${params.action.toUpperCase()}`,
              entityType: params.model || 'Unknown',
              entityId: entityId || 'unknown',
              metadata: {
                args: params.args,
              },
            }
          })?.catch?.(() => {});
        } catch {
          // ignore audit logging failures in offline dev mode
        }
      }
      
      return result;
    });
  } catch {
    // ignore middleware registration error
  }
}
