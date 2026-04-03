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
  ArrowRight
} from 'lucide-react'
import { 
  deleteAccountNode, 
  updateAccountNode, 
  createAccountNode,
  materializeLedger,
  recalibrateLedger,
  vaporizeLedger
} from '@/actions/category.actions'
import { executeRevenueSyncFix } from '@/actions/system.actions'
import { toast } from '@/lib/toast'
import { Card, Badge, Button, Input } from '@/components/ui-finova'

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
    <div className="space-y-12">
      {/* HEADER COMMAND STRIP (FINOVA RECONSTRUCTION) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-4 border-b border-surface-100 dark:border-surface-800 pb-10">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
              <Layers className="w-6 h-6 text-brand" />
            </div>
            <h1 className="text-3xl font-black text-surface-900 dark:text-white uppercase tracking-tight italic">Executive Ledger Hub</h1>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center">
             <ShieldCheck className="w-4 h-4 mr-2" /> V.3.1 Governance Infrastructure Active
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => setIsLedgerEditorVisible(true)}>Materialize Ledger</Button>
          <Button variant="primary" size="sm" onClick={() => setIsCommandCenterVisible(!isCommandCenterVisible)}>
             {isCommandCenterVisible ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
             New Account Node
          </Button>
        </div>
      </div>

      {isLedgerEditorVisible && (
        <Card className="bg-brand text-white border-none shadow-premium-lg">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black uppercase italic tracking-widest flex items-center">
                 <Zap className="w-6 h-6 mr-3" /> Materialize High-Performance Ledger
              </h3>
              <button onClick={() => setIsLedgerEditorVisible(false)} className="text-white hover:rotate-90 transition-transform"><X /></button>
           </div>
           <form onSubmit={handleCreateLedger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input 
                value={newLedgerName}
                onChange={(e) => setNewLedgerName(e.target.value)}
                required 
                placeholder="LEDGER NAME (e.g. COMMERCIAL)" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <select 
                value={newLedgerClass}
                onChange={(e) => setNewLedgerClass(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none"
              >
                 <option value="EXPENSE">EXPENSE CLASSIFICATION</option>
                 <option value="REVENUE">REVENUE STREAM</option>
                 <option value="CAPEX">CAPITAL EXPENDITURE</option>
              </select>
              <Button type="submit" variant="primary" className="bg-white text-brand hover:bg-white/90">Deploy Ledger</Button>
           </form>
        </Card>
      )}

      {isCommandCenterVisible && (
        <Card className="bg-surface-900 border-none">
           <form ref={formRef} action={handleMaterializeNode} className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-end">
              <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] block">Data Label</label>
                  <Input name="name" required placeholder="e.g., Marketing Budget" className="bg-surface-800 border-surface-700/50 text-white" />
              </div>
              <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] block">Target Ledger</label>
                  <select name="ledgerId" value={formLedgerId} onChange={(e) => setFormLedgerId(e.target.value)} className="w-full bg-surface-800 border border-surface-700/50 rounded-xl px-4 py-3 text-white text-sm font-bold appearance-none">
                      {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
              </div>
              <div className="space-y-3 lg:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] block">Parent Root Node</label>
                  <select name="parentId" className="w-full bg-surface-800 border border-surface-700/50 rounded-xl px-4 py-3 text-white text-sm font-bold appearance-none">
                      <option value="">[ROOT LEVEL]</option>
                      {validParentNodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
              </div>
              <Button type="submit" variant="primary" className="h-12 shadow-premium">Activate Entry</Button>
           </form>
        </Card>
      )}

      {/* DYNAMIC LEDGER MAPPING GRID (PHASE 2 MANDATE: IMAGE 7 STANDARD) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {ledgers.map((ledger, idx) => {
           const scopeRoots = nodes.filter(n => n.ledgerId === ledger.id && !n.parentId);
           return (
            <Card key={ledger.id} className="min-h-[500px] flex flex-col p-8 group">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-xl font-black italic text-surface-900 dark:text-white uppercase tracking-tighter">{ledger.name}</h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Classification Index #0{idx+1}</p>
                 </div>
                 {/* MANDATE PROOF: RENTAL INCOME BADGE RENDERING */}
                 <Badge variant={ledger.class === 'REVENUE' ? 'success' : 'default'} className="rounded-xl border-none">
                   {ledger.class}::{idx+1}
                 </Badge>
              </div>

              <div className="flex-1 space-y-3">
                {scopeRoots.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-surface-100 dark:border-surface-800 rounded-[2rem] p-8">
                     <Activity className="w-10 h-10 text-surface-100 dark:text-surface-800 mb-4" />
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-center italic">Open Logic Domain</p>
                  </div>
                ) : (
                  scopeRoots.map((node: AccountNode) => (
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
                  ))
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-surface-50 dark:border-surface-800 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleVaporizeLedger(ledger.id)} className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center"><X className="w-3 h-3 mr-1" /> Vaporize Registry</button>
                 <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Audit Ref: {ledger.id.slice(0,6)}</span>
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
      <div className={`flex items-center justify-between p-4 rounded-xl transition-all ${isEditing ? 'bg-brand/5 ring-1 ring-brand/20' : 'hover:bg-surface-50 dark:hover:bg-surface-900/50'}`}>
        <div className="flex items-center flex-1 min-w-0">
          <button onClick={() => toggleNode(node.id)} className={`mr-2 transition-colors ${hasDependencies ? 'text-brand' : 'text-slate-200'}`} disabled={!hasDependencies}>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {isEditing ? (
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 py-1 px-3 text-xs font-black uppercase italic" />
          ) : (
            <span className="text-[12px] font-bold text-surface-900 dark:text-white uppercase tracking-tight truncate group-hover/node:translate-x-1 transition-transform">{node.name}</span>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover/node:opacity-100 transition-opacity">
           {isEditing ? (
             <button onClick={handleUpdate} className="text-emerald-500 hover:text-emerald-600"><Check className="w-4 h-4" /></button>
           ) : (
             <>
               <button onClick={startEdit} className="text-slate-400 hover:text-brand"><Edit2 className="w-3 h-3" /></button>
               <button onClick={handleDelete} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-3 h-3" /></button>
             </>
           )}
        </div>
      </div>
      {isExpanded && (
        <div className="ml-6 mt-1 border-l-2 border-surface-100 dark:border-surface-800 pl-4 space-y-1">
          {subNodes.map((sub: any) => <RecursiveAccountNode key={sub.id} node={sub} allNodes={allNodes} editingId={editingId} editName={editName} setEditName={setEditName} expandedNodes={expandedNodes} toggleNode={toggleNode} handleDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
