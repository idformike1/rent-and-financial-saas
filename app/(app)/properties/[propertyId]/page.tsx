import prisma from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, ShieldCheck, Zap, Layers, Navigation } from 'lucide-react'
import PropertyPulseTerminal from './PropertyPulseTerminal'
import { Badge } from '@/components/ui-finova'

export default async function PropertyUnitsPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  
  const property = await prisma.property.findUnique({
    where: { id: propertyId }
  });

  if (!property) return (
    <div className="min-h-screen flex items-center justify-center p-10">
       <div className="bg-rose-500/10 border border-rose-500/20 p-12 rounded-[3.5rem] text-center space-y-6">
          <Zap className="w-12 h-12 text-rose-500 mx-auto" strokeWidth={3} />
          <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">NULL_RESOURCE_CONTEXT</h2>
          <Link href="/properties" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-brand transition-colors">Return to Portfolio Registry</Link>
       </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 p-10 lg:p-14 space-y-16">
      
      {/* TERMINAL HEADER: SOVEREIGN AUDENCE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
        <div className="space-y-6">
          <Link 
            href="/properties" 
            className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-brand transition-colors mb-6 group"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-3 group-hover:-translate-x-2 transition-transform" /> 
            PORTFOLIO_MASTER_INDEX
          </Link>
          
          <div className="flex items-center gap-4">
             <Badge variant="success" className="rounded-xl px-3 font-mono text-[8px] tracking-[0.4em]">ASSET_STATUS: ONLINE</Badge>
             <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-pulse" />
          </div>

          <div>
            <h1 className="text-5xl font-light tracking-tighter text-white uppercase italic leading-none">
              {property.name} <br/>
              <span className="text-[var(--primary)]">Pulse Terminal</span>
            </h1>
            <div className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-5">
              <Navigation className="w-3.5 h-3.5 mr-3 text-brand" /> {property.address}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
           <div className="px-8 py-5 border border-white/10 bg-white/3 rounded-3xl flex flex-col justify-center">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Authorization Layer</span>
              <span className="text-xs font-bold text-white flex items-center gap-2 italic uppercase">
                 <ShieldCheck className="w-3 h-3 text-brand" /> Sovereignty_V3.0
              </span>
           </div>
        </div>
      </div>

      {/* CORE ANALYTICAL TERMINAL */}
      <PropertyPulseTerminal propertyId={propertyId} propertyName={property.name} />

      {/* FOOTER ANCHOR */}
      <div className="flex justify-between items-center opacity-30 pt-10 border-t border-white/5 text-slate-500">
         <div className="flex items-center gap-6">
            <Layers className="w-10 h-10" />
            <div className="text-[8px] font-black uppercase tracking-[0.4em] leading-relaxed">
               Axiom 2026 Sovereign Auditor <br/>
               Physical_Asset_Persistence_Mapping
            </div>
         </div>
         <div className="text-[9px] font-mono italic">
            SEC_TOKEN: {property.id.split('-')[0].toUpperCase()}
         </div>
      </div>

    </div>
  )
}
