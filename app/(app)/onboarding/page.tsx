'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { submitOnboarding, checkTenantExistence } from '@/actions/tenant.actions'
import { getAvailableUnits } from '@/actions/asset.actions'
import { User, Home, DollarSign, Calendar, ChevronRight, ChevronLeft, CheckCircle2, Loader2, AlertCircle, ShieldCheck, AlertTriangle, Zap, Mail, Phone, Fingerprint, Lock } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/lib/toast'
import { Card, Button, Input, Badge, cn } from '@/components/ui-finova'

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

  if (step === 4) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6 animate-in zoom-in-95 duration-500">
        <Card className="p-8 text-center space-y-6 rounded-[12px] border-none bg-card">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-[20px] font-medium text-foreground tracking-tight">Onboarding complete</h2>
          <p className="text-muted-foreground font-medium text-[13px] leading-relaxed max-w-sm mx-auto">The tenant registry has been updated and the initial ledger entries have been generated.</p>
          
          <div className="bg-[#1C1F26] rounded-[8px] p-6 text-left space-y-4">
             <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                   <p className="text-[11px] text-muted-foreground">Lease ID</p>
                   <p className="text-[13px] text-foreground font-medium">{successData?.leaseId}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[11px] text-muted-foreground">Tenant ID</p>
                   <p className="text-[13px] text-foreground font-medium">{successData?.tenantId}</p>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button variant="primary" onClick={() => window.location.href = '/tenants'} className="w-full h-[38px] rounded-full text-[13px] font-medium">
               Go to tenants <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
               variant="ghost" 
               onClick={() => { reset(); setStep(1); }} 
               className="w-full h-[38px] rounded-full text-[13px] font-medium text-muted-foreground hover:text-foreground"
            >
               Add another tenant
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-[24px] font-medium text-foreground tracking-tight leading-none">
          Add tenant
        </h1>
        <p className="text-[13px] font-medium text-muted-foreground">
          Fill out the details below to onboard a new resident.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8">
         {[1, 2, 3].map((s) => (
           <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "h-1.5 w-12 rounded-full transition-all duration-300",
                step >= s ? "bg-primary" : "bg-muted"
              )} />
           </div>
         ))}
      </div>

      <Card className="rounded-[12px] border-[#2A2D35] bg-[#181B21] overflow-hidden shadow-none">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-medium text-muted-foreground ml-1">Full name</label>
                  <Input {...register('tenantName')} className={cn("h-[38px] rounded-[8px] text-[13px] font-medium border-[#2A2D35] bg-[#1C1F26]", errors.tenantName && "border-rose-500")} placeholder="Legal name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-muted-foreground ml-1">Email</label>
                  <Input {...register('email')} className={cn("h-[38px] rounded-[8px] text-[13px] font-medium border-[#2A2D35] bg-[#1C1F26]", errors.email && "border-rose-500")} placeholder="Email address" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-muted-foreground ml-1">Phone</label>
                  <Input {...register('phone')} className={cn("h-[38px] rounded-[8px] text-[13px] font-medium border-[#2A2D35] bg-[#1C1F26]", errors.phone && "border-rose-500")} placeholder="Phone number" />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className="text-[11px] font-medium text-muted-foreground ml-1">National ID</label>
                   <Input {...register('nationalId')} className={cn("h-[38px] rounded-[8px] text-[13px] font-medium border-[#2A2D35] bg-[#1C1F26]", errors.nationalId && "border-rose-500")} placeholder="Identification string" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[11px] font-medium text-muted-foreground ml-1">Asset allocation</label>
                      <select {...register('unitId')} className={cn("w-full bg-[#1C1F26] text-foreground border border-[#2A2D35] rounded-[8px] px-4 py-2 text-[13px] h-[38px] outline-none appearance-none focus:ring-2 focus:ring-primary/10", errors.unitId ? 'border-rose-500' : 'border-[#2A2D35]')}>
                        <option value="">Select unit...</option>
                        {units.map(u => <option key={u.id} value={u.id}>Unit {u.unitNumber} - {u.type}</option>)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[11px] font-medium text-muted-foreground ml-1">Base rent</label>
                     <Input type="number" {...register('baseRent', {valueAsNumber: true})} className={cn("h-[38px] rounded-[8px] text-[13px] font-medium border-[#2A2D35] bg-[#1C1F26]", errors.baseRent && "border-rose-500")} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[11px] font-medium text-muted-foreground ml-1">Security deposit</label>
                     <Input type="number" {...register('securityDeposit', {valueAsNumber: true})} className={cn("h-[38px] rounded-[8px] text-[13px] font-medium border-[#2A2D35] bg-[#1C1F26]", errors.securityDeposit && "border-rose-500")} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[11px] font-medium text-muted-foreground ml-1">Move-in date</label>
                     <Input type="date" {...register('moveInDate')} className={cn("h-[38px] rounded-[8px] text-[13px] font-medium border-[#2A2D35] bg-[#1C1F26]", errors.moveInDate && "border-rose-500")} />
                  </div>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="bg-[#1C1F26] p-6 space-y-6 text-foreground rounded-[8px] border border-[#2A2D35]">
                  <h4 className="text-[11px] font-medium text-muted-foreground border-b border-[#2A2D35] pb-4 uppercase tracking-wider">Audit projection</h4>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[12px] font-medium text-foreground">Total initial payment</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Prorated rent + security deposit</p>
                     </div>
                     <span className="text-[28px] font-[450] text-foreground tracking-[-0.02em] leading-none">${prorationPreview?.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
               </div>
               {serverError && <div className="bg-rose-500/10 p-4 rounded-[8px] border border-rose-500/20 text-rose-500 font-medium text-[12px]">{serverError}</div>}
            </div>
          )}

          {serverError && (
            <div className="bg-rose-500/10 border-2 border-rose-500 p-6 rounded-[8px] flex items-center gap-4 text-rose-500 animate-in shake duration-500">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <p className="text-[10px] ">{serverError}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-8 border-t border-[#2A2D35]">
             {step > 1 ? (
               <button type="button" onClick={() => { setStep(step-1); setServerError(''); }} className="text-[13px] font-medium text-muted-foreground hover:text-foreground flex items-center transition-none"><ChevronLeft className="w-4 h-4 mr-2" /> Back</button>
             ) : <div />}
             
             {step < 3 ? (
               <Button type="button" variant="primary" onClick={nextStep} className="px-8 h-[38px] rounded-full text-[13px] font-medium">Continue <ChevronRight className="w-4 h-4 ml-2" /></Button>
             ) : (
               <Button type="submit" variant="primary" disabled={isSubmitting} className="px-10 h-[38px] rounded-full text-[13px] font-medium">
                  {isSubmitting ? (
                    <div className="flex items-center gap-3"><Loader2 className="w-4 h-4 animate-spin" /> Provisioning...</div>
                  ) : 'Onboard tenant'}
               </Button>
             )}
          </div>
        </form>
      </Card>
    </div>
  )
}
