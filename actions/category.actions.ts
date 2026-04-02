'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ExpenseScope } from '@prisma/client'

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  const scope = formData.get('scope') as string;
  const parentId = formData.get('parentId') as string || null;

  if (!name || !scope) {
    throw new Error("Missing required fields: name, scope");
  }

  try {
    const existing = await (prisma as any).expenseCategory.findFirst({
        where: { name, scope: scope as ExpenseScope, parentId }
    });

    if (existing) {
        return { error: "Category already exists in this scope." };
    }

    await (prisma as any).expenseCategory.create({
      data: {
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
}
