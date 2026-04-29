'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRightLeft, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import { executeInternalTransfer, getWealthAccounts } from '@/actions/wealth.actions'
import { Button } from '@/src/components/finova/ui-finova'

export default function TransferEngine() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    memo: ''
  })

  useEffect(() => {
    async function load() {
      const data = await getWealthAccounts()
      setAccounts(data as any[])
      setIsFetching(false)
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fromAccountId || !formData.toAccountId || !formData.amount) return
    
    setIsLoading(true)
    setStatus(null)

    try {
      const res = await executeInternalTransfer({
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        amount: parseFloat(formData.amount),
        memo: formData.memo
      })

      if (res.success) {
        setStatus({ type: 'success', message: res.message })
        setFormData({ fromAccountId: '', toAccountId: '', amount: '', memo: '' })
      } else {
        setStatus({ type: 'error', message: res.message })
      }
    } catch (err) {
      setStatus({ type: 'error', message: "System failure during execution." })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) return (
    <div className="p-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
      <div className="px-8 py-6 border-b border-border/50 bg-white/5 flex items-center justify-between">
        <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Internal Transfer Engine</h3>
            <p className="text-[10px] text-clinical-muted uppercase tracking-[0.2em] font-bold">Double-Entry Verification: <span className="text-mercury-green">ACTIVE</span></p>
        </div>
        <div className="p-3 bg-amber-500/10 rounded-xl">
            <ArrowRightLeft className="w-6 h-6 text-amber-500" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {status && (
          <div className={`p-4 rounded-xl flex gap-3 items-center border ${
            status.type === 'success' ? 'bg-mercury-green/5 border-mercury-green/20 text-mercury-green' : 'bg-destructive/5 border-destructive/20 text-destructive'
          }`}>
            {status.type === 'success' ? <ShieldCheck className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-clinical-muted uppercase tracking-widest px-1">Source Account</label>
            <select 
              className="w-full bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm appearance-none"
              value={formData.fromAccountId}
              onChange={(e) => setFormData({...formData, fromAccountId: e.target.value})}
              required
            >
              <option value="">Select account...</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.category})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-clinical-muted uppercase tracking-widest px-1">Destination Bucket</label>
            <select 
              className="w-full bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm appearance-none"
              value={formData.toAccountId}
              onChange={(e) => setFormData({...formData, toAccountId: e.target.value})}
              required
            >
              <option value="">Select bucket...</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-clinical-muted uppercase tracking-widest px-1">Transfer Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-clinical-muted font-mono">$</span>
            <input 
              type="number"
              step="0.01"
              className="w-full bg-black/40 border border-border/50 rounded-xl pl-8 pr-4 py-4 text-white font-mono text-xl focus:outline-none focus:border-amber-500/50 transition-all"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-clinical-muted uppercase tracking-widest px-1">Sovereign Note (Memo)</label>
          <input 
            type="text"
            className="w-full bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all"
            placeholder="e.g., Q3 Savings Allocation"
            value={formData.memo}
            onChange={(e) => setFormData({...formData, memo: e.target.value})}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-amber-500 hover:bg-amber-600 h-14 rounded-xl text-black font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Executing...
            </div>
          ) : 'Execute Sovereign Transfer'}
        </Button>

        <p className="text-[9px] text-center text-clinical-muted uppercase tracking-widest">
            Identity Verified: Organization Context Encrypted
        </p>
      </form>
    </div>
  )
}
