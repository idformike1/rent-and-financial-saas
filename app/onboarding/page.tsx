'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { submitOnboarding } from '@/actions/onboarding.actions'

const onboardingSchema = z.object({
  tenantName: z.string().min(2, "Name requires at least 2 characters"),
  unitId: z.string().uuid("Please specify a valid unit ID"),
  baseRent: z.number().positive("Rent must be greater than 0"),
  securityDeposit: z.number().min(0, "Cannot be negative"),
  moveInDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid Date" })
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState('');

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      tenantName: '',
      unitId: '', // To be filled by mock data for testing
      baseRent: 1500,
      securityDeposit: 1500,
      moveInDate: new Date().toISOString().split('T')[0]
    }
  });

  const handleNext = async () => {
    let valid = false;
    if (step === 1) valid = await trigger(['tenantName']);
    if (step === 2) valid = await trigger(['unitId', 'baseRent', 'securityDeposit', 'moveInDate']);
    
    if (valid) setStep(step + 1);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    setServerMsg('');
    const response = await submitOnboarding(data);
    
    if (response.success) {
      setServerMsg(`Success! Day One Transaction completed. Tenant ID: ${response.data.tenantId}`);
      setStep(4);
    } else {
      setServerMsg(`Error: ${response.message}`);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-white shadow rounded-lg border border-slate-200">
      <h1 className="text-2xl font-bold mb-6">Tenant Onboarding Engine</h1>

      {/* Progress */}
      <div className="flex space-x-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-2 rounded ${step >= s ? 'bg-slate-900' : 'bg-slate-200'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 1: Profile</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input {...register('tenantName')} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
              {errors.tenantName && <p className="text-red-500 text-sm mt-1">{errors.tenantName.message}</p>}
            </div>
            <button type="button" onClick={handleNext} className="bg-slate-900 text-white px-4 py-2 rounded">Next Step</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 2: Lease Details</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700">Unit ID (UUID)</label>
              <input {...register('unitId')} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="Enter a valid Unit UUID" />
              {errors.unitId && <p className="text-red-500 text-sm mt-1">{errors.unitId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Base Rent ($)</label>
              <input type="number" {...register('baseRent', {valueAsNumber: true})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
              {errors.baseRent && <p className="text-red-500 text-sm mt-1">{errors.baseRent.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Security Deposit ($)</label>
              <input type="number" {...register('securityDeposit', {valueAsNumber: true})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
              {errors.securityDeposit && <p className="text-red-500 text-sm mt-1">{errors.securityDeposit.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Move-in Date</label>
              <input type="date" {...register('moveInDate')} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
              {errors.moveInDate && <p className="text-red-500 text-sm mt-1">{errors.moveInDate.message}</p>}
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="bg-slate-200 text-slate-800 px-4 py-2 rounded">Back</button>
              <button type="button" onClick={handleNext} className="bg-slate-900 text-white px-4 py-2 rounded">Review</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 3: Day One Transaction</h2>
            <p className="text-sm text-slate-600">The engine will calculate prorated rent based on the move-in date and bind the initial charges to the Ledger.</p>
            
            {serverMsg && <p className="text-red-500 font-medium">{serverMsg}</p>}

            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(2)} className="bg-slate-200 text-slate-800 px-4 py-2 rounded">Back</button>
              <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white px-4 py-2 rounded shadow flex items-center">
                {isSubmitting ? 'Processing ACID Tx...' : 'Finalize Onboarding'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-green-600 mb-2">Onboarding Complete</h2>
            <p className="text-slate-600">{serverMsg}</p>
          </div>
        )}
      </form>
    </div>
  )
}
