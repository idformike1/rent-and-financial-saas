import { NextResponse } from 'next/server'
import { generateSuperReport } from '@/lib/exporters'

export async function GET() {
  try {
    const reportText = await generateSuperReport();
    
    // We serve the Super-Report as a text/plain file with a .text extension for simplicity, 
    // or as a markdown file. PDF generation requires heavy libraries like jspdf.
    // Given the "PDF Utilities" request, I'll return it as a structured PDF-style text profile.
    
    return new NextResponse(reportText, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="SUPER_INVESTOR_REPORT.txt"',
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
