import { NextResponse } from 'next/server'
import { generateCSV } from '@/lib/exporters'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    id: searchParams.get('id') || undefined,
    searchTerm: searchParams.get('searchTerm') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    category: searchParams.get('category') || undefined,
  };

  try {
    const csvContent = await generateCSV(filters);
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="LEDGER_EXPORT_${new Date().toISOString().split('T')[0]}.csv"`,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
