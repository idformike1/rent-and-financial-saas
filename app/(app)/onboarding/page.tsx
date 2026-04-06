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
      <div className="max-w-3xl mx-auto py-12 px-6 animate-in zoom-in-95 duration-500">
        <Card className="p-6 text-center space-y-6 rounded-[8px] border-none bg-card/80">
          <div className="w-24 h-24 bg-[var(--primary-muted)] rounded-[8px] flex items-center justify-center mx-auto mb-10-sm">
            <CheckCircle2 className="w-12 h-12 text-[var(--primary)]" />
          </div>
          <h2 className="text-display font-weight-display text-foreground border-b-2 border-border pb-10">Materialized</h2>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-lg mx-auto">The agreement and master ledger entries have been successfully cashed into the registry.</p>
          
          <div className="bg-card rounded-[8px] p-6 text-left space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
               <Fingerprint className="w-32 h-32 text-foreground" />
            </div>
            <div className="space-y-6 relative z-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <p className="text-[11px] text-muted-foreground  tracking-[0.3em]">Fiscal Lease Identifier</p>
                     <div className="bg-muted/50 border border-border p-5 rounded-[8px]">
                        <p className="font-mono text-sm text-foreground truncate font-bold">{successData?.leaseId}</p>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <p className="text-[11px] text-muted-foreground  tracking-[0.3em]">Master Tenant Hash</p>
                     <div className="bg-muted/50 border border-border p-5 rounded-[8px]">
                        <p className="font-mono text-sm text-foreground truncate font-bold">{successData?.tenantId}</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-6">
            <Button variant="primary" onClick={() => window.location.href = '/tenants'} className="h-16 rounded-[8px]  text-xl">
               Enter Command Center <ChevronRight className="w-6 h-6 ml-3" />
            </Button>
            <button 
               onClick={() => { reset(); setStep(1); }} 
               className="h-14 rounded-[8px]  text-[11px] text-[var(--muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center group"
            >
               <AlertCircle className="w-4 h-4 mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
               Reset Activation Wizard
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-[28px] font-[380] text-foreground tracking-tight leading-none">
            Activation Wizard
          </h1>
          <p className="text-[15px] font-[400] text-muted-foreground">
            Enterprise provisioning and tenancy initiation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="h-10 px-4 flex items-center bg-muted/50 border border-border text-muted-foreground font-bold text-[10px]  tracking-widest">
            v3.1 Stable
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between mb-16 px-12 relative">
         <div className="absolute left-12 right-12 top-7 h-0.5 bg-muted -z-0" />
         {[User, DollarSign, CheckCircle2].map((Icon, i) => (
           <div key={i} className="relative z-10">
              <div className={`w-14 h-14 rounded-[8px] border-2 flex items-center justify-center transition-all duration-300 ${step > i + 1 ? 'bg-card border-foreground text-foreground' : step === i + 1 ? 'bg-brand border-brand text-foreground' : 'bg-card border-border text-foreground'}`}>
                 <Icon className="w-6 h-6" />
              </div>
           </div>
         ))}
      </div>

      <Card className="rounded-[8px] border-none overflow-hidden bg-card">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] text-muted-foreground  ml-1">Identity Aggregate</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                    <Input {...register('tenantName')} className={cn("pl-16 py-7 text-2xl h-16", errors.tenantName && "border-rose-500")} placeholder="Full Legal Name" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] text-muted-foreground  ml-1">Protocol Email</label>
                  <Input {...register('email')} className={cn("h-16", errors.email && "border-rose-500")} placeholder="tenant@axiom.com" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] text-muted-foreground  ml-1">Contact String</label>
                  <Input {...register('phone')} className={cn("h-16", errors.phone && "border-rose-500")} placeholder="+1 (555) 000" />
                </div>
                <div className="md:col-span-2 space-y-4">
                   <label className="text-[10px] text-muted-foreground  ml-1">Registry Identifier</label>
                   <Input {...register('nationalId')} className={cn("h-16", errors.nationalId && "border-rose-500")} placeholder="ID / Passport / SSN" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-4">
                     <label className="text-[10px] text-muted-foreground  ml-1">Asset Allocation</label>
                      <select {...register('unitId')} className={cn("w-full bg-[var(--card)] text-[var(--foreground)] border-2 rounded-[8px] px-6 py-5 text-lg h-16 outline-none appearance-none focus:ring-2 focus:ring-[var(--primary)]", errors.unitId ? 'border-rose-500' : 'border-[var(--border)]')}>
                        <option value="">Select Target Unit</option>
                        {units.map(u => <option key={u.id} value={u.id}>Unit {u.unitNumber} // {u.type}</option>)}
                     </select>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] text-muted-foreground  ml-1">Subscription Rate</label>
                     <Input type="number" {...register('baseRent', {valueAsNumber: true})} className={cn("h-16", errors.baseRent && "border-rose-500")} placeholder="0.00" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] text-muted-foreground  ml-1">Collateral Deposit</label>
                     <Input type="number" {...register('securityDeposit', {valueAsNumber: true})} className={cn("h-16", errors.securityDeposit && "border-rose-500")} placeholder="0.00" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] text-muted-foreground  ml-1">Commencement</label>
                     <Input type="date" {...register('moveInDate')} className={cn("h-16", errors.moveInDate && "border-rose-500")} />
                  </div>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
               <Card className="bg-card border-none p-6 space-y-8 text-foreground rounded-[8px]">
                  <h4 className="text-[10px]  tracking-[0.4em] text-brand border-b border-border pb-4">Audit Projection</h4>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[9px] font-bold text-muted-foreground ">Aggregate Liquid Requirement</p>
                        <p className="text-sm font-medium mt-1">Prorated Initial + Collateral</p>
                     </div>
                     <span className="text-display font-weight-display text-foreground">${prorationPreview?.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
               </Card>
               {serverError && <div className="bg-rose-500/10 p-6 rounded-[8px] border-l-8 border-rose-500 text-rose-600 font-bold text-xs ">{serverError}</div>}
            </div>
          )}

          {serverError && (
            <div className="bg-rose-500/10 border-2 border-rose-500 p-6 rounded-[8px] flex items-center gap-4 text-rose-500 animate-in shake duration-500">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <p className="text-[10px] ">{serverError}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-10 border-t border-border">
             {step > 1 ? (
               <button type="button" onClick={() => { setStep(step-1); setServerError(''); }} className="text-[10px]  text-muted-foreground hover:text-foreground flex items-center transition-colors"><ChevronLeft className="w-4 h-4 mr-2" /> Reverse</button>
             ) : <div />}
             
             {step < 3 ? (
               <Button type="button" variant="primary" onClick={nextStep} className="px-10 h-16 rounded-[8px] ">Proceed <ChevronRight className="w-4 h-4 ml-2" /></Button>
             ) : (
               <Button type="submit" variant="primary" disabled={isSubmitting} className="px-12 h-16 rounded-[8px]  bg-[var(--primary)] hover:bg-[var(--primary)]">
                  {isSubmitting ? (
                    <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /> Provisioning...</div>
                  ) : 'Activate Tenancy'}
               </Button>
             )}
          </div>
        </form>
      </Card>
    </div>
  )
}
