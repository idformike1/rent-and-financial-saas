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

  // Revalidate type safety for mapping
  type TenantWithLeases = typeof tenants[0];

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

      <div className="bg-white border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] rounded-2xl overflow-hidden">
        {tenants.length === 0 ? (
          <div className="p-24 text-center">
            <User className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <p className="text-xl font-black text-slate-900 uppercase italic">No Active Records</p>
            <p className="text-slate-400 text-sm mt-1 font-bold tracking-widest uppercase">Start by onboarding your first occupant.</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-slate-900 text-white border-b-4 border-slate-900">
              <tr>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest">Occupant Identity</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest">Lease Portfolio</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest">Status / Risk</th>
                <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest">Registry Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-4 divide-slate-50">
              {tenants.map((tenant: any) => {
                const activeLeases = (tenant.leases as any[]).filter(l => l.isActive);
                const primaryLease = activeLeases.find(l => l.isPrimary) || activeLeases[0];
                const unitDisplay = activeLeases.length > 1 
                  ? `${primaryLease?.unit.unitNumber} (+${activeLeases.length - 1} more)`
                  : primaryLease?.unit.unitNumber || 'UNASSIGNED';

                return (
                  <tr key={tenant.id} className="hover:bg-indigo-50/50 transition-all group">
                    <td className="px-6 py-6">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg mr-4 italic shadow-lg group-hover:rotate-3 transition-transform">
                          {tenant.name.charAt(0)}
                        </div>
                        <div>
                          <span className="block text-sm font-black text-slate-900 uppercase italic tracking-tighter">{tenant.name}</span>
                          <span className="block text-[10px] font-bold text-slate-400 font-mono tracking-tighter truncate max-w-[150px]">{tenant.email || 'NO_IDENTITY_LINKED'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center text-slate-900 font-black italic">
                        <Building className="w-4 h-4 mr-2 text-indigo-600" />
                        <span className="text-xs uppercase tracking-tighter">{unitDisplay}</span>
                      </div>
                      <span className="block text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">{activeLeases.length} ACTIVE ATOMIC LEASES</span>
                    </td>
                    <td className="px-6 py-6 font-mono">
                      <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black tracking-widest border-2 ${activeLeases.length > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        {activeLeases.length > 0 ? 'STATUS::ACTIVE' : 'STATUS::INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <Link 
                        href={`/tenants/${tenant.id}`} 
                        className="inline-block bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all uppercase tracking-widest italic"
                      >
                        Enter Command Center
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
