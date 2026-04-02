import { NextResponse } from 'next/server'
import { generatePDFReport } from '@/lib/exporters'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    searchTerm: searchParams.get('searchTerm') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    category: searchParams.get('category') || undefined,
  };

  try {
    const pdfBuffer = await generatePDFReport(filters);
    
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="AUDIT_REPORT_${new Date().toISOString().split('T')[0]}.pdf"`,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
