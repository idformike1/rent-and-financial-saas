"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Lock, ShieldCheck, ChevronRight, CheckCircle2, AlertTriangle, Building2, Calendar, DollarSign } from 'lucide-react';
import { submitOnboarding, checkTenantExistence } from '@/actions/tenant.actions'
import { getAvailableUnits } from '@/actions/asset.actions'
import { toast } from '@/lib/toast'
import { cn } from "@/lib/utils"

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

const steps = [
  { id: 1, title: 'Identity', desc: 'Basic information' },
  { id: 2, title: 'Terms', desc: 'Property & Lease' },
  { id: 3, title: 'Execution', desc: 'Review & Confirm' },
];

export default function TenantOnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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

  const { register, handleSubmit, formState: { errors }, trigger, control, reset, getValues, setError } = useForm<OnboardingFormData>({
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

  const [isValidating, setIsValidating] = useState(false);

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

  const handleNext = async () => {
    setServerError('');
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ['tenantName', 'email', 'phone', 'nationalId'];
    if (currentStep === 2) fieldsToValidate = ['unitId', 'baseRent', 'securityDeposit', 'moveInDate'];
    
    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

    if (currentStep === 1) {
      setIsValidating(true);
      const vals = getValues();
      try {
        const check = await checkTenantExistence(vals.tenantName, vals.email, vals.phone, vals.nationalId) as any;
        if (check.exists) {
          setServerError("Identity conflict detected. Please resolve highlighted fields.");
          if (check.conflicts) {
            Object.entries(check.conflicts).forEach(([field, message]) => {
              setError(field as any, { message: message as string });
            });
          }
          return;
        }
      } catch (err) {
        setServerError("Identity validation protocol failed. Please retry.");
        return;
      } finally {
        setIsValidating(false);
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      const response = await submitOnboarding(data);
      if (response.success) {
        toast.success("Tenancy Materialized Successfully");
        setSuccessData(response.data);
        setCurrentStep(4); // Success step
      } else {
        setServerError(response.message || "Mutation failed");
      }
    } catch (err) {
      setServerError("Network protocol failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-card border border-slate-800 rounded-2xl p-12 text-center space-y-8 animate-in zoom-in-95 duration-500 shadow-2xl">
          <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto border border-brand/20 shadow-brand/20 shadow-lg">
            <CheckCircle2 size={40} className="text-brand" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl text-white font-light tracking-tight">Identity Activated</h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              The tenancy has been successfully registered and initial ledger accounts materialized.
            </p>
          </div>
          
          <div className="bg-background border border-slate-800 rounded-xl p-6 text-left space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lease Reference</p>
                   <p className="text-sm text-brand/80 font-mono">{successData?.leaseId?.slice(0, 12).toUpperCase() || '—'}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Registry ID</p>
                   <p className="text-sm text-brand/80 font-mono">{successData?.tenantId?.slice(0, 12).toUpperCase() || '—'}</p>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
               onClick={() => router.push('/tenants')} 
               className="w-full h-12 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-all shadow-brand/30 shadow-lg"
            >
               View Forensic Profile →
            </button>
            <button 
               onClick={() => { reset(); setCurrentStep(1); setSuccessData(null); }} 
               className="w-full h-12 text-slate-500 hover:text-white font-medium transition-all"
            >
               Register Another Tenancy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-300 flex flex-col items-center pt-12 pb-24 px-4 font-sans selection:bg-brand/30">
      
      {/* HEADER & HORIZONTAL STEPPER */}
      <div className="w-full max-w-4xl mb-10">
        <h1 className="text-3xl text-white font-light tracking-tight mb-8">Register New Tenancy</h1>
        
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-slate-800 z-0"></div>
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isPast = currentStep > step.id;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-3 bg-background px-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-500",
                  isActive ? "bg-brand text-white shadow-brand/50 shadow-lg scale-110" : 
                  isPast ? "bg-slate-800 text-brand/80 border border-slate-700" : "bg-card text-slate-500 border border-slate-800"
                )}>
                  {isPast ? <ChevronRight size={16} /> : step.id}
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-300",
                    isActive ? "text-brand" : "text-slate-500"
                  )}>{step.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="w-full max-w-4xl bg-card border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Step Header */}
        <div className="border-b border-slate-800 p-8 bg-white/[0.01]">
          <p className="text-[10px] font-bold tracking-[0.2em] text-brand mb-2 uppercase">Step {currentStep} of 3</p>
          <h2 className="text-2xl text-white font-light tracking-tight">{steps[currentStep - 1].desc}</h2>
          <p className="text-slate-500 mt-2 text-sm">
            {currentStep === 1 && "Materialize the legal identity of the primary occupant."}
            {currentStep === 2 && "Define the fiscal terms and asset allocation for the lease."}
            {currentStep === 3 && "Final forensic audit before registry commit."}
          </p>
        </div>

        {/* Form Grid Area */}
        <div className="p-8">
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                <input 
                  {...register('tenantName')}
                  type="text" 
                  placeholder="e.g. Aris Thorne" 
                  className="w-full bg-muted border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all" 
                />
                {errors.tenantName && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.tenantName.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="aris@example.com" 
                  className="w-full bg-muted border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all" 
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input 
                  {...register('phone')}
                  type="tel" 
                  placeholder="+X XXX XXX XXXX" 
                  className="w-full bg-muted border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all" 
                />
                {errors.phone && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identity Identifier</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={14} className="text-slate-500" />
                  </div>
                  <input 
                    {...register('nationalId')}
                    type="text" 
                    placeholder="SSN / National ID" 
                    className="w-full bg-muted border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand transition-all" 
                  />
                </div>
                {errors.nationalId && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.nationalId.message}</p>}
              </div>

              <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <p className="text-xs text-emerald-500/80 flex items-center gap-2">
                  <ShieldCheck size={16} /> 
                  Identity information is encrypted and stored securely within the Sovereign Vault.
                </p>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asset Allocation</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 size={16} className="text-slate-500" />
                  </div>
                  <select 
                    {...register('unitId')}
                    className="w-full bg-muted border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-brand transition-all cursor-pointer"
                  >
                    <option value="">Select available inventory...</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>Unit {u.unitNumber} — {u.type} (Market: ${u.marketRent})</option>
                    ))}
                  </select>
                </div>
                {errors.unitId && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.unitId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Monthly Baseline Rent</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-slate-500" />
                  </div>
                  <input 
                    {...register('baseRent', { valueAsNumber: true })}
                    type="number" 
                    placeholder="0.00" 
                    className="w-full bg-muted border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand transition-all" 
                  />
                </div>
                {errors.baseRent && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.baseRent.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Security Reserve</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheck size={16} className="text-slate-500" />
                  </div>
                  <input 
                    {...register('securityDeposit', { valueAsNumber: true })}
                    type="number" 
                    placeholder="0.00" 
                    className="w-full bg-muted border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-brand transition-all" 
                  />
                </div>
                {errors.securityDeposit && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.securityDeposit.message}</p>}
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Activation Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-slate-500" />
                  </div>
                  <input 
                    {...register('moveInDate')}
                    type="date" 
                    className="w-full bg-muted border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-slate-400 focus:outline-none focus:border-brand transition-all [color-scheme:dark]" 
                  />
                </div>
                {errors.moveInDate && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.moveInDate.message}</p>}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-background border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h4 className="text-white font-medium">Initial Ledger Impact</h4>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Immediate Hit</p>
                    <p className="text-xl text-brand/80 font-mono">${prorationPreview?.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Prorated Allocation</p>
                      <p className="text-sm text-slate-300 font-mono">${prorationPreview?.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Security Reserve</p>
                      <p className="text-sm text-slate-300 font-mono">${watchedValues.securityDeposit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Primary Occupant</p>
                      <p className="text-sm text-slate-300 tracking-tight">{watchedValues.tenantName || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Allocated Unit</p>
                      <p className="text-sm text-slate-300 tracking-tight">Unit {units.find(u => u.id === watchedValues.unitId)?.unitNumber || 'TBD'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {serverError && (
                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center gap-4 text-rose-500">
                  <AlertTriangle size={20} />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-wider">Protocol Violation</p>
                    <p className="text-xs opacity-80">{serverError}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACTION CONTROLS (Bottom Right Bias) */}
        <div className="border-t border-slate-800 bg-white/[0.01] p-6 flex justify-between items-center">
          <button 
            onClick={() => router.push('/tenants')}
            className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-300 transition-colors"
          >
            Abort Protocol
          </button>
          
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
              >
                Back
              </button>
            )}
            <button 
              onClick={currentStep === 3 ? handleSubmit(onSubmit) : handleNext}
              disabled={isSubmitting || isValidating}
              className="px-8 py-2.5 rounded-lg bg-brand hover:bg-brand/90 text-white shadow-brand/30 shadow-lg transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
            >
              {isSubmitting || isValidating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : currentStep === 3 ? (
                'Execute Onboarding'
              ) : (
                'Continue Protocol'
              )}
            </button>
          </div>
        </div>

      </div>

      <div className="mt-12 flex items-center gap-4 opacity-20 hover:opacity-100 transition-opacity duration-500">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Sovereign Registry Control // V.4.2</p>
      </div>
    </div>
  );
}
