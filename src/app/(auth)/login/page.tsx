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
        router.push('/home')
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
      <Card variant="default" className="w-full max-w-md p-6 border-border rounded-[12px] animate-in zoom-in-95 duration-700 bg-card">
        <div className="space-y-10">
          <div className="text-center space-y-4">
             <div className="w-12 h-12 bg-foreground rounded-[10px] flex items-center justify-center mx-auto mb-6 transition-none">
                <span className="text-background font-bold text-xl">M</span>
             </div>
             <div>
                <h1 className="text-[20px] font-medium tracking-tight text-foreground leading-none">Mercury Alpha</h1>
                <p className="text-[13px] font-medium text-muted-foreground mt-3 leading-relaxed">System login required for terminal access.</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-medium text-muted-foreground ml-1">Email address</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50">[E]</span>
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-[38px] rounded-[8px] text-[13px] font-medium border-border focus:border-foreground/20 bg-muted" 
                    placeholder="Enter email..."
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[11px] font-medium text-muted-foreground ml-1">Password</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50">[P]</span>
                  <Input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-[38px] rounded-[8px] text-[13px] font-medium border-border focus:border-foreground/20 bg-muted"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-[8px] border border-red-500/20 text-center text-[11px] font-bold  animate-in shake duration-500">
                {error}
              </div>
            )}

            <Button 
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              variant="primary"
              className="w-full h-[38px] rounded-[6px] text-[13px] font-medium border-none mt-2"
            >
              {isLoading ? "Authenticating..." : "Sign In →"}
            </Button>
          </form>

          <div className="pt-10 border-t border-border flex justify-between items-center text-[10px] font-bold text-muted-foreground ">
            <span className="flex items-center gap-2 font-medium">(✓) V.3.2 Secure Pipeline</span>
            <span>Ref: 0xMERCURY</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
