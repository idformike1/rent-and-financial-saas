'use client';

import React, { useState, useMemo } from 'react';
import InsightsOverview from '@/components/insights/InsightsOverview';
import InsightsMoneyIn from '@/components/insights/InsightsMoneyIn';
import InsightsMoneyOut from '@/components/insights/InsightsMoneyOut';
import InsightsDatePicker from '@/components/insights/InsightsDatePicker';
import LedgerChart from '@/components/insights/LedgerChart';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DateRange } from 'react-day-picker';
import { subMonths, isWithinInterval, parse, format, differenceInDays, addDays, startOfDay, isSameMonth } from 'date-fns';
import { generateRunwayNarrative, generateIncomeNarrative, generateOutflowNarrative } from './semanticGenerator';
import { Button } from '@/components/ui-finova';

const TIMELINE_START = new Date(2025, 4, 1);
const TIMELINE_END = new Date(2026, 4, 1);
const TOTAL_DAYS = differenceInDays(TIMELINE_END, TIMELINE_START);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InsightsClientProps {
  chartData: any[];
  entries: any[];
  totalAssets: number;
}

type TabType = 'overview' | 'money-in' | 'money-out';

export default function InsightsClient(props: InsightsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [aggregation, setAggregation] = useState<'day' | 'month' | 'quarter'>('month');
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  const scrubberState = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return { left: 0, width: 100 };
    const leftDays = differenceInDays(startOfDay(dateRange.from), TIMELINE_START);
    const rangeDays = differenceInDays(startOfDay(dateRange.to), startOfDay(dateRange.from));
    return {
      left: Math.max(0, (leftDays / TOTAL_DAYS) * 100),
      width: Math.min(100, (rangeDays / TOTAL_DAYS) * 100)
    };
  }, [dateRange]);

  const updateFromPercentages = (newLeft: number, newWidth: number) => {
    const from = addDays(TIMELINE_START, Math.round((newLeft / 100) * TOTAL_DAYS));
    const to = addDays(from, Math.round((newWidth / 100) * TOTAL_DAYS));
    setDateRange({ from, to });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const initialLeft = scrubberState.left;

    const onMove = (moveEvent: PointerEvent) => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.getBoundingClientRect().width;
      const deltaX = moveEvent.clientX - startX;
      let newLeft = initialLeft + (deltaX / trackWidth) * 100;
      newLeft = Math.max(0, Math.min(newLeft, 100 - scrubberState.width));
      updateFromPercentages(newLeft, scrubberState.width);
    };

    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const handleLeftDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const startX = e.clientX;
    const initialLeft = scrubberState.left;
    const initialWidth = scrubberState.width;

    const onMove = (moveEvent: PointerEvent) => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.getBoundingClientRect().width;
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / trackWidth) * 100;

      let newLeft = initialLeft + deltaPercent;
      let newWidth = initialWidth - deltaPercent;

      if (newWidth < 5) {
        newLeft = initialLeft + initialWidth - 5;
        newWidth = 5;
      }
      if (newLeft < 0) {
        newWidth = initialWidth + initialLeft;
        newLeft = 0;
      }
      updateFromPercentages(newLeft, newWidth);
    };

    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const handleRightDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const startX = e.clientX;
    const initialLeft = scrubberState.left;
    const initialWidth = scrubberState.width;

    const onMove = (moveEvent: PointerEvent) => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.getBoundingClientRect().width;
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / trackWidth) * 100;

      let newWidth = initialWidth + deltaPercent;

      if (newWidth < 5) newWidth = 5;
      if (initialLeft + newWidth > 100) {
        newWidth = 100 - initialLeft;
      }
      updateFromPercentages(initialLeft, newWidth);
    };

    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  // --- AUTOMATIC GRANULARITY DETECTION ---
  React.useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      if (isSameMonth(dateRange.from, dateRange.to)) {
        if (aggregation !== 'day') setAggregation('day');
      } else if (aggregation === 'day') {
        setAggregation('month');
      }
    }
  }, [dateRange, aggregation]);

  const filteredEntries = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return props.entries;
    return props.entries.filter((entry) => {
      try {
        const itemDate = new Date(entry.transactionDate);
        return isWithinInterval(itemDate, { start: dateRange.from!, end: dateRange.to! });
      } catch { return true; }
    });
  }, [props.entries, dateRange]);

  // --- CLIENT-SIDE AGGREGATION ENGINE ---
  const filteredData = useMemo(() => {
    const map = new Map<string, { dateObj: Date; income: number; expense: number }>();

    filteredEntries.forEach((entry) => {
      const d = new Date(entry.transactionDate);
      let key = "";
      let bucketDate: Date;
      
      if (aggregation === 'day') {
        key = format(d, 'MMM dd');
        bucketDate = d;
      } else if (aggregation === 'month') {
        key = format(d, 'MMM yy');
        bucketDate = new Date(d.getFullYear(), d.getMonth(), 1);
      } else {
        const q = Math.floor(d.getMonth() / 3);
        key = `${d.getFullYear()} Q${q + 1}`;
        bucketDate = new Date(d.getFullYear(), q * 3, 1);
      }

      const existing = map.get(key) || { dateObj: bucketDate, income: 0, expense: 0 };
      const amt = Math.abs(Number(entry.amount));
      
      if (entry.account?.category === 'INCOME') existing.income += amt;
      else if (entry.account?.category === 'EXPENSE') existing.expense += amt;
      
      map.set(key, existing);
    });

    return Array.from(map.entries())
      .map(([name, vals]) => ({
        date: name,
        moneyIn: vals.income,
        moneyOut: -vals.expense,
        netCashflow: vals.income - vals.expense,
        _sort: vals.dateObj.getTime()
      }))
      .sort((a, b) => a._sort - b._sort);
  }, [filteredEntries, aggregation]);

  // Recalculate hero metrics based on exact math: Net = Income - Math.abs(Expense)
  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredEntries.forEach(e => {
      if (e.account?.category === "INCOME") income += Math.abs(e.amount);
      if (e.account?.category === "EXPENSE") expense += Math.abs(e.amount);
    });

    // Calculate monthly average using accurate day-weights
    const rangeTo = dateRange?.to || new Date();
    const rangeFrom = dateRange?.from || subMonths(new Date(), 3);
    const dayCount = Math.max(1, differenceInDays(rangeTo, rangeFrom));
    const monthsRatio = Math.max(0.1, dayCount / 30.44); // Standard month length

    const avgIncome = income / monthsRatio;
    const avgExpense = expense / monthsRatio;

    return { income, expense, net: income - expense, avgIncome, avgExpense };
  }, [filteredEntries, dateRange]);

  const activeMonths = filteredData.length > 0 ? filteredData.length : 1;
  const burnRate = metrics.expense / activeMonths;

  const semanticNodes = useMemo(() => ({
    runway: generateRunwayNarrative(burnRate, props.totalAssets),
    income: generateIncomeNarrative(metrics.income, filteredEntries),
    outflow: generateOutflowNarrative(metrics.expense, filteredEntries)
  }), [burnRate, props.totalAssets, metrics, filteredEntries]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'money-in', label: 'Money in' },
    { id: 'money-out', label: 'Money out' },
  ];

  const formatValue = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal >= 1000000) return Math.round(absVal / 1000).toLocaleString('en-US') + 'K';
    return {
      full: absVal.toLocaleString('en-US', { minimumFractionDigits: 0 }),
      compact: Math.round(absVal / 1000).toLocaleString('en-US') + 'K'
    };
  };

  const renderMetric = (val: number, isNet: boolean = false) => {
    const formatted = formatValue(val);
    const prefix = isNet ? (val < 0 ? '−' : '') : (val < 0 ? '−' : '+');
    if (typeof formatted === 'string') return `${prefix}$${formatted}`;
    return (
      <>
        <span className="hidden xl:inline">{prefix}${formatted.full}</span>
        <span className="xl:hidden">{prefix}${formatted.compact}</span>
      </>
    );
  };

  return (
    <div className="w-full">
      {/* ── CONTEXT RESTORATION (Page Identity) ── */}
      <h1 className="text-[24px] font-normal text-foreground mb-6 flex items-center gap-3 tracking-tight font-arcadia">
        Insights
      </h1>

      {/* ── CONTROL STRATUM (State Machine) ────────────────────────────────── */}
      <div className="flex justify-between items-center w-full mb-2">
        {/* Segmented Control */}
        <div className="flex items-center gap-2">
          <div className="flex items-center h-8 bg-transparent border border-border rounded-[var(--radius)] p-[2px] ">
            {tabs.map((tab, idx) => (
              <React.Fragment key={tab.id}>
                <div
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "text-[15px] leading-[24px] h-full flex items-center px-4 rounded-[var(--radius)] cursor-pointer transition-all font-normal whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-muted text-white "
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </div>
                {/* Divider logic: only between Money in and Money out as per screenshot */}
                {idx === 1 && (
                  <div className="w-[1px] h-3 bg-white/10 mx-1"></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="w-[1px] h-3 bg-white/10 mx-0.5"></div>
          <Button type="button" variant="ghost" disabled={false} className="h-8 w-8 flex items-center justify-center p-0 rounded-[var(--radius)] text-muted-foreground bg-transparent border-none">
            [↓]
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <InsightsDatePicker date={dateRange} setDate={setDateRange} />
          <Button 
            type="button" 
            variant="ghost" 
            disabled={false}
            className="h-8 px-4 bg-white/[0.03] border border-border rounded-[var(--radius)] text-[15px] leading-[24px] font-normal text-foreground"
          >
            [+] Compare to
            <span className="text-[10px] ml-1 opacity-70">▼</span>
          </Button>
        </div>
      </div>

      {/* ── TIMELINE SCRUBBER ── */}
      <div className="w-full flex flex-col mb-6 mt-4">
        {/* ... (Existing Scrubber Code) ... */}
        <div className="relative w-full h-[60px] flex items-end" ref={trackRef}>
          <div className="absolute bottom-[4px] w-full border-b border-white/10"></div>
          {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((month, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative pointer-events-none">
              <div className="absolute bottom-[4px] left-[16.6%] w-[1px] h-[4px] bg-white opacity-20"></div>
              <div className="absolute bottom-[4px] left-[33.3%] w-[1px] h-[4px] bg-white opacity-20.0"></div>
              <div className="absolute bottom-[4px] left-[50.0%] w-[1px] h-[4px] bg-white opacity-20"></div>
              <div className="absolute bottom-[4px] left-[66.6%] w-[1px] h-[4px] bg-white opacity-20"></div>
              <div className="absolute bottom-[4px] left-[83.3%] w-[1px] h-[4px] bg-white opacity-20"></div>
              <div className="absolute bottom-[4px] left-0 w-[1.2px] h-[12px] bg-white"></div>
              <span className="absolute bottom-[16px] left-0 text-[11px] font-normal text-muted-foreground">{month}</span>
              {month === 'Jan' && <span className="absolute bottom-[36px] left-0 text-[16px] font-normal text-white/40 tracking-tight">2026</span>}
            </div>
          ))}
          <div
            onPointerDown={handlePointerDown}
            style={{ left: `${scrubberState.left}%`, width: `${scrubberState.width}%` }}
            className={cn(
              "absolute bottom-[4px] h-[48px] bg-blue-500/[0.08] border-[1.5px] border-blue-500/[0.6] rounded-[var(--radius)] cursor-grab active:cursor-grabbing transition-all z-10 select-none [1px] -blue-500/20",
              isDragging ? "bg-blue-500/[0.15] border-blue-500 -[0_0_25px_rgba(96,165,250,0.45)] scale-y-[1.02]" : "hover:bg-blue-500/[0.12] hover:border-blue-500/[0.8] hover:-[0_0_20px_rgba(96,165,250,0.35)]"
            )}
          >
            <span className="absolute top-2 left-2 text-white text-[16px] font-normal whitespace-nowrap pointer-events-none tracking-tight leading-none drop-">
              {dateRange?.from && dateRange?.to ? `${format(dateRange.from, 'LLL dd')} – ${format(dateRange.to, 'LLL dd')}` : 'Select Range'}
            </span>
            <div onPointerDown={(e) => { e.stopPropagation(); handleLeftDown(e); }} className="absolute top-0 left-0 bottom-0 w-[20px] flex items-center justify-start cursor-col-resize z-20 group">
              <div className="w-[2px] h-[16px] bg-primary opacity-[0.08] group-hover:opacity-100 transition-opacity ml-1 rounded-[var(--radius)]"></div>
            </div>
            <div onPointerDown={(e) => { e.stopPropagation(); handleRightDown(e); }} className="absolute top-0 right-0 bottom-0 w-[20px] flex items-center justify-end cursor-col-resize z-20 group">
              <div className="w-[2px] h-[16px] bg-primary opacity-[0.08] group-hover:opacity-100 transition-opacity mr-1 rounded-[var(--radius)]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col mb-8 border-b border-border/50 pb-8 transition-all duration-300">
        <div className="flex flex-row items-end flex-wrap min-h-[96px] gap-y-4">
          {activeTab === 'overview' ? (
            <>
              <div className="flex flex-col mr-[144px]">
                <p className="text-[15px] leading-[24px] font-normal text-foreground mb-2 font-sans tracking-tight border-b border-dotted border-white/20 pb-0.5 w-fit">Net cashflow</p>
                <p className="text-[38px] text-white tracking-[-0.02em] leading-[42px]" style={{ fontFamily: '"Arcadia Display", system-ui, sans-serif', fontWeight: 480 }}>
                  {renderMetric(metrics.net, true)}
                </p>
              </div>
              <div className="flex flex-col mr-12 md:pb-0.5">
                <p className="text-[15px] leading-[24px] font-normal text-foreground mb-[4px] font-sans tracking-tight border-b border-dotted border-white/20 pb-0.5 w-fit">Money in</p>
                <p className="text-[24px] text-white tracking-[-0.01em] leading-[28px]" style={{ fontFamily: '"Arcadia Text", system-ui, sans-serif', fontWeight: 480 }}>
                  {renderMetric(metrics.income)}
                </p>
              </div>
              <div className="flex flex-row flex-1 justify-between items-end md:pb-0.5 pr-12">
                <div className="flex flex-col">
                  <p className="text-[15px] leading-[24px] font-normal text-foreground mb-[4px] font-sans tracking-tight border-b border-dotted border-white/20 pb-0.5 w-fit">Money out</p>
                  <p className="text-[24px] text-white tracking-[-0.01em] leading-[28px]" style={{ fontFamily: '"Arcadia Text", system-ui, sans-serif', fontWeight: 480 }}>
                    {renderMetric(-metrics.expense)}
                  </p>
                </div>
              </div>
            </>
          ) : activeTab === 'money-in' ? (
            <>
              <div className="flex flex-col mr-[144px]">
                <p className="text-[15px] leading-[24px] font-normal text-foreground mb-2 font-sans tracking-tight border-b border-dotted border-white/20 pb-0.5 w-fit">Total money in</p>
                <p className="text-[38px] text-white tracking-[-0.02em] leading-[42px]" style={{ fontFamily: '"Arcadia Display", system-ui, sans-serif', fontWeight: 480 }}>
                  {renderMetric(metrics.income)}
                </p>
              </div>
              <div className="flex flex-col mr-12 md:pb-0.5">
                <p className="text-[15px] leading-[24px] font-normal text-foreground mb-[4px] font-sans tracking-tight border-b border-dotted border-white/20 pb-0.5 w-fit">Monthly average</p>
                <p className="text-[24px] text-white tracking-[-0.01em] leading-[28px]" style={{ fontFamily: '"Arcadia Text", system-ui, sans-serif', fontWeight: 480 }}>
                  {renderMetric(metrics.avgIncome)}
                </p>
              </div>
              <div className="flex-1"></div>
            </>
          ) : (
            <>
              <div className="flex flex-col mr-[144px]">
                <p className="text-[15px] leading-[24px] font-normal text-foreground mb-2 font-sans tracking-tight border-b border-dotted border-white/20 pb-0.5 w-fit">Total money out</p>
                <p className="text-[38px] text-white tracking-[-0.02em] leading-[42px]" style={{ fontFamily: '"Arcadia Display", system-ui, sans-serif', fontWeight: 480 }}>
                  {renderMetric(-metrics.expense)}
                </p>
              </div>
              <div className="flex flex-col mr-12 md:pb-0.5">
                <p className="text-[15px] leading-[24px] font-normal text-foreground mb-[4px] font-sans tracking-tight border-b border-dotted border-white/20 pb-0.5 w-fit">Monthly average</p>
                <p className="text-[24px] text-white tracking-[-0.01em] leading-[28px]" style={{ fontFamily: '"Arcadia Text", system-ui, sans-serif', fontWeight: 480 }}>
                  {renderMetric(-metrics.avgExpense)}
                </p>
              </div>
              <div className="flex-1"></div>
            </>
          )}

          <div className="hidden lg:flex items-center gap-3">
            <div className="flex p-1 bg-white/5 border border-white/5 rounded-[var(--radius)] h-8 items-center relative group">
              <Button 
                type="button" 
                variant="ghost" 
                disabled={false}
                className="flex items-center gap-2 px-3 h-full rounded-[var(--radius)] text-[15px] leading-[24px] font-normal border-none bg-transparent"
               >
                {aggregation.charAt(0).toUpperCase() + aggregation.slice(1)} <span className="text-[10px] opacity-70">▼</span>
              </Button>
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-1 w-32 bg-popover border border-white/10 rounded-[var(--radius)]  invisible group-hover:visible z-50 overflow-hidden">
                <div 
                  onClick={() => setAggregation('day')}
                  className={cn("px-4 py-2 text-[14px] cursor-pointer hover:bg-white/5", aggregation === 'day' ? "text-white" : "text-muted-foreground")}
                >
                  Day
                </div>
                <div 
                  onClick={() => setAggregation('month')}
                  className={cn("px-4 py-2 text-[14px] cursor-pointer hover:bg-white/5 border-t border-white/5", aggregation === 'month' ? "text-white" : "text-muted-foreground")}
                >
                  Month
                </div>
                <div 
                  onClick={() => setAggregation('quarter')}
                  className={cn("px-4 py-2 text-[14px] cursor-pointer hover:bg-white/5 border-t border-white/5", aggregation === 'quarter' ? "text-white" : "text-muted-foreground")}
                >
                  Quarter
                </div>
              </div>
            </div>
            <div className="flex p-1 bg-white/5 border border-white/5 rounded-[var(--radius)] h-8 items-center transition-all">
               <Button 
                type="button" 
                variant="ghost"
                disabled={false}
                onClick={() => setChartType('area')} 
                className={cn("h-full px-2.5 transition-all rounded-[var(--radius)] flex items-center justify-center p-0 border-none bg-transparent", chartType === 'area' ? "bg-muted text-white " : "text-muted-foreground hover:text-white")}
               >
                 📈
               </Button>
               <Button 
                type="button" 
                variant="ghost"
                disabled={false}
                onClick={() => setChartType('bar')} 
                className={cn("h-full px-2.5 transition-all rounded-[var(--radius)] flex items-center justify-center p-0 border-none bg-transparent", chartType === 'bar' ? "bg-muted text-white " : "text-muted-foreground hover:text-white")}
               >
                 📊
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── THE CONTEXTUAL CHART AREA ── */}
      <div className="w-full h-[400px] relative overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent opacity-50 blur-2xl"></div>
        <LedgerChart data={filteredData} type={chartType} mode={activeTab} />
      </div>

      {/* ── NARRATIVE TEXT BLOCKS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-2 mb-16">
        <div className="bg-transparent flex flex-col justify-start">
          <p className="text-[15px] leading-[24px] font-normal text-foreground mb-3 flex items-center gap-2">
            <span className="text-muted-foreground">〰</span> Runway and cash position
          </p>
          <div className="text-[15px] leading-[24px] font-normal text-foreground/80 h-[4.5em] overflow-hidden">{semanticNodes.runway}</div>
        </div>
        <div className="bg-transparent flex flex-col justify-start">
          <p className="text-[15px] leading-[24px] font-normal text-foreground mb-3 flex items-center gap-2">
            <span className="text-destructive">▼</span> Money out trends
          </p>
          <div className="text-[15px] leading-[24px] font-normal text-foreground/80 h-[4.5em] overflow-hidden">{semanticNodes.outflow}</div>
        </div>
        <div className="bg-transparent flex flex-col justify-start">
          <p className="text-[15px] leading-[24px] font-normal text-foreground mb-3 flex items-center gap-2">
             <span className="text-mercury-green">▲</span> Money in trends
          </p>
          <div className="text-[15px] leading-[24px] font-normal text-foreground/80 h-[4.5em] overflow-hidden">{semanticNodes.income}</div>
        </div>
      </div>

      {/* ── CONDITIONAL RENDERING BLOCK (Tab Content) ── */}
      <div className="transition-all duration-300">
        {activeTab === 'overview' && <InsightsOverview entries={filteredEntries} income={metrics.income} expense={metrics.expense} />}
        {activeTab === 'money-in' && <InsightsMoneyIn entries={filteredEntries} income={metrics.income} />}
        {activeTab === 'money-out' && <InsightsMoneyOut entries={filteredEntries} expense={metrics.expense} />}
      </div>
    </div>
  );
}
