import prisma from '@/lib/prisma'
import { AlertTriangle, Clock } from 'lucide-react'

export default async function DelinquencyReport() {
  // Aggregate tenants with their unpaid charges
  const tenants = await prisma.tenant.findMany({
    include: {
      charges: {
        where: { isFullyPaid: false, amount: { gt: 0 } }
      }
    }
  });

  const now = new Date().getTime();

  // Calculate total due, days past due, and rank them
  const reportData = tenants.map(tenant => {
    let totalDue = 0;
    let oldestDate = now;

    for (const c of tenant.charges) {
      totalDue += (c.amount.toNumber() - c.amountPaid.toNumber());
      if (c.dueDate.getTime() < oldestDate) {
        oldestDate = c.dueDate.getTime();
      }
    }

    const daysPastDue = totalDue > 0 ? Math.floor((now - oldestDate) / (1000 * 60 * 60 * 24)) : 0;
    
    return {
      id: tenant.id,
      name: tenant.name,
      totalDue,
      daysPastDue,
      isSevere: totalDue > 0 && daysPastDue > 30
    }
  }).filter(t => t.totalDue > 0).sort((a, b) => b.totalDue - a.totalDue);

  return (
    <div className="py-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Delinquency Report</h1>
          <p className="text-slate-500 mt-1">Ranking of outstanding balances and aging metrics.</p>
        </div>
        <div className="bg-red-50 text-red-700 font-medium px-4 py-2 border border-red-200 rounded text-sm flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Severe Delinquencies ({reportData.filter(d => d.isSevere).length})
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm sm:rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tenant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Due</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Days Past Due</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500 italic">No delinquencies recorded. Operations are current.</td>
                </tr>
              ) : (
                reportData.map((tenant) => (
                  <tr key={tenant.id} className={tenant.isSevere ? 'bg-red-50/50' : 'hover:bg-slate-50 transition-colors'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {tenant.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      ${tenant.totalDue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
                      {tenant.daysPastDue} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {tenant.isSevere ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 uppercase tracking-wide">
                          Severe (30+ Days)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 uppercase tracking-wide">
                          Warning
                        </span>
                      )}
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
