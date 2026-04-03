'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Landmark, Users, Building, FileText, Search, Activity, LogOut, Shield, ChevronRight, ShieldAlert, Zap } from 'lucide-react'
import { toast } from '@/lib/toast'
import { globalSearch, SearchResult } from '@/actions/search.actions'

const navigation = [
  { name: 'Dashboard', href: '/treasury', icon: Landmark },
  { name: 'Properties', href: '/properties', icon: Building },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Onboarding', href: '/onboarding', icon: Search },
  { name: 'Expenses', href: '/expenses', icon: FileText },
  { name: 'Intelligence Hub', href: '/reports', icon: Activity },
  { name: 'Finance Translation', href: '/reports/financial-connections', icon: Shield },
  { name: 'Waterfall Analytics', href: '/reports/ledger-waterfall', icon: Zap },
  { name: 'Master Ledger', href: '/reports/master-ledger', icon: FileText },
  { name: 'Team', href: '/settings/team', icon: Users },
  { name: 'Audit Logs', href: '/settings/audit', icon: ShieldAlert },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

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
      if (segment === 'treasury') return 'Dashboard';
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })

  return (
    <div className="flex h-screen bg-white font-mono">
      {/* Sidebar - Brutalist Style */}
      <div className="w-72 bg-black border-r-4 border-black flex flex-col hidden md:flex text-white p-6 justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-white pb-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-white" />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-tighter opacity-50">Organization Unit</span>
                <span className="text-xl font-bold tracking-tighter uppercase leading-none truncate max-w-[180px]">
                  {session?.user?.organizationName || 'SYSTEM_INIT'}
                </span>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              if ((item.name === 'Team' || item.name === 'Audit Logs') && session?.user?.role !== 'OWNER') return null;
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-black uppercase tracking-widest transition-all ${
                    isActive
                      ? 'bg-white text-black translate-x-1 translate-y-1'
                      : 'hover:bg-zinc-800'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t-2 border-zinc-800">
          <div className="flex flex-col gap-1 px-4">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Operator</span>
            <span className="text-sm font-bold truncate">{session?.user?.name || 'ADMIN'}</span>
            <span className="text-[10px] text-zinc-500 font-bold italic">{session?.user?.role}</span>
          </div>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center w-full px-4 py-3 text-xs font-black uppercase tracking-tighter hover:bg-red-600 transition-colors border-2 border-zinc-800"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Termination Protocol
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b-4 border-black bg-white">
          <div className="flex items-center text-xs font-black uppercase tracking-widest flex-1 relative">
            {isSearchOpen ? (
              <div className="flex-1 max-w-md animate-in fade-in slide-in-from-left-2 transition-all">
                <input 
                  autoFocus
                  type="text"
                  placeholder="SEARCH PROTOCOL: ENTER QUERY..."
                  className="w-full bg-zinc-100 border-2 border-black px-4 py-1 text-[10px] font-black focus:outline-none focus:bg-white transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && suggestions.length > 0) {
                       window.location.href = suggestions[0].href;
                       setIsSearchOpen(false);
                       setSearchQuery('');
                    }
                    if (e.key === 'Escape') setIsSearchOpen(false);
                  }}
                />
                
                {/* Search Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute top-10 left-0 w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden divide-y-2 divide-zinc-100 animate-in slide-in-from-top-2">
                    <div className="bg-black text-white px-3 py-1 flex items-center justify-between">
                      <span className="text-[8px] font-black tracking-widest">GLOBAL SYSTEMS INDEX</span>
                      <span className="text-[8px] opacity-50">{suggestions.length} MATCHES</span>
                    </div>
                    {suggestions.map((result) => (
                      <Link
                        key={result.id}
                        href={result.href}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-3 hover:bg-zinc-50 transition-colors group"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <span className="text-[8px] font-black bg-zinc-200 px-1 rounded">{result.type}</span>
                             <span className="text-xs font-black group-hover:text-indigo-600 truncate max-w-[200px]">{result.title}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-bold mt-0.5">{result.subtitle}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                    <div className="bg-zinc-50 p-2 text-[8px] font-black text-center text-zinc-300 uppercase tracking-widest">
                      Press Escape to close scan terminal
                    </div>
                  </div>
                )}
              </div>
            ) : (
              breadcrumbs.length > 0 ? (
                breadcrumbs.map((crumb, index) => (
                  <span key={index} className="flex items-center">
                    {index > 0 && <span className="mx-3 opacity-30">//</span>}
                    <span className={index === breadcrumbs.length - 1 ? "bg-black text-white px-2 py-0.5" : "text-zinc-500"}>
                      {crumb}
                    </span>
                  </span>
                ))
              ) : (
                <span className="bg-black text-white px-2 py-0.5">Dashboard</span>
              )
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center text-[10px] font-black text-zinc-400 gap-2 px-3 py-1 border-2 border-zinc-100 rounded">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              SYSTEM SECURE
            </div>
            
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 ${isSearchOpen ? 'bg-black text-white' : 'bg-white text-black hover:bg-zinc-100'}`}
            >
              <Search className="h-5 w-5 font-black" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-zinc-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
