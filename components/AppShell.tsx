'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  Landmark, 
  Users, 
  Building, 
  FileText, 
  Search, 
  Activity, 
  LogOut, 
  ShieldCheck, 
  ChevronRight, 
  ShieldAlert, 
  Zap,
  LayoutDashboard,
  Bell,
  Menu,
  X
} from 'lucide-react'
import { toast } from '@/lib/toast'
import { globalSearch, SearchResult } from '@/actions/search.actions'
import { Button, Input, Badge, Card } from '@/components/ui-finova'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Onboarding', href: '/onboarding', icon: Search },
  { name: 'Expenses', href: '/expenses', icon: FileText },
  { name: 'Intelligence Hub', href: '/reports', icon: Activity },
  { name: 'Finance Translation', href: '/reports/financial-connections', icon: ShieldCheck },
  { name: 'Waterfall Analytics', href: '/reports/ledger-waterfall', icon: Zap },
  { name: 'Governance', href: '/settings/categories', icon: ShieldAlert },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);

  useEffect(() => {
    const fetchSearch = async () => {
      if (searchQuery.length >= 3) {
        const results = await globalSearch(searchQuery);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    };

    const timer = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (pathname === '/login') {
    return <>{children}</>
  }

  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map(segment => {
      if (segment === 'dashboard') return 'Treasury';
      if (segment === 'categories') return 'Governance';
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950 font-sans text-slate-900 dark:text-white">
      
      {/* SIDEBAR: FINOVA PREMIUM STANDARD */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-surface-900 border-r border-slate-100 dark:border-surface-800 flex flex-col transition-transform duration-300 transform lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* ORGANIZATION IDENTITY */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
               <Zap className="w-6 h-6 text-brand fill-brand" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Axiom Finova</span>
              <span className="text-lg font-black tracking-tighter uppercase leading-none truncate dark:text-white mt-1">
                {session?.user?.organizationName || 'Master Unit'}
              </span>
            </div>
          </div>

          <nav className="space-y-1.5 font-medium">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 text-[11px] font-bold uppercase tracking-widest rounded-2xl transition-all ${
                    isActive
                      ? 'bg-brand text-white shadow-premium'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-surface-800'
                  }`}
                >
                  <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* ACCOUNT ACTION REGISTRY */}
        <div className="mt-auto p-8 pt-6 border-t border-slate-100 dark:border-surface-800 space-y-4">
          <div className="flex items-center gap-4 px-2">
            <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center font-black text-xs text-brand">
               {session?.user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
               <span className="text-xs font-bold truncate text-slate-900 dark:text-white">{session?.user?.name || 'Administrator'}</span>
               <Badge className="text-[9px] w-fit px-1.5 py-0 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">{session?.user?.role || 'Operator'}</Badge>
            </div>
          </div>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Terminate Protocol
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT COMMANDER */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 bg-surface-50 dark:bg-surface-950">
        
        {/* HEADER: DYNAMIC BREADCRUMB & SCAN */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-slate-100 dark:border-surface-800 bg-white dark:bg-surface-900 sticky top-0 z-40">
          
          <div className="flex items-center gap-6">
            <button 
              className="lg:hidden p-2 text-slate-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            
            <div className="hidden md:flex items-center text-[10px] font-black uppercase tracking-[0.3em] overflow-hidden whitespace-nowrap">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <span className="mx-4 text-slate-200 dark:text-slate-700">/</span>}
                  <span className={index === breadcrumbs.length - 1 ? "text-brand" : "text-slate-400"}>
                    {crumb}
                  </span>
                </span>
              ))}
              {breadcrumbs.length === 0 && <span className="text-brand">Infrastructure</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-6 flex-1 justify-end max-w-2xl px-6">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand transition-colors" />
              <input 
                type="text"
                placeholder="Scan Registry..."
                className="w-full bg-slate-50 dark:bg-surface-800 border border-slate-100 dark:border-surface-700 rounded-2xl pl-12 pr-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {/* SCAN RESULTS DROP-OFF */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-4 bg-white dark:bg-surface-900 border border-slate-100 dark:border-surface-800 shadow-premium-lg rounded-2xl z-50 overflow-hidden divide-y divide-slate-50 dark:divide-surface-800 animate-in slide-in-from-top-2">
                  <div className="p-4 flex items-center justify-between bg-surface-50 dark:bg-surface-950">
                    <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Matched Records</span>
                    <Badge variant="success" className="text-[8px]">{suggestions.length} Signals</Badge>
                  </div>
                  {suggestions.map((result) => (
                    <Link
                      key={result.id}
                      href={result.href}
                      onClick={() => setSearchQuery('')}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors group"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <span className="text-[8px] font-black text-brand uppercase tracking-widest">{result.type}</span>
                           <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{result.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">{result.subtitle}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-brand transition-transform group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-xl text-slate-400 hover:text-brand transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full border-2 border-white dark:border-surface-900" />
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT DOMAIN */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
