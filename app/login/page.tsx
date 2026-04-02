'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('INVALID CREDENTIALS: ACCESS DENIED')
      } else {
        router.push('/treasury')
        router.refresh()
      }
    } catch (err) {
      setError('SYSTEM ERROR: PLEASE RETRY')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white selection:bg-white selection:text-black font-mono">
      <div className="w-full max-w-md p-10 border-4 border-white shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
        <div className="space-y-6">
          <div className="border-b-4 border-white pb-6">
            <h1 className="text-6xl font-black italic tracking-tighter">LOGIN</h1>
            <p className="text-sm font-bold uppercase tracking-widest mt-2">Enterprise SaaS Instance: 0xREKCAL</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest">Protocol Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border-2 border-white p-4 text-xl focus:bg-white focus:text-black outline-none transition-colors placeholder:text-zinc-700" 
                  placeholder="admin@system.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest">Access Cipher</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border-2 border-white p-4 text-xl focus:bg-white focus:text-black outline-none transition-colors placeholder:text-zinc-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-600 p-4 border-2 border-white font-black text-center text-sm">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-white text-black p-6 text-2xl font-black uppercase tracking-wide hover:bg-zinc-200 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.4)]"
            >
              INITIALIZE SESSION
            </button>
          </form>

          <div className="pt-6 border-t border-zinc-800 flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <span>Security: HARDENED</span>
            <span>Version: 7.6.0-ENTERPRISE</span>
          </div>
        </div>
      </div>
    </div>
  )
}
