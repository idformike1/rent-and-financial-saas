import { auth, signOut } from "@/auth";
import { prisma } from '@/src/lib/prisma';
import { redirect } from "next/navigation";

/**
 * LIVE IDENTITY GUARD
 * 
 * This utility eliminates "Ghost Sessions" by verifying the user's real-time state 
 * in the database. If a user is suspended, archived, or deleted while they have 
 * an active JWT, this guard will forcefully terminate their session.
 */
export async function requireLiveIdentity() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  // 1. Fetch real-time status from the authoritative database
  const liveUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      accountStatus: true, 
      deletedAt: true 
    }
  });

  // 2. Evaluate identity integrity
  const isInvalid = 
    !liveUser || 
    liveUser.deletedAt !== null || 
    liveUser.accountStatus === 'SUSPENDED' || 
    liveUser.accountStatus === 'ARCHIVED' ||
    liveUser.accountStatus === 'DEACTIVATED';

  // 3. Shred session if identity is compromised
  if (isInvalid) {
    console.warn(`[SECURITY_GUARD] Terminating compromised session for identity: ${session.user.id}`);
    
    // Forcefully sign out and redirect to login
    // Note: signOut from NextAuth handles the session destruction
    await signOut({ redirectTo: '/login' });
    return null;
  }

  return session;
}
