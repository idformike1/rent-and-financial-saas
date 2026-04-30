'use server'

import { auth } from '@/auth'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function setupNewPassword(password: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: 'UNAUTHORIZED_PROTOCOL: No active session detected.' };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: hashedPassword,
        requiresPasswordChange: false
      }
    });

    // Revalidate to update session data in the client if needed
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    console.error('[AUTH_PASSWORD_SETUP_FATAL]', error);
    return { error: 'SYSTEM_FAILURE: Unable to calibrate credentials.' };
  }
}

/**
 * SUDO MODE: VERIFICATION GATE
 * Authenticates the current admin session against their password for destructive actions.
 */
export async function verifySudoPassword(password: string) {
  const session = await auth();
  
  if (!session?.user?.id || !(session.user as any)?.isSystemAdmin) {
    return { success: false, error: "UNAUTHORIZED: ROOT_ADMIN clearance required." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true }
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "ERR_IDENTITY_LOST: Admin record not found." };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return { success: false, error: "AUTHENTICATION_FAILED: Invalid password provided." };
    }

    return { success: true };
  } catch (error) {
    console.error('[SUDO_VERIFY_FATAL]', error);
    return { success: false, error: "INTERNAL_ERROR: Unable to verify authority." };
  }
}
