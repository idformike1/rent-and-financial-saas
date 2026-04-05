'use client'

import React, { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, AlertOctagon, Zap, ShieldCheck, Database, Trash2, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { axiomParseCSV } from '@/lib/csv-parser'
import { ingestBulkExpenses } from '@/actions/ingestion.actions'

/**
 * AXIOM MASS INGESTION ENGINE
 * Brutalist UI for Enterprise Data Ingress
 */
export default function MassIngestionClient() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      processFile(droppedFile);
    } else {
      toast.error("Format Error: AXIOM only accepts legacy CSV datasets.");
    }
  };

  const processFile = (file: File) => {
    setFile(file);
    setErrorStatus(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result as string;
      try {
        const parsedData = axiomParseCSV(csvData);
        setData(parsedData);
      } catch (err) {
        toast.error("Parsing Failure: digital dataset contains illegal characters.");
      }
    };
    reader.readAsText(file);
  };

  const handleRegistryCommit = async () => {
    if (data.length === 0) return;
    setIsProcessing(true);
    try {
      const response = await ingestBulkExpenses(data);
      if (response.success) {
        toast.success(response.message);
        setData([]);
        setFile(null);
      } else {
        setErrorStatus(response.error === 'DATA_VALIDATION_FAILURE' ? response.details?.join(', ') : response.message);
        toast.error("Ingestion Protocols Breach: " + (response.error || "Registry Conflict"));
      }
    } catch (e: any) {
      toast.error("Digital Integrity Failure: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER COMMAND STRIP */}
      <div className="border-b-8 border-slate-900 pb-10">
        <div className="flex items-center space-x-4 mb-4">
          <Database className="w-12 h-12 text-[var(--primary)] animate-pulse" />
          <h1 className="text-6xl font-black italic tracking-tighter text-foreground uppercase">Mass Ingestion Engine</h1>
        </div>
        <div className="flex items-center space-x-6">
          <p className="text-slate-500 font-bold tracking-[0.4em] uppercase text-xs flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2" /> Data Protocol v.3.5.1 ACTIVE
          </p>
          <div className="h-1 w-20 bg-slate-200" />
          <p className="text-foreground font-black text-[10px] uppercase tracking-widest bg-yellow-400 px-3 py-1 italic">
             Legacy CSV Ingress Pathway
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* DROPZONE ALPHA */}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative group bg-slate-50 border-8 border-dashed transition-all duration-300 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center ${
            file ? 'border-[var(--primary)] bg-[var(--primary-muted)]' : 'border-slate-300 hover:border-[var(--primary)]'
          }`}
        >
          {file ? (
            <div className="space-y-6 animate-in zoom-in-90 fill-mode-forwards duration-500">
               <div className="bg-[var(--primary)] w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                 <CheckCircle2 className="w-12 h-12 text-white" />
               </div>
               <div>
                  <h3 className="text-3xl font-black text-foreground uppercase">{file.name}</h3>
                  <p className="text-[var(--primary)] font-bold uppercase tracking-widest text-xs mt-2">
                    {data.length} records parsed from legacy stream
                  </p>
               </div>
               <button 
                  onClick={() => {setFile(null); setData([]);}} 
                  className="bg-slate-900 text-white font-black px-6 py-3 rounded-3xl hover:bg-red-600 transition-all uppercase tracking-widest text-[10px] flex items-center mx-auto"
               >
                 <Trash2 className="w-4 h-4 mr-2" /> Purge Staging Buffer
               </button>
            </div>
          ) : (
            <>
              <div className="bg-slate-900 w-32 h-32 rounded-[2rem] flex items-center justify-center text-white mb-8 group-hover:rotate-6 transition-transform shadow-[12px_12px_0px_0px_rgba(79,70,229,1)]">
                <Upload className="w-16 h-16" />
              </div>
              <h3 className="text-4xl font-black text-foreground uppercase mb-4 italic">Materialize Data Stream</h3>
              <p className="text-slate-500 font-bold max-w-sm uppercase text-xs tracking-widest leading-loose">
                Drag and drop your enterprise CSV here or 
                <button 
                   onClick={() => fileInputRef.current?.click()} 
                   className="text-[var(--primary)] underline decoration-4 underline-offset-4 mx-2"
                >
                  manually select 
                </button> 
                file from legacy terminal.
              </p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            className="hidden" 
            accept=".csv" 
          />
        </div>

        {/* REGISTRY PREVIEW & COMMIT */}
        <div className="space-y-8 h-full">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white min-h-[400px] flex flex-col justify-between shadow-[24px_24px_0px_0px_rgba(79,70,229,0.2)]">
              <div>
                <h4 className="text-2xl font-black uppercase italic tracking-[0.2em] mb-8 flex items-center">
                  <Zap className="w-8 h-8 mr-4 text-yellow-400" /> Staging Buffer
                </h4>
                
                {data.length > 0 ? (
                  <div className="max-h-[300px] overflow-auto border-t-4 border-slate-700 pt-6 space-y-4 pr-4">
                    {data.slice(0, 5).map((row, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800 text-[10px] font-black tracking-widest uppercase">
                         <span className="text-slate-400">{row.Date || row.date || 'unknown'}</span>
                         <span className="text-white">{row.Payee || row.payee || 'no_payee'}</span>
                         <span className="text-emerald-400">${row.Amount || row.amount || '0'}</span>
                      </div>
                    ))}
                    {data.length > 5 && (
                      <p className="text-slate-500 italic text-[10px] font-bold py-2">
                        + {data.length - 5} additional records in buffer chain
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] border-4 border-dashed border-slate-700 rounded-3xl opacity-50">
                    <FileSpreadsheet className="w-12 h-12 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No legacy trace found.</p>
                  </div>
                )}

                {errorStatus && (
                  <div className="mt-8 bg-red-600/20 border-4 border-red-600 p-6 rounded-3xl flex items-start animate-in shake duration-500">
                    <AlertOctagon className="w-8 h-8 text-red-500 mr-4 flex-shrink-0" />
                    <div>
                       <p className="text-red-500 font-bold uppercase text-[10px] tracking-widest mb-1">Ingestion Breach</p>
                       <p className="text-white text-xs font-black leading-relaxed">{errorStatus}</p>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleRegistryCommit}
                disabled={data.length === 0 || isProcessing}
                className={`w-full mt-10 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center transition-all shadow-[12px_12px_12px_rgba(0,0,0,0.5)] active:translate-y-2 active:shadow-none ${
                   data.length > 0 && !isProcessing
                   ? 'bg-yellow-400 text-foreground border-4 border-slate-900 hover:scale-[1.02]' 
                   : 'bg-slate-800 text-slate-500 border-4 border-slate-700 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-4 border-slate-900 border-t-transparent animate-spin rounded-full" />
                    <span>Synchronizing Chain...</span>
                  </div>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-3" /> Commit Records to Registry
                  </>
                )}
              </button>
           </div>
        </div>
      </div>

      {/* DOCUMENTATION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
         {[
           { title: "Standard Headers", desc: "Date, Amount, Payee, Description, LedgerId, CategoryId" },
           { title: "Date Horizon", desc: "ISO 8601 or YYYY-MM-DD standard required for chronological indexing." },
           { title: "Registry Persistence", desc: "Once committed, records enter the immutable master ledger." }
         ].map((box, i) => (
           <div key={i} className="bg-card border-4 border-slate-900 p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:bg-[var(--primary-muted)] transition-colors">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">AXIOM_PROTOCOL_0{i+1}</h5>
              <h4 className="text-xl font-black text-foreground uppercase mb-2">{box.title}</h4>
              <p className="text-xs font-medium text-slate-500 leading-relaxed uppercase">{box.desc}</p>
           </div>
         ))}
      </div>
    </div>
  );
}
