import { useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend,
} from 'recharts';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useTransactions, useGoals } from '@/lib/hooks';
import { cn, formatCurrency } from '@/lib/utils';

const tooltipStyle = {
  backgroundColor: '#18181B',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#fff',
  padding: '8px 12px',
};

const CATEGORY_COLORS: Record<string, string> = {
  Software: '#2563EB',
  Marketing: '#06B6D4',
  Office: '#10B981',
  'Office Supplies': '#10B981',
  Travel: '#F59E0B',
  Utilities: '#8B5CF6',
  Payroll: '#7C3AED',
  Legal: '#EF4444',
  Hardware: '#3B82F6',
  Rent: '#EC4899',
  Other: '#6B7280',
};

export function AnalyticsPage() {
  const { rows } = useTransactions();
  const { rows: goals } = useGoals();

  const expenseTrend = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const tx of rows) {
      const m = (tx.date || '').slice(0, 7);
      byMonth.set(m, (byMonth.get(m) ?? 0) + Number(tx.amount));
    }
    return [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-7).map(([month, expenses]) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
      expenses,
      budget: 16000,
    }));
  }, [rows]);

  const categoryBreakdown = useMemo(() => {
    const byCat = new Map<string, number>();
    for (const tx of rows) {
      const cat = tx.category || 'Other';
      byCat.set(cat, (byCat.get(cat) ?? 0) + Number(tx.amount));
    }
    return [...byCat.entries()].map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] ?? '#6B7280' }));
  }, [rows]);

  const cashFlow = useMemo(() => {
    // Group by week from transactions
    const now = new Date();
    const weeks: { week: string; inflow: number; outflow: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const end = new Date(now); end.setDate(now.getDate() - i * 7);
      const start = new Date(end); start.setDate(end.getDate() - 7);
      const outflow = rows.filter((tx) => {
        const d = new Date(tx.date);
        return d >= start && d < end;
      }).reduce((a, tx) => a + Number(tx.amount), 0);
      weeks.push({ week: `W${4 - i}`, inflow: Math.round(outflow * 1.4), outflow });
    }
    return weeks;
  }, [rows]);

  const budgetUsage = useMemo(() => {
    return goals.map((g) => ({ name: g.name, used: Number(g.current), limit: Number(g.target) }));
  }, [goals]);

  const totalSpend = rows.reduce((a, r) => a + Number(r.amount), 0);
  const totalVat = rows.reduce((a, r) => a + Number(r.vat || 0), 0);
  const savingsRate = totalSpend > 0 ? Math.round((totalVat / totalSpend) * 100) : 0;
  const avgDaily = rows.length > 0 ? Math.round(totalSpend / 30) : 0;
  const budgetUsed = goals.length > 0 ? Math.round(goals.reduce((a, g) => a + Math.min(100, (Number(g.current) / Number(g.target)) * 100), 0) / goals.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="mt-1 text-sm text-text-2">Deep dive into your spending, budgets, and cash flow.</p>
        </div>
        <div className="flex gap-2">
          {['7D', '30D', '90D', '1Y'].map((r, i) => (
            <button key={r} className={cn('rounded-xl px-3.5 py-2 text-xs font-medium transition', i === 1 ? 'bg-white/10 text-white' : 'text-text-2 hover:bg-white/5')}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryStat label="Total spend" value={totalSpend} prefix="R" delta={totalSpend > 0 ? 9 : 0} up={false} />
        <SummaryStat label="Avg daily spend" value={avgDaily} prefix="R" delta={-3} />
        <SummaryStat label="Budget used" value={budgetUsed} suffix="%" delta={5} />
        <SummaryStat label="VAT rate" value={savingsRate} suffix="%" delta={2} up />
      </div>

      <Card glow>
        <SectionHeader title="Expense Trends" subtitle="Monthly expenses vs budget" action={<LegendDot color="#2563EB" label="Expenses" />} />
        <div className="mt-5 h-[300px]">
          {expenseTrend.length === 0 ? (
            <EmptyChart label="No expense data yet" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expenseTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
                <Area type="monotone" dataKey="expenses" stroke="#2563EB" strokeWidth={2.5} fill="url(#expGrad)" />
                <Line type="monotone" dataKey="budget" stroke="#71717A" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card glow>
          <SectionHeader title="Category Breakdown" subtitle="Spending by category" />
          <div className="mt-5 grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
            <div className="h-[240px]">
              {categoryBreakdown.length === 0 ? (
                <EmptyChart label="No categories yet" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                      {categoryBreakdown.map((c) => <Cell key={c.name} fill={c.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-2">
              {categoryBreakdown.length === 0 && <p className="text-sm text-muted">No data yet.</p>}
              {categoryBreakdown.map((c) => (
                <div key={c.name} className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="flex-1 text-sm text-text-2">{c.name}</span>
                  <span className="text-sm font-semibold text-white">{formatCurrency(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card glow>
          <SectionHeader title="Cash Flow" subtitle="Weekly inflow vs outflow" />
          <div className="mt-5 h-[280px]">
            {cashFlow.every((w) => w.outflow === 0) ? (
              <EmptyChart label="No cash flow data yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlow} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="week" stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="inflow" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="outflow" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card glow className="lg:col-span-2">
          <SectionHeader title="Budget Usage" subtitle="How close each goal is to its target" />
          <div className="mt-5 space-y-4">
            {budgetUsage.length === 0 && <p className="py-8 text-center text-sm text-muted">No goals set yet. Create goals to track budgets.</p>}
            {budgetUsage.map((b, i) => {
              const pct = b.limit > 0 ? Math.round((b.used / b.limit) * 100) : 0;
              const over = pct > 100;
              return (
                <div key={b.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{b.name}</span>
                    <span className={cn('text-xs font-semibold', over ? 'text-danger' : pct > 85 ? 'text-warning' : 'text-text-2')}>
                      {formatCurrency(b.used)} / {formatCurrency(b.limit)} · {pct}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={cn('h-full rounded-full', over ? 'bg-gradient-to-r from-danger to-warning' : pct > 85 ? 'bg-gradient-to-r from-warning to-accent' : 'bg-gradient-to-r from-primary to-accent')}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card glow>
          <SectionHeader title="Savings" subtitle="AI-identified savings" />
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ name: 'savings', value: 72, fill: '#10B981' }]} startAngle={90} endAngle={-270}>
                <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="-mt-32 text-center">
            <p className="text-4xl font-extrabold text-white"><AnimatedNumber value={72} suffix="%" /></p>
            <p className="mt-1 text-xs text-text-2">of opportunities captured</p>
          </div>
          <div className="mt-20 rounded-xl border border-success/20 bg-success/5 p-3 text-center">
            <p className="text-xs text-text-2">Total VAT collected</p>
            <p className="mt-0.5 text-xl font-bold text-success">{formatCurrency(totalVat)}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

function SummaryStat({ label, value, delta, suffix, prefix, up = true }: { label: string; value: number; delta: number; suffix?: string; prefix?: string; up?: boolean }) {
  const positive = up ? delta >= 0 : delta < 0;
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-white">
        {prefix}<AnimatedNumber value={value} />{suffix}
      </p>
      <div className={cn('mt-1.5 flex items-center gap-1 text-xs font-semibold', positive ? 'text-success' : 'text-danger')}>
        {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(delta)}% vs last period
      </div>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
