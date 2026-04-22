import { 
  Home, 
  Users, 
  List, 
  Database, 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  ArrowLeftRight,
  Activity,
  BarChart3,
  Zap,
  Settings
} from 'lucide-react'

export type WorkspaceMode = 'PROPERTY' | 'WEALTH'

export const WORKSPACE_CONFIG = {
  PROPERTY: {
    mode: 'PROPERTY' as WorkspaceMode,
    dashboardTitle: 'Operational Command',
    badgeText: 'Property Management',
    theme: 'mercury-clinical',
    menuItems: [
      {
        label: 'COMMAND',
        items: [
          { name: 'Dashboard', href: '/home', icon: Home },
          { name: 'Tenancy Registry', href: '/tenants', icon: Users },
          { name: 'Treasury Feed', href: '/treasury/feed', icon: List },
          { name: 'Governance Ledger', href: '/governance/ledger', icon: Database },
        ]
      },
      {
          label: 'INTELLIGENCE',
          items: [
            { name: 'Insights', href: '/reports/insights', icon: Activity },
            { name: 'Market Reports', href: '/reports', icon: BarChart3 },
          ]
      },
      {
          label: 'ADMINISTRATION',
          items: [
              { name: 'System Registry', href: '/settings/registry', icon: Settings },
          ]
      }
    ]
  },
  WEALTH: {
    mode: 'WEALTH' as WorkspaceMode,
    dashboardTitle: 'Analytical Cockpit',
    badgeText: 'Wealth Portfolio',
    theme: 'sovereign-noble',
    menuItems: [
      {
        label: 'WEALTH HUB',
        items: [
          { name: 'Wealth Cockpit', href: '/home', icon: Home },
          { name: 'Insights', href: '/reports/insights', icon: LayoutDashboard },
          { name: 'Accounts Matrix', href: '/wealth/accounts', icon: Wallet },
          { name: 'Cash Flow Insights', href: '/wealth/cash-flow', icon: TrendingUp },
          { name: 'Allowances & Transfers', href: '/wealth/transfers', icon: ArrowLeftRight },
        ]
      },
      {
          label: 'SYSTEM',
          items: [
              { name: 'Master Ledger', href: '/treasury', icon: List },
              { name: 'Ledger Explorer', href: '/governance/ledger', icon: Database },
              { name: 'Internal Audit', href: '/settings/audit', icon: Database },
              { name: 'System Registry', href: '/settings/registry', icon: Settings },
          ]
      }
    ]
  }
}
