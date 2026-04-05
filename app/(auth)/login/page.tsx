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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-1000">
      <Card variant="glass" className="w-full max-w-md p-12 border-none shadow-premium-lg rounded-[3.5rem] animate-in zoom-in-95 duration-700">
        <div className="space-y-10">
          <div className="text-center space-y-4">
             <div className="w-20 h-20 bg-brand/10 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all hover:rotate-12 hover:scale-110 shadow-premium">
                <Zap className="w-10 h-10 text-brand fill-brand" />
             </div>
             <h1 className="text-5xl font-black italic tracking-tighter text-foreground dark:text-white uppercase leading-none">Axiom <br/><span className="text-brand">Finova</span></h1>
             <p className="text-[10px] font-black uppercase tracking-[0.45em] text-slate-400 mt-4 leading-relaxed">Enterprise SaaS Terminal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Identity Protocol</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-16 h-16 rounded-3xl text-lg font-black italic tracking-tighter" 
                    placeholder="admin@axiom.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Access Cipher</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                  <Input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-16 h-16 rounded-3xl text-base font-black tracking-widest"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-5 rounded-3xl text-center text-[10px] font-black uppercase tracking-widest animate-in shake duration-500">
                {error}
              </div>
            )}

            <Button 
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full h-16 rounded-3xl text-xl font-black uppercase italic tracking-tighter shadow-premium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Authorize Session <ArrowRight className="w-6 h-6 ml-3" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-10 border-t border-border dark:border-slate-800/50 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> V.3.1 Secure Pipeline</span>
            <span>Ref: 0xFINOVA</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
