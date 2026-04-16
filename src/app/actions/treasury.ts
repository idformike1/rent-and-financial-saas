"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function voidTransaction(id: string) {
  await prisma.ledgerEntry.update({
    where: { id },
    data: { status: "VOIDED" },
  });
  revalidatePath("/treasury");
}

export async function clearTransaction(id: string, currentStatus: boolean) {
  await prisma.ledgerEntry.update({
    where: { id },
    data: { 
      isCleared: !currentStatus,
      clearedAt: !currentStatus ? new Date() : null,
    },
  });
  revalidatePath("/treasury");
}
