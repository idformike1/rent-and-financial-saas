'use client'

import { useState, useRef, useMemo } from 'react'
import { 
  Building2,
  Briefcase,
  Database,
  FileSpreadsheet,
  Activity,
  Layers,
  Command,
  Zap,
  RotateCcw
} from 'lucide-react'
import { 
  deleteAccountNode, 
  updateAccountNode, 
  createAccountNode,
  materializeLedger,
  recalibrateLedger,
  vaporizeLedger
} from '@/actions/system.actions'
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
  children?: AccountNode[];
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 pb-12 border-b border-[var(--border)]">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-6 mb-4">
            <div className="w-16 h-16 rounded-[var(--radius)] bg-brand/10 flex items-center justify-center">
               <span className="text-brand text-2xl font-bold">[G]</span>
            </div>
            <div>
              <h1 className="text-display font-weight-display text-foreground leading-none">Taxonomy Control</h1>
              <div className="flex items-center gap-3 mt-3">
                 <Badge variant="brand" className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Mercury Standard</Badge>
                 <Badge variant="success" className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Registry Synchronized</Badge>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <Button 
            type="button"
            variant="secondary"
            disabled={false}
            className={cn("rounded-[var(--radius)] h-14 px-8 transition-all group border border-[var(--border)]", isLedgerEditorVisible ? "bg-[var(--primary)] text-foreground" : "bg-[var(--card)] text-[var(--foreground)]")} 
            onClick={() => {
              setIsLedgerEditorVisible(!isLedgerEditorVisible);
              setIsCommandCenterVisible(false);
            }}
          >
            {isLedgerEditorVisible ? "[X]" : "[⚗] Materialize Ledger"}
          </Button>
          <Button 
            type="button"
            variant="primary"
            disabled={false}
            className="rounded-[var(--radius)] h-14 px-8  bg-[var(--primary)] text-foreground" 
            onClick={() => {
              setIsCommandCenterVisible(!isCommandCenterVisible);
              setIsLedgerEditorVisible(false);
            }}
          >
             {isCommandCenterVisible ? "[X]" : "[+] New Account Node"}
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isLedgerEditorVisible && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.98 }}>
            <Card className="p-6 rounded-[var(--radius)] relative overflow-hidden border border-[var(--border)] bg-[var(--card)]">
               <div className="flex justify-between items-center mb-10 border-b border-[var(--border)] pb-8">
                  <div>
                    <h3 className="text-2xl  text-[var(--foreground)] flex items-center">
                       <span className="text-brand mr-4 text-3xl">⚡</span> Provision Financial Partition
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3">Level 0: Master Ledger Inode</p>
                  </div>
                  <Button type="button" variant="ghost" disabled={false} onClick={() => setIsLedgerEditorVisible(false)} className="bg-muted p-2 h-10 w-10 min-w-0 rounded-[var(--radius)] hover:rotate-90 transition-transform duration-500 group hover:bg-rose-500/10 border-none">
                    <span className="text-muted-foreground group-hover:text-rose-500 font-bold">[X]</span>
                  </Button>
               </div>
               <form onSubmit={handleCreateLedger} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Partition Hash</label>
                    <Input 
                      value={newLedgerName}
                      onChange={(e) => setNewLedgerName(e.target.value)}
                      required 
                      placeholder="e.g. OPERATIONS" 
                      className="h-16 text-lg  bg-[var(--card)] border-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Classification Logic</label>
                    <select 
                      value={newLedgerClass}
                      onChange={(e) => setNewLedgerClass(e.target.value)}
                      className="w-full bg-[var(--card)] border-none rounded-[var(--radius)] px-6 h-16 text-[11px] font-bold uppercase tracking-tight outline-none focus:ring-2 focus:ring-brand/30 appearance-none"
                    >
                      <option value="EXPENSE">EXPENSE STREAM</option>
                      <option value="REVENUE">REVENUE FLOW</option>
                      <option value="CAPEX">ASSET INJECTION</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" variant="primary" disabled={false} className="h-16 w-full rounded-[var(--radius)] ">Initialize Nexus</Button>
                  </div>
               </form>
            </Card>
          </motion.div>
        )}

        {isCommandCenterVisible && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.98 }}>
            <Card className="p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] relative overflow-hidden">
               <div className="flex justify-between items-center mb-10 border-b border-[var(--border)] pb-8">
                  <div>
                    <h3 className="text-2xl  text-[var(--foreground)] flex items-center">
                       <span className="text-brand mr-4 text-2xl">[Ξ]</span> Provision Account Node
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3">Recursive Logic Definition</p>
                  </div>
                  <Button type="button" variant="ghost" disabled={false} onClick={() => setIsCommandCenterVisible(false)} className="bg-muted p-2 h-10 w-10 min-w-0 rounded-[var(--radius)] hover:rotate-90 transition-transform duration-500 group hover:bg-rose-500/10 border-none">
                    <span className="text-muted-foreground group-hover:text-rose-500 font-bold">[X]</span>
                  </Button>
               </div>
               <form ref={formRef} action={handleMaterializeNode} className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-end">
                  <div className="space-y-4 lg:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Node Registry Label</label>
                      <Input name="name" required placeholder="Marketing Matrix" className="h-16 text-[13px] bg-[var(--card)] border-none px-8" />
                  </div>
                  <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Target Cluster</label>
                      <select name="ledgerId" value={formLedgerId} onChange={(e) => setFormLedgerId(e.target.value)} className="w-full bg-[var(--card)] border-none rounded-[var(--radius)] px-6 h-16 text-[11px] font-bold uppercase outline-none appearance-none focus:ring-2 focus:ring-brand/30">
                          {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                  </div>
                  <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Inheritance Logic</label>
                      <select name="parentId" className="w-full bg-[var(--card)] border-none rounded-[var(--radius)] px-6 h-16 text-[11px] font-bold uppercase outline-none appearance-none focus:ring-2 focus:ring-brand/30">
                          <option value="">[ROOT SEED]</option>
                          {validParentNodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                      </select>
                  </div>
                  <Button type="submit" variant="primary" disabled={false} className="h-16 rounded-[var(--radius)] ">Commit Trace</Button>
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
              className="group min-h-[500px] flex flex-col p-6 bg-[var(--card)] border border-border rounded-[var(--radius)] hover:border-[var(--primary)]/30 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center mb-10">
                 <div className="w-20 h-20 rounded-[var(--radius)] bg-brand/5 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                    <span className="text-3xl text-brand font-bold">[L]</span>
                 </div>
                 <h2 className="text-2xl text-[var(--foreground)] leading-none">{ledger.name}</h2>
                 <Badge variant={ledger.class === 'REVENUE' ? 'success' : 'brand'} className="mt-4 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest">{ledger.class}</Badge>
              </div>

              <div className="flex-1 space-y-4">
                {scopeRoots.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center border border-dashed border-[var(--primary)]/20 rounded-[var(--radius)] p-6">
                     <span className="text-3xl text-foreground mb-4">✧</span>
                     <p className="text-[10px] text-muted-foreground  text-center leading-relaxed">Available Logic Domain</p>
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
                 <Button type="button" variant="ghost" disabled={false} onClick={() => handleVaporizeLedger(ledger.id!)} className="w-full flex items-center justify-center gap-3 py-3 h-10 rounded-[var(--radius)] bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 transition-colors text-[11px] font-bold uppercase tracking-widest border-none">
                    ⌫ Vaporize Registry
                 </Button>
                 <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Hash::{ledger.id!.slice(0,8)}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">[S]</span>
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
        "flex items-center justify-between p-3.5 rounded-[var(--radius)] transition-all duration-500",
        isEditing ? "bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]/20" : "hover:bg-muted"
      )}>
        <div className="flex items-center flex-1 min-w-0">
            <span className={cn(
               "mr-3 h-6 w-6 flex items-center justify-center transition-all duration-300",
               hasDependencies ? "text-brand" : "text-muted-foreground/30",
               isExpanded && "rotate-90"
            )}>▶</span>
          
          {isEditing ? (
            <input 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              className="h-14 py-1 px-6 text-[13px] font-medium tracking-tight border-2 border-brand/20 bg-card dark:bg-card rounded-[var(--radius)] outline-none focus:ring-2 focus:ring-brand/30 transition-all flex-1 min-w-0 mx-4 text-foreground dark:text-foreground" 
              autoFocus 
            />
          ) : (
            <span className="text-[13px] font-medium text-foreground tracking-tight truncate group-hover/node:translate-x-1 transition-transform">{node.name}</span>
          )}
        </div>

        {/* PREDICTIVE MINIMALISM: HOVER REVEAL */}
        <div className="flex items-center gap-2 opacity-0 group-hover/node:opacity-100 transition-opacity duration-300">
           {isEditing ? (
             <>
               <Button type="button" variant="primary" disabled={false} onClick={handleUpdate} className="bg-[var(--primary)] text-foreground p-2 h-8 w-8 min-w-0 rounded-[var(--radius)] hover:scale-110 active:scale-95 transition-all">✓</Button>
               <Button type="button" variant="secondary" disabled={false} onClick={cancelEdit} className="bg-muted text-[var(--muted)] p-2 h-8 w-8 min-w-0 rounded-[var(--radius)] hover:scale-110 active:scale-95 transition-all border-none">[X]</Button>
             </>
           ) : (
             <>
               <Button type="button" variant="ghost" disabled={false} onClick={startEdit} className="w-8 h-8 p-0 min-w-0 rounded-[var(--radius)] bg-muted border-none flex items-center justify-center text-[var(--muted)] hover:text-[var(--primary)] transition-all bg-transparent">✎</Button>
               <Button type="button" variant="ghost" disabled={false} onClick={handleDelete} className="w-8 h-8 p-0 min-w-0 rounded-[var(--radius)] bg-muted border-none flex items-center justify-center text-[var(--muted)] hover:text-rose-400 transition-all bg-transparent">⌫</Button>
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
