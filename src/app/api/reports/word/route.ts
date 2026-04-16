import { NextResponse } from 'next/server'
import { generateWordReport } from '@/lib/exporters'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    searchTerm: searchParams.get('searchTerm') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    category: searchParams.get('category') || undefined,
  };

  try {
    const wordContent = await generateWordReport(filters);
    
    return new NextResponse(wordContent, {
      headers: {
        'Content-Type': 'application/msword',
        'Content-Disposition': `attachment; filename="LEDGER_REPORT_${new Date().toISOString().split('T')[0]}.doc"`,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
