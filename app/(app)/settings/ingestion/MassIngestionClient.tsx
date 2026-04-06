'use client'

import React, { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, AlertOctagon, Zap, ShieldCheck, Database, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { axiomParseCSV } from '@/lib/csv-parser'
import { ingestBulkExpenses } from '@/actions/ingestion.actions'
import { Badge } from '@/components/ui-finova'

export default function MassIngestionClient() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };

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
        
        if (parsedData.length > 0) {
          const keys = Object.keys(parsedData[0]).map(k => k.toLowerCase());
          if (!keys.includes('date') || !keys.includes('amount')) {
            setErrorStatus("MISSING CORE HEADERS: Date and Amount are strictly required.");
          }
        }

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
        toast.success(response.message || "BATCH COMMITTED TO IMMUTABLE LEDGER", { 
          icon: '🔥',
          duration: 5000 
        });
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
    <div className="space-y-12 pb-20 max-w-7xl mx-auto animate-in fade-in duration-700">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border)] pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--primary-muted)] rounded-2xl flex items-center justify-center border border-[var(--primary)]/20">
              <Database className="w-6 h-6 text-[var(--primary)] animate-pulse" />
            </div>
            <Badge variant="brand" className="px-5 py-2 rounded-3xl font-black uppercase text-[9px] tracking-widest bg-[var(--primary-muted)] border-2 border-[var(--primary)]/20">
              Legacy CSV Ingress Pathway
            </Badge>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter text-[var(--foreground)] uppercase leading-none">
            Mass Ingestion <span className="text-[var(--primary)]">Engine</span>
          </h1>
          <p className="text-[10px] font-mono font-black text-[var(--muted)] uppercase tracking-[0.4em] flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" /> Data Protocol v.3.5.1 Active
          </p>
        </div>
      </header>

      <div className={data.length > 0 ? "flex flex-col gap-12" : "grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"}>

        {/* DROP ZONE */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative group glass-panel border-2 border-dashed transition-all duration-300 rounded-3xl p-16 flex flex-col items-center justify-center text-center cursor-pointer ${
            file
              ? 'border-[var(--primary)] bg-[var(--primary-muted)]/20'
              : 'border-[var(--primary)]/30 hover:border-[var(--primary)] hover:bg-[var(--primary-muted)]/10'
          }`}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          {file ? (
            <div className="space-y-6 animate-in zoom-in-90 duration-500">
              <div className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,87,51,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[var(--foreground)] uppercase">{file.name}</h3>
                <p className="text-[var(--primary)] font-bold uppercase tracking-widest text-xs mt-2">
                  {data.length} records parsed from legacy stream
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setData([]); }}
                className="bg-rose-500/10 border border-rose-500/30 text-rose-400 font-black px-6 py-3 rounded-3xl hover:bg-rose-500/20 transition-all uppercase tracking-widest text-[10px] flex items-center mx-auto gap-2"
              >
                <Trash2 className="w-4 h-4" /> Purge Staging Buffer
              </button>
            </div>
          ) : (
            <>
              <div className="w-24 h-24 bg-[var(--primary-muted)] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-[var(--primary)]/20">
                <Upload className="w-12 h-12 text-[var(--primary)]" />
              </div>
              <h3 className="text-3xl font-black text-[var(--foreground)] uppercase mb-4 italic">Materialize Data Stream</h3>
              <p className="text-[var(--muted)] font-medium max-w-sm uppercase text-xs tracking-widest leading-loose">
                Drag and drop your enterprise CSV here or{' '}
                <span className="text-[var(--primary)] underline decoration-2 underline-offset-4 cursor-pointer">
                  manually select
                </span>{' '}
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

        {/* STAGING BUFFER */}
        <div className="glass-panel rounded-3xl border border-[var(--border)] overflow-hidden flex flex-col">
          <div className="bg-[var(--card)] px-8 py-5 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-[var(--primary)]" />
              <h4 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">Staging Buffer</h4>
            </div>
            {data.length > 0 && (
              <Badge variant="brand" className="bg-[var(--primary)]/10 text-[var(--primary)] border-transparent font-black tracking-widest">
                {data.length.toLocaleString()} RECORDS STAGED FOR COMMIT
              </Badge>
            )}
          </div>

          <div className="p-0 flex-1 flex flex-col min-h-[320px]">
            {data.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="sticky top-0 bg-[var(--card)]/90 backdrop-blur border-b border-[var(--border)] z-10 shadow-sm">
                    <tr>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Date</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Payee</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Description</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Category</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[var(--muted)] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/50">
                    {data.slice(0, 100).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[var(--primary)]/5 transition-colors group">
                        <td className="py-4 px-6 text-xs font-bold text-[var(--muted)] whitespace-nowrap">{row.Date || row.date || '—'}</td>
                        <td className="py-4 px-6 text-xs font-bold text-[var(--foreground)] max-w-[200px] truncate" title={row.Payee || row.payee}>{row.Payee || row.payee || '—'}</td>
                        <td className="py-4 px-6 text-xs font-medium text-[var(--muted)] max-w-[300px] truncate" title={row.Description || row.description}>{row.Description || row.description || '—'}</td>
                        <td className="py-4 px-6"><Badge variant="default" className="text-[9px] uppercase">{row.Category || row.category || 'UNCLASSIFIED'}</Badge></td>
                        <td className="py-4 px-6 text-right text-sm font-finance tabular-nums font-black text-[var(--primary)]">${row.Amount || row.amount || '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 h-full flex-1 opacity-60">
                <div className="w-20 h-20 rounded-full border border-dashed border-[var(--primary)]/30 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-[var(--muted)]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">No legacy trace found in staging area.</p>
              </div>
            )}

            <div className="p-8 bg-[var(--card)]/50 border-t border-[var(--border)] mt-auto flex flex-col gap-6">
              {errorStatus && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <AlertOctagon className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="mt-0.5">
                    <p className="text-rose-400 font-black uppercase text-[10px] tracking-widest mb-1.5 leading-none">INGESTION FAILED</p>
                    <p className="text-[var(--foreground)] text-xs font-bold uppercase tracking-wider">{errorStatus}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleRegistryCommit}
                disabled={data.length === 0 || isProcessing || errorStatus !== null}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all ${
                  data.length > 0 && !isProcessing && !errorStatus
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_0_20px_rgba(255,87,51,0.2)] hover:shadow-none hover:translate-y-[1px]'
                    : 'bg-[var(--muted)]/10 text-[var(--muted)] cursor-not-allowed border border-white/5 disabled:opacity-50'
                }`}
              >
                {isProcessing ? (
                   <div className="flex items-center gap-3">
                     <span className="w-3 h-3 bg-[var(--foreground)] rounded-full animate-ping" />
                     SYNCHRONIZING CHAIN...
                   </div>
                ) : (
                  <>
                    <Zap className="w-5 h-5" /> Commit {data.length} Records to Registry
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PROTOCOL DOCS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Standard Headers", desc: "Date, Amount, Payee, Description, LedgerId, CategoryId", n: '01' },
          { title: "Date Horizon", desc: "ISO 8601 or YYYY-MM-DD standard required for chronological indexing.", n: '02' },
          { title: "Registry Persistence", desc: "Once committed, records enter the immutable master ledger.", n: '03' },
        ].map((box) => (
          <div key={box.n} className="glass-panel rounded-3xl p-6 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all group">
            <h5 className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest mb-2 font-mono">AXIOM_PROTOCOL_{box.n}</h5>
            <h4 className="text-base font-black text-[var(--foreground)] uppercase mb-2">{box.title}</h4>
            <p className="text-xs font-medium text-[var(--muted)] leading-relaxed uppercase">{box.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
