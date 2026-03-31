'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Landmark, Users, Building, FileText, Search } from 'lucide-react'

const navigation = [
  { name: 'Treasury', href: '/treasury', icon: Landmark },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Properties', href: '/properties', icon: Building },
  { name: 'Master Ledger', href: '/reports/master-ledger', icon: FileText },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/login') {
    return <>{children}</>
  }

  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Landmark className="h-6 w-6 text-slate-900 mr-2" />
          <span className="font-semibold text-slate-900 tracking-tight">TREASURY</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-slate-200 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white">
          <div className="flex items-center text-sm text-slate-500">
            {breadcrumbs.length > 0 ? (
              breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  <span className={index === breadcrumbs.length - 1 ? "font-medium text-slate-900" : ""}>
                    {crumb}
                  </span>
                </span>
              ))
            ) : (
              // Default breadcrumb if at root
              <span className="font-medium text-slate-900">Dashboard</span>
            )}
          </div>
          
          <div className="flex items-center">
            {/* Command Bar Placeholder */}
            <button className="flex items-center text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-100 transition-colors">
              <Search className="h-4 w-4 mr-2" />
              <span>Search...</span>
              <kbd className="ml-4 font-sans text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5">⌘K</kbd>
            </button>
          </div>
        </header>

        {/* Page Content with Wide Gutter */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
