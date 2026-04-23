'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * USER DOMAIN ACTIONS
 * User-specific operations such as credential updates.
 */

export async function changeMyPassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'UNAUTHORIZED_PROTOCOL: No active session detected.' };
  }

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'VALIDATION_FAILED: All fields are required.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'VALIDATION_FAILED: New passwords do not match.' };
  }

  if (newPassword.length < 8) {
    return { error: 'VALIDATION_FAILED: New password must be at least 8 characters.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.passwordHash) {
      return { error: 'ERR_IDENTITY_ABSENT: User record not found.' };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return { error: 'ERR_CREDENTIAL_MISMATCH: The current password provided is incorrect.' };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: hashedNewPassword }
    });

    return { success: true };
  } catch (e: any) {
    console.error('[USER_PASSWORD_CHANGE_FATAL]', e);
    return { error: 'SYSTEM_FAILURE: Unable to calibrate credentials at this time.' };
  }
}
