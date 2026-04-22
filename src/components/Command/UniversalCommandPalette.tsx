'use client'

import React, { useState, useEffect, useRef, useTransition } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { getWealthAccounts, getExpenseCategories, getIncomeSources } from '@/src/actions/registry.actions'
import { logPersonalExpense, logPersonalIncome, executeInternalTransfer } from '@/actions/wealth.actions'
import { Button, Input, Select, Label } from '@/components/ui-finova'
import { toast } from '@/lib/toast'
import { Plus, X, ArrowLeftRight, TrendingDown, TrendingUp, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'

// Register GSAP
gsap.registerPlugin(useGSAP)

const INITIAL_FORM_STATE = {
  amount: '',
  payee: '',
  date: new Date().toISOString().split('T')[0],
  fromAccountId: '',
  toAccountId: '',
  categoryId: '',
  sourceId: ''
}

export default function UniversalCommandPalette() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE')
  const [isPending, startTransition] = useTransition()
  
  // Data State
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [sources, setSources] = useState<any[]>([])
  
  // Form State
  const [form, setForm] = useState(INITIAL_FORM_STATE)

  // Refs for GSAP
  const backdropRef = useRef(null)
  const modalRef = useRef(null)

  // ── FIX: Reset form when navigating or switching workspace ──
  useEffect(() => {
    setForm(INITIAL_FORM_STATE)
  }, [pathname])

  // ── DYNAMIC STYLE MAPPING (CLINICAL LUXURY REFINE) ─────────────────
  const modeConfig = {
    EXPENSE: {
      color: 'amber-500',
      border: 'border-amber-700/50',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
      bg: 'bg-amber-700',
      icon: <TrendingDown className="w-4 h-4" />
    },
    INCOME: {
      color: 'emerald-500',
      border: 'border-emerald-800/40',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      bg: 'bg-emerald-800',
      icon: <TrendingUp className="w-4 h-4" />
    },
    TRANSFER: {
      color: 'sky-500',
      border: 'border-sky-800/40',
      glow: 'shadow-[0_0_30px_rgba(14,165,233,0.15)]',
      bg: 'bg-sky-800',
      icon: <ArrowLeftRight className="w-4 h-4" />
    }
  }

  const currentStyle = modeConfig[mode]

  const resetForm = () => setForm(INITIAL_FORM_STATE)

  // ── 1. KEYBOARD LISTENERS ───────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // ── 2. DATA HYDRATION ──────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
        async function hydrate() {
            try {
                const [accs, cats, srcs] = await Promise.all([
                    getWealthAccounts(),
                    getExpenseCategories(),
                    getIncomeSources()
                ])
                setAccounts(accs as any[])
                setCategories(cats as any[])
                setSources(srcs as any[])
            } catch (err) {
                console.error('[COMMAND_HYDRATION_ERROR]', err)
            }
        }
        hydrate()
    }
  }, [isOpen])

  // ── 3. GSAP ANIMATIONS ──────────────────────────────────────────────
  useGSAP(() => {
    if (isOpen) {
        // Entrance Sequence
        const tl = gsap.timeline()
        tl.to(backdropRef.current, { 
            opacity: 1, 
            display: 'flex', 
            duration: 0.3, 
            ease: 'power2.out' 
        })
        tl.fromTo(modalRef.current, 
            { y: -40, opacity: 0, scale: 0.9, filter: 'blur(10px)' },
            { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(1.4)' },
            '-=0.1'
        )
        // Staggered Input Entrance
        tl.fromTo('.stagger-input', 
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.04, duration: 0.3, ease: 'power2.out' },
            '-=0.2'
        )
    } else {
        // Exit Sequence
        gsap.to(backdropRef.current, { 
            opacity: 0, 
            duration: 0.2, 
            onComplete: () => {
                if (backdropRef.current) (backdropRef.current as any).style.display = 'none'
            }
        })
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.amount || parseFloat(form.amount) <= 0) {
        toast.error("Operational amount is required.")
        return
    }

    startTransition(async () => {
        let res: any

        if (mode === 'EXPENSE') {
            if (!form.categoryId || !form.fromAccountId) {
                toast.error("Allocation details missing.");
                return;
            }
            res = await logPersonalExpense({
                amount: parseFloat(form.amount),
                categoryId: form.categoryId,
                accountId: form.fromAccountId,
                payee: form.payee,
                date: form.date
            })
        } else if (mode === 'INCOME') {
            if (!form.sourceId || !form.fromAccountId) {
                toast.error("Source origin missing.");
                return;
            }
            res = await logPersonalIncome({
                amount: parseFloat(form.amount),
                sourceId: form.sourceId,
                accountId: form.fromAccountId,
                payee: form.payee,
                date: form.date
            })
        } else {
            if (!form.fromAccountId || !form.toAccountId) {
                toast.error("Liquidity path missing.");
                return;
            }
            res = await executeInternalTransfer({
                fromAccountId: form.fromAccountId,
                toAccountId: form.toAccountId,
                amount: parseFloat(form.amount),
                memo: form.payee || "Internal Transfer"
            })
        }

        if (res.success) {
            toast.success(res.message || `${mode} recorded successfully.`)
            resetForm()
            setIsOpen(false)
        } else {
            toast.error(res.message || `Failed to record ${mode}.`)
        }
    })
  }

  return (
    <div 
        ref={backdropRef}
        className="fixed inset-0 z-[100] hidden items-center justify-center bg-black/60 backdrop-blur-md opacity-0 transition-opacity"
        onClick={(e) => e.target === backdropRef.current && setIsOpen(false)}
    >
        <div 
            ref={modalRef}
            className={`w-full max-w-xl bg-black/80 border ${currentStyle.border} rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl transition-all duration-500`}
        >
            {/* ── HEADER & MODE TOGGLE ────────────────────────────────────────── */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
                <div className="flex items-center gap-4">
                    <div className={`p-2 bg-${currentStyle.color}/10 rounded-lg transition-colors`}>
                        <Sparkles className={`w-5 h-5 text-${currentStyle.color}`} />
                    </div>
                    <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
                        {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map((m) => (
                            <ModeButton 
                                key={m}
                                active={mode === m} 
                                onClick={() => setMode(m)} 
                                label={m.charAt(0) + m.slice(1).toLowerCase()} 
                                icon={modeConfig[m].icon}
                                activeClass={`${modeConfig[m].bg} ${modeConfig[m].glow}`}
                            />
                        ))}
                    </div>
                </div>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* ── DYNAMIC FORM ────────────────────────────────────────────────── */}
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="stagger-input grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Operational Amount ($)</Label>
                        <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            className={`h-12 bg-white/5 border-white/10 text-xl font-mono focus:border-${currentStyle.color}/50 transition-all`}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Protocol Date</Label>
                        <Input 
                            type="date" 
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="h-12 bg-white/5 border-white/10" 
                        />
                    </div>
                </div>

                <div className="stagger-input space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest opacity-40">
                        {mode === 'TRANSFER' ? 'Transfer Memo' : (mode === 'INCOME' ? 'Payer / Source' : 'Payee / Description')}
                    </Label>
                    <Input 
                        placeholder={mode === 'TRANSFER' ? 'e.g. Savings Sweep' : 'e.g. Starbucks, Salary, Amazon'} 
                        value={form.payee}
                        onChange={(e) => setForm({ ...form, payee: e.target.value })}
                        className="h-12 bg-white/5 border-white/10"
                    />
                </div>

                {/* ── CONTEXTUAL SELECTS ────────────────────────────────────────── */}
                <div className="stagger-input grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest opacity-40">
                            {mode === 'TRANSFER' ? 'Origin Account' : 'Debit Account'}
                        </Label>
                        <Select 
                            value={form.fromAccountId}
                            onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
                            className="h-12 bg-white/5 border-white/10"
                        >
                            <option value="">Select Account</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest opacity-40">
                            {mode === 'TRANSFER' ? 'Destination' : (mode === 'INCOME' ? 'Income Stream' : 'Expense Category')}
                        </Label>
                        {mode === 'TRANSFER' ? (
                            <Select 
                                value={form.toAccountId}
                                onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
                                className="h-12 bg-white/5 border-white/10"
                            >
                                <option value="">Select Account</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </Select>
                        ) : mode === 'INCOME' ? (
                            <Select 
                                value={form.sourceId}
                                onChange={(e) => setForm({ ...form, sourceId: e.target.value })}
                                className="h-12 bg-white/5 border-white/10"
                            >
                                <option value="">Select Source</option>
                                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </Select>
                        ) : (
                            <Select 
                                value={form.categoryId}
                                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                className="h-12 bg-white/5 border-white/10"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                        )}
                    </div>
                </div>

                <div className="stagger-input pt-4">
                    <Button 
                        type="submit"
                        disabled={isPending}
                        isLoading={isPending}
                        className={`w-full h-14 ${currentStyle.bg} hover:brightness-110 text-white font-bold tracking-[0.2em] uppercase text-xs border-none ${currentStyle.glow} transition-all duration-500`}
                    >
                        {isPending ? 'STABILIZING LEDGER...' : `EXECUTE ${mode} PROTOCOL`}
                    </Button>
                </div>
            </form>

            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-4">
                <span className="text-[9px] text-white/20 uppercase font-mono tracking-[0.2em]">Press [ESC] to abort</span>
                <div className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-[9px] text-white/20 uppercase font-mono tracking-[0.2em]">Zero-Leak Sovereign Isolation Active</span>
            </div>
        </div>
    </div>
  )
}

function ModeButton({ active, onClick, label, icon, activeClass }: any) {
    return (
        <button 
            type="button"
            onClick={onClick}
            className={`flex items-center gap-3 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                active 
                    ? `${activeClass} text-white font-extrabold` 
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
        >
            {icon}
            {label}
        </button>
    )
}