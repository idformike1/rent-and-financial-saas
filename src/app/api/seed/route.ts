import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = [
    { name: "Management Fees", type: "EXPENSE", isPersonal: false },
    { name: "Maintenance & Repairs", type: "EXPENSE", isPersonal: false },
    { name: "Property Insurance", type: "EXPENSE", isPersonal: false },
    { name: "Utilities", type: "EXPENSE", isPersonal: false },
    { name: "Property Tax", type: "EXPENSE", isPersonal: false },
    { name: "Market Rent", type: "INCOME", isPersonal: false },
    { name: "Owner Draw", type: "EXPENSE", isPersonal: true },
    { name: "Personal Travel", type: "EXPENSE", isPersonal: true },
    { name: "Tax Preparation", type: "EXPENSE", isPersonal: true },
  ];

  const results = [];
  
  for (const cat of categories) {
    const res = await (prisma as any).expenseCategory.upsert({
      where: { id: `seed-${cat.name.replace(/\s+/g, '-').toLowerCase()}` },
      update: {
        type: cat.type,
        isPersonal: cat.isPersonal,
      },
      create: {
        id: `seed-${cat.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: cat.name,
        type: cat.type as any,
        isPersonal: cat.isPersonal,
      },
    });
    results.push(res);
  }

  return NextResponse.json({ success: true, seeded: results.length });
}
