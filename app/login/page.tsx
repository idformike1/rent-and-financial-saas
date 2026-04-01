'use client'

import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = () => {
    // Set a mock auth cookie for development testing
    document.cookie = "auth-session=mock-token; path=/; max-age=3600"
    
    // Redirect to the main dashboard
    router.push('/treasury')
    router.refresh()
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm p-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">WELCOME</h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">SIGN IN TO ACCESS THE ENGINE</p>
        </div>
        
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs leading-relaxed text-amber-800 dark:text-amber-200/80 italic">
          &quot;This is a secure mock login for performance and integration testing. In the final production environment, this is replaced by the hardened identity provider.&quot;
        </div>

        <button 
          onClick={handleLogin}
          className="relative group w-full overflow-hidden rounded-xl bg-zinc-950 px-8 py-4 transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:hover:bg-zinc-200"
        >
          <span className="relative z-10 font-bold uppercase tracking-widest text-zinc-50 dark:text-zinc-950">
            Sign In
          </span>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>

        <div className="pt-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-tighter text-zinc-400 dark:text-zinc-600">
            Security Hardening: Active
          </p>
        </div>
      </div>
    </div>
  )
}
