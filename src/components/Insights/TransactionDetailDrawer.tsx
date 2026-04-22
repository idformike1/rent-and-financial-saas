'use client'

import React, { useEffect, useState } from 'react'
import { getTransactionsByCategory } from '@/src/actions/registry.actions'
import { X, ExternalLink, Calendar, Wallet } from 'lucide-react'
import { format } from 'date-fns'

interface TransactionDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  categoryName: string
  dateRange: { from?: Date; to?: Date }
}

/**
 * FORENSIC DETAIL DRAWER (PHASE 11.5)
 * 
 * Provides deep-dive transactional insights for specific categories.
 * Features a clinical slide-over UI with high-density data visualization.
 */
export default function TransactionDetailDrawer({ 
  isOpen, onClose, categoryId, categoryName, dateRange 
}: TransactionDetailDrawerProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && categoryId) {
        setIsLoading(true)
        getTransactionsByCategory(categoryId, dateRange)
            .then(data => setTransactions(data as any[]))
            .finally(() => setIsLoading(false))
    }
  }, [isOpen, categoryId, dateRange])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop for clinical focus */}
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={onClose} 
        />
        
        {/* Drawer Content */}
        <div className="relative w-full max-w-2xl bg-black border-l border-white/10 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-500 ease-in-out">
            <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-amber-500 tracking-[0.2em] mb-1">Analytical Drill-down</span>
                    <h2 className="text-3xl font-weight-display text-white tracking-tighter">{categoryName}</h2>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                    <X className="w-6 h-6" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {isLoading ? (
                    <div className="space-y-6">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="h-20 w-full bg-white/5 animate-pulse rounded-xl border border-white/5" />
                        ))}
                    </div>
                ) : transactions.length > 0 ? (
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-black z-10">
                            <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-white/20 tracking-[0.2em] text-left">
                                <th className="pb-4 pr-4">Timeline</th>
                                <th className="pb-4 pr-4 text-center">Identity</th>
                                <th className="pb-4 pr-4">Operational Source</th>
                                <th className="pb-4 text-right">Liquidity Delta</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.map(tx => (
                                <tr key={tx.id} className="group hover:bg-white/[0.03] transition-all">
                                    <td className="py-5 pr-4 text-xs font-mono text-white/40">
                                        {tx.transactionDate ? format(new Date(tx.transactionDate), 'MMM dd, yyyy') : 'N/A'}
                                    </td>
                                    <td className="py-5 pr-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{tx.payee || tx.description}</span>
                                            {tx.payee && <span className="text-[10px] text-white/20 truncate max-w-[200px]">{tx.description}</span>}
                                        </div>
                                    </td>
                                    <td className="py-5 pr-4">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-3.5 h-3.5 text-amber-500/40" />
                                            <span className="text-xs text-white/60">{tx.account?.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 text-right">
                                        <span className={`text-sm font-mono font-bold ${tx.amount < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {tx.amount < 0 ? '−' : '+'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 uppercase tracking-[0.3em] text-[10px] text-center italic">
                        <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/40 to-transparent mb-6" />
                        Zero discrepancies identified
                    </div>
                )}
            </div>

            <footer className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[11px] uppercase font-bold tracking-[0.1em] text-white/30">
                <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-amber-500/50" />
                    {dateRange.from && dateRange.to ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}` : 'Full Historical Archive'}
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-white/60 font-mono tracking-tighter">{transactions.length} Records</span>
                    <button className="hover:text-amber-500 transition-colors flex items-center gap-2 group">
                        Export Forensic Log <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                    </button>
                </div>
            </footer>
        </div>
    </div>
  )
}
