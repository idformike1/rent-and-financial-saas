import prisma from '@/lib/prisma'
import ExportCsvButton from '@/components/ExportCsvButton'
import { FileText } from 'lucide-react'

export const dynamic = 'force-dynamic';

export default async function MasterLedgerPage() {
  const entries = await prisma.ledgerEntry.findMany({
    orderBy: { date: 'desc' },
    include: { account: true }
  });

  const tableData = entries.map(e => {
    const isDebit = e.amount.toNumber() > 0;
    const absVal = Math.abs(e.amount.toNumber());

    return {
      id: e.id,
      transactionId: e.transactionId,
      date: e.date.toISOString().split('T')[0],
      account: e.account.name,
      description: e.description,
      debit: isDebit ? absVal : null,
      credit: !isDebit ? absVal : null,
    }
  });

  return (
    <div className="py-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Master Ledger Audit</h1>
          <p className="text-slate-500 mt-1">Immutable double-entry chronologies tracing system ACID integrity.</p>
        </div>
        <div className="flex gap-4">
          <ExportCsvButton data={tableData} />
          <a
            href="/api/reports"
            target="_blank"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            <FileText className="w-4 h-4 mr-2" />
            Super-Report PDF
          </a>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm sm:rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[800px]">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Tx ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Account</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Debit (Dr)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Credit (Cr)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500 italic">No ledger entries exist. System is fully clean.</td>
                </tr>
              ) : (
                tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors font-mono text-xs">
                    <td className="px-6 py-3 whitespace-nowrap text-slate-400 hidden md:table-cell">
                      {row.transactionId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-slate-900">
                      {row.date}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap font-medium text-slate-900">
                      {row.account}
                    </td>
                    <td className="px-6 py-3 text-slate-500 truncate max-w-xs">
                      {row.description}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-slate-900 border-l border-slate-100 bg-slate-50/30">
                      {row.debit !== null ? `$${row.debit.toFixed(2)}` : ''}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-slate-900 border-l border-slate-100">
                      {row.credit !== null ? `$${row.credit.toFixed(2)}` : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
