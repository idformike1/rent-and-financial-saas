'use client'

import { useState, useRef, useMemo } from 'react'
import { 
  FolderTree, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  Settings2,
  Lock,
  Sparkles,
  Command,
  Database,
  Building2,
  FileSpreadsheet,
  Briefcase
} from 'lucide-react'
import { 
  deleteAccountNode, 
  updateAccountNode, 
  createAccountNode,
  materializeLedger,
  recalibrateLedger,
  vaporizeLedger
} from '@/actions/category.actions'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/lib/toast'
import { Card, Badge, Button, Input, cn } from '@/components/ui-finova'

type FinancialLedger = {
  id: string;
  name: string;
  class: string;
  categories: AccountNode[];
}

type AccountNode = {
  id: string;
  name: string;
  ledgerId: string;
  parentId: string | null;
  children: AccountNode[];
}

const LEDGER_ICONS = [Building2, Briefcase, Database, FileSpreadsheet, Activity, Layers, Command, Zap];

export default function GovernanceRegistryClient({ 
  initialLedgers = [],
  initialNodes = []
}: { 
  initialLedgers: FinancialLedger[],
  initialNodes: AccountNode[]
}) {
  const [ledgers, setLedgers] = useState<FinancialLedger[]>(initialLedgers);
  const [nodes, setNodes] = useState<AccountNode[]>(initialNodes);
  
  const [isCommandCenterVisible, setIsCommandCenterVisible] = useState(false);
  const [isLedgerEditorVisible, setIsLedgerEditorVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newLedgerName, setNewLedgerName] = useState("");
  const [newLedgerClass, setNewLedgerClass] = useState("EXPENSE");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const [formLedgerId, setFormLedgerId] = useState<string>(initialLedgers?.[0]?.id || "");
  const formRef = useRef<HTMLFormElement>(null);

  const validParentNodes = useMemo(() => {
    return nodes.filter(n => n.ledgerId === formLedgerId && !n.parentId);
  }, [nodes, formLedgerId]);

  const toggleNode = (id: string) => {
    const next = new Set(expandedNodes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedNodes(next);
  };

  const handleMaterializeNode = async (formData: FormData) => {
    try {
      const result = await createAccountNode(formData);
      if (result.success && result.data) {
        toast.success("Account Node Materialized");
        setNodes(prev => [...prev, result.data as AccountNode]);
        const pId = formData.get('parentId') as string;
        if (pId) setExpandedNodes(prev => new Set(prev).add(pId));
        formRef.current?.reset();
      } else {
        toast.error(result.error || "Materialization Failure");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCreateLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await materializeLedger(newLedgerName, newLedgerClass);
      if (result.success && result.data) {
         toast.success("New Global Ledger Materialized");
         setLedgers(prev => [...prev, result.data as FinancialLedger]);
         setIsLedgerEditorVisible(false);
      } else {
         toast.error(result.error || "Registry Failure");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleVaporizeLedger = async (id: string) => {
    if (!confirm("Vaporize entire Ledger Registry?")) return;
    try {
      const result = await vaporizeLedger(id);
      if (result.success) {
        toast.success("Ledger Vaporized");
        setLedgers(prev => prev.filter(l => l.id !== id));
      } else {
        toast.error(result.error || "Security Protocol Blocked Action");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-16">
      {/* HEADER COMMAND STRIP (PHASE 3) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-6 pb-12 border-b border-slate-100 dark:border-slate-800">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-6 mb-4">
            <div className="w-16 h-16 rounded-[1.75rem] bg-brand/10 flex items-center justify-center shadow-premium-lg">
              <Command className="w-8 h-8 text-brand" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Governance Hub</h1>
              <div className="flex items-center gap-3 mt-3">
                 <Badge variant="brand" className="px-3 py-1 text-[8px]">Precision Protocol 2026</Badge>
                 <Badge variant="success" className="px-3 py-1 text-[8px]">Signal Locked</Badge>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <Button variant="secondary" className="rounded-2xl h-14 px-8 bg-white dark:bg-slate-900" onClick={() => setIsLedgerEditorVisible(true)}>Materialize Ledger</Button>
          <Button variant="primary" className="rounded-2xl h-14 px-8 shadow-brand/40" onClick={() => setIsCommandCenterVisible(!isCommandCenterVisible)}>
             {isCommandCenterVisible ? <X className="w-4 h-4 mr-3" /> : <Plus className="w-4 h-4 mr-3" />}
             New Account Node
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isLedgerEditorVisible && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card variant="glass" className="p-10 rounded-[2.5rem] relative overflow-hidden border-none shadow-premium-lg">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white flex items-center">
                       <Zap className="w-6 h-6 mr-4 text-brand" /> Deploy Financial Partition
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 px-10">Isolation level: Enterprise Cloud</p>
                  </div>
                  <button onClick={() => setIsLedgerEditorVisible(false)} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl hover:rotate-90 transition-transform"><X className="w-5 h-5 text-slate-400"/></button>
               </div>
               <form onSubmit={handleCreateLedger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input 
                    value={newLedgerName}
                    onChange={(e) => setNewLedgerName(e.target.value)}
                    required 
                    placeholder="LEDGER NAME (e.g. OPERATIONS)" 
                    className="py-6 text-lg font-black uppercase italic tracking-tighter"
                  />
                  <select 
                    value={newLedgerClass}
                    onChange={(e) => setNewLedgerClass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-brand/30"
                  >
                     <option value="EXPENSE">EXPENSE STREAM</option>
                     <option value="REVENUE">REVENUE FLOW</option>
                     <option value="CAPEX">ASSET INJECTION</option>
                  </select>
                  <Button type="submit" variant="primary" className="h-16 rounded-2xl font-black italic">Initialize Stream</Button>
               </form>
            </Card>
          </motion.div>
        )}

        {isCommandCenterVisible && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card variant="glass" className="p-10 rounded-[2.5rem] border-none shadow-premium-lg">
               <form ref={formRef} action={handleMaterializeNode} className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-end">
                  <div className="space-y-4 lg:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Registry Label</label>
                      <Input name="name" required placeholder="e.g., Marketing Budget" className="py-6 italic font-black uppercase tracking-tighter" />
                  </div>
                  <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Target Cluster</label>
                      <select name="ledgerId" value={formLedgerId} onChange={(e) => setFormLedgerId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-brand/30">
                          {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                  </div>
                  <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Node Parent</label>
                      <select name="parentId" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-brand/30">
                          <option value="">[ROOT LEVEL]</option>
                          {validParentNodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                      </select>
                  </div>
                  <Button type="submit" variant="primary" className="h-[4.5rem] rounded-2xl shadow-premium">Commit Trace</Button>
               </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4-COLUMN GOVERNANCE GRID (PHASE 3: PREDICTIVE MINIMALISM) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
        {ledgers.map((ledger, idx) => {
           const scopeRoots = nodes.filter(n => n.ledgerId === ledger.id && !n.parentId);
           const Icon = LEDGER_ICONS[idx % LEDGER_ICONS.length];
           return (
            <Card 
              key={ledger.id} 
              className="group min-h-[500px] flex flex-col p-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-white/5 rounded-[2.5rem] shadow-premium hover:shadow-premium-lg"
            >
              <div className="flex flex-col items-center text-center mb-10">
                 <div className="w-20 h-20 rounded-[1.75rem] bg-brand/5 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500 shadow-premium">
                    <Icon className="w-10 h-10 text-brand fill-brand/10" />
                 </div>
                 <h2 className="text-2xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{ledger.name}</h2>
                 <Badge variant={ledger.class === 'REVENUE' ? 'success' : 'brand'} className="mt-4 px-4 py-1.5 text-[8px] tracking-[0.2em]">{ledger.class}</Badge>
              </div>

              <div className="flex-1 space-y-4">
                {scopeRoots.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-10">
                     <Sparkles className="w-10 h-10 text-slate-200 dark:text-slate-800 mb-4" />
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center italic leading-relaxed">Available Logic Domain</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scopeRoots.map((node: AccountNode) => (
                      <RecursiveAccountNode 
                        key={node.id} 
                        node={node} 
                        allNodes={nodes}
                        editingId={editingId}
                        editName={editName}
                        setEditName={setEditName}
                        startEdit={() => { setEditingId(node.id); setEditName(node.name); }}
                        handleUpdate={async () => {
                          const r = await updateAccountNode(node.id!, editName);
                          if (r.success) { setNodes(prev => prev.map(n => n.id === node.id ? { ...n, name: editName } : n)); setEditingId(null); }
                          else toast.error(r.error);
                        }}
                        handleDelete={async () => {
                          if (!confirm("Vaporize node?")) return;
                          const r = await deleteAccountNode(node.id!);
                          if (r.success) setNodes(prev => prev.filter(n => n.id !== node.id));
                          else toast.error(r.error);
                        }}
                        cancelEdit={() => setEditingId(null)}
                        expandedNodes={expandedNodes}
                        toggleNode={toggleNode}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* PREDICTIVE MINIMALISM: HOVER REVEAL */}
              <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                 <button onClick={() => handleVaporizeLedger(ledger.id)} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 transition-colors text-[10px] font-black uppercase tracking-widest">
                    <Trash2 className="w-4 h-4" /> Vaporize Registry
                 </button>
                 <div className="flex justify-between items-center px-2">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Hash::{ledger.id.slice(0,8)}</span>
                    <Lock className="w-3 h-3 text-slate-300" />
                 </div>
              </div>
            </Card>
           );
        })}
      </div>
    </div>
  );
}

function RecursiveAccountNode({ node, allNodes, editingId, editName, setEditName, startEdit, handleUpdate, handleDelete, cancelEdit, expandedNodes, toggleNode }: any) {
  const isEditing = editingId === node.id;
  const subNodes = allNodes.filter((n: any) => n.parentId === node.id);
  const isExpanded = expandedNodes.has(node.id);
  const hasDependencies = subNodes.length > 0;

  return (
    <div className="group/node animate-in fade-in duration-300">
      <div className={cn(
        "flex items-center justify-between p-3.5 rounded-2xl transition-all duration-500",
        isEditing ? "bg-brand/5 ring-1 ring-brand/20 shadow-sm" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
      )}>
        <div className="flex items-center flex-1 min-w-0">
          <button onClick={() => toggleNode(node.id)} className={cn(
            "mr-3 transition-all duration-300",
            hasDependencies ? "text-brand" : "text-slate-200 dark:text-slate-700",
            isExpanded && "rotate-90"
          )} disabled={!hasDependencies}>
            <ChevronRight className="w-4 h-4" />
          </button>
          
          {isEditing ? (
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-9 py-1 px-4 text-xs font-black uppercase italic border-brand ring-brand/20" autoFocus />
          ) : (
            <span className="text-[12px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight truncate group-hover/node:translate-x-1 transition-transform">{node.name}</span>
          )}
        </div>

        {/* PREDICTIVE MINIMALISM: HOVER REVEAL */}
        <div className="flex items-center gap-2 opacity-0 group-hover/node:opacity-100 transition-opacity duration-300">
           {isEditing ? (
             <>
               <button onClick={handleUpdate} className="bg-emerald-500 text-white p-1.5 rounded-lg hover:scale-110 active:scale-95 transition-all"><Check className="w-3.5 h-3.5" /></button>
               <button onClick={cancelEdit} className="bg-slate-200 text-slate-600 p-1.5 rounded-lg hover:scale-110 active:scale-95 transition-all"><X className="w-3.5 h-3.5" /></button>
             </>
           ) : (
             <>
               <button onClick={startEdit} className="text-slate-400 hover:text-brand transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
               <button onClick={handleDelete} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
             </>
           )}
        </div>
      </div>
      {isExpanded && (
        <div className="ml-5 mt-2 border-l border-slate-100 dark:border-slate-800/50 pl-4 space-y-2">
          {subNodes.map((sub: any) => <RecursiveAccountNode key={sub.id} node={sub} allNodes={allNodes} editingId={editingId} editName={editName} setEditName={setEditName} expandedNodes={expandedNodes} toggleNode={toggleNode} handleDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
