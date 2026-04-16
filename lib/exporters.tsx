import React from 'react'
import { prisma } from '@/lib/prisma'
import { generateReportData } from './reports'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportPDF } from '@/components/ReportPDF'

export interface FilterParams {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}

async function getFilteredEntries(filters: FilterParams, take?: number) {
  const { searchTerm, startDate, endDate, category } = filters;
  
  // Construct Prisma where clause
  const where: any = {
    AND: []
  };

  if (searchTerm) {
    where.AND.push({
      OR: [
        { transactionId: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { account: { name: { contains: searchTerm, mode: 'insensitive' } } }
      ]
    });
  }

  if (startDate) {
    where.AND.push({ date: { gte: new Date(startDate) } });
  }

  if (endDate) {
    where.AND.push({ date: { lte: new Date(endDate) } });
  }

  if (category && category !== 'ALL') {
    where.AND.push({ account: { category: category } });
  }

  // Remove empty AND if nothing added
  if (where.AND.length === 0) delete where.AND;

  return await prisma.ledgerEntry.findMany({
    where,
    include: { account: true },
    orderBy: { date: 'desc' },
    take: take || undefined
  });
}

export async function generateCSV(filters: FilterParams) {
  const entries = await getFilteredEntries(filters);

  const headers = ['Date', 'Transaction ID', 'Account', 'Category', 'Debit', 'Credit', 'Description'];
  const rows = entries.map((e: any) => {
    const amt = Number(e.amount);
    const isDebit = amt > 0;
    const debit = isDebit ? amt.toFixed(2) : '0.00';
    const credit = !isDebit ? Math.abs(amt).toFixed(2) : '0.00';
    
    return [
      e.date.toISOString().split('T')[0],
      e.transactionId,
      e.account.name,
      e.account.category,
      debit,
      credit,
      `"${e.description.replace(/"/g, '""')}"` // CSV safe scoping
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Word Generation (HTML strategy for .doc)
 */
export async function generateWordReport(filters: FilterParams) {
  const data = await generateReportData();
  const entries = await getFilteredEntries(filters, 500); // Higher limit for Word

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Master Ledger Report</title></head>
    <body style="font-family: Arial, sans-serif;">
      <h1 style="color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 15px;">Master Ledger Audit Report</h1>
      <p style="color: #64748b;">Generated: ${data.reportDate} | Filtered Records: ${entries.length}</p>
      
      <h2 style="background: #f8fafc; padding: 10px; border-left: 5px solid #16a34a;">Executive Summary</h2>
      <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
        <tr style="background: #f1f5f9;">
          <th>Metric</th>
          <th>Value</th>
        </tr>
        <tr><td>Total Collected Income</td><td>$${data.totalCollectedIncome.toLocaleString()}</td></tr>
        <tr><td>Total Operational Expense</td><td>$${data.totalOperationalExpense.toLocaleString()}</td></tr>
        <tr><td style="font-weight: bold;">Net Realizable Revenue</td><td style="font-weight: bold; color: #16a34a;">$${data.netRealizableRevenue.toLocaleString()}</td></tr>
      </table>

      <h2 style="margin-top: 30px;">Transactional Protocol History</h2>
      <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <tr style="background: #0f172a; color: white;">
          <th>Date</th>
          <th>ID</th>
          <th>Account</th>
          <th>Debit (+)</th>
          <th>Credit (-)</th>
        </tr>
        ${entries.map((e: any) => `
          <tr>
            <td>${e.date.toISOString().split('T')[0]}</td>
            <td style="font-size: 10px;">${e.transactionId}</td>
            <td style="font-weight: bold;">${e.account.name}</td>
            <td style="color: #16a34a; text-align: right;">${Number(e.amount) > 0 ? '$'+Number(e.amount).toFixed(2) : ''}</td>
            <td style="color: #dc2626; text-align: right;">${Number(e.amount) < 0 ? '$'+Math.abs(Number(e.amount)).toFixed(2) : ''}</td>
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;
  return Buffer.from(html);
}

/**
 * PDF Generation using @react-pdf/renderer
 */
export async function generatePDFReport(filters: FilterParams) {
  const data = await generateReportData();
  const entries = await getFilteredEntries(filters, 100);

  return await renderToBuffer(<ReportPDF data={data} entries={entries} />);
}

// Keep the old name for compatibility if needed elsewhere
export async function generateSuperReport(filters: FilterParams) {
  return generatePDFReport(filters);
}
