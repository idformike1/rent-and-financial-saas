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
import Link from 'next/link'
import { fetchDetailedOntology } from '@/actions/system.actions'
import { Badge } from '@/components/ui-finova'
import { Skeleton } from '@/components/ui/skeleton'

function OntologySkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] pt-20">
      <div className="p-5 bg-[var(--card)] border border-[var(--border)] min-w-[280px] rounded-[8px] mb-0 flex flex-col gap-3 relative z-20">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-4 h-4" />
        </div>
        <Skeleton className="w-48 h-5" />
        <Skeleton className="w-24 h-4 mt-2" />
      </div>
      <div className="w-px h-10 bg-gradient-to-b from-[var(--border)] to-transparent relative z-0" />
      <div className="w-[180px] h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent mb-10 relative z-0" />
      
      <div className="flex gap-6 relative z-20">
        <div className="p-5 bg-[var(--card)] border border-[var(--border)] min-w-[280px] rounded-[8px] flex flex-col gap-3">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-40 h-5" />
        </div>
        <div className="p-5 bg-[var(--card)] border border-[var(--border)] min-w-[280px] rounded-[8px] flex flex-col gap-3">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-40 h-5" />
        </div>
      </div>
    </div>
  )
}

// High-fidelity node color definitions
const NODE_COLORS = {
  ORGANIZATION: 'text-[var(--primary)] border-emerald-400/30',
  CATEGORY: 'text-[var(--muted)] border-[var(--border)]',
  BUILDING: 'text-[var(--primary)] border-[var(--primary)]/20',
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
    <div className="min-h-screen bg-[var(--background)] font-mono p-6 lg:p-6 overflow-x-auto border-none">
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-24 border-b border-[var(--border)] pb-10 gap-6">
        <div className="space-y-4">
          <Skeleton className="w-24 h-5" />
          <Skeleton className="w-[400px] h-12" />
          <Skeleton className="w-[300px] h-4" />
        </div>
      </div>
      <OntologySkeleton />
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--background)] font-mono p-6 lg:p-6 overflow-x-auto selection:bg-[var(--primary-muted)] border-none scrollbar-hide text-[var(--foreground)]">
      
      {/* GRID OVERLAY */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-[0.15]" />
      
      {/* SCANLINE EFFECT */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,3px_100%] pointer-events-none z-50 opacity-10" />

      {/* HEADER */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-24 border-b border-[var(--border)] pb-10 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Badge className="bg-[var(--primary-muted)] text-[var(--primary)] border-[var(--primary)]/20 text-[8px] rounded-xl px-2 py-0.5">SYST_REC_v3.5</Badge>
            <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-pulse shadow-none" />
          </div>
          <h1 className="text-display font-weight-display font-light text-[var(--foreground)] ">System Recon <span className="text-[var(--primary)]">Ontology Tree</span></h1>
          <p className="text-[10px] text-[var(--muted)] tracking-[0.2em] mt-3 ">Dynamic persistence layer mapping for <span className="text-[var(--foreground)] font-bold tracking-normal">{tree.name}</span></p>
        </div>
        <div className="hidden md:flex flex-col items-end opacity-40">
           <span className="text-[8px] text-[var(--primary)]  mb-1">DATA_INTEGRITY: 100%</span>
           <div className="w-32 h-[2px] bg-[var(--border)] overflow-hidden relative">
              <div className="absolute inset-0 bg-[var(--primary)] animate-progress origin-left" />
           </div>
        </div>
      </div>

      {/* THE TREE ROOT */}
      <div className="relative z-10 min-w-max flex flex-col items-center pb-64 pt-10">
         <TreeNode node={tree} isRoot />
      </div>

      {/* FOOTER TERMINAL */}
      <div className="fixed bottom-10 left-10 right-10 flex justify-between items-center text-[9px] text-[var(--muted)]  tracking-[0.2em] border-t border-[var(--border)] pt-10 pointer-events-none bg-[var(--background)]/80 z-30">
         <div className="flex items-center space-x-10">
            <div className="flex items-center space-x-3">
               <HardDrive className="w-3.5 h-3.5 text-[var(--primary)]/50" />
               <span className="text-[8px]">LAYER: <span className="text-[var(--foreground)]">PERSISTENCE_GRAPH</span></span>
            </div>
            <div className="flex items-center space-x-3">
               <Cpu className="w-3.5 h-3.5 text-[var(--primary)]/50" />
               <span className="text-[8px]">PROTOCOL: <span className="text-[var(--foreground)]">RECURSIVE_EXPANSION</span></span>
            </div>
         </div>
         <div className="flex items-center space-x-6 text-[8px]">
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
  
  // Surgical Fix: Corporate Overhead Empty State
  if (node.id === 'detached-expenses' && childBranches.length === 0) {
      childBranches.push({ 
        id: 'empty-detached', 
        name: 'NO DETACHED EXPENSES DETECTED', 
        type: 'EMPTY_STATE' 
      })
  }

  const hasChildren = childBranches.length > 0
  
  if (node.type === 'EMPTY_STATE') {
      return (
        <div className="min-w-[280px] p-5 bg-[var(--background)] border border-dashed border-[var(--border)] font-mono text-[10px] text-[var(--muted)] text-center  rounded-[8px]">
          {node.name}
        </div>
      )
  }

  const colorKey = node.type as keyof typeof NODE_COLORS
  const colorClasses = NODE_COLORS[colorKey] || 'text-[var(--muted)] border-[var(--border)]'

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
            min-w-[280px] p-5 bg-[var(--card)] border ${colorClasses} relative transition-all duration-300 rounded-[8px] shadow-sm hover:shadow-none
            ${hasChildren ? 'cursor-pointer hover:bg-[var(--card-raised)] hover:scale-[1.02]' : 'cursor-default'}
            dark:shadow-none
          `}
         >
           {/* TYPE & STATUS */}
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                 <NodeIcon type={node.type} className={`w-3.5 h-3.5 opacity-60`} />
                 <span className="text-[8px] tracking-[0.2em] opacity-40 ">{node.type}</span>
              </div>
              {hasChildren && (
                 <motion.div 
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  className="w-4 h-4 rounded-full bg-[var(--card-raised)] flex items-center justify-center border border-[var(--border)]"
                 >
                    <ChevronRight className="w-2.5 h-2.5 text-[var(--muted)]" />
                 </motion.div>
              )}
           </div>

           {/* CONTENT */}
           <div className="space-y-2">
              <h3 className="text-[var(--foreground)] text-xs font-bold tracking-tight  truncate leading-tight">
                {node.name || (node.description ? node.description.slice(0, 30) + '...' : 'UNNAMED_ENTITY')}
              </h3>
              
              {node.amount && (
                 <div className="flex items-center justify-between">
                    <span className="text-[8px] text-muted-foreground ">VALUE</span>
                    <span className="text-[var(--primary)] font-mono text-[11px] font-finance tabular-nums font-bold">
                        {Number(node.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                 </div>
              )}

              {node.transactionDate && (
                 <div className="flex items-center justify-between opacity-40 text-[7px] font-mono">
                    <span className="uppercase">TIMESTAMP</span>
                    <span>{new Date(node.transactionDate).toLocaleDateString()}</span>
                 </div>
              )}
           </div>

           {/* DATA FINGERPRINT */}
           <div className="mt-5 border-t border-[var(--border)] pt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                 <div className={`w-1 h-1 rounded-full ${isOpen ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]/50'}`} />
                 <span className="text-[7px] font-mono text-[var(--muted)]  truncate max-w-[120px]">REF_{node.id.slice(0,12)}</span>
              </div>
              <JumpToSource node={node} />
           </div>
         </div>

         {/* DOWNWARD CONNECTOR (Local to Node) */}
         {isOpen && hasChildren && (
            <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-[2px] h-[40px] bg-gradient-to-b from-emerald-500/40 to-[var(--border)]/20 z-0" />
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
            className="flex gap-6 pt-10 relative"
          >
            {/* HORIZONTAL CONNECTOR (SMART LINE APPROXIMATION) */}
            {childBranches.length > 1 && (
               <div className="absolute top-0 left-[140px] right-[140px] h-px bg-[var(--border)]" />
            )}
            
            {childBranches.map((child: any) => (
               <div key={child.id} className="relative pt-0">
                  {/* RE-VERTICAL CONNECTOR */}
                  {childBranches.length > 1 && (
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-10 bg-[var(--border)]" />
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

function JumpToSource({ node }: { node: any }) {
  let href = '';
  let label = '';

  switch (node.type) {
    case 'BUILDING':
      href = `/properties/${node.id}`;
      label = 'Property';
      break;
    case 'TENANT':
      href = `/tenants/${node.id}`;
      label = 'Tenant';
      break;
    case 'EXPENSE':
      href = `/expenses?id=${node.id}`;
      label = 'Expense';
      break;
    case 'INCOME':
      href = `/treasury?id=${node.id}`;
      label = 'Income';
      break;
    default:
      return <Link2 className="w-2.5 h-2.5 text-foreground" />;
  }

  return (
    <Link 
      href={href} 
      title={`Jump to ${label} Source`}
      className="p-1 hover:bg-[var(--primary)]/10 transition-all group/link rounded"
    >
      <Link2 className="w-3 h-3 text-[var(--muted)] group-hover/link:text-[var(--primary)] transition-colors" />
    </Link>
  );
}

function NodeIcon({ type, className }: { type: string, className?: string }) {
  if (type === 'ORGANIZATION') return <Orbit className={className} />
  if (type === 'BUILDING') return <Building2 className={className} />
  if (type === 'TENANT') return <Users className={className} />
  if (type === 'EXPENSE') return <TrendingDown className={className} />
  if (type === 'CATEGORY') return <Layers className={className} />
  return <Dna className={className} />
}
