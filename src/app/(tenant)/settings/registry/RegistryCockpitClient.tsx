'use client'

import React, { useTransition, useState } from 'react'
import { 
  createWealthAccount, createExpenseCategory, createIncomeSource,
  toggleArchiveStatus 
} from '@/src/actions/registry.actions'
import { Card, Button, Input, Select, Label, Badge } from '@/components/ui-finova'
import { toast } from 'react-hot-toast'
import { Wallet, Landmark, Tag, Archive, RotateCcw, Plus } from 'lucide-react'

interface RegistryCockpitClientProps {
  accounts: any[]
  categories: any[]
  sources: any[]
  ledgers: any[]
}

export default function RegistryCockpitClient({ 
  accounts, categories, sources, ledgers 
}: RegistryCockpitClientProps) {
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* 1. WEALTH ACCOUNTS */}
      <RegistryColumn 
        title="Wealth Accounts"
        icon={<Wallet className="w-4 h-4" />}
        items={accounts}
        type="wealthAccount"
        onCreate={async (name: string) => {
            const res = await createWealthAccount({ name, category: 'ASSET' });
            return res.success;
        }}
      />

      {/* 2. INCOME SOURCES */}
      <RegistryColumn 
        title="Income Sources"
        icon={<Landmark className="w-4 h-4" />}
        items={sources}
        type="incomeSource"
        onCreate={async (name: string) => {
            const res = await createIncomeSource({ name });
            return res.success;
        }}
      />

      {/* 3. EXPENSE CATEGORIES */}
      <RegistryColumn 
        title="Expense Categories"
        icon={<Tag className="w-4 h-4" />}
        items={categories}
        type="expenseCategory"
        extraData={ledgers}
        onCreate={async (name: string, ledgerId: string) => {
            if (!ledgerId) {
                toast.error("Please select a ledger for the category.");
                return false;
            }
            const res = await createExpenseCategory({ name, ledgerId });
            return res.success;
        }}
      />

    </div>
  )
}

function RegistryColumn({ title, icon, items, type, onCreate, extraData }: any) {
  const [isPending, startTransition] = useTransition()
  const [newName, setNewName] = useState('')
  const [extraVal, setExtraVal] = useState('')

  // Sync extraVal with first available ledger if empty
  React.useEffect(() => {
    if (!extraVal && extraData?.length > 0) {
      setExtraVal(extraData[0].id)
    }
  }, [extraData, extraVal])

  const handleAdd = () => {
    if (!newName) return
    startTransition(async () => {
      const success = await onCreate(newName, extraVal)
      if (success) {
        setNewName('')
        toast.success(`${title} added successfully`)
      } else {
        toast.error(`Failed to add ${title}`)
      }
    })
  }

  return (
    <Card variant="glass" className="p-0 overflow-hidden flex flex-col h-[600px]">
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                {icon}
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">{title}</h3>
        </div>
        <Badge variant="default" className="font-mono">{items.length}</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {items.map((item: any) => (
          <div 
            key={item.id} 
            className="flex justify-between items-center p-3 rounded-lg hover:bg-white/[0.03] transition-colors group"
          >
            <div className="flex flex-col">
                <span className={`text-sm font-medium ${item.isArchived ? 'text-white/20 line-through' : 'text-white/80'}`}>
                    {item.name}
                </span>
                {item.category && <span className="text-[9px] text-white/30 uppercase font-bold">{item.category}</span>}
            </div>
            <button 
                onClick={() => {
                    startTransition(async () => {
                        await toggleArchiveStatus(type, item.id, !item.isArchived);
                        toast.success(item.isArchived ? "Restored" : "Archived");
                    })
                }}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/5 rounded-md transition-all text-white/40 hover:text-amber-500"
            >
                {item.isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
            </button>
          </div>
        ))}
        {items.length === 0 && (
            <div className="h-full flex items-center justify-center text-[10px] text-white/10 uppercase tracking-widest border border-dashed border-white/5 rounded-xl m-2">
                Empty Registry
            </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-black/20 space-y-4">
        {type === 'expenseCategory' && extraData?.length > 0 && (
            <div className="space-y-1">
                <Label className="text-[9px] uppercase font-bold opacity-40">Target Ledger</Label>
                <Select 
                    value={extraVal} 
                    onChange={(e) => setExtraVal(e.target.value)}
                    className="h-9 text-[11px]"
                >
                    {extraData.map((l: any) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                </Select>
            </div>
        )}
        <div className="flex gap-2">
            <Input 
                placeholder={`New ${title.slice(0, -1)}...`}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-10 bg-black/40 border-white/5"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button 
                onClick={handleAdd}
                disabled={isPending || !newName}
                isLoading={isPending}
                className="w-12 h-10 p-0 bg-amber-500 hover:bg-amber-600 text-black border-none"
            >
                {!isPending && <Plus className="w-5 h-5" />}
            </Button>
        </div>
      </div>
    </Card>
  )
}
