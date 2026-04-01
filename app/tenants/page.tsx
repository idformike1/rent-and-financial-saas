import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, User, Building } from 'lucide-react'

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    include: {
      leases: {
        include: {
          unit: true
        }
      }
    }
  });

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">The Directory</h1>
          <p className="text-slate-500 mt-1">Master list of all current and former occupants.</p>
        </div>
        <Link 
          href="/onboarding" 
          className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium shadow-sm hover:bg-slate-800 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> New Occupant
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
        {tenants.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No tenants found in the ledger.</p>
            <p className="text-slate-400 text-sm mt-1">Start by onboarding your first occupant.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenant Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Unit</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lease Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tenants.map((tenant) => {
                const primaryLease = tenant.leases.find(l => l.isActive);
                return (
                  <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs mr-3">
                          {tenant.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-slate-600">
                        <Building className="w-4 h-4 mr-2 text-slate-400" />
                        <span className="text-sm">{primaryLease?.unit.unitNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${primaryLease ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                        {primaryLease ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/tenants/${tenant.id}`} className="text-indigo-600 hover:text-indigo-900">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
