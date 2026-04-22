'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { subMonths, isWithinInterval, format, differenceInDays, addDays, startOfDay, isSameMonth } from 'date-fns';
import { generateRunwayNarrative, generateIncomeNarrative, generateOutflowNarrative } from '@/src/app/(app)/reports/insights/semanticGenerator';
import { FilterBar } from './FilterBar';
import { KpiGrid } from './KpiGrid';
import { Visualizer } from './Visualizer';

// External Tab content (already modular)
import InsightsOverview from '@/components/insights/InsightsOverview';
import InsightsMoneyIn from '@/components/insights/InsightsMoneyIn';
import InsightsMoneyOut from '@/components/insights/InsightsMoneyOut';

const TIMELINE_START = new Date(2025, 4, 1);
const TIMELINE_END = new Date(2026, 4, 1);
const TOTAL_DAYS = differenceInDays(TIMELINE_END, TIMELINE_START);

interface InsightsDashboardProps {
  entries: any[];
  totalAssets: number;
  telemetry?: {
    current: { revenue: number, opex: number, debt: number, yieldRate: number };
    previous: { revenue: number, opex: number, debt: number, yieldRate: number };
    deltas: { revenue: number, opex: number, debt: number, yield: number };
  } | null;
}

type TabType = 'overview' | 'money-in' | 'money-out';

export function InsightsDashboard(props: InsightsDashboardProps) {
  const { entries, totalAssets, telemetry } = props;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [aggregation, setAggregation] = useState<'day' | 'month' | 'quarter'>('month');
  const trackRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
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

  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredEntries.forEach(e => {
      if (e.account?.category === "INCOME") income += Math.abs(e.amount);
      if (e.account?.category === "EXPENSE") expense += Math.abs(e.amount);
    });

    const rangeTo = dateRange?.to || new Date();
    const rangeFrom = dateRange?.from || subMonths(new Date(), 3);
    const dayCount = Math.max(1, differenceInDays(rangeTo, rangeFrom));
    const monthsRatio = Math.max(0.1, dayCount / 30.44);

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

  const handleDownload = () => {
    const params = new URLSearchParams();
    if (dateRange?.from) params.set('startDate', dateRange.from.toISOString());
    if (dateRange?.to) params.set('endDate', dateRange.to.toISOString());
    window.location.href = `/api/reports/csv?${params.toString()}`;
  };

  const handleCompare = () => {
    import('@/lib/toast').then(({ toast }) => {
      toast.info("Registry Surveillance: Multi-period comparison engine is under clinical calibration.");
    });
  };

  return (
    <div className="w-full">
      <h1 className="text-mercury-headline text-foreground mb-6 flex items-center gap-3">
        Insights
      </h1>

      <FilterBar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dateRange={dateRange}
        setDateRange={setDateRange}
        aggregation={aggregation}
        setAggregation={setAggregation}
        chartType={chartType}
        setChartType={setChartType}
        handleDownload={handleDownload}
        handleCompare={handleCompare}
        scrubberState={scrubberState}
        isDragging={isDragging}
        trackRef={trackRef}
        handlePointerDown={handlePointerDown}
        handleLeftDown={handleLeftDown}
        handleRightDown={handleRightDown}
      />

      <KpiGrid 
        activeTab={activeTab}
        metrics={metrics}
        aggregation={aggregation}
        setAggregation={setAggregation}
        chartType={chartType}
        setChartType={setChartType}
      />

      {/* ── THE CONTEXTUAL CHART & NARRATIVE AREA ── */}
      {entries.length > 0 ? (
        <Visualizer 
          filteredData={filteredData}
          chartType={chartType}
          activeTab={activeTab}
          semanticNodes={semanticNodes}
        />
      ) : (
        <div className="w-full h-[400px] bg-white/5 animate-pulse rounded-[var(--radius-sm)] mb-10 flex items-center justify-center">
          <span className="text-clinical-muted text-mercury-body">Reconstructing visual history...</span>
        </div>
      )}

      <div className="transition-all duration-300">
        {entries.length > 0 ? (
          <>
            {activeTab === 'overview' && <InsightsOverview entries={filteredEntries} income={metrics.income} expense={metrics.expense} />}
            {activeTab === 'money-in' && <InsightsMoneyIn entries={filteredEntries} income={metrics.income} />}
            {activeTab === 'money-out' && <InsightsMoneyOut entries={filteredEntries} expense={metrics.expense} />}
          </>
        ) : (
          <div className="w-full h-32 bg-white/5 animate-pulse rounded-[var(--radius-sm)]"></div>
        )}
      </div>
    </div>
  );
}
