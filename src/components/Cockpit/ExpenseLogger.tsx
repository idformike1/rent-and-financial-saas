'use client'

import React, { useTransition, useState } from 'react'
import { logPersonalExpense } from '@/actions/wealth.actions'
import { Button, Input, Select, Label } from '@/src/components/finova/ui-finova'
import { toast } from 'react-hot-toast'

interface Account {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

export default function ExpenseLogger({ accounts, categories }: { accounts: Account[], categories: Category[] }) {
  const [isPending, startTransition] = useTransition()
  const [amount, setAmount] = useState('')
  const [payee, setPayee] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!amount || parseFloat(amount) <= 0) return toast.error("Invalid amount. Must be greater than 0.")
    if (!accountId) return toast.error("Please select a source account.")
    if (!categoryId) return toast.error("Please select an expense category.")

    startTransition(async () => {
      // Step 2: Optimistic UI - Clear fields immediately
      const currentAmount = amount
      const currentPayee = payee
      
      setAmount('')
      setPayee('')
      
      const res = await logPersonalExpense({
        amount: parseFloat(currentAmount),
        payee: currentPayee,
        categoryId,
        accountId,
        date,
      })

      if (res.success) {
        toast.success(res.message)
      } else {
        // Rollback if failed (optional, but good practice)
        setAmount(currentAmount)
        setPayee(currentPayee)
        toast.error(res.message)
      }
    })
  }

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Sovereign Expense Logger</h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold opacity-60">Amount ($)</Label>
          <Input 
            type="number" 
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-10 bg-black/40"
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold opacity-60">Payee / Description</Label>
          <Input 
            type="text" 
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
            className="h-10 bg-black/40"
            placeholder="e.g. Starbucks, Amazon"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold opacity-60">Category</Label>
          <Select 
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 bg-black/40"
            required
          >
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold opacity-60">Source Account</Label>
          <Select 
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="h-10 bg-black/40"
            required
          >
            <option value="">Select Account</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        </div>

        <div className="space-y-1 md:col-span-2">
            <Label className="text-[10px] uppercase font-bold opacity-60">Transaction Date</Label>
            <Input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 bg-black/40"
                required
            />
        </div>

        <div className="md:col-span-2 pt-2">
            <Button 
                type="submit" 
                disabled={isPending}
                isLoading={isPending}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-10 rounded-lg transition-all border-none"
            >
                {isPending ? 'STABILIZING LEDGER...' : 'LOG PERSONAL EXPENSE'}
            </Button>
        </div>
      </form>
    </div>
  )
}
