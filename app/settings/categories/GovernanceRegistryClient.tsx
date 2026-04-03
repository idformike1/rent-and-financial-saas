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
  Settings, 
  Search,
  Activity,
  Layers,
  ShieldCheck,
  Zap
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

/**
 * UPDATED PROFESSIONAL FINANCIAL TAXONOMY INTERFACES
 * Supporting Dynamic Ledgers & 2-Level Depth Capping.
 */
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

export default function ExecutiveLedgerHub({ 
  initialLedgers = [],
  initialNodes = []
}: { 
  initialLedgers: FinancialLedger[],
  initialNodes: AccountNode[]
}) {
  const [ledgers, setLedgers] = useState<FinancialLedger[]>(initialLedgers);
  const [nodes, setNodes] = useState<AccountNode[]>(initialNodes);
  
  // UI States
  const [isCommandCenterVisible, setIsCommandCenterVisible] = useState(false);
  const [isLedgerEditorVisible, setIsLedgerEditorVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newLedgerName, setNewLedgerName] = useState("");
  const [newLedgerClass, setNewLedgerClass] = useState("EXPENSE");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Dynamic Form State
  const [formLedgerId, setFormLedgerId] = useState<string>(initialLedgers?.[0]?.id || "");
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * TASK 1: STRICT HIERARCHY CONSTRAINT (DEPTH CAPPING)
   * Only Top-Level categories (where parentId is NULL) are selectable as parents.
   */
  const validParentNodes = useMemo(() => {
    return nodes.filter(n => n.ledgerId === formLedgerId && !n.parentId);
  }, [nodes, formLedgerId]);

  const toggleNode = (id: string) => {
    const next = new Set(expandedNodes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedNodes(next);
  };

  /**
   * ACCOUNT NODE CRUD
   */
  const handleMaterializeNode = async (formData: FormData) => {
    try {
      const result = await createAccountNode(formData);
      
      if (result.success && result.data) {
        toast.success("Account Node Materialized Successfully");
        setNodes(prev => [...prev, result.data as AccountNode]);
        
        const pId = formData.get('parentId') as string;
        if (pId) setExpandedNodes(prev => new Set(prev).add(pId));
        
        formRef.current?.reset();
      } else {
        toast.error(result.error || "Materialization Failure");
      }
    } catch (e: any) {
      toast.error(e.message || "Materialization Logic Failure");
    }
  };

  /**
   * TOP-LEVEL LEDGER CRUD
   */
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
      toast.error(e.message || "Registry Infrastructure Failure");
    }
  };

  const syncClassification = (val: string) => {
    setNewLedgerName(val);
    const v = val.toUpperCase();
    if (v.includes('INCOME') || v.includes('REVENUE') || v.includes('RENT')) {
       setNewLedgerClass('REVENUE');
    } else if (v.includes('CAPEX') || v.includes('EQUITY')) {
       setNewLedgerClass('CAPEX');
    } else {
       setNewLedgerClass('EXPENSE');
    }
  };

  const handleVaporizeLedger = async (id: string) => {
    if (!confirm("Vaporize entire Ledger Registry? This requires zero child nodes.")) return;
    try {
      const result = await vaporizeLedger(id);
      if (result.success) {
        toast.success("Ledger Vaporized");
        setLedgers(prev => prev.filter(l => l.id !== id));
      } else {
        toast.error(result.error || "Security Protocol Blocked Action");
      }
    } catch (e: any) {
      toast.error(e.message || "Vaporization Protocol Failure");
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER COMMAND STRIP */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-8 border-slate-900 pb-10 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <Layers className="w-10 h-10 text-indigo-600 animate-bounce" />
            <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 uppercase">Executive Ledger Hub</h1>
          </div>
          <div className="flex items-center space-x-4 mt-2">
             <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-[11px] flex items-center">
               <ShieldCheck className="w-4 h-4 mr-2" /> Financial Governance Protocol v.3.1 Active
             </p>
             <button 
               onClick={() => setIsLedgerEditorVisible(true)}
               className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
             >
                [Materialize Global Ledger]
             </button>
             <button 
               onClick={async () => {
                 const res = await executeRevenueSyncFix();
                 if (res.success) toast.success(res.message);
                 else toast.error(res.message);
               }}
               className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
               title="Sync Classifications"
             >
                [Sync Infrastructure]
             </button>
          </div>
        </div>

        <button 
          onClick={() => setIsCommandCenterVisible(!isCommandCenterVisible)}
          className={`font-black px-8 py-4 rounded-2xl transition-all flex items-center uppercase tracking-[0.2em] text-xs italic shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${
            isCommandCenterVisible ? 'bg-indigo-600 text-white shadow-none' : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {isCommandCenterVisible ? <X className="w-5 h-5 mr-3" /> : <Plus className="w-5 h-5 mr-3" />}
          {isCommandCenterVisible ? "Close Control Panel" : "Materialize Account Node"}
        </button>
      </div>

      {isLedgerEditorVisible && (
        <div className="bg-indigo-600 p-8 rounded-[3rem] border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] animate-in zoom-in-95 duration-200">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-xl font-black uppercase italic tracking-widest flex items-center">
                 <Zap className="w-6 h-6 mr-3" /> Materialize High-Performance Ledger
              </h3>
              <button onClick={() => setIsLedgerEditorVisible(false)} className="text-white hover:rotate-90 transition-transform"><X /></button>
           </div>
           <form onSubmit={handleCreateLedger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                value={newLedgerName}
                onChange={(e) => syncClassification(e.target.value)}
                required 
                placeholder="LEDGER NAME (e.g. COMMERCIAL)" 
                className="md:col-span-1 bg-white border-4 border-slate-900 rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-sm outline-none placeholder:text-slate-300" 
              />
              <select 
                value={newLedgerClass}
                onChange={(e) => setNewLedgerClass(e.target.value)}
                required 
                className={`md:col-span-1 border-4 border-slate-900 rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-sm outline-none appearance-none italic transition-all ${
                  newLedgerClass === 'REVENUE' ? 'bg-green-50 text-green-700' : 'bg-white'
                }`}
              >
                 <option value="EXPENSE" className="text-slate-900">EXPENSE CLASSIFICATION</option>
                 <option value="REVENUE" className="text-slate-900">REVENUE STREAM</option>
                 <option value="CAPEX" className="text-slate-900">CAPITAL EXPENDITURE</option>
              </select>
              <button type="submit" className="md:col-span-1 bg-slate-900 text-white font-black px-8 py-4 rounded-2xl hover:bg-white hover:text-slate-900 transition-all uppercase tracking-widest text-xs shadow-lg">
                 Deploy Ledger
              </button>
           </form>
        </div>
      )}

      {isCommandCenterVisible && (
        <div className="bg-slate-900 rounded-[2.5rem] p-10 border-4 border-slate-900 shadow-[16px_16px_0px_0px_rgba(79,70,229,0.3)] animate-in fade-in slide-in-from-top-4 duration-500">
           <form ref={formRef} action={handleMaterializeNode} className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-end">
              <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] block">Data Label</label>
                  <input name="name" required className="w-full bg-slate-800 border-4 border-slate-700/50 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all text-sm placeholder:text-slate-600" placeholder="e.g., Marketing Budget" />
              </div>
              
              <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] block">Target Ledger</label>
                  <select 
                    name="ledgerId" 
                    value={formLedgerId}
                    onChange={(e) => setFormLedgerId(e.target.value)}
                    required 
                    className="w-full bg-slate-800 border-4 border-slate-700/50 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all text-sm appearance-none font-black italic"
                  >
                      {ledgers.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                  </select>
              </div>

              <div className="space-y-3 lg:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] block">Parent Root Category (Strict Depth Constraint)</label>
                  <select name="parentId" className="w-full bg-slate-800 border-4 border-slate-700/50 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-indigo-500 transition-all text-sm appearance-none font-mono">
                      <option value="">[TOP-LEVEL ROOT CATEGORY]</option>
                      {validParentNodes.map((n) => (
                          <option key={n.id} value={n.id}>{`[ROOT] ${n.name}`}</option>
                      ))}
                  </select>
              </div>

              <button type="submit" className="bg-indigo-600 text-white font-black h-16 rounded-2xl hover:bg-white hover:text-indigo-600 transition-all uppercase tracking-[0.2em] text-xs shadow-lg group">
                  Activate Entry
              </button>
           </form>
        </div>
      )}

      {/* DYNAMIC LEDGER MAPPING GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {ledgers.map((ledger, idx) => {
           const scopeRoots = nodes.filter(n => n.ledgerId === ledger.id && !n.parentId);
           
           return (
            <div key={ledger.id} className="bg-white border-[6px] border-slate-900 shadow-[14px_14px_0px_0px_rgba(15,23,42,1)] rounded-3xl p-8 flex flex-col min-h-[500px] animate-in slide-in-from-bottom-8 duration-700 delay-[idx*100]ms">
              <div className="flex items-center justify-between border-b-4 border-slate-100 pb-6 mb-8 group/ledger">
                <h2 className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">{ledger.name}</h2>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handleVaporizeLedger(ledger.id)}
                     className="text-slate-200 hover:text-red-500 transition-colors"
                     title="Vaporize Ledger"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                   <div className="px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase bg-slate-900 text-white">
                      ACTIVE::{ledger.class}::{ (idx+1).toString().padStart(2, '0') }
                   </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {scopeRoots.length === 0 ? (
                  <div className="h-60 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-3xl space-y-4">
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest text-center">Open Ledger Territory</p>
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
                        try {
                          const r = await updateAccountNode(node.id!, editName);
                          if (r.success) { 
                            setNodes(prev => prev.map(n => n.id === node.id ? { ...n, name: editName } : n)); 
                            setEditingId(null); 
                          }
                          else toast.error(r.error || "Recalibration protocol failed.");
                        } catch (e: any) {
                          toast.error(e.message || "Recalibration Failure");
                        }
                      }}
                      handleDelete={async () => {
                        if (!confirm("Vaporize node?")) return;
                        try {
                          const r = await deleteAccountNode(node.id!);
                          if (r.success) setNodes(prev => prev.filter(n => n.id !== node.id));
                          else toast.error(r.error || "Vaporization protocol blocked.");
                        } catch (e: any) {
                          toast.error(e.message || "Vaporization Failure");
                        }
                      }}
                      cancelEdit={() => setEditingId(null)}
                      expandedNodes={expandedNodes}
                      toggleNode={toggleNode}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * RECURSIVE TAXONOMY NODE COMPONENT (STRICT DEPTH)
 */
function RecursiveAccountNode({ 
  node, 
  allNodes,
  editingId,
  editName,
  setEditName,
  startEdit,
  handleUpdate,
  handleDelete,
  cancelEdit,
  expandedNodes,
  toggleNode
}: {
  node: AccountNode,
  allNodes: AccountNode[],
  editingId: string | null,
  editName: string,
  setEditName: (v: string) => void,
  startEdit: () => void,
  handleUpdate: () => void,
  handleDelete: () => void,
  cancelEdit: () => void,
  expandedNodes: Set<string>,
  toggleNode: (id: string) => void
}) {
  const isEditing = editingId === node.id;
  const subNodes = allNodes.filter((n: any) => n.parentId === node.id);
  const isExpanded = expandedNodes.has(node.id);
  const hasDependencies = subNodes.length > 0;

  return (
    <div className="group animate-in fade-in slide-in-from-left-2 duration-300">
      <div className={`flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${
        isEditing ? 'border-indigo-600 bg-indigo-50/30' : 'border-transparent hover:border-slate-900/5 hover:bg-slate-50'
      }`}>
        <div className="flex items-center flex-1 min-w-0">
          {hasDependencies ? (
            <button onClick={() => toggleNode(node.id)} className="mr-3 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none">
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          ) : (
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors" />
            </div>
          )}
          
          {isEditing ? (
            <input 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              className="bg-white border-4 border-indigo-600 rounded-xl px-4 py-2 text-sm font-black uppercase italic tracking-tighter focus:outline-none flex-1 max-w-[240px]"
              onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') cancelEdit(); }}
            />
          ) : (
              <span className="text-[13px] font-black text-slate-900 uppercase italic tracking-tighter truncate">
                {node.name}
              </span>
          )}
        </div>

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-4">
          {isEditing ? (
            <div className="flex items-center bg-slate-900 rounded-xl overflow-hidden">
               <button onClick={handleUpdate} className="p-2 text-white hover:bg-green-500 transition-colors"><Check className="w-4 h-4" /></button>
               <button onClick={cancelEdit} className="p-2 text-white border-l border-slate-700 hover:bg-red-500 transition-colors"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={startEdit}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleDelete}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && hasDependencies && (
        <div className="ml-8 pl-6 border-l-4 border-slate-100 mt-2 space-y-2">
          {subNodes.map((sub: AccountNode) => (
             <RecursiveAccountNode 
               key={sub.id}
               node={sub}
               allNodes={allNodes}
               editingId={editingId}
               editName={editName}
               setEditName={setEditName}
               // No further editing/nesting logic here as we enforce 2-level cap
               startEdit={() => {}} 
               handleUpdate={() => {}}
               handleDelete={async () => {
                  if (!confirm("Vaporize leaf node?")) return;
                  try {
                    const r = await deleteAccountNode(sub.id!);
                    if (!r.success) toast.error(r.error || "Registry vaporization protocol failed.");
                  } catch (e: any) {
                    toast.error(e.message || "Logic failure in sub-node removal.");
                  }
               }}
               cancelEdit={() => {}}
               expandedNodes={expandedNodes}
               toggleNode={toggleNode}
             />
          ))}
        </div>
      )}
    </div>
  );
}
