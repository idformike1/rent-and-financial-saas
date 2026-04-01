import prisma from '@/lib/prisma'
import { generateReportData } from './reports'

export async function generateCSV() {
  const entries = await prisma.ledgerEntry.findMany({
    include: { account: true, },
    orderBy: { date: 'desc' }
  });

  const headers = ['Date', 'Transaction ID', 'Account', 'Category', 'Debit', 'Credit', 'Description'];
  const rows = entries.map(e => {
    const isDebit = e.amount.toNumber() > 0;
    const debit = isDebit ? e.amount.toNumber().toFixed(2) : '0.00';
    const credit = !isDebit ? Math.abs(e.amount.toNumber()).toFixed(2) : '0.00';
    
    return [
      e.date.toISOString().split('T')[0],
      e.transactionId,
      e.account.name,
      e.account.category,
      debit,
      credit,
      e.description.replace(/,/g, ';') // CSV safe
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Super-Report (PDF-like text report)
 * In a real environment, we'd use 'jspdf' or 'react-pdf'.
 * For this implementation, we'll return a formatted Markdown/Text report 
 * that the client can handle or prompt for a "Save As PDF" style view.
 */
export async function generateSuperReport() {
  const data = await generateReportData();
  const entries = await prisma.ledgerEntry.findMany({
    include: { account: true },
    orderBy: { date: 'desc' },
    take: 100 // Last 100 entries for the executive summary
  });

  let pdfReport = `
# MATERIAL FISCAL SUPER-REPORT
Date Generated: ${data.reportDate}
--------------------------------------------------------------------------------

## 📈 Net Realizable Revenue (NRR) Analysis
- Total Collected Income:  $${data.totalCollectedIncome.toLocaleString()}
- Total Operational Cost:  $${data.totalOperationalExpense.toLocaleString()}
- NET OPERATING INCOME:    $${data.netRealizableRevenue.toLocaleString()}

## ⚖️ Utility Recovery Protocol (Algorithm B)
- Master Master Bill Total: $${data.utilityAnalysis.utilExpense.toLocaleString()}
- Tenant Recovery Total:    $${data.utilityAnalysis.utilRecovery.toLocaleString()}
- Fiscal Delta:             $${data.utilityAnalysis.utilityDelta.toLocaleString()}
- STATUS:                   ${data.utilityAnalysis.isUtilityWarning ? '⚠️ DELTA EXCEEDS 15% THRESHOLD' : '✅ RECOVERY WITHIN NOMINAL RANGE'}

## 🕰️ Aging Snapshot (Receivables Rank)
${data.agingSnapshot.map(t => `- ${t.name}: $${t.totalDue.toLocaleString()} (${t.daysPastDue} Days Past Due)`).join('\n')}

## 📓 Master Ledger Snapshot (Recent 100 Entries)
| Date | Transaction ID | Account | Debit (+) | Credit (-) |
|------|----------------|---------|-----------|------------|
${entries.map(e => {
  const isDebit = e.amount.toNumber() > 0;
  return `| ${e.date.toISOString().split('T')[0]} | ${e.transactionId} | ${e.account.name} | ${isDebit ? e.amount.toNumber().toFixed(2) : ''} | ${!isDebit ? Math.abs(e.amount.toNumber()).toFixed(2) : ''} |`;
}).join('\n')}

--------------------------------------------------------------------------------
END OF REPORT // SECURED BY ANTIGRAWITY ENGINE
`;

  return pdfReport;
}
