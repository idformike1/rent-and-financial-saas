import prisma from './prisma'
import { auth } from '@/auth'

interface AuditLogParams {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'NUCLEAR_PURGE' | 'INVITE' | 'ACTIVATE' | 'DEACTIVATE' | 'ROLE_CHANGE' | 'MOVE_OUT' | 'PAYMENT' | 'GRANT_EDIT' | 'REVOKE_EDIT';
  entityType: 'USER' | 'EXPENSE' | 'REVENUE' | 'PROPERTY' | 'TENANT' | 'UNIT' | 'LEASE' | 'CHARGE' | 'ACCOUNT' | 'LEDGER_ENTRY' | 'LEDGER' | 'CATEGORY' | 'ORGANIZATION';
  entityId: string;
  metadata?: any;
  tx?: any; 
  userId?: string;
  organizationId?: string;
}

export async function recordAuditLog({ action, entityType, entityId, metadata, tx, userId, organizationId }: AuditLogParams) {
  const client = tx || prisma;
  let finalUserId = userId;
  let finalOrgId = organizationId;

  if (!finalUserId || !finalOrgId) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new Error("UNAUTHORIZED_AUDIT_ATTEMPT");
    }
    finalUserId = session.user.id;
    finalOrgId = session.user.organizationId;
  }

  return await client.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      metadata: metadata ? metadata : undefined,
      userId: finalUserId,
      organizationId: finalOrgId
    }
  });
}
