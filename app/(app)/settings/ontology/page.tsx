'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  Users, 
  TrendingDown, 
  Orbit, 
  Dna,
  Zap,
  HardDrive,
  Cpu,
  Link2,
  ChevronRight,
  Layers,
} from 'lucide-react'
import { fetchDetailedOntology } from '@/actions/ontology.actions'
import { Badge } from '@/components/ui-finova'

// High-fidelity node color definitions
const NODE_COLORS = {
  ORGANIZATION: 'text-emerald-400 border-emerald-400/30',
  CATEGORY: 'text-slate-400 border-white/10',
  BUILDING: 'text-indigo-400 border-indigo-400/20',
  TENANT: 'text-amber-400 border-amber-400/20',
  EXPENSE: 'text-rose-400 border-rose-400/20',
}

export default function OntologyMapPage() {
  const [tree, setTree] = useState<any>(null)

  useEffect(() => {
    fetchDetailedOntology().then((res: any) => {
       if (res) setTree(res.root)
    }).catch(console.error)
  }, [])

  if (!tree) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 font-mono text-emerald-400 border-none">
      <div className="flex flex-col items-center">
        <Zap className="animate-pulse mb-4 w-8 h-8" />
        <span className="text-[10px] tracking-[0.3em] uppercase">Initializing Recon Protocol...</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 font-mono p-8 lg:p-12 overflow-x-auto selection:bg-emerald-500/30 border-none scrollbar-hide">
      
      {/* GRID OVERLAY */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />
      
      {/* SCANLINE EFFECT */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,3px_100%] pointer-events-none z-50 opacity-10" />

      {/* HEADER */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-24 border-b border-white/5 pb-10 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] rounded-none px-2 py-0.5">SYST_REC_v3.5</Badge>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
          <h1 className="text-5xl font-light tracking-tighter text-white uppercase italic">System Recon <span className="text-emerald-400">Ontology Tree</span></h1>
          <p className="text-[10px] text-slate-500 tracking-[0.2em] mt-3 uppercase">Dynamic persistence layer mapping for <span className="text-white font-bold tracking-normal">{tree.name}</span></p>
        </div>
        <div className="hidden md:flex flex-col items-end opacity-40">
           <span className="text-[8px] text-emerald-500 uppercase tracking-widest font-black mb-1">DATA_INTEGRITY: 100%</span>
           <div className="w-32 h-[2px] bg-slate-900 overflow-hidden relative">
              <div className="absolute inset-0 bg-emerald-500 animate-progress origin-left" />
           </div>
        </div>
      </div>

      {/* THE TREE ROOT */}
      <div className="relative z-10 min-w-max flex flex-col items-center pb-64 pt-10">
         <TreeNode node={tree} isRoot />
      </div>

      {/* FOOTER TERMINAL */}
      <div className="fixed bottom-10 left-10 right-10 flex justify-between items-center text-[9px] text-slate-600 uppercase tracking-[0.2em] border-t border-white/5 pt-10 pointer-events-none bg-slate-950/80 backdrop-blur-sm z-30">
         <div className="flex items-center space-x-10">
            <div className="flex items-center space-x-3">
               <HardDrive className="w-3.5 h-3.5 text-emerald-500/50" />
               <span className="text-[8px]">LAYER: <span className="text-slate-400">PERSISTENCE_GRAPH</span></span>
            </div>
            <div className="flex items-center space-x-3">
               <Cpu className="w-3.5 h-3.5 text-emerald-500/50" />
               <span className="text-[8px]">PROTOCOL: <span className="text-slate-400">RECURSIVE_EXPANSION</span></span>
            </div>
         </div>
         <div className="flex items-center space-x-6 text-[8px] italic">
            <span>AXIOM_RECON_OS © 2026</span>
         </div>
      </div>
    </div>
  )
}

function TreeNode({ node, isRoot = false }: { node: any, isRoot?: boolean }) {
  const [isOpen, setIsOpen] = useState(isRoot || node.id === 'asset-portfolio')
  
  // Logical branch construction
  const childBranches = node.children ? [...node.children] : []
  if (node.type === 'BUILDING') {
      if (node.tenants?.length) childBranches.push({ id: `${node.id}-tenants`, name: `Tenants (${node.tenants.length})`, type: 'CATEGORY', children: node.tenants })
      if (node.expenses?.length) childBranches.push({ id: `${node.id}-expenses`, name: `Recent Expenses`, type: 'CATEGORY', children: node.expenses })
  }

  const hasChildren = childBranches.length > 0
  const colorKey = node.type as keyof typeof NODE_COLORS
  const colorClasses = NODE_COLORS[colorKey] || 'text-slate-400 border-white/10'

  return (
    <div className="flex flex-col items-center relative">
      
      {/* NODE CARD */}
      <motion.div 
        layout
        className="relative group z-20"
      >
         <div 
          onClick={() => hasChildren && setIsOpen(!isOpen)}
          className={`
            min-w-[280px] p-5 bg-slate-900 border ${colorClasses} relative transition-all duration-300
            ${hasChildren ? 'cursor-pointer hover:bg-slate-800/80 hover:scale-[1.02]' : 'cursor-default'}
            shadow-[0_20px_50px_rgba(0,0,0,0.5)]
          `}
         >
           {/* TYPE & STATUS */}
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                 <NodeIcon type={node.type} className={`w-3.5 h-3.5 opacity-60`} />
                 <span className="text-[8px] font-black tracking-[0.2em] opacity-40 uppercase">{node.type}</span>
              </div>
              {hasChildren && (
                 <motion.div 
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center border border-white/5"
                 >
                    <ChevronRight className="w-2.5 h-2.5 text-slate-500" />
                 </motion.div>
              )}
           </div>

           {/* CONTENT */}
           <div className="space-y-2">
              <h3 className="text-white text-xs font-bold tracking-tight uppercase truncate leading-tight">
                {node.name || (node.description ? node.description.slice(0, 30) + '...' : 'UNNAMED_ENTITY')}
              </h3>
              
              {node.amount && (
                 <div className="flex items-center justify-between">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">VALUE</span>
                    <span className="text-emerald-400 font-mono text-[11px] tabular-nums font-bold">
                        {Number(node.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                 </div>
              )}

              {node.transactionDate && (
                 <div className="flex items-center justify-between opacity-40 text-[7px] font-mono">
                    <span className="uppercase font-black">TIMESTAMP</span>
                    <span>{new Date(node.transactionDate).toLocaleDateString()}</span>
                 </div>
              )}
           </div>

           {/* DATA FINGERPRINT */}
           <div className="mt-5 border-t border-white/5 pt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                 <div className={`w-1 h-1 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                 <span className="text-[7px] font-mono text-slate-600 uppercase tracking-tighter truncate max-w-[120px]">REF_{node.id.slice(0,12)}</span>
              </div>
              <Link2 className="w-2.5 h-2.5 text-slate-800" />
           </div>
         </div>

         {/* DOWNWARD CONNECTOR (Local to Node) */}
         {isOpen && hasChildren && (
            <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-[2px] h-[40px] bg-gradient-to-b from-emerald-500/40 to-white/5 z-0" />
         )}
      </motion.div>

      {/* BRANCH CONTAINER */}
      <AnimatePresence mode="popLayout">
        {isOpen && hasChildren && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-10 pt-10 relative"
          >
            {/* HORIZONTAL CONNECTOR (SMART LINE APPROXIMATION) */}
            {childBranches.length > 1 && (
               <div className="absolute top-0 left-[140px] right-[140px] h-px bg-white/5" />
            )}
            
            {childBranches.map((child: any) => (
               <div key={child.id} className="relative pt-0">
                  {/* RE-VERTICAL CONNECTOR */}
                  {childBranches.length > 1 && (
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-10 bg-white/5" />
                  )}
                  <TreeNode node={child} />
               </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NodeIcon({ type, className }: { type: string, className?: string }) {
  if (type === 'ORGANIZATION') return <Orbit className={className} />
  if (type === 'BUILDING') return <Building2 className={className} />
  if (type === 'TENANT') return <Users className={className} />
  if (type === 'EXPENSE') return <TrendingDown className={className} />
  if (type === 'CATEGORY') return <Layers className={className} />
  return <Dna className={className} />
}
