// Role-Based Access Control Definitions
export type UserRole = 'OWNER' | 'MANAGER' | 'ADMIN';

export interface SessionContext {
  userId: string;
  role: UserRole;
}

/**
 * MOCK: In production, securely get the session from NextAuth or similar.
 */
export async function getCurrentSession(): Promise<SessionContext | null> {
  return {
    userId: 'mock-manager-123',
    role: 'MANAGER',
  };
}

/**
 * Verify if the active user role meets the required role hierarchy.
 */
export async function verifyRole(requiredRole: UserRole, currentRole: UserRole): Promise<boolean> {
  const roleHierarchy: Record<UserRole, number> = {
    'OWNER': 1,
    'MANAGER': 2,
    'ADMIN': 3
  };
  
  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
}

/**
 * Server Action wrapper protecting database mutations
 */
export async function runSecureServerAction<T>(
  requiredRole: UserRole, 
  action: (session: SessionContext) => Promise<T>
): Promise<T> {
  const session = await getCurrentSession();
  
  if (!session) {
    throw new Error('UNAUTHORIZED: No active session found.');
  }

  const isAuthorized = await verifyRole(requiredRole, session.role);
  if (!isAuthorized) {
    throw new Error(`FORBIDDEN: Requires ${requiredRole} access level.`);
  }

  return action(session);
}
