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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-6 pb-12 border-b border-[var(--border)]">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-6 mb-4">
            <div className="w-16 h-16 rounded-[1.75rem] bg-brand/10 flex items-center justify-center shadow-premium-lg">
              <Command className="w-8 h-8 text-brand" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[var(--foreground)] uppercase tracking-tighter italic leading-none">Governance Hub</h1>
              <div className="flex items-center gap-3 mt-3">
                 <Badge variant="brand" className="px-3 py-1 text-[8px]">Precision Protocol 2026</Badge>
                 <Badge variant="success" className="px-3 py-1 text-[8px]">Signal Locked</Badge>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            className={cn("rounded-3xl h-14 px-8 transition-all group border border-[var(--border)]", isLedgerEditorVisible ? "bg-[var(--primary)] text-white" : "bg-[var(--card)] text-[var(--foreground)]")} 
            onClick={() => {
              setIsLedgerEditorVisible(!isLedgerEditorVisible);
              setIsCommandCenterVisible(false);
            }}
          >
            {isLedgerEditorVisible ? <X className="w-4 h-4 mr-3" /> : <Settings2 className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />}
            Materialize Ledger
          </Button>
          <Button 
            variant="primary" 
            className="rounded-3xl h-14 px-8 shadow-[0_0_20px_rgba(255,87,51,0.2)] bg-[var(--primary)] text-white" 
            onClick={() => {
              setIsCommandCenterVisible(!isCommandCenterVisible);
              setIsLedgerEditorVisible(false);
            }}
          >
             {isCommandCenterVisible ? <X className="w-4 h-4 mr-3" /> : <Plus className="w-4 h-4 mr-3" />}
             New Account Node
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isLedgerEditorVisible && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.98 }}>
            <Card className="p-10 rounded-[3rem] relative overflow-hidden border border-[var(--border)] shadow-premium-lg bg-[var(--card)] backdrop-blur-xl">
               <div className="flex justify-between items-center mb-10 border-b border-[var(--border)] pb-8">
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-[var(--foreground)] flex items-center">
                       <Zap className="w-8 h-8 mr-4 text-brand" /> Provision Financial Partition
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Level 0: Master Ledger Inode</p>
                  </div>
                  <button onClick={() => setIsLedgerEditorVisible(false)} className="bg-white/5 p-3 rounded-3xl hover:rotate-90 transition-transform duration-500 group hover:bg-rose-500/10">
                    <X className="w-6 h-6 text-slate-400 group-hover:text-rose-500 transition-colors"/>
                  </button>
               </div>
               <form onSubmit={handleCreateLedger} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Partition Hash</label>
                    <Input 
                      value={newLedgerName}
                      onChange={(e) => setNewLedgerName(e.target.value)}
                      required 
                      placeholder="e.g. OPERATIONS" 
                      className="h-16 text-lg font-black uppercase italic tracking-tighter bg-[var(--card)] border-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification Logic</label>
                    <select 
                      value={newLedgerClass}
                      onChange={(e) => setNewLedgerClass(e.target.value)}
                      className="w-full bg-[var(--card)] border-none rounded-3xl px-6 h-16 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand/30 appearance-none"
                    >
                      <option value="EXPENSE">EXPENSE STREAM</option>
                      <option value="REVENUE">REVENUE FLOW</option>
                      <option value="CAPEX">ASSET INJECTION</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" variant="primary" className="h-16 w-full rounded-[1.25rem] font-black uppercase italic tracking-tighter shadow-brand/40">Initialize Nexus</Button>
                  </div>
               </form>
            </Card>
          </motion.div>
        )}

        {isCommandCenterVisible && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.98 }}>
            <Card className="p-10 rounded-[3rem] border border-[var(--border)] shadow-premium-lg bg-[var(--card)] backdrop-blur-xl relative overflow-hidden">
               <div className="flex justify-between items-center mb-10 border-b border-[var(--border)] pb-8">
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-[var(--foreground)] flex items-center">
                       <Layers className="w-8 h-8 mr-4 text-brand" /> Provision Account Node
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Recursive Logic Definition</p>
                  </div>
                  <button onClick={() => setIsCommandCenterVisible(false)} className="bg-white/5 p-3 rounded-3xl hover:rotate-90 transition-transform duration-500 group hover:bg-rose-500/10">
                    <X className="w-6 h-6 text-slate-400 group-hover:text-rose-500 transition-colors"/>
                  </button>
               </div>
               <form ref={formRef} action={handleMaterializeNode} className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-end">
                  <div className="space-y-4 lg:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Node Registry Label</label>
                      <Input name="name" required placeholder="Marketing Matrix" className="h-16 italic font-black uppercase tracking-tighter bg-[var(--card)] border-none px-8" />
                  </div>
                  <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Cluster</label>
                      <select name="ledgerId" value={formLedgerId} onChange={(e) => setFormLedgerId(e.target.value)} className="w-full bg-[var(--card)] border-none rounded-3xl px-6 h-16 text-[10px] font-black uppercase tracking-widest outline-none appearance-none focus:ring-2 focus:ring-brand/30">
                          {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                  </div>
                  <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inheritance Logic</label>
                      <select name="parentId" className="w-full bg-[var(--card)] border-none rounded-3xl px-6 h-16 text-[10px] font-black uppercase tracking-widest outline-none appearance-none focus:ring-2 focus:ring-brand/30">
                          <option value="">[ROOT SEED]</option>
                          {validParentNodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                      </select>
                  </div>
                  <Button type="submit" variant="primary" className="h-16 rounded-[1.25rem] font-black uppercase italic tracking-tighter shadow-premium">Commit Trace</Button>
               </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-COLUMN GOVERNANCE GRID (PHASE 6: ANALYTICAL DENSITY) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {ledgers.map((ledger, idx) => {
           const scopeRoots = nodes.filter(n => n.ledgerId === ledger.id && !n.parentId);
           const Icon = LEDGER_ICONS[idx % LEDGER_ICONS.length];
           return (
            <Card 
              key={ledger.id} 
              className="group min-h-[500px] flex flex-col p-10 bg-[var(--card)] backdrop-blur-xl border border-white/10 rounded-[2.5rem] hover:border-[var(--primary)]/30 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center mb-10">
                 <div className="w-20 h-20 rounded-[1.75rem] bg-brand/5 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500 shadow-premium">
                    <Icon className="w-10 h-10 text-brand fill-brand/10" />
                 </div>
                 <h2 className="text-2xl font-black italic text-[var(--foreground)] uppercase tracking-tighter leading-none">{ledger.name}</h2>
                 <Badge variant={ledger.class === 'REVENUE' ? 'success' : 'brand'} className="mt-4 px-4 py-1.5 text-[8px] tracking-[0.2em]">{ledger.class}</Badge>
              </div>

              <div className="flex-1 space-y-4">
                {scopeRoots.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center border border-dashed border-[var(--primary)]/20 rounded-[2rem] p-10">
                     <Sparkles className="w-10 h-10 text-slate-200 mb-4" />
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center italic leading-relaxed">Available Logic Domain</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scopeRoots.map((node: AccountNode) => (
                      <RecursiveAccountNode 
                        key={node.id} 
                        node={node} 
                        allNodes={nodes}
                        setNodes={setNodes}
                        editingId={editingId}
                        setEditingId={setEditingId}
                        editName={editName}
                        setEditName={setEditName}
                        expandedNodes={expandedNodes}
                        toggleNode={toggleNode}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* PREDICTIVE MINIMALISM: HOVER REVEAL */}
              <div className="mt-10 pt-8 border-t border-[var(--border)] flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                 <button onClick={() => handleVaporizeLedger(ledger.id!)} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 transition-colors text-[10px] font-black uppercase tracking-widest">
                    <Trash2 className="w-4 h-4" /> Vaporize Registry
                 </button>
                 <div className="flex justify-between items-center px-2">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Hash::{ledger.id!.slice(0,8)}</span>
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

function RecursiveAccountNode({ node, allNodes, setNodes, editingId, setEditingId, editName, setEditName, expandedNodes, toggleNode }: any) {
  const isEditing = editingId === node.id;
  const subNodes = allNodes.filter((n: any) => n.parentId === node.id);
  const isExpanded = expandedNodes.has(node.id);
  const hasDependencies = subNodes.length > 0;

  const startEdit = () => { setEditingId(node.id); setEditName(node.name); };
  const cancelEdit = () => setEditingId(null);
  
  const handleUpdate = async () => {
    const r = await updateAccountNode(node.id as string, editName);
    if (r.success) { 
      setNodes((prev: any[]) => prev.map(n => n.id === node.id ? { ...n, name: editName } : n)); 
      setEditingId(null); 
      toast.success("Identity Recalibrated");
    } else {
      toast.error((r as any).error || "Update Failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Vaporize Account Node and all children?")) return;
    const r = await deleteAccountNode(node.id as string);
    if (r.success) {
      setNodes((prev: any[]) => prev.filter((n: any) => n.id !== node.id && n.parentId !== node.id));
      toast.success("Node Dissolved");
    } else {
      toast.error((r as any).error || "Vaporize Failed");
    }
  };

  return (
    <div className="group/node animate-in fade-in slide-in-from-left-2 duration-300">
      <div className={cn(
        "flex items-center justify-between p-3.5 rounded-3xl transition-all duration-500",
        isEditing ? "bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]/20" : "hover:bg-white/5"
      )}>
        <div className="flex items-center flex-1 min-w-0">
          <button onClick={() => toggleNode(node.id)} className={cn(
            "mr-3 transition-all duration-300",
            hasDependencies ? "text-brand" : "text-slate-200 dark:text-foreground",
            isExpanded && "rotate-90"
          )} disabled={!hasDependencies}>
            <ChevronRight className="w-4 h-4" />
          </button>
          
          {isEditing ? (
            <input 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              className="h-14 py-1 px-6 text-[12px] font-black uppercase italic tracking-tight border-2 border-brand/20 bg-card dark:bg-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-brand/30 transition-all flex-1 min-w-0 mx-4 text-foreground dark:text-white" 
              autoFocus 
            />
          ) : (
            <span className="text-[12px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-tight truncate group-hover/node:translate-x-1 transition-transform">{node.name}</span>
          )}
        </div>

        {/* PREDICTIVE MINIMALISM: HOVER REVEAL */}
        <div className="flex items-center gap-2 opacity-0 group-hover/node:opacity-100 transition-opacity duration-300">
           {isEditing ? (
             <>
               <button onClick={handleUpdate} className="bg-[var(--primary)] text-white p-2 rounded-xl hover:scale-110 active:scale-95 transition-all"><Check className="w-4 h-4" /></button>
               <button onClick={cancelEdit} className="bg-white/10 text-[var(--muted)] p-2 rounded-xl hover:scale-110 active:scale-95 transition-all"><X className="w-4 h-4" /></button>
             </>
           ) : (
             <>
               <button onClick={startEdit} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[var(--muted)] hover:text-[var(--primary)] transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
               <button onClick={handleDelete} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[var(--muted)] hover:text-rose-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
             </>
           )}
        </div>
      </div>
      {isExpanded && (
        <div className="ml-5 mt-2 border-l border-[var(--border)] pl-4 space-y-2">
          {subNodes.map((sub: any) => (
            <RecursiveAccountNode 
               key={sub.id} 
               node={sub} 
               allNodes={allNodes} 
               setNodes={setNodes} 
               editingId={editingId} 
               setEditingId={setEditingId} 
               editName={editName} 
               setEditName={setEditName} 
               expandedNodes={expandedNodes} 
               toggleNode={toggleNode} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
