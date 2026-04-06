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
    <div className="flex items-center justify-center min-h-screen bg-background p-6 animate-in fade-in duration-1000 selection:bg-primary/10">
      <Card variant="default" className="w-full max-w-md p-10 border-border rounded-[12px] animate-in zoom-in-95 duration-700 bg-card">
        <div className="space-y-10">
          <div className="text-center space-y-6">
             <div className="w-16 h-16 bg-card border border-border rounded-[12px] flex items-center justify-center mx-auto mb-8 transition-none shadow-sm">
                <Zap className="w-8 h-8 text-primary fill-primary" />
             </div>
             <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase leading-none">Mercury <span className="text-muted-foreground font-normal">OS</span></h1>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-4 leading-relaxed">Enterprise Financial Terminal</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Identity Protocol</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 rounded-[8px] text-[15px] font-bold border-border focus:border-primary bg-muted/50" 
                    placeholder="admin@mercury.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Cipher</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 rounded-[8px] text-[15px] font-bold border-border focus:border-primary bg-muted/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-[8px] border border-red-500/20 text-center text-[11px] font-bold uppercase tracking-widest animate-in shake duration-500">
                {error}
              </div>
            )}

            <Button 
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full h-12 rounded-full text-[14px] font-bold uppercase tracking-[0.2em] bg-primary hover:bg-primary/95 text-foreground border-none mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Authorize Session <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-10 border-t border-border flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> V.3.2 Secure Pipeline</span>
            <span>Ref: 0xMERCURY</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
