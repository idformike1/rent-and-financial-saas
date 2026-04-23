'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronDown,
  ArrowUpRight, X, DollarSign, Wallet, Layers,
  Database, Tag, LayoutGrid, Building2, Users, ArrowDownLeft, Download,
  FileText, FileSpreadsheet, FileBox
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui-finova'
import InsightsDatePicker from '@/components/insights/InsightsDatePicker'
import { DateRange } from 'react-day-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface FilterBarProps {
  // Keyword
  q: string
  onSearchChange: (val: string) => void

  // Tabs (Data Views)
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: string[]

  // Properties & Tenants
  properties: { id: string, name: string }[]
  tenants: { id: string, name: string }[]
  activePropertyId: string
  activeTenantId: string
  onPropertyChange: (id: string) => void
  onTenantChange: (id: string) => void

  // Dates
  dateRange: DateRange | undefined
  onDateChange: (range: DateRange | undefined) => void

  // Amount
  minAmount: string
  maxAmount: string
  onAmountChange: (min: string, max: string) => void

  // Nature (Revenue/Expense)
  cat?: string
  onCategoryChange: (cat: string) => void

  // Global Reset
  onReset: () => void
  onExport: (format: 'csv' | 'pdf' | 'excel') => void
}

type TabPanel = 'properties' | 'tenants' | 'taxonomy'

export default function TransactionFilterBar({
  q, onSearchChange,
  activeTab, onTabChange, tabs,
  properties, tenants, activePropertyId, activeTenantId, onPropertyChange, onTenantChange,
  dateRange, onDateChange,
  minAmount, maxAmount, onAmountChange,
  cat = 'ALL', onCategoryChange,
  onReset, onExport
}: FilterBarProps) {
  const [activeTabPanel, setActiveTabPanel] = useState<TabPanel>('properties')
  const [isTabPopoverOpen, setIsTabPopoverOpen] = useState(false)

  return (
    <div className="w-full h-14 flex items-center px-0">
      <div className="flex items-center gap-x-4 h-full w-full">

        {/* PILLAR 1: DATA VIEWS (Dropdown) */}
        <Popover open={isTabPopoverOpen} onOpenChange={setIsTabPopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" disabled={false} className="h-8 gap-x-2 text-sm font-normal text-white/60 hover:text-white px-2 border-none">
              <Layers size={14} className="opacity-70" />
              <span>{activeTab}</span>
              <span className="opacity-30">▼</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1" align="start">
            {tabs.map((tab) => (
              <Button
                type="button"
                key={tab}
                variant="ghost"
                onClick={() => {
                  onTabChange(tab)
                  setIsTabPopoverOpen(false)
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm h-9 justify-start",
                  activeTab === tab 
                    ? "bg-white/5 text-white" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.02]"
                )}
              >
                {tab}
              </Button>
            ))}
          </PopoverContent>
        </Popover>

        {/* PILLAR 2: ADVANCED FILTERS (Mega-Dropdown) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              type="button"
              variant="ghost" 
              className={cn(
                "h-8 gap-2 text-sm font-normal px-2",
                (q || minAmount || maxAmount || activePropertyId || activeTenantId || cat !== 'ALL') ? "text-primary hover:text-primary/80" : "text-white/60 hover:text-white"
              )}
            >
              <Filter size={14} className="opacity-70" />
              <span>Filters</span>
              {(q || minAmount || maxAmount || activePropertyId || activeTenantId || cat !== 'ALL') && (
                <div className="w-1 h-1 rounded-[var(--radius-sm)] bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[680px] p-0 rounded-[var(--radius-sm)] overflow-hidden" 
            align="start" 
            side="bottom"
            sideOffset={12}
          >
            <div className="flex h-[440px]">
              {/* Sidebar Tabs */}
              <div className="w-[180px] border-r border-white/5 bg-white/[0.01] flex flex-col p-2 gap-1">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTabPanel('properties')}
                  className={cn(
                    "w-full h-9 flex items-center justify-start gap-3 px-3 py-2 text-sm rounded-[var(--radius-sm)] transition-all",
                    activeTabPanel === 'properties' ? "bg-white/5 text-white" : "text-white/40 hover:text-white/60"
                  )}
                >
                  <Building2 size={14} />
                  Properties
                </Button>
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTabPanel('tenants')}
                  className={cn(
                    "w-full h-9 flex items-center justify-start gap-3 px-3 py-2 text-sm rounded-[var(--radius-sm)] transition-all",
                    activeTabPanel === 'tenants' ? "bg-white/5 text-white" : "text-white/40 hover:text-white/60"
                  )}
                >
                  <Users size={14} />
                  Tenants
                </Button>
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTabPanel('taxonomy')}
                  className={cn(
                    "w-full h-9 flex items-center justify-start gap-3 px-3 py-2 text-sm rounded-[var(--radius-sm)] transition-all",
                    activeTabPanel === 'taxonomy' ? "bg-white/5 text-white" : "text-white/40 hover:text-white/60"
                  )}
                >
                  <Tag size={14} />
                  Taxonomy
                </Button>
              </div>

              {/* Dynamic Options Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTabPanel === 'properties' && (
                    <motion.div 
                      key="properties" 
                      initial={{ opacity: 0, y: 4 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="space-y-3">
                        <label className="text-[11px] uppercase tracking-widest text-white/30 font-semibold">Asset Selection</label>
                        <div className="grid grid-cols-1 gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onPropertyChange('')}
                            className={cn(
                              "w-full h-10 justify-start px-3 py-2.5 text-sm rounded-[var(--radius-sm)] border transition-all",
                              !activePropertyId ? "border-primary/20 bg-primary/5 text-primary" : "border-white/5 text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
                            )}
                          >
                            All Properties
                          </Button>
                          {properties.map(p => (
                             <Button 
                               type="button"
                               key={p.id}
                               variant="ghost"
                               onClick={() => onPropertyChange(p.id)}
                               className={cn(
                                 "flex h-12 items-center justify-between p-3 rounded-[var(--radius-sm)] border transition-all",
                                 activePropertyId === p.id 
                                   ? "border-primary/30 bg-primary/5 text-white" 
                                   : "border-white/5 bg-white/[0.02] text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                               )}
                             >
                               <span className="text-sm">{p.name}</span>
                               {activePropertyId === p.id && <div className="w-1.5 h-1.5 rounded-[var(--radius-sm)] bg-primary" />}
                             </Button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTabPanel === 'tenants' && (
                    <motion.div 
                      key="tenants" 
                      initial={{ opacity: 0, y: 4 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="space-y-3">
                        <label className="text-[11px] uppercase tracking-widest text-white/30 font-semibold">Client Registry</label>
                        <div className="grid grid-cols-1 gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onTenantChange('')}
                            className={cn(
                              "w-full h-10 justify-start px-3 py-2.5 text-sm rounded-[var(--radius-sm)] border transition-all",
                              !activeTenantId ? "border-primary/20 bg-primary/5 text-primary" : "border-white/5 text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
                            )}
                          >
                            All Tenants
                          </Button>
                          {tenants.map(t => (
                             <Button 
                               type="button"
                               key={t.id}
                               variant="ghost"
                               onClick={() => onTenantChange(t.id)}
                               className={cn(
                                 "flex h-12 items-center justify-between p-3 rounded-[var(--radius-sm)] border transition-all",
                                 activeTenantId === t.id 
                                   ? "border-primary/30 bg-primary/5 text-white" 
                                   : "border-white/5 bg-white/[0.02] text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                               )}
                             >
                               <span className="text-sm">{t.name}</span>
                               {activeTenantId === t.id && <div className="w-1.5 h-1.5 rounded-[var(--radius-sm)] bg-primary" />}
                             </Button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTabPanel === 'taxonomy' && (
                    <motion.div 
                      key="taxonomy" 
                      initial={{ opacity: 0, y: 4 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="space-y-3">
                        <label className="text-[11px] uppercase tracking-widest text-white/30 font-semibold">Asset Classes</label>
                        <div className="grid grid-cols-1 gap-2">
                           {['Commercial Core', 'Residential Hub', 'Industrial Estate', 'Mixed Use'].map(cls => (
                            <div key={cls} className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group">
                              <span className="text-sm text-white/70">{cls}</span>
                              <ChevronDown size={14} className="opacity-0 group-hover:opacity-40 transition-opacity -rotate-90" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {/* Popover Footer */}
            <div className="h-14 border-t border-white/5 flex items-center justify-between px-6 bg-white/[0.01]">
              <Button type="button" variant="ghost" disabled={false} size="sm" onClick={onReset} className="text-white/40 hover:text-white border border-white/5">Reset Selection</Button>
              <Button type="button" disabled={false} size="sm" className="bg-primary text-primary-foreground font-semibold px-6 hover:opacity-90 transition-opacity">Apply Parameters</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* PILLAR 3: DATE RANGE (Custom Switch) */}
        <div className="h-8">
           <InsightsDatePicker date={dateRange} setDate={onDateChange} />
        </div>


        {/* PILLAR 5: AMOUNT RANGE */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" disabled={false} className={cn("h-8 gap-2 text-sm font-normal px-2 border-none", (minAmount || maxAmount) ? "text-primary" : "text-white/60 hover:text-white")}>
              <DollarSign size={14} className="opacity-70" />
              <span>Range</span>
              <span className="opacity-30">▼</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 text-white" align="start">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Amount Scope</span>
                  <Button type="button" variant="ghost" disabled={false} onClick={() => onAmountChange('', '')} className="h-auto p-0 text-[10px] text-primary hover:underline hover:bg-transparent border-none">Reset</Button>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                     <label className="text-[9px] uppercase tracking-wider text-white/30">Min ($)</label>
                     <input
                       type="number"
                       placeholder="0"
                       value={minAmount}
                       onChange={(e) => onAmountChange(e.target.value, maxAmount)}
                       className="w-full h-8 bg-white/[0.03] border border-white/10 rounded px-2 text-sm text-white outline-none focus:border-white/20"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[9px] uppercase tracking-wider text-white/30">Max ($)</label>
                     <input
                       type="number"
                       placeholder="Any"
                       value={maxAmount}
                       onChange={(e) => onAmountChange(minAmount, e.target.value)}
                       className="w-full h-8 bg-white/[0.03] border border-white/10 rounded px-2 text-sm text-white outline-none focus:border-white/20"
                     />
                  </div>
               </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* GLOBAL ACTIONS (Aligned Right) */}
        <div className="ml-auto flex-1 flex items-center gap-x-4 max-w-[600px]">
            <Button type="button" variant="ghost" disabled={false} size="sm" onClick={onReset} className="text-white/40 hover:text-white h-8 text-sm whitespace-nowrap border-none bg-transparent">
              Reset Filters
            </Button>

            <div className="flex-1 flex items-center h-8 border border-white/5 rounded-[var(--radius-sm)] px-4 group focus-within:border-white/10 transition-all">
              <Search size={14} className="text-white/20 group-focus-within:text-white/60 transition-colors mr-3" />
              <input
                type="text"
                value={q}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Deep scan keywords..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder-white/10 w-full font-normal tracking-clinical"
              />
              {q && (
                <Button type="button" variant="ghost" disabled={false} onClick={() => onSearchChange('')} className="h-auto p-0 text-white/20 hover:text-white hover:bg-transparent transition-colors border-none bg-transparent">
                  <span className="opacity-40 font-bold">✕</span>
                </Button>
              )}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  className="h-8 gap-2 text-sm font-normal px-2 text-white/60 hover:text-white transition-all"
                >
                  <Download size={14} className="opacity-70" />
                  <span>Export</span>
                  <ChevronDown size={12} className="opacity-30" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="end">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => onExport('csv')}
                  className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm h-9 text-white/40 hover:text-white hover:bg-white/5 rounded-[var(--radius-sm)] transition-all"
                >
                  <FileSpreadsheet size={14} className="text-emerald-500/60" />
                  Export as CSV
                </Button>
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => onExport('excel')}
                  className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm h-9 text-white/40 hover:text-white hover:bg-white/5 rounded-[var(--radius-sm)] transition-all"
                >
                  <FileBox size={14} className="text-blue-500/60" />
                  Export as Excel
                </Button>
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => onExport('pdf')}
                  className="w-full h-9 flex items-center justify-start gap-3 px-3 py-2 text-sm text-white/40 hover:text-white hover:bg-white/5 rounded-[var(--radius-sm)] transition-all"
                >
                  <FileText size={14} className="text-rose-500/60" />
                  Export as PDF
                </Button>
              </PopoverContent>
            </Popover>
        </div>

      </div>
    </div>
  )
}
