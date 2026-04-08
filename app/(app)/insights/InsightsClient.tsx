'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  LayoutDashboard, 
  CreditCard, 
  ArrowLeftRight, 
  Settings,
  Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getInsightsData, Timeframe } from './actions';

// --- Reusable Components ---

const StatCard = ({ title, value, subtext, trend, trendType, loading }: { title: string, value: string, subtext: string, trend: string, trendType: 'positive' | 'negative' | 'neutral', loading: boolean }) => (
  <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between h-full">
    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
    {loading ? (
       <div className="animate-pulse h-8 bg-muted rounded w-1/2 my-1"></div>
    ) : (
      <h3 className="text-2xl font-semibold text-foreground">{value}</h3>
    )}
    <div className="flex items-center mt-2">
      {!loading && (
        <>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
            trendType === 'positive' ? 'bg-mercury-green/10 text-mercury-green dark:bg-green-500/10 dark:text-green-400' : 
            trendType === 'negative' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 
            'bg-muted/50 text-muted-foreground'
          }`}>
            {trendType === 'positive' && <ArrowUpRight size={12} className="mr-1" />}
            {trendType === 'negative' && <ArrowDownRight size={12} className="mr-1" />}
            {trend}
          </span>
          <span className="text-xs text-muted-foreground ml-2">{subtext}</span>
        </>
      )}
    </div>
  </div>
);

// --- Main Dashboard Layout ---

export default function InsightsClient({ organizationId }: { organizationId: string | undefined }) {
  const [timeframe, setTimeframe] = useState<Timeframe>('3M');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getInsightsData(organizationId, timeframe)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch insights", err);
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [timeframe, organizationId]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Insights</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Overview of your financial health.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
            className="bg-card border border-border text-foreground rounded-lg px-4 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer font-medium"
          >
            <option value="3M">Last 3 months</option>
            <option value="YTD">Year to date</option>
            <option value="ALL">All time</option>
          </select>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Net Cash Flow" 
          value={data ? formatCurrency(data.netCashFlow) : '$0.00'} 
          trend="vs last period" 
          trendType={data?.netCashFlow >= 0 ? "positive" : "negative"} 
          subtext="" 
          loading={loading}
        />
        <StatCard 
          title="Burn Rate" 
          value={data ? formatCurrency(data.burnRate) : '$0.00'} 
          trend="monthly avg" 
          trendType="negative" 
          subtext="" 
          loading={loading}
        />
        <StatCard 
          title="Runway" 
          value={data ? `${data.runwayMonths === 999 ? 'Infinite' : data.runwayMonths.toFixed(1)} Months` : '0 Months'} 
          trend="based on avg spend" 
          trendType={data?.runwayMonths > 6 ? "positive" : "neutral"} 
          subtext="" 
          loading={loading}
        />
      </div>

      {/* Charts & Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spend Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-96 flex flex-col relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6 z-10 relative">
            <h4 className="font-semibold text-foreground">Cash Flow Trend</h4>
            <BarChart3 size={18} className="text-muted-foreground" />
          </div>
          
          <div className="flex-1 w-full relative z-10 -ml-4">
            {loading ? (
               <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
               </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.chartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                       dy={10}
                    />
                    <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                       tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                       dx={-10}
                    />
                    <Tooltip 
                       contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                       itemStyle={{ padding: 0 }}
                    />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Categories Table */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden flex flex-col h-96">
          <h4 className="font-semibold text-foreground mb-6">Top Spending Categories</h4>
          
          <div className="space-y-5 flex-1 overflow-y-auto pr-2 scrollbar-hide">
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                   <div key={i} className="animate-pulse space-y-2">
                       <div className="flex justify-between">
                           <div className="h-4 bg-muted rounded w-24"></div>
                           <div className="h-4 bg-muted rounded w-16"></div>
                       </div>
                       <div className="h-2 bg-muted rounded-full w-full"></div>
                   </div>
                ))
            ) : data?.topCategories.length > 0 ? (
                data.topCategories.map((item: any) => (
                  <div key={item.name} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-foreground tracking-tight">{item.name}</span>
                      <span className="text-muted-foreground font-mono">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                      <div className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))
            ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
                    No spending data for this period
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
