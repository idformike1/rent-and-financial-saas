'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { submitOnboarding } from '@/actions/onboarding.actions'
import { getAvailableUnits } from '@/actions/unit.actions'
import { User, Home, DollarSign, Calendar, ChevronRight, ChevronLeft, CheckCircle2, Loader2, AlertCircle, ShieldCheck, AlertTriangle, Zap, Mail, Phone, Fingerprint } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/lib/toast'
import { Card, Button, Input, Badge } from '@/components/ui-finova'

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

  const { register, handleSubmit, formState: { errors }, trigger, control, reset } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      tenantName: '',
      email: '',
      phone: '',
      nationalId: '',
      unitId: '',
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
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['tenantName', 'email', 'phone', 'nationalId'];
    if (step === 2) fieldsToValidate = ['unitId', 'baseRent', 'securityDeposit', 'moveInDate'];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
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
      <div className="max-w-2xl mx-auto py-12 px-6 animate-in zoom-in duration-500">
        <Card className="p-12 text-center space-y-8 rounded-[3rem] border-none shadow-premium-lg">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 border-b border-slate-50 pb-6">Materialized</h2>
          <p className="text-slate-500 font-medium leading-relaxed">The tenancy agreement and master ledger entries have been cashed into the registry.</p>
          <div className="bg-slate-900 rounded-3xl p-8 text-left space-y-6 relative overflow-hidden">
            <Badge className="bg-brand text-white border-none text-[8px]">Ref: {successData?.leaseId.slice(0,8)}</Badge>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lease ID</p>
                  <p className="font-mono text-[10px] text-white truncate">{successData?.leaseId}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tenant ID</p>
                  <p className="font-mono text-[10px] text-white truncate">{successData?.tenantId}</p>
               </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Button variant="primary" onClick={() => window.location.href = '/tenants'} className="h-14 rounded-2xl font-black uppercase italic tracking-tighter">Enter Command Center</Button>
            <button onClick={() => { reset(); setStep(1); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand">Reset Wizard</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-16 flex items-center gap-6">
         <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center shadow-premium group-hover:rotate-12 transition-transform">
            <Zap className="w-7 h-7 text-white fill-white" />
         </div>
         <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">Activation <span className="text-brand">Wizard</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Enterprise Provisioning v3.1</p>
         </div>
      </div>

      <div className="flex items-center justify-between mb-16 px-12 relative">
         <div className="absolute left-12 right-12 top-7 h-0.5 bg-slate-100 -z-0" />
         {[User, DollarSign, CheckCircle2].map((Icon, i) => (
           <div key={i} className="relative z-10">
              <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${step > i + 1 ? 'bg-slate-900 border-slate-900 text-white' : step === i + 1 ? 'bg-brand border-brand text-white shadow-premium' : 'bg-white border-slate-100 text-slate-200'}`}>
                 <Icon className="w-6 h-6" />
              </div>
           </div>
         ))}
      </div>

      <Card className="rounded-[3rem] border-none shadow-premium-lg overflow-hidden bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="p-12 space-y-12">
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Aggregate</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                    <Input {...register('tenantName')} className="pl-16 py-7 text-2xl font-black italic tracking-tighter" placeholder="Full Legal Name" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Email</label>
                  <Input {...register('email')} placeholder="tenant@axiom.com" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact String</label>
                  <Input {...register('phone')} placeholder="+1 (555) 000" />
                </div>
                <div className="md:col-span-2 space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registry Identifier</label>
                   <Input {...register('nationalId')} placeholder="ID / Passport / SSN" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Allocation</label>
                     <select {...register('unitId')} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-black text-lg outline-none appearance-none focus:ring-2 focus:ring-brand">
                        <option value="">Select Target Unit</option>
                        {units.map(u => <option key={u.id} value={u.id}>Unit {u.unitNumber} // {u.type}</option>)}
                     </select>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subscription Rate</label>
                     <Input type="number" {...register('baseRent', {valueAsNumber: true})} placeholder="0.00" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commencement</label>
                     <Input type="date" {...register('moveInDate')} />
                  </div>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
               <Card className="bg-slate-900 border-none p-10 space-y-8 text-white rounded-[2.5rem]">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand border-b border-white/5 pb-4">Audit Projection</h4>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Aggregate Liquid Requirement</p>
                        <p className="text-sm font-medium mt-1">Prorated Initial + Collateral</p>
                     </div>
                     <span className="text-4xl font-black italic tracking-tighter text-white">${prorationPreview?.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
               </Card>
               {serverError && <div className="bg-rose-50 p-6 rounded-2xl border-l-8 border-rose-500 text-rose-600 font-bold text-xs uppercase">{serverError}</div>}
            </div>
          )}

          <div className="flex justify-between items-center pt-10 border-t border-slate-50">
             {step > 1 ? (
               <button type="button" onClick={() => setStep(step-1)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center"><ChevronLeft className="w-4 h-4 mr-2" /> Reverse</button>
             ) : <div />}
             
             {step < 3 ? (
               <Button type="button" variant="primary" onClick={nextStep} className="px-10 h-14 rounded-2xl font-black uppercase italic tracking-tighter">Proceed <ChevronRight className="w-4 h-4 ml-2" /></Button>
             ) : (
               <Button type="submit" variant="primary" disabled={isSubmitting} className="px-10 h-14 rounded-2xl font-black uppercase italic tracking-tighter bg-emerald-500 hover:bg-emerald-600">
                  {isSubmitting ? 'Mutating...' : 'Activate Tenancy'}
               </Button>
             )}
          </div>
        </form>
      </Card>
    </div>
  )
}
