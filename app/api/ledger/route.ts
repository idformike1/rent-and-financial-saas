import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      include: {
        account: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Formatting for decimal consistency in JSON
    const formatted = entries.map(e => ({
      ...e,
      amount: e.amount.toNumber(),
    }));

    return NextResponse.json(formatted);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
