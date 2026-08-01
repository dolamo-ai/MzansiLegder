import { motion } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { expenseTrend, categoryBreakdown, cashFlow, budgetUsage } from '@/data/mock';
import { cn, formatCurrency } from '@/lib/utils';

const tooltipStyle = {
  backgroundColor: '#18181B',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#fff',
  padding: '8px 12px',
};

export function AnalyticsPage() {
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

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryStat label="Net cash flow" value={51000} delta={12} up />
        <SummaryStat label="Avg daily spend" value={6144} delta={-3} />
        <SummaryStat label="Budget used" value={68} suffix="%" delta={5} />
        <SummaryStat label="Savings rate" value={7} suffix="%" delta={2} up />
      </div>

      {/* Expense trend */}
      <Card glow>
        <SectionHeader title="Expense Trends" subtitle="Monthly expenses vs budget" action={<LegendDot color="#2563EB" label="Expenses" />} />
        <div className="mt-5 h-[300px]">
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
              <YAxis stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
              <Area type="monotone" dataKey="expenses" stroke="#2563EB" strokeWidth={2.5} fill="url(#expGrad)" />
              <Line type="monotone" dataKey="budget" stroke="#71717A" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category breakdown */}
        <Card glow>
          <SectionHeader title="Category Breakdown" subtitle="Spending by category" />
          <div className="mt-5 grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                    {categoryBreakdown.map((c) => <Cell key={c.name} fill={c.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
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

        {/* Cash flow */}
        <Card glow>
          <SectionHeader title="Cash Flow" subtitle="Weekly inflow vs outflow" />
          <div className="mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlow} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="week" stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="inflow" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="outflow" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Budget usage */}
        <Card glow className="lg:col-span-2">
          <SectionHeader title="Budget Usage" subtitle="How close each category is to its limit" />
          <div className="mt-5 space-y-4">
            {budgetUsage.map((b, i) => {
              const pct = Math.round((b.used / b.limit) * 100);
              const over = pct > 100;
              return (
                <motion.div key={b.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{b.name}</span>
                    <span className={cn('text-xs font-semibold', over ? 'text-danger' : pct > 85 ? 'text-warning' : 'text-text-2')}>
                      {formatCurrency(b.used)} / {formatCurrency(b.limit)} · {pct}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className={cn('h-full rounded-full', over ? 'bg-gradient-to-r from-danger to-warning' : pct > 85 ? 'bg-gradient-to-r from-warning to-accent' : 'bg-gradient-to-r from-primary to-accent')}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, pct)}%` }}
                      transition={{ delay: i * 0.08 + 0.2, duration: 0.8 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Savings radial */}
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
            <p className="text-xs text-text-2">Available savings</p>
            <p className="mt-0.5 text-xl font-bold text-success">{formatCurrency(12840)}</p>
          </div>
        </Card>
      </div>
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

export { TrendingUp, TrendingDown };
