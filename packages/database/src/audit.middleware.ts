import { PrismaClient } from '@prisma/client';

const EXCLUDED_MODELS = new Set([
  'AuditLog',
  'ToolExecution',
  'ExecutionStep',
  'ExecutionLog',
  'EventRecord',
  'AIPromptTemplate',
]);

function deriveEventType(model: string, action: string, data: any): string {
  const m = model.toUpperCase();
  const a = action.toLowerCase();

  if (m === 'DEAL') {
    if (a === 'create') return 'DEAL_CREATED';
    if (a === 'update') {
      if (data?.stage === 'Won') return 'DEAL_WON';
      if (data?.stage === 'Lost') return 'DEAL_LOST';
      if (data?.stage) return 'DEAL_STAGE_CHANGED';
      return 'DEAL_UPDATED';
    }
  }
  if (m === 'CONTACT') {
    if (a === 'create') return 'CONTACT_CREATED';
    if (a === 'update') return 'CONTACT_UPDATED';
    if (a === 'delete') return 'CONTACT_DELETED';
  }
  if (m === 'COMPANY') {
    if (a === 'create') return 'COMPANY_CREATED';
    if (a === 'update') return 'COMPANY_UPDATED';
  }
  if (m === 'INVOICE') {
    if (a === 'create') return 'INVOICE_CREATED';
    if (a === 'update' && (data?.status === 'PAID' || data?.isPaid)) return 'PAYMENT_RECEIVED';
    if (a === 'update' && data?.status === 'OVERDUE') return 'INVOICE_OVERDUE';
  }
  if (m === 'TICKET') {
    if (a === 'create') return 'TICKET_CREATED';
    if (a === 'update' && data?.status === 'RESOLVED') return 'TICKET_RESOLVED';
    if (a === 'update' && data?.status === 'ESCALATED') return 'TICKET_ESCALATED';
  }
  if (m === 'TASK') {
    if (a === 'create') return 'TASK_CREATED';
    if (a === 'update' && (data?.status === 'COMPLETED' || data?.completed)) return 'TASK_COMPLETED';
  }
  if (m === 'EMPLOYEE') {
    if (a === 'create') return 'EMPLOYEE_CREATED';
    if (a === 'update' && data?.onboarded) return 'EMPLOYEE_ONBOARDED';
  }

  return `${m}_${action.toUpperCase()}`;
}

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

      // Only log & dispatch on mutations
      if (['create', 'update', 'delete', 'createMany', 'updateMany', 'deleteMany'].includes(params.action)) {
        if (!params.model || EXCLUDED_MODELS.has(params.model)) {
          return result;
        }

        const args = params.args || {};
        const data = args.data || {};

        // Extract tenantId
        let tenantId = data.tenantId;
        if (!tenantId && args.where && args.where.tenantId) {
          tenantId = args.where.tenantId;
        }
        if (!tenantId && result && result.tenantId) {
          tenantId = result.tenantId;
        }
        if (!tenantId) {
          tenantId = 'default-tenant';
        }

        // Extract entity ID if possible
        let entityId = result?.id;
        if (!entityId && args.where && args.where.id) {
          entityId = args.where.id;
        }

        const actionName = `${params.model.toUpperCase()}_${params.action.toUpperCase()}`;

        // 1. Asynchronously log to AuditLog without blocking
        try {
          (prisma as any).auditLog?.create({
            data: {
              tenantId,
              action: actionName,
              entityType: params.model,
              entityId: entityId || 'unknown',
              metadata: {
                args: params.args,
              },
            }
          })?.catch?.(() => {});
        } catch {
          // ignore offline audit logging errors
        }

        // 2. Asynchronously dispatch business event to Unified Event Bus
        try {
          const eventType = deriveEventType(params.model, params.action, data);
          const automationUrl = process.env.AUTOMATION_URL || 'http://localhost:3009';

          fetch(`${automationUrl}/workflows/events/publish`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-tenant-id': tenantId,
            },
            body: JSON.stringify({
              type: eventType,
              source: `database:${params.model.toLowerCase()}`,
              payload: {
                entityId,
                model: params.model,
                action: params.action,
                data: result || data,
                changes: data,
              },
              actor: {
                type: 'SYSTEM',
                name: 'PrismaMutationInterceptor',
              },
            }),
          }).catch(() => {
            // fire-and-forget: event bus might be offline in unit tests
          });
        } catch {
          // ignore event bus dispatch errors
        }
      }

      return result;
    });
  } catch {
    // ignore middleware registration error
  }
}
