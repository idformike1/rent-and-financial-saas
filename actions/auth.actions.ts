'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
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
