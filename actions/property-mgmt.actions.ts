'use server'

import prisma from '@/lib/prisma'
import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function createProperty(data: { name: string, address: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const property = await prisma.property.create({
        data: {
          organizationId: session.organizationId,
          name: data.name,
          address: data.address
        }
      });
      revalidatePath('/properties');
      return { success: true, data: property };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function deleteProperty(propertyId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      // Note: This will fail if there are units attached. In a real app we'd handle cascading or prompt.
      await prisma.property.delete({
        where: { id: propertyId, organizationId: session.organizationId }
      });
      revalidatePath('/properties');
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}
