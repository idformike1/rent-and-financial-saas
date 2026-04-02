'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { submitOnboarding } from '@/actions/onboarding.actions'
import { getAvailableUnits } from '@/actions/unit.actions'
import { User, Home, DollarSign, Calendar, ChevronRight, ChevronLeft, CheckCircle2, Loader2, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/lib/toast'

const onboardingSchema = z.object({
  tenantName: z.string().min(2, "Full name is required (min 2 chars)"),
  email: z.string().email("Valid institutional email required"),
  phone: z.string().min(8, "Valid telephonic contact required"),
  nationalId: z.string().min(4, "Legal identifier required"),
  unitId: z.string().min(1, "Please select an available unit"),
  baseRent: z.number().positive("Rent must be a positive number"),
  securityDeposit: z.number().min(0, "Deposit cannot be negative"),
  moveInDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Choose a valid move-in date" })
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);

  // Fetch available units on mount
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

  // Watch values for real-time proration preview
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

  const prevStep = () => setStep(step - 1);

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    setServerError('');
    
    try {
      const response = await submitOnboarding(data);
      if (response.success) {
        toast.success("Tenancy Agreement Successfully Materialized");
        setSuccessData(response.data);
        setStep(4);
      } else {
        const errorMsg = response.message || "An unexpected error occurred.";
        setServerError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Network error. Please ensure the database is accessible.";
      setServerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { name: 'Profile', icon: User },
    { name: 'Details', icon: DollarSign },
    { name: 'Review', icon: CheckCircle2 }
  ];

  if (step === 4) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-white border-4 border-slate-900 rounded-[32px] shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] overflow-hidden text-center p-12">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-6 border-4 border-white shadow-lg">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Deployment Success</h2>
          <p className="text-slate-500 text-lg mb-8 leading-relaxed font-medium">
            The tenancy agreement has been materialized and the <span className="font-black text-slate-900 italic">Day One Transaction Vault</span> has been locked.
          </p>
          <div className="bg-slate-900 rounded-2xl p-8 mb-10 text-left border-b-4 border-indigo-600">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Master Ledger Reference</p>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lease Logical ID</p>
                <p className="font-mono text-white text-xs truncate opacity-80">{successData?.leaseId}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tenant Logical ID</p>
                <p className="font-mono text-white text-xs truncate opacity-80">{successData?.tenantId}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Link href="/tenants" className="bg-slate-900 text-white font-black px-8 py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-sm italic">
              Access Tenant Command Center
            </Link>
            <button onClick={() => { reset(); setStep(1); setSuccessData(null); }} className="text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-900 transition-colors">
              Onboard Another Identity
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-14 text-center">
        <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2 italic uppercase">Activation Wizard</h1>
        <p className="text-slate-500 font-black uppercase text-xs tracking-[0.3em] opacity-60">Enterprise Tenant Provisioning Engine v2</p>
      </div>

      {/* Brutalist Progress Stepper */}
      <div className="flex items-center justify-center mb-16 gap-4">
        {steps.map((s, i) => (
          <div key={s.name} className="flex items-center">
            <div className={`flex flex-col items-center relative ${step >= i + 1 ? 'text-slate-900' : 'text-slate-300'}`}>
              <div className={`w-14 h-14 rounded-2xl border-4 flex items-center justify-center mb-3 transition-all duration-300 shadow-sm ${step > i + 1 ? 'border-slate-900 bg-slate-900 text-white translate-y-[-4px] shadow-lg' : step === i + 1 ? 'border-indigo-600 bg-indigo-50 text-indigo-600 translate-y-[-4px] shadow-lg' : 'border-slate-100 bg-slate-50'}`}>
                {step > i + 1 ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className={`w-6 h-6 ${step === i + 1 ? 'animate-pulse' : ''}`} />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest absolute -bottom-6 whitespace-nowrap`}>{s.name}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-1 mx-2 bg-slate-100 rounded-full overflow-hidden`}>
                <div className={`h-full bg-slate-900 transition-all duration-500 ${step > i + 1 ? 'w-full' : 'w-0'}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white border-4 border-slate-900 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] rounded-[32px] overflow-hidden mt-12 min-h-[500px] flex flex-col transition-all duration-300">
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="p-10 flex-1">
            
            {step === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="mb-10">
                  <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Identity Registration</h2>
                  <p className="text-slate-500 font-medium">Provision the legal and institutional metadata for the occupant.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Legal Aggregate Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <User className="w-6 h-6 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                      </div>
                      <input 
                        {...register('tenantName')} 
                        className={`w-full bg-slate-50 border-2 ${errors.tenantName ? 'border-red-200 focus:border-red-500 bg-red-50' : 'border-slate-100 focus:border-slate-900 focus:bg-white'} rounded-[20px] pl-16 pr-6 py-6 text-2xl font-black italic transition-all outline-none placeholder:text-slate-200 text-slate-900`} 
                        placeholder="e.g. Johnathan Corporate"
                        autoFocus
                      />
                    </div>
                    {errors.tenantName && <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-widest flex items-center px-1"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.tenantName.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Institutional Email</label>
                    <input 
                      {...register('email')} 
                      className={`w-full bg-slate-50 border-2 ${errors.email ? 'border-red-200' : 'border-slate-100'} focus:border-slate-900 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold transition-all outline-none text-slate-900`} 
                      placeholder="tenant@domain.com"
                    />
                    {errors.email && <p className="text-red-500 text-[10px] mt-2 font-black uppercase px-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Telephonic Contact</label>
                    <input 
                      {...register('phone')} 
                      className={`w-full bg-slate-50 border-2 ${errors.phone ? 'border-red-200' : 'border-slate-100'} focus:border-slate-900 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold transition-all outline-none text-slate-900`} 
                      placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] mt-2 font-black uppercase px-1">{errors.phone.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">National ID / Passport / Registry No.</label>
                    <input 
                      {...register('nationalId')} 
                      className={`w-full bg-slate-50 border-2 ${errors.nationalId ? 'border-red-200' : 'border-slate-100'} focus:border-slate-900 focus:bg-white rounded-2xl px-6 py-5 text-lg font-black uppercase italic tracking-widest transition-all outline-none text-slate-900`} 
                      placeholder="SSN-XXX-000-000"
                    />
                    {errors.nationalId && <p className="text-red-500 text-[10px] mt-2 font-black uppercase px-1">{errors.nationalId.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="mb-10">
                  <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Lease Configuration</h2>
                  <p className="text-slate-500 font-medium">Define the spatial and economic boundaries of the occupancy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Asset Assignment (Vacant Inventory)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Home className="w-5 h-5 text-slate-300" />
                      </div>
                      <select 
                        {...register('unitId')} 
                        className={`w-full bg-slate-50 border-2 ${errors.unitId ? 'border-red-200' : 'border-slate-100'} focus:border-slate-900 focus:bg-white rounded-2xl pl-14 pr-10 py-5 text-lg font-black outline-none appearance-none cursor-pointer transition-all uppercase italic tracking-tighter text-slate-900`}
                      >
                        <option value="">-- Deploy to Unit --</option>
                        {units.map(u => (
                          <option key={u.id} value={u.id}>Unit {u.unitNumber} // {u.type} [READY]</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                        <ChevronRight className="w-5 h-5 text-slate-300 rotate-90" />
                      </div>
                    </div>
                    {isLoadingUnits && <p className="text-[10px] text-indigo-600 mt-2 animate-pulse font-black uppercase tracking-widest flex items-center"><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Pinging Unit Registry...</p>}
                    {errors.unitId && <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-widest flex items-center px-1"><AlertCircle className="w-3.5 h-3.5 mr-2" /> {errors.unitId.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Commencement Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Calendar className="w-5 h-5 text-slate-300" />
                      </div>
                      <input 
                        type="date" 
                        {...register('moveInDate')} 
                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-5 focus:border-slate-900 focus:bg-white transition-all outline-none font-black text-sm text-slate-900`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Monthly Subscription</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <DollarSign className="w-5 h-5 text-slate-300 font-black" />
                      </div>
                      <input 
                        type="number" 
                        {...register('baseRent', {valueAsNumber: true})} 
                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-5 focus:border-slate-900 focus:bg-white transition-all outline-none font-black text-xl italic text-slate-900`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Security Collateral (LRS)</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <ShieldCheck className="w-5 h-5 text-slate-300" />
                      </div>
                      <input 
                        type="number" 
                        {...register('securityDeposit', {valueAsNumber: true})} 
                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-5 focus:border-slate-900 focus:bg-white transition-all outline-none font-black text-xl italic text-slate-900`}
                        placeholder="00.00 (Collateral Held)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="mb-10">
                  <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Audit Projection</h2>
                  <p className="text-slate-500 font-medium">Verify the initial ledger entries before committing to the registry.</p>
                </div>

                <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border-b-8 border-indigo-600">
                  <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Transaction Manifest #V1</span>
                    <span className="text-[8px] bg-red-600 text-white px-2 py-1 rounded font-black uppercase tracking-widest">Awaiting Acid Lock</span>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-end border-b border-white/5 pb-6">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collateral Held</span>
                        <p className="text-sm text-white font-bold opacity-80 mt-1">Security Deposit (Full Tenure)</p>
                      </div>
                      <span className="text-2xl font-black text-white italic tracking-tighter">${prorationPreview?.securityDeposit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    
                    <div className="flex justify-between items-end border-b border-white/5 pb-6">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subscription Proration</span>
                        <p className="text-sm text-white font-bold opacity-80 mt-1">
                          Cycle Start: {watchedValues.moveInDate} // 
                          <span className="text-indigo-400 ml-1 italic">{prorationPreview?.remainingDays} Days Active</span>
                        </p>
                      </div>
                      <span className="text-2xl font-black text-white italic tracking-tighter">${prorationPreview?.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <span className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em]">Aggregate Liquid Requirement</span>
                      <span className="text-4xl font-black text-white italic tracking-tighter">${prorationPreview?.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-indigo-50 border-2 border-indigo-100 rounded-3xl text-indigo-900 text-xs font-bold leading-relaxed flex gap-4">
                  <AlertCircle className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                  <p>
                    <span className="block uppercase tracking-widest text-[10px] mb-1">Structural Notice</span>
                    By engaging 'Finalize Tenancy', you execute an atomic database sequence. This will provision the Tenant Identity, materialize the Lease Bridge, and populate the Master Ledger with the above liabilities instantly.
                  </p>
                </div>

                {serverError && (
                  <div className="p-6 bg-red-50 border-4 border-red-900 rounded-3xl text-red-950 text-xs font-black uppercase tracking-widest flex items-center animate-in shake duration-300 shadow-xl">
                    <AlertTriangle className="w-8 h-8 mr-4 flex-shrink-0" />
                    {serverError}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Brutalist Action Toolbar */}
          <div className="p-8 bg-slate-50 border-t-4 border-slate-900 flex justify-between items-center sticky bottom-0">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={prevStep} 
                className="flex items-center text-slate-400 font-black text-[10px] px-6 py-4 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all uppercase tracking-[0.2em]"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Reverse
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="bg-slate-900 text-white font-black text-xs px-12 py-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(15,23,42,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center uppercase tracking-[0.2em] italic"
              >
                Proceed <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-indigo-600 text-white font-black text-xs px-14 py-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(49,46,129,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center uppercase tracking-[0.2em] italic"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Mutating Ledger...
                  </>
                ) : (
                  <>
                    Finalize Tenancy <CheckCircle2 className="w-5 h-5 ml-3" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
      
      <p className="text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.4em] mt-12 mb-20 opacity-40">
        Enterprise Ledger Engine v2.0 // Secured by prisma-transactional-logic
      </p>
    </div>
  )
}
