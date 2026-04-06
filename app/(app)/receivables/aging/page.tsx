import prisma from '@/lib/prisma'
import { AlertTriangle, Clock } from 'lucide-react'

export default async function DelinquencyReport() {
  const tenants = await prisma.tenant.findMany({
    include: {
      charges: {
        where: { isFullyPaid: false, amount: { gt: 0 } }
      }
    }
  });

  const now = new Date().getTime();

  const reportData = tenants.map((tenant: any) => {
    let totalDue = 0;
    let oldestDate = now;

    for (const c of tenant.charges) {
      totalDue += (Number(c.amount) - Number(c.amountPaid));
      const dueDate = new Date(c.dueDate);
      if (dueDate.getTime() < oldestDate) {
        oldestDate = dueDate.getTime();
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
  }).filter((t: any) => t.totalDue > 0).sort((a: any, b: any) => b.totalDue - a.totalDue);

  return (
    <div className="py-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground ">Delinquency Report</h1>
          <p className="text-muted-foreground mt-1 text-sm">Ranking of outstanding balances and aging metrics.</p>
        </div>
        <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-bold px-4 py-2 border border-red-200 dark:border-red-500/30 rounded-[8px] text-sm flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Severe Delinquencies ({reportData.filter((d: any) => d.isSevere).length})
        </div>
      </div>

      <div className="bg-card border border-border rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground ">Tenant</th>
                <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground ">Total Due</th>
                <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground ">Days Past Due</th>
                <th scope="col" className="px-6 py-3 text-right text-[10px] font-bold text-muted-foreground ">Status</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">No delinquencies recorded. Operations are current.</td>
                </tr>
              ) : (
                reportData.map((tenant: any) => (
                  <tr key={tenant.id} className={tenant.isSevere ? 'bg-red-50/50 dark:bg-red-500/5' : 'hover:bg-muted transition-colors'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground">
                      {tenant.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground font-finance">
                      ${tenant.totalDue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground flex items-center">
                      <Clock className="w-4 h-4 mr-1.5 text-muted-foreground" />
                      {tenant.daysPastDue} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {tenant.isSevere ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400  tracking-wide">
                          Severe (30+ Days)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400  tracking-wide">
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
