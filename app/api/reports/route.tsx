import { generateReportData } from '@/lib/reports'
import { StakeholderPDF } from '@/lib/PDFTemplate'
import { renderToStream } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await generateReportData();
  const pdfComponent = <StakeholderPDF data={data} />;

  try {
    const stream = await renderToStream(pdfComponent);

    return new Response(stream as unknown as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="super-report.pdf"'
      }
    });

  } catch (error) {
    console.error("PDF Gen Error", error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
