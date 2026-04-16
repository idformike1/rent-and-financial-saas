'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { submitOnboarding, checkTenantExistence } from '@/actions/tenant.actions'
import { getAvailableUnits } from '@/actions/asset.actions'
import { 
  User, 
  DollarSign, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Zap 
} from 'lucide-react'
import { toast } from '@/lib/toast'
import { Card, Button, Input, cn } from '@/components/ui-finova'

const onboardingSchema = z.object({
  tenantName: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(8, "Valid phone required"),
  nationalId: z.string().min(4, "Legal identifier required"),
  unitId: z.string().min(1, "Select a unit"),
  baseRent: z.number().positive("Rent must be positive"),
  securityDeposit: z.number().min(0, "Deposit cannot be negative"),
  moveInDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" })
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);

  useEffect(() => {
    async function fetchUnits() {
      try {
        const data = await getAvailableUnits();
        setUnits(data);
      } catch (e) {
        console.error("Failed to load units", e);
      } finally {
        setIsLoadingUnits(false);
      }
    }
    fetchUnits();
  }, []);

  const { register, handleSubmit, formState: { errors }, trigger, control, reset, getValues } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      tenantName: '',
      email: '',
      phone: '',
      nationalId: '',
      unitId: '',
      baseRent: 0,
      securityDeposit: 0,
      moveInDate: new Date().toISOString().split('T')[0]
    }
  });

  const watchedValues = useWatch({ control });
  
  const prorationPreview = useMemo(() => {
    if (!watchedValues.moveInDate || !watchedValues.baseRent) return null;
    const moveIn = new Date(watchedValues.moveInDate);
    const rent = Number(watchedValues.baseRent) || 0;
    const year = moveIn.getUTCFullYear();
    const month = moveIn.getUTCMonth();
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0));
    const daysInMonth = endOfMonth.getUTCDate();
    const currentDay = moveIn.getUTCDate();
    const remainingDays = daysInMonth - currentDay + 1;
    const prorated = (rent / daysInMonth) * remainingDays;
    return {
      daysInMonth,
      remainingDays,
      amount: prorated,
      securityDeposit: Number(watchedValues.securityDeposit) || 0,
      total: prorated + (Number(watchedValues.securityDeposit) || 0)
    };
  }, [watchedValues.moveInDate, watchedValues.baseRent, watchedValues.securityDeposit]);

  const nextStep = async () => {
    setServerError('');
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['tenantName', 'email', 'phone', 'nationalId'];
    if (step === 2) fieldsToValidate = ['unitId', 'baseRent', 'securityDeposit', 'moveInDate'];
    
    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

    if (step === 1) {
      const vals = getValues();
      const check = await checkTenantExistence(vals.tenantName, vals.email, vals.phone);
      if (check.exists) {
        setServerError(check.message || "Identity conflict detected.");
        return;
      }
    }

    setStep(step + 1);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      const response = await submitOnboarding(data);
      if (response.success) {
        toast.success("Deployment Successful");
        setSuccessData(response.data);
        setStep(4);
      } else {
        setServerError(response.message || "Mutation failed");
      }
    } catch (err) {
      setServerError("Network protocol failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: 'Recipient' },
    { id: 2, label: 'Amount' },
    { id: 3, label: 'Categorization' },
    { id: 4, label: 'Details' },
    { id: 5, label: 'Review' }
  ];

  const mercuryStepInfo = useMemo(() => {
    switch(step) {
      case 1: return { title: 'Recipient', index: 0 };
      case 2: return { title: 'Terms & Fiscal', index: 1 };
      case 3: return { title: 'Registry Review', index: 4 };
      default: return { title: 'Registry', index: 0 };
    }
  }, [step]);

  if (step === 4) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-6 animate-in zoom-in-95 duration-500">
        <Card className="p-12 text-center space-y-10 rounded-[6px] border border-border bg-card ">
          <div className="w-20 h-20 bg-mercury-green/10 rounded-[6px] flex items-center justify-center mx-auto mb-8 border border-mercury-green/20">
            <CheckCircle2 className="w-10 h-10 text-mercury-green" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-[28px] font-display font-medium text-foreground tracking-tight leading-tight">Identity Activated</h2>
            <p className="text-[15px] text-muted-foreground font-medium leading-relaxed max-w-sm mx-auto">
              The tenant has been successfully registered and the initial ledger accounts have been initialized.
            </p>
          </div>
          
          <div className="bg-background/50 border border-border rounded-[6px] p-8 text-left space-y-6">
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                   <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Lease Reference</p>
                   <p className="text-[15px] text-foreground font-mono">{successData?.leaseId || '—'}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Registry ID</p>
                   <p className="text-[15px] text-foreground font-mono">{successData?.tenantId || '—'}</p>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 pt-6 justify-center">
            <Button 
               variant="primary" 
               onClick={() => router.push('/tenants')} 
               className="h-12 px-10 bg-[#5D71F9] hover:bg-[#5D71F9]/90 text-white rounded-[6px] text-[14px] font-bold uppercase tracking-widest transition-all "
            >
               View Profile <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button 
               variant="ghost" 
               onClick={() => { reset(); setStep(1); }} 
               className="h-12 px-8 rounded-[6px] text-[13px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
            >
               Finish
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-8 flex flex-col animate-in fade-in duration-700">
      <div className="max-w-[1100px] mx-auto w-full grid grid-cols-[240px_1fr] gap-16">
        <aside className="space-y-1 pt-16">
           {steps.map((s, idx) => (
             <div 
               key={s.id} 
               className={cn(
                 "relative pl-6 py-2.5 transition-all duration-300",
                 mercuryStepInfo.index === idx ? "text-foreground opacity-100" : "text-muted-foreground/40"
               )}
             >
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] transition-all duration-300",
                  mercuryStepInfo.index === idx ? "bg-white" : "bg-border"
                )} />
                <span className="text-[12px] font-bold tracking-[0.1em] uppercase">{s.label}</span>
             </div>
           ))}
        </aside>

        <div className="space-y-12">
          <div className="space-y-1">
             <h1 className="text-[28px] font-display text-foreground tracking-tight leading-none">
               {mercuryStepInfo.title}
             </h1>
             <p className="text-[14px] text-muted-foreground">Registry Initialization Protocol // V.4.1</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 pb-32">
             {step === 1 && (
               <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                 <Card className="bg-card border-border rounded-[6px]  overflow-hidden p-8">
                    <div className="flex items-center gap-8">
                       <div className="w-14 h-14 rounded-[6px] bg-background border border-border flex items-center justify-center text-[16px] font-bold text-[#5D71F9]">
                         {watchedValues.tenantName ? watchedValues.tenantName.substring(0, 2).toUpperCase() : '??'}
                       </div>
                       <div className="flex-1 space-y-6">
                         <div className="space-y-2">
                           <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Legal Identity</label>
                           <Input 
                             {...register('tenantName')} 
                             className="h-10 border-b border-t-0 border-x-0 border-border rounded-none bg-transparent px-0 text-[16px] focus:border-[#5D71F9] transition-all" 
                             placeholder="ENTER NAME" 
                           />
                         </div>
                         <div className="flex gap-8">
                            <div className="flex-1 space-y-2">
                               <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                               <Input 
                                 {...register('email')} 
                                 className="h-9 border-b border-t-0 border-x-0 border-border rounded-none bg-transparent px-0 text-[14px] focus:border-[#5D71F9] transition-all" 
                                 placeholder="identity@domain.com" 
                               />
                            </div>
                            <div className="flex-1 space-y-2">
                               <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Mobile Contact</label>
                               <Input 
                                 {...register('phone')} 
                                 className="h-9 border-b border-t-0 border-x-0 border-border rounded-none bg-transparent px-0 text-[14px] focus:border-[#5D71F9] transition-all" 
                                 placeholder="+X XXX XXX XXXX" 
                               />
                            </div>
                         </div>
                       </div>
                    </div>
                 </Card>

                 <div className="space-y-3">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Identity Identifier</label>
                    <div className="bg-card border border-border rounded-[6px] p-5 flex items-center gap-4">
                       <ShieldCheck className="w-5 h-5 text-muted-foreground/30" />
                       <Input 
                         {...register('nationalId')} 
                         className="bg-transparent border-0 focus:ring-0 text-[15px] h-8 px-0 flex-1 placeholder:text-muted-foreground/20" 
                         placeholder="Enter SSN or Passport details" 
                       />
                    </div>
                 </div>
               </div>
             )}

             {step === 2 && (
               <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="space-y-3">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Asset Allocation</label>
                    <div className="bg-card border border-border rounded-[6px] overflow-hidden">
                       <select 
                         {...register('unitId')} 
                         className="w-full bg-transparent text-foreground p-6 text-[16px] outline-none appearance-none cursor-pointer border-0"
                       >
                         <option value="" className="bg-card">Select available inventory...</option>
                         {units.map(u => <option key={u.id} value={u.id} className="bg-card">Unit {u.unitNumber} - {u.type}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Monthly Baseline</label>
                       <div className="bg-card border border-border rounded-[6px] p-6 flex items-center">
                          <span className="text-muted-foreground/20 text-[18px] mr-3 font-mono">$</span>
                          <Input 
                             type="number" 
                             {...register('baseRent', {valueAsNumber: true})} 
                             className="bg-transparent border-0 focus:ring-0 text-[20px] p-0 flex-1 font-mono tracking-tight" 
                             placeholder="0.00" 
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Security Reserve</label>
                       <div className="bg-card border border-border rounded-[6px] p-6 flex items-center">
                          <span className="text-muted-foreground/20 text-[18px] mr-3 font-mono">$</span>
                          <Input 
                             type="number" 
                             {...register('securityDeposit', {valueAsNumber: true})} 
                             className="bg-transparent border-0 focus:ring-0 text-[20px] p-0 flex-1 font-mono tracking-tight" 
                             placeholder="0.00" 
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Activation Date</label>
                    <div className="bg-card border border-border rounded-[6px] p-6 flex items-center gap-5">
                       <Calendar className="w-5 h-5 text-muted-foreground/30" />
                       <Input 
                          type="date" 
                          {...register('moveInDate')} 
                          className="bg-transparent border-0 focus:ring-0 text-[16px] p-0 h-8 flex-1 invert" 
                       />
                    </div>
                 </div>
               </div>
             )}

             {step === 3 && (
               <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                 <Card className="bg-card border border-border rounded-[6px] p-10 overflow-hidden relative ">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                       <Zap className="w-24 h-24" />
                    </div>
                    
                    <div className="space-y-10">
                       <div className="flex justify-between items-end border-b border-white/[0.04] pb-8">
                          <div className="space-y-1">
                             <h4 className="text-[22px] font-display text-foreground tracking-tight">Ledger Summary</h4>
                             <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Initial Ledger Hit</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[28px] font-mono text-foreground tracking-tighter">${prorationPreview?.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-16">
                          <div className="space-y-5">
                             <div className="space-y-0.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Prorated Allocation</p>
                                <p className="text-[16px] font-mono text-foreground/80">${prorationPreview?.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                             </div>
                             <div className="space-y-0.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Security Reserve</p>
                                <p className="text-[16px] font-mono text-foreground/80">${watchedValues.securityDeposit?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                             </div>
                          </div>
                          <div className="space-y-5">
                             <div className="space-y-0.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Entity</p>
                                <p className="text-[16px] text-foreground/80 tracking-tight">{watchedValues.tenantName || 'UNKNOWN'}</p>
                             </div>
                             <div className="space-y-0.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Allocated Asset</p>
                                <p className="text-[16px] text-foreground/80 tracking-tight">Unit {units.find(u => u.id === watchedValues.unitId)?.unitNumber || 'TBD'}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </Card>
                 
                 {serverError && (
                   <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-[6px] flex items-center gap-5 text-red-500/80">
                     <AlertCircle className="w-6 h-6 shrink-0" />
                     <div className="space-y-0.5">
                       <p className="text-[14px] font-bold uppercase tracking-wider">Protocol Violation</p>
                       <p className="text-[13px] opacity-70">{serverError}</p>
                     </div>
                   </div>
                 )}
               </div>
             )}
          </form>
        </div>
      </div>

      <div className="fixed bottom-0 left-[240px] right-0 h-24 flex items-center justify-center gap-3 bg-gradient-to-t from-background to-transparent pointer-events-none">
         <div className="flex items-center gap-3 pointer-events-auto bg-background/80 backdrop-blur-sm p-2 rounded-[6px] border border-border/50">
           {step > 1 && (
             <button 
               type="button" 
               onClick={() => { setStep(step-1); setServerError(''); }} 
               className="h-10 px-8 rounded-[6px] text-[13px] font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
               disabled={isSubmitting}
             >
               Go back
             </button>
           )}
           
           {step < 3 ? (
             <Button 
               type="button" 
               variant="primary" 
               onClick={nextStep} 
               className="h-10 px-10 rounded-[6px] text-[13px] font-bold bg-[#5D71F9] hover:bg-[#5D71F9]/90 text-white flex items-center gap-2  transition-all"
             >
               Next Step <ChevronRight className="w-4 h-4" />
             </Button>
           ) : (
             <Button 
               type="submit" 
               variant="primary" 
               onClick={handleSubmit(onSubmit)}
               disabled={isSubmitting} 
               className="h-10 px-12 rounded-[6px] text-[13px] font-bold bg-[#5D71F9] hover:bg-[#5D71F9]/90 text-white  transition-all"
             >
               {isSubmitting ? (
                 <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> COMMITTING...</div>
               ) : (
                 <div className="flex items-center gap-2">Authorize Registry <ShieldCheck className="w-4 h-4" /></div>
               )}
             </Button>
           )}
         </div>
      </div>
    </div>
  );
}
