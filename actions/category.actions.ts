'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ExpenseScope } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'

export async function createCategory(formData: FormData) {
  return runSecureServerAction('MANAGER', async (session) => {
    const name = formData.get('name') as string;
    const scope = formData.get('scope') as string;
    const parentId = formData.get('parentId') as string || null;

    if (!name || !scope) {
      return { error: "Missing required fields: name, scope" };
    }

    try {
      const existing = await prisma.expenseCategory.findFirst({
          where: { 
            name, 
            scope: scope as ExpenseScope, 
            parentId,
            organizationId: session.organizationId 
          }
      });

      if (existing) {
          return { error: "Category already exists in this scope." };
      }

      await prisma.expenseCategory.create({
        data: {
          organizationId: session.organizationId,
          name,
          scope: scope as ExpenseScope,
          parentId: parentId || undefined
        }
      });

      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
      return { error: e.message };
    }
  });
}
