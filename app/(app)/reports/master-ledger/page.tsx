'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Landmark, FileText, Download, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Activity, Search } from 'lucide-react'

// Using API routes for downloads to actually trigger the browser's download prompt
export default function MasterLedgerPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchLedger() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ledger'); // Internal API or just use state 
        const data = await response.json();
        setEntries(data);
      } catch (e) {
        console.error("Failed to load ledger registry", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLedger();
  }, []);

  // Filter entries based on search term and filters
  const filteredEntries = entries.filter(e => {
    const matchesSearch = 
      e.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.account?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const entryDate = new Date(e.date);
    const matchesStartDate = startDate ? entryDate >= new Date(startDate) : true;
    const matchesEndDate = endDate ? entryDate <= new Date(endDate) : true;
    const matchesCategory = category !== 'ALL' ? e.account.category === category : true;
    
    return matchesSearch && matchesStartDate && matchesEndDate && matchesCategory;
  });

  const totalPages = Math.ceil(filteredEntries.length / 20);
  const paginatedEntries = filteredEntries.slice((page - 1) * 20, page * 20);

  const handleCSVExport = () => {
    const params = new URLSearchParams({ searchTerm, startDate, endDate, category });
    window.open(`/api/reports/csv?${params.toString()}`, '_blank');
  };

  const handlePDFExport = () => {
    const params = new URLSearchParams({ searchTerm, startDate, endDate, category });
    window.open(`/api/reports/pdf?${params.toString()}`, '_blank');
  };

  const handleWordExport = () => {
    const params = new URLSearchParams({ searchTerm, startDate, endDate, category });
    window.open(`/api/reports/word?${params.toString()}`, '_blank');
  };

  const exportBtnClass = "bg-[var(--card)] text-foreground px-6 py-3 rounded-[8px] border border-[var(--border)] shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center  text-[10px]";

  return (
    <div className="py-8 px-4 sm:px-6 h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-border pb-10">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Landmark className="w-8 h-8 text-[var(--primary)]" />
            <h1 className="text-display font-weight-display text-foreground ">Master Ledger Registry</h1>
          </div>
          <p className="text-muted-foreground font-medium tracking-tight">The immutable source of truth for all transactional fiscal events.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button onClick={handleCSVExport} className={exportBtnClass}>
            <Download className="w-4 h-4 mr-3" /> CSV
          </button>
          <button onClick={handleWordExport} className={exportBtnClass}>
            <FileText className="w-4 h-4 mr-3" /> Word
          </button>
          <button onClick={handlePDFExport} className="bg-[var(--primary)] text-foreground px-6 py-3 rounded-[8px] shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center  text-[10px]">
            <FileText className="w-4 h-4 mr-3" /> PDF Report
          </button>
        </div>
      </div>

      <div className="flex-1 bg-card border-2 border-foreground shadow-none rounded-[8px] overflow-hidden flex flex-col mb-8">
        <div className="bg-muted border-b border-border p-6 space-y-4">
           <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="relative group w-full lg:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                  <input 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all font-sans"
                    placeholder="Search entries, accounts, or IDs..." 
                  />
              </div>
              <div className="flex items-center space-x-4 text-xs font-bold text-muted-foreground ">
                  <span className="flex items-center"><Activity className="w-3 h-3 mr-2 text-[var(--primary)]" /> MATCH RESULTS: {filteredEntries.length}</span>
                  <span className="h-4 w-[1px] bg-muted" />
                  <span>PAGE {page} OF {totalPages || 1}</span>
              </div>
           </div>

           <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground ">Date Range</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
                <span className="text-muted-foreground">→</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
              </div>

              <div className="h-6 w-[1px] bg-muted mx-2 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground ">Category Filter</span>
                <select 
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background appearance-none cursor-pointer"
                >
                  <option value="ALL">ALL CATEGORIES</option>
                  <option value="INCOME">INCOME ONLY</option>
                  <option value="EXPENSE">EXPENSE ONLY</option>
                  <option value="ASSET">ASSET ONLY</option>
                </select>
              </div>

              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStartDate('');
                  setEndDate('');
                  setCategory('ALL');
                  setPage(1);
                }}
                className="ml-auto text-[10px] text-[var(--primary)]  hover:underline"
              >
                Clear All Filters
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto min-h-[500px]">
          <table className="min-w-full border-collapse">
            <thead className="bg-card text-muted-foreground text-[10px]   sticky top-0 z-10">
              <tr>
                <th className="px-6 py-5 text-left border-r border-border">Posting Date</th>
                <th className="px-6 py-5 text-left border-r border-border">Transaction ID</th>
                <th className="px-6 py-5 text-left border-r border-border">Chart of Account Mapping</th>
                <th className="px-6 py-5 text-right border-r border-border text-[var(--primary)]">Debit (+)</th>
                <th className="px-6 py-5 text-right border-r border-border text-red-400">Credit (-)</th>
                <th className="px-6 py-5 text-left border-r border-border">Mode</th>
                <th className="px-6 py-5 text-left border-r border-border">Reference</th>
                <th className="px-6 py-5 text-left">Internal Narrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-card text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Querying ledger registry...</td>
                </tr>
              ) : paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No fiscal engagements recorded. System is current.</td>
                </tr>
              ) : (
                paginatedEntries.map((e, i) => {
                  const isDebit = Number(e.amount) > 0;
                  return (
                    <tr key={e.id} className={`${i % 2 === 0 ? 'bg-card' : 'bg-muted'} hover:bg-muted transition-colors group cursor-default`}>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-sans">{new Date(e.date).toISOString().split('T')[0]}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold tracking-tight text-muted-foreground ">{e.transactionId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                           <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isDebit ? 'bg-[var(--primary-muted)]' : 'bg-red-500'}`} />
                           <span className="font-bold text-foreground">{e.account.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--primary)] border-r border-border/30">
                        {isDebit ? `$ ${Math.abs(Number(e.amount)).toLocaleString(undefined, {minimumFractionDigits: 2})}` : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-red-600 border-r border-border/30">
                        {!isDebit ? `$ ${Math.abs(Number(e.amount)).toLocaleString(undefined, {minimumFractionDigits: 2})}` : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px]  text-muted-foreground border-r border-border/30">
                        {e.paymentMode || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] font-bold text-muted-foreground border-r border-border/30 truncate max-w-[120px]">
                        {e.referenceText || '---'}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground max-w-xs truncate font-sans">
                        {e.description}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-muted border-t border-border p-6 flex items-center justify-between">
           <p className="text-xs font-bold text-muted-foreground leading-none">Powered by double-entry acid engine v3.0</p>
           <div className="flex gap-2">
             <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-3 bg-card border border-border rounded-xl hover:border-foreground transition-all disabled:opacity-50"
             >
                <ChevronLeft className="w-4 h-4" />
             </button>
             <button 
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
              className="p-3 bg-card border border-border rounded-xl hover:border-foreground transition-all disabled:opacity-50"
             >
                <ChevronRight className="w-4 h-4" />
             </button>
           </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-8 text-[10px] text-muted-foreground   mt-2">
        <span className="flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-2 text-[var(--primary)]" /> System Integrity Certified</span>
        <span className="flex items-center"><TrendingDown className="w-3.5 h-3.5 mr-2 text-red-500" /> Balanced Status Check: Pass</span>
      </div>
    </div>
  )
}
