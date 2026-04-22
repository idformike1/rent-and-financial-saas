'use client'

import React from 'react'
import Link from 'next/link'
import { Wallet, Shield, TrendingUp, Landmark } from 'lucide-react'

const HOLDINGS_DATA = [
  { id: '1', name: 'Primary Savings', type: 'Cash', balance: 125000.50, change: '+2.4%', institution: 'Chase', icon: Wallet },
  { id: '2', name: 'Growth Index Fund', type: 'Investment', balance: 450000.00, change: '+12.1%', institution: 'Vanguard', icon: TrendingUp },
  { id: '3', name: 'Term Life Policy', type: 'Insurance', balance: 1000000.00, change: '0.0%', institution: 'MetLife', icon: Shield },
  { id: '4', name: 'Offshore Reserve', type: 'Cash', balance: 85200.00, change: '-0.5%', institution: 'HSBC', icon: Landmark },
]

export default function HoldingsMatrix() {
  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-border/50 bg-white/5 flex justify-between items-center">
        <h3 className="text-xs font-bold text-clinical-muted uppercase tracking-widest">Holdings Matrix</h3>
        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold">LIVE SYNC</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/30">
              <th className="px-6 py-3 text-[10px] font-bold text-clinical-muted uppercase tracking-tighter">Asset / Account</th>
              <th className="px-6 py-3 text-[10px] font-bold text-clinical-muted uppercase tracking-tighter">Type</th>
              <th className="px-6 py-3 text-[10px] font-bold text-clinical-muted uppercase tracking-tighter text-right">Balance</th>
              <th className="px-6 py-3 text-[10px] font-bold text-clinical-muted uppercase tracking-tighter text-right">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {HOLDINGS_DATA.map((item) => (
              <tr key={item.id} className="hover:bg-white/10 transition-colors group cursor-pointer relative">
                <td className="px-6 py-4">
                  <Link href={`/wealth/accounts/${item.id}`} className="absolute inset-0 z-10" />
                  <div className="flex items-center gap-3 relative z-0">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                        <item.icon className="w-4 h-4 text-clinical-muted group-hover:text-amber-500 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-[10px] text-clinical-muted uppercase tracking-widest">{item.institution}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] border border-border/50 px-2 py-0.5 rounded-md text-clinical-muted font-medium">
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-sm font-mono font-bold text-white">${item.balance.toLocaleString()}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-[11px] font-bold ${item.change.startsWith('+') ? 'text-mercury-green' : item.change === '0.0%' ? 'text-clinical-muted' : 'text-destructive'}`}>
                    {item.change}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
