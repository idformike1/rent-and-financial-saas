import { NextResponse } from 'next/server'
import { generateCSV } from '@/lib/exporters'

export async function GET() {
  try {
    const csvContent = await generateCSV();
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="MASTER_LEDGER_EXPORT.csv"',
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
