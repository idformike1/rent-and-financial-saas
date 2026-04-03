'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Zap, ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { Card, Button, Input, Badge } from '@/components/ui-finova'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials. Access restricted.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('System authentication failure.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <Card className="w-full max-w-md p-10 border-none shadow-premium-lg rounded-[2.5rem] bg-white dark:bg-slate-900 animate-in fade-in zoom-in duration-500">
        <div className="space-y-8">
          <div className="text-center space-y-3">
             <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform hover:scale-110">
                <Zap className="w-8 h-8 text-brand fill-brand" />
             </div>
             <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Axiom <br/><span className="text-brand">Finova</span></h1>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Enterprise SaaS Terminal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity Protocol</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand transition-colors" />
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 rounded-xl py-4 focus:ring-brand focus:border-transparent transition-all" 
                    placeholder="admin@axiom.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Cipher</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand transition-colors" />
                  <Input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 rounded-xl py-4 focus:ring-brand focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 p-4 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-center text-xs font-bold uppercase tracking-wider animate-in shake duration-300">
                {error}
              </div>
            )}

            <Button 
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full h-14 rounded-2xl text-lg font-black uppercase italic tracking-tighter shadow-premium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Authorize Session <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> V.3.1 Secure Pipeline</span>
            <span>Ref: 0xFINOVA</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
