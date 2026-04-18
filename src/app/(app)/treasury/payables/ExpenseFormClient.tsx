'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { logExpense } from '@/actions/finance.actions'
import { Loader2, Landmark, CheckCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { toast } from '@/lib/toast'
import { cn } from '@/components/ui-finova'

const treasurySchema = z.object({
  date: z.string().min(1, "Date is mandatory for treasury audit."),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive numerical figure.",
  }),
  payee: z.string().min(2, "Identification of payee/payer is mandatory for data governance."),
  description: z.string().min(3, "Substantive narrative required for fiscal reasoning."),
  scope: z.string(),
  type: z.enum(['REVENUE', 'EXPENSE']),
  propertyId: z.string().optional(),
  parentCategoryId: z.string().min(1, "Core account category must be defined."),
  subCategoryId: z.string().optional(),
  paymentMode: z.enum(['CASH', 'BANK']),
});

type TreasuryFormData = z.infer<typeof treasurySchema>;

const DEFAULT_VALUES = {
  date: new Date().toISOString().split('T')[0],
  type: 'EXPENSE' as const,
  paymentMode: 'BANK' as const,
  amount: '',
  payee: '',
  description: '',
  parentCategoryId: '',
  subCategoryId: '',
  propertyId: '',
};

export default function ExpenseFormClient({ properties, allCategories, allLedgers }: { properties: any[], allCategories: any[], allLedgers: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastEntry, setLastEntry] = useState<{ payee: string; amount: string; type: string } | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<TreasuryFormData>({
    resolver: zodResolver(treasurySchema),
    defaultValues: { ...DEFAULT_VALUES, scope: allLedgers[0]?.id || '' },
  });

  const selectedScopeId = watch('scope');
  const selectedType = watch('type');
  const selectedParentId = watch('parentCategoryId');

  const activeLedger = allLedgers.find((l: any) => l.id === selectedScopeId);
  const showAssetContext = activeLedger?.name?.toUpperCase().includes('BUILDING');

  // TRIGGER: Filter Ledgers by flow type
  const availableLedgers = useMemo(() => 
    allLedgers.filter(l => l.class === selectedType),
    [allLedgers, selectedType]
  );

  const availableParents = useMemo(() => 
    allCategories.filter((c: any) => 
      c.ledgerId === selectedScopeId && 
      c.ledger?.class === selectedType && 
      !c.parentId
    ),
    [allCategories, selectedScopeId, selectedType]
  );
  
  const availableSubs = useMemo(() => 
    allCategories.filter((c: any) => c.parentId === selectedParentId),
    [allCategories, selectedParentId]
  );

  // LOGIC: Reset dependent fields when core states mutate
  useEffect(() => {
    setValue('parentCategoryId', '');
    setValue('subCategoryId', '');
    // If current scope is no longer valid for the selected type, reset it to the first available ledger of that type
    if (selectedScopeId && !availableLedgers.find((l: any) => l.id === selectedScopeId)) {
        setValue('scope', availableLedgers[0]?.id || '');
    }
  }, [selectedScopeId, selectedType, setValue, availableLedgers]);

  useEffect(() => {
    if (!showAssetContext) {
      setValue('propertyId', '');
    }
  }, [showAssetContext, setValue]);

  async function onSubmit(data: TreasuryFormData) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const result = await logExpense(formData);
      if (result.success) {
        setLastEntry({ payee: data.payee, amount: data.amount, type: data.type });
        setSessionCount(prev => prev + 1);
        toast.success(`✓ ${data.type} Materialized`);
        reset({
          ...DEFAULT_VALUES,
          date: data.date,
          scope: data.scope,
          type: data.type,
          paymentMode: data.paymentMode,
          propertyId: data.propertyId,
        });
      } else {
        toast.error(result.error || "Registry authorization failed.");
      }
    } catch (e: any) {
      toast.error("Nexus synchronization failure");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = (error?: any) => cn(
    "w-full bg-card border-2 rounded-[var(--radius)] px-6 h-16 text-foreground outline-none focus:ring-2 focus:ring-brand/30 transition-all text-[12px]  tracking-tight placeholder-muted-foreground dark:placeholder-muted-foreground",
    error ? "border-rose-500 bg-rose-50/10" : "border-transparent focus:border-brand/20"
  );
  const labelClass = "text-[10px] text-muted-foreground  tracking-[0.25rem] mb-3 ml-1 block";

  return (
    <div className="space-y-10">
      {sessionCount > 0 && lastEntry && (
        <div className="rounded-[var(--radius)] px-10 py-8 flex items-center justify-between bg-[var(--card)] border border-[var(--primary)]/20 animate-in zoom-in-95 duration-500">
          <div className="flex items-center space-x-6">
            <div className={cn("w-14 h-14 rounded-[calc(var(--radius)*2)] flex items-center justify-center border-4 border-foreground/20", lastEntry.type === 'REVENUE' ? 'bg-[var(--primary)]' : 'bg-destructive')}>
               {lastEntry.type === 'REVENUE' ? <ArrowUpCircle className="w-7 h-7 text-foreground" /> : <ArrowDownCircle className="w-7 h-7 text-foreground" />}
            </div>
            <div>
              <p className=" text-2xl text-foreground leading-none">
                Entry #{sessionCount}: Materialized
              </p>
              <p className="text-[10px]   text-[var(--primary)] mt-3 animate-pulse">
                {lastEntry.payee} — ${parseFloat(lastEntry.amount).toLocaleString(undefined, {minimumFractionDigits: 2})} // AUDITED
              </p>
            </div>
          </div>
          <div className="bg-[var(--primary)]/20 p-3 rounded-[var(--radius)]">
            <CheckCircle className="w-8 h-8 text-[var(--primary)]" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        <div className="bg-card border border-border border-border rounded-[var(--radius)] p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* FLOW TYPE SELECTOR — SIGNAL-ALIGNED SIGNAL GRADIENTS */}
          <div className="md:col-span-2 grid grid-cols-2 gap-6 p-2 bg-muted/50 rounded-[calc(var(--radius)*2)]">
             <button 
               type="button" 
               onClick={() => setValue('type', 'EXPENSE')}
               className={cn("py-5 rounded-[var(--radius)]  text-[10px] transition-all duration-500 flex items-center justify-center gap-3",
                 selectedType === 'EXPENSE' ? 'bg-destructive text-foreground' : 'text-muted-foreground hover:text-muted-foreground dark:hover:text-foreground'
               )}
             >
                <ArrowDownCircle className="w-4 h-4" /> Outflow / Out-Take
             </button>
             <button 
               type="button" 
               onClick={() => setValue('type', 'REVENUE')}
               className={cn("py-5 rounded-[var(--radius)]  text-[10px] transition-all duration-500 flex items-center justify-center gap-3",
                 selectedType === 'REVENUE' ? 'bg-[var(--primary)] text-foreground' : 'text-muted-foreground hover:text-muted-foreground dark:hover:text-foreground'
               )}
             >
                <ArrowUpCircle className="w-4 h-4" /> Inflow / Revenue
             </button>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Materialization Date</label>
            <input type="date" {...register('date')} className={inputClass(errors.date)} />
            {errors.date && <p className="text-[9px]  text-destructive mt-2 ml-1">{errors.date.message}</p>}
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Liquid Volume (Amount)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input type="text" {...register('amount')} className={cn(inputClass(errors.amount), "pl-12 text-2xl")} placeholder="00.00" />
            </div>
            {errors.amount && <p className="text-[9px]  text-destructive mt-2 ml-1">{errors.amount.message}</p>}
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Ledger Scope</label>
            <div className="relative">
              <select {...register('scope')} className={cn(inputClass(errors.scope), "appearance-none")}>
                {availableLedgers.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20"><Landmark className="w-4 h-4" /></div>
            </div>
          </div>

          {showAssetContext && (
            <div className="space-y-1 animate-in fade-in duration-500">
              <label className={labelClass}>Asset Context (Property)</label>
              <select {...register('propertyId')} className={cn(inputClass(), "appearance-none")}>
                <option value="">GENERAL CORE</option>
                {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className={labelClass}>{selectedType === 'REVENUE' ? 'Revenue Source' : 'Expenditure Account'}</label>
            <select {...register('parentCategoryId')} className={cn(inputClass(errors.parentCategoryId), "appearance-none")}>
              <option value="">SELECT ACCOUNT</option>
              {availableParents.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.parentCategoryId && <p className="text-[9px]  text-destructive mt-2 ml-1">{errors.parentCategoryId.message}</p>}
          </div>

          {availableSubs.length > 0 && (
            <div className="space-y-1 animate-in fade-in duration-500">
              <label className={labelClass}>Granular Allocation</label>
              <select {...register('subCategoryId')} className={cn(inputClass(), "appearance-none")}>
                <option value="">NO SUB-ALLOCATION</option>
                {availableSubs.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className={labelClass}>{selectedType === 'REVENUE' ? 'Payer Identity' : 'Payee Identity'}</label>
            <input {...register('payee')} className={inputClass(errors.payee)} placeholder="Legal Entity Name" />
            {errors.payee && <p className="text-[9px]  text-destructive mt-2 ml-1">{errors.payee.message}</p>}
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Requisition Mode</label>
            <select {...register('paymentMode')} className={cn(inputClass(), "appearance-none")}>
              <option value="BANK">DIGITAL CLEARANCE</option>
              <option value="CASH">LIQUID ASSET (CASH)</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-4 pt-4 border-t border-border border-border">
            <label className={labelClass}>Substantive Narrative (Description)</label>
            <textarea rows={3} {...register('description')} className={cn(inputClass(errors.description), "normal-case h-32 py-6")} placeholder="Enter fiscal reasoning narrative..." />
            {errors.description && <p className="text-[9px]  text-destructive mt-2 ml-1">{errors.description.message}</p>}
          </div>

          <div className="md:col-span-2 pt-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn("w-full text-foreground h-20 rounded-[var(--radius)] transition-all flex items-center justify-center  tracking-[0.5rem] text-[12px] group relative overflow-hidden active:translate-y-[1px] transition-transform",
                selectedType === 'REVENUE' ? 'bg-[var(--primary)]' : 'bg-destructive'
              )}
            >
              <div className="absolute inset-0 bg-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              {isSubmitting ? <Loader2 className="w-6 h-6 mr-4 animate-spin" /> : <Landmark className="w-6 h-6 mr-4" />}
              {isSubmitting ? "Processing Ledger..." : `Authorize Treasury ${selectedType === 'REVENUE' ? 'Inflow' : 'Outflow'}`}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
