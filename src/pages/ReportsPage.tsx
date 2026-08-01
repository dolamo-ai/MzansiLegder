import { FileText, Download, FileSpreadsheet, File, Sparkles, TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { expenseTrend, categoryBreakdown, aiInsights } from '@/data/mock';
import { formatCurrency, formatDate } from '@/lib/utils';

const tooltipStyle = { backgroundColor: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#fff' };

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reports</h1>
          <p className="mt-1 text-sm text-text-2">Generate and export professional financial reports.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" leftIcon={<FileText size={16} />}>Export PDF</Button>
          <Button variant="ghost" leftIcon={<FileSpreadsheet size={16} />}>Export Excel</Button>
          <Button variant="ghost" leftIcon={<File size={16} />}>Export CSV</Button>
          <Button leftIcon={<Download size={16} />}>Download</Button>
        </div>
      </div>

      {/* PDF preview */}
      <Card glow className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-white/8 bg-white/3 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-danger/60" />
            <span className="h-3 w-3 rounded-full bg-warning/60" />
            <span className="h-3 w-3 rounded-full bg-success/60" />
          </div>
          <p className="text-xs text-muted">Q3 2026 Financial Report · Northwind Inc.</p>
          <span className="text-xs text-muted">Page 1 of 4</span>
        </div>

        {/* Page */}
        <div className="bg-[#0e0e11] p-8 sm:p-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16 L9 7 L12 12 L15 9 L20 16" /></svg>
                  </div>
                  <span className="text-sm font-bold text-white">CostPilot AI</span>
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">Q3 Financial Report</h2>
                <p className="mt-1 text-sm text-text-2">Northwind Inc. · Generated {formatDate(new Date().toISOString())}</p>
              </div>
              <div className="rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-right">
                <p className="text-xs text-[#6ee7b7]">AI Health Score</p>
                <p className="text-2xl font-extrabold text-success"><AnimatedNumber value={87} /></p>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Expenses', value: 184320, prefix: '$' },
                { label: 'Invoices', value: 47 },
                { label: 'VAT', value: 24680, prefix: '$' },
                { label: 'Savings', value: 12840, prefix: '$' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{s.label}</p>
                  <p className="mt-1 text-xl font-bold text-white">{s.prefix}<AnimatedNumber value={s.value} compact={s.value >= 100000} /></p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="mt-6 rounded-xl border border-white/8 bg-white/3 p-5">
              <p className="text-sm font-semibold text-white">Expense Trend</p>
              <div className="mt-3 h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={expenseTrend} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
                    <Area type="monotone" dataKey="expenses" stroke="#2563EB" strokeWidth={2} fill="url(#repGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-white">Category Breakdown</p>
              <div className="mt-3 space-y-2">
                {categoryBreakdown.map((c) => {
                  const total = categoryBreakdown.reduce((a, b) => a + b.value, 0);
                  const pct = Math.round((c.value / total) * 100);
                  return (
                    <div key={c.name} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-text-2">{c.name}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                        <motion.div className="h-full rounded-full" style={{ backgroundColor: c.color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                      </div>
                      <span className="w-16 text-right text-xs font-medium text-white">{formatCurrency(c.value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insights */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-white">AI Insights & Recommendations</p>
              <div className="mt-3 space-y-2">
                {aiInsights.slice(0, 4).map((ins) => {
                  const Icon = ins.type === 'duplicate' ? AlertTriangle : ins.type === 'savings' ? TrendingDown : ins.type === 'risk' ? AlertTriangle : Lightbulb;
                  const tone = ins.severity === 'high' ? 'text-danger' : ins.severity === 'medium' ? 'text-warning' : 'text-accent';
                  return (
                    <div key={ins.id} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 p-3">
                      <Icon size={16} className={`mt-0.5 shrink-0 ${tone}`} />
                      <div>
                        <p className="text-sm font-medium text-white">{ins.title}</p>
                        <p className="mt-0.5 text-xs text-text-2">{ins.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-muted">
              <span>Generated by CostPilot AI</span>
              <span>Confidential — Northwind Inc.</span>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Report templates */}
      <div>
        <SectionHeader title="Report Templates" subtitle="Quick-generate common reports" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Monthly Expense Report', desc: 'Detailed breakdown of all expenses', icon: TrendingUp, tone: 'from-primary/15 to-primary/5' },
            { name: 'VAT Summary', desc: 'VAT collected and owed for the period', icon: FileText, tone: 'from-accent/15 to-accent/5' },
            { name: 'Savings Report', desc: 'AI-identified savings opportunities', icon: Lightbulb, tone: 'from-success/15 to-success/5' },
            { name: 'Cash Flow Statement', desc: 'Inflows and outflows by week', icon: TrendingDown, tone: 'from-purple/15 to-purple/5' },
            { name: 'Anomaly Report', desc: 'Flagged and duplicate transactions', icon: AlertTriangle, tone: 'from-warning/15 to-warning/5' },
            { name: 'Annual Summary', desc: 'Year-over-year financial overview', icon: Sparkles, tone: 'from-primary/15 to-accent/5' },
          ].map((t) => (
            <motion.div key={t.name} whileHover={{ y: -2 }}>
              <Card className={`bg-gradient-to-br ${t.tone}`}>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white"><t.icon size={18} /></span>
                <p className="mt-3 text-sm font-bold text-white">{t.name}</p>
                <p className="mt-1 text-xs text-text-2">{t.desc}</p>
                <Button size="sm" variant="ghost" className="mt-3" rightIcon={<Download size={14} />}>Generate</Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
