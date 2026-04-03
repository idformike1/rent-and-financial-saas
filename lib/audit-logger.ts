import prisma from './prisma'
import { auth } from '@/auth'

interface AuditLogParams {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'NUCLEAR_PURGE' | 'INVITE' | 'ACTIVATE' | 'DEACTIVATE' | 'ROLE_CHANGE';
  entityType: 'USER' | 'EXPENSE' | 'PROPERTY' | 'TENANT' | 'UNIT' | 'LEASE' | 'CHARGE' | 'ACCOUNT' | 'LEDGER_ENTRY';
  entityId: string;
  metadata?: any;
}

export async function recordAuditLog({ action, entityType, entityId, metadata }: AuditLogParams) {
  const session = await auth();
  
  if (!session?.user?.id || !session?.user?.organizationId) {
    throw new Error("UNAUTHORIZED_AUDIT_ATTEMPT");
  }

  return await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      metadata: metadata ? metadata : undefined,
      userId: session.user.id,
      organizationId: session.user.organizationId
    }
  });
}
