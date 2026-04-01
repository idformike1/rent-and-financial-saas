'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { submitOnboarding } from '@/actions/onboarding.actions'
import { getAvailableUnits } from '@/actions/unit.actions'
import { User, Home, DollarSign, Calendar, ChevronRight, ChevronLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const onboardingSchema = z.object({
  tenantName: z.string().min(2, "Full name is required (min 2 chars)"),
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
      unitId: '',
      baseRent: 1200,
      securityDeposit: 1200,
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
    if (step === 1) fieldsToValidate = ['tenantName'];
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
        setSuccessData(response.data);
        setStep(4);
      } else {
        setServerError(response.message || "An unexpected error occurred.");
      }
    } catch (err) {
      setServerError("Network error. Please ensure the database is accessible.");
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
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-center p-12">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Onboarding Complete</h2>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            The tenancy agreement has been materialized and the <strong>Day One Transaction</strong> has been posted to the ledger effectively.
          </p>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 mb-10 text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Internal Record Mapping</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Lease Reference</p>
                <p className="font-mono text-slate-900 font-medium truncate">{successData?.leaseId}</p>
              </div>
              <div>
                <p className="text-slate-500">Tenant Reference</p>
                <p className="font-mono text-slate-900 font-medium truncate">{successData?.tenantId}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tenants" className="bg-slate-900 text-white font-medium px-8 py-3 rounded-lg shadow-sm hover:bg-slate-800 transition-all">
              Go to Records
            </Link>
            <button onClick={() => { reset(); setStep(1); setSuccessData(null); }} className="bg-white text-slate-600 border border-slate-200 font-medium px-8 py-3 rounded-lg hover:bg-slate-50 transition-all">
              Onboard Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Tenancy Activation Engine</h1>
        <p className="text-slate-500 text-lg">Deploy a new occupant and initialize fiscal ledger records.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center mb-12">
        {steps.map((s, i) => (
          <div key={s.name} className="flex items-center">
            <div className={`flex flex-col items-center relative ${step > i + 1 ? 'text-indigo-600' : step === i + 1 ? 'text-slate-900' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-300 ${step >= i + 1 ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white'}`}>
                {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className={`w-5 h-5 ${step === i + 1 ? 'animate-pulse' : ''}`} />}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest absolute -bottom-5 whitespace-nowrap`}>{s.name}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-24 h-0.5 mx-2 bg-slate-200 relative`}>
                <div className={`absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-500 ${step > i + 1 ? 'w-full' : 'w-0'}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden mt-12 min-h-[460px] flex flex-col transition-all duration-300">
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="p-8 flex-1">
            
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900">Occupant Profile</h2>
                  <p className="text-slate-500 text-sm">Capture the primary identity of the new tenant.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="relative group">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 transition-colors group-focus-within:text-indigo-600">Legal Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-400" />
                      <input 
                        {...register('tenantName')} 
                        className={`w-full bg-slate-50 border-2 ${errors.tenantName ? 'border-red-200 focus:border-red-500 bg-red-50' : 'border-slate-100 focus:border-slate-900 focus:bg-white'} rounded-xl pl-12 pr-4 py-4 text-lg transition-all outline-none font-medium placeholder:text-slate-300`} 
                        placeholder="e.g. John Doe"
                        autoFocus
                      />
                    </div>
                    {errors.tenantName && <p className="text-red-500 text-xs mt-2 font-bold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.tenantName.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Lease Configuration</h2>
                    <p className="text-slate-500 text-sm">Define the spatial and economic boundaries.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Asset Assignment</label>
                    <div className="relative">
                      <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 active:text-indigo-400" />
                      <select 
                        {...register('unitId')} 
                        className={`w-full bg-slate-50 border-2 ${errors.unitId ? 'border-red-200' : 'border-slate-100'} focus:border-slate-900 focus:bg-white rounded-xl pl-12 pr-4 py-4 text-base font-medium appearance-none transition-all outline-none cursor-pointer`}
                      >
                        <option value="">-- Select Available Unit --</option>
                        {units.map(u => (
                          <option key={u.id} value={u.id}>Unit {u.unitNumber} - {u.type} (Operational)</option>
                        ))}
                      </select>
                    </div>
                    {isLoadingUnits && <p className="text-xs text-indigo-500 mt-2 animate-pulse flex items-center font-medium"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Querying unit register...</p>}
                    {errors.unitId && <p className="text-red-500 text-xs mt-2 font-bold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.unitId.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Effective Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        type="date" 
                        {...register('moveInDate')} 
                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-12 pr-4 py-4 focus:border-slate-900 focus:bg-white transition-all outline-none font-medium`}
                      />
                    </div>
                    {errors.moveInDate && <p className="text-red-500 text-xs mt-2 font-bold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.moveInDate.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Base Monthly Rent</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 font-bold">$</div>
                      <input 
                        type="number" 
                        {...register('baseRent', {valueAsNumber: true})} 
                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-12 pr-4 py-4 focus:border-slate-900 focus:bg-white transition-all outline-none font-medium`}
                      />
                    </div>
                    {errors.baseRent && <p className="text-red-500 text-xs mt-2 font-bold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.baseRent.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Security Deposit</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 font-bold">$</div>
                      <input 
                        type="number" 
                        {...register('securityDeposit', {valueAsNumber: true})} 
                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-12 pr-4 py-4 focus:border-slate-900 focus:bg-white transition-all outline-none font-medium`}
                      />
                    </div>
                    {errors.securityDeposit && <p className="text-red-500 text-xs mt-2 font-bold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.securityDeposit.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900">Financial Projection</h2>
                  <p className="text-slate-500 text-sm">Review the initial ledger entries before final commitment.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                  <div className="px-6 py-4 bg-slate-100/50 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scheduled Transaction Bundle</span>
                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold uppercase">Pending Acid Tx</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium font-medium">Security Deposit (Full)</span>
                      <span className="text-slate-900 font-bold">${prorationPreview?.securityDeposit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-slate-600 font-medium">Prorated Month 1 Rent</span>
                        <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-tighter">
                          {prorationPreview?.remainingDays} / {prorationPreview?.daysInMonth} Days remaining
                        </p>
                      </div>
                      <span className="text-slate-900 font-bold">${prorationPreview?.amount.toFixed(2)}</span>
                    </div>
                    <div className="pt-4 border-t-2 border-slate-200 flex justify-between items-center">
                      <span className="text-slate-900 font-extrabold text-lg uppercase tracking-tight">Day One Total Due</span>
                      <span className="text-indigo-600 font-extrabold text-2xl">${prorationPreview?.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-medium leading-relaxed">
                  <p className="flex items-start">
                    <AlertCircle className="w-3.5 h-3.5 mr-2 mt-0.5 flex-shrink-0" />
                    By Finalizing, the system will execute a database transaction creating the Tenant, the Lease, and mapping these charges to the Master Ledger instantly.
                  </p>
                </div>

                {serverError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold flex items-center animate-in shake duration-300">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    {serverError}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Action Toolbar */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center sticky bottom-0">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={prevStep} 
                className="flex items-center text-slate-500 font-bold text-sm px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors uppercase tracking-widest"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="bg-slate-900 text-white font-bold text-sm px-10 py-4 rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center uppercase tracking-widest"
              >
                Forward <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-indigo-600 text-white font-bold text-sm px-12 py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center uppercase tracking-widest"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing ACID Tx
                  </>
                ) : (
                  <>
                    Finalize Tenancy <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
      
      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-8">
        Enterprise Ledger Engine v2.0 // Secured by prisma-transactional-logic
      </p>
    </div>
  )
}
