import { ChevronLeft, ChevronRight, Building, Upload, MoreHorizontal, Plus, ArrowRight } from 'lucide-react'

export default function OperationalGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      
      {/* ── CARD 1: DELINQUENT ARREARS ────────────────────────────────────────── */}
      <div className="mercury-card h-[280px]">
        <div className="flex justify-between items-center">
          <h3 className="text-[15px] font-[400] text-white tracking-tight font-sans">Delinquent arrears</h3>
          <div className="flex items-center gap-1 text-white/30">
            <button className="p-1 hover:bg-white/5 rounded-full transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <span className="text-[12px] font-[400] font-sans">1/9</span>
            <button className="p-1 hover:bg-white/5 rounded-full transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[15px] font-[400] text-white/50 tracking-tight font-sans">Past due rent collected</p>
            <p className="text-[28px] leading-[42px] font-[400] text-white tracking-tight font-sans">$14,250</p>
          </div>
          
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-mercury-green rounded-full" style={{ width: '65%' }} />
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground/60 font-[400]">
              <span>Collected</span>
              <span>Pending</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
          <span className="text-[13px] font-[380] text-foreground/80">Open arrears: 12 tenants</span>
          <button className="text-[13px] font-[380] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            View <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── CARD 2: OCCUPANCY YIELD ─────────────────────────────────────────── */}
      <div className="mercury-card h-[280px]">
        <div className="flex justify-between items-center">
          <h3 className="text-[15px] font-[400] text-white tracking-tight font-sans">Occupancy yield</h3>
          <Building className="w-4 h-4 text-white/20" />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[15px] font-[400] text-white/50 tracking-tight font-sans">Total potential rent</p>
            <p className="text-[28px] leading-[42px] font-[400] text-white tracking-tight font-sans">$12,505.87</p>
          </div>
          
          <div className="space-y-2">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
               <div className="h-full bg-foreground" style={{ width: '85%' }} />
               <div className="h-full bg-muted-foreground/40" style={{ width: '10%' }} />
               {/* remaining 5% is vacant (muted bg) */}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-[400] tracking-tight">
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-foreground" /> Occupied</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-muted" /> Vacant</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> Notice</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
          <div className="flex flex-col">
            <span className="text-[13px] font-[380] text-foreground/80">Autopay</span>
            <span className="text-[11px] font-[400] text-muted-foreground/60">144 Leases</span>
          </div>
          <button className="px-3 py-1 bg-muted rounded-full text-[11px] font-[400] text-foreground hover:bg-white/10 transition-colors tracking-tight">
            Manage
          </button>
        </div>
      </div>

      {/* ── CARD 3: EXPENSE PAYABLES ────────────────────────────────────────── */}
      <div className="mercury-card h-[280px]">
        <div className="flex justify-between items-center">
          <h3 className="text-[15px] font-[400] text-white tracking-tight font-sans">Expense payables</h3>
          <div className="flex items-center gap-2 text-white/30">
            <button className="p-1 hover:bg-white/5 rounded-full transition-colors"><Upload className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white/5 rounded-full transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-[400] text-muted-foreground/80">Outstanding</span>
            <span className="text-[13px] font-[380] font-finance text-foreground">11</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-[400] text-muted-foreground/80">Overdue</span>
            <span className="text-[13px] font-[380] font-finance text-rose-400">1</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-[400] text-muted-foreground/80">Due soon</span>
            <span className="text-[13px] font-[380] font-finance text-muted-foreground/40">-</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
          <span className="text-[13px] font-[380] text-foreground/80">Inbox: 3 items - $10K</span>
          <button className="text-[13px] font-[380] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            View <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── CARD 4: RENT RECEIVABLES ────────────────────────────────────────── */}
      <div className="mercury-card h-[280px]">
        <div className="flex justify-between items-center">
          <h3 className="text-[15px] font-[400] text-white tracking-tight font-sans">Rent receivables</h3>
          <div className="flex items-center gap-1 text-white/30">
            <button className="p-1 hover:bg-white/5 rounded-full transition-colors"><Plus className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white/5 rounded-full transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
               <span className="text-[13px] font-[400] text-muted-foreground/80">Overdue</span>
               <span className="text-[11px] font-[400] text-muted-foreground/40">4 items</span>
            </div>
            <span className="text-[16px] font-[380] font-finance text-foreground tracking-tight">$950</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
               <span className="text-[13px] font-[400] text-muted-foreground/80">Paid</span>
               <span className="text-[11px] font-[400] text-muted-foreground/40">12 items</span>
            </div>
            <span className="text-[16px] font-[380] font-finance text-mercury-green tracking-tight">$6K</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
          <span className="text-[13px] font-[380] text-foreground/80">Open: 12 items - $12.3K</span>
          <button className="text-[13px] font-[380] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            View <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  )
}
