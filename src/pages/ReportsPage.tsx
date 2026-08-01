import { useMemo } from 'react';
import { FileText, Download, FileSpreadsheet, File as FileIcon, Sparkles, TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useTransactions, useGoals } from '@/lib/hooks';
import { deriveInsights } from '@/components/ai/AIInsights';
import { exportCSV, exportExcel, exportPDF } from '@/lib/export';
import { formatCurrency, formatDate } from '@/lib/utils';

const tooltipStyle = { backgroundColor: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#fff' };

const CATEGORY_COLORS: Record<string, string> = {
  Software: '#2563EB', Marketing: '#06B6D4', Office: '#10B981', 'Office Supplies': '#10B981',
  Travel: '#F59E0B', Utilities: '#8B5CF6', Payroll: '#7C3AED', Legal: '#EF4444',
  Hardware: '#3B82F6', Rent: '#EC4899', Other: '#6B7280',
};

export function ReportsPage() {
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

  const { insights, score } = useMemo(() => deriveInsights(rows, goals), [rows, goals]);

  const total = rows.reduce((a, r) => a + Number(r.amount), 0);
  const vat = rows.reduce((a, r) => a + Number(r.vat || 0), 0);
  const savings = insights.filter((i) => i.amount && (i.type === 'savings' || i.type === 'duplicate')).reduce((a, i) => a + (i.amount ?? 0), 0);

  const buildReportHTML = () => {
    const stats = `
      <div class="stat"><div class="v">${formatCurrency(total)}</div><div class="l">Total Expenses</div></div>
      <div class="stat"><div class="v">${rows.length}</div><div class="l">Transactions</div></div>
      <div class="stat"><div class="v">${formatCurrency(vat)}</div><div class="l">VAT</div></div>
      <div class="stat"><div class="v">${formatCurrency(savings)}</div><div class="l">Savings</div></div>`;
    const txRows = rows.slice(0, 12).map((r) => `<tr><td>${r.id}</td><td>${r.vendor}</td><td>${formatDate(r.date)}</td><td>${r.category}</td><td>${r.status}</td><td style="text-align:right">${formatCurrency(Number(r.amount))}</td></tr>`).join('');
    const insightsHtml = insights.slice(0, 4).map((i) => `<li><strong>${i.title}</strong> — ${i.detail}</li>`).join('');
    return `
      <h1>Mzansi Ledger — Financial Report</h1>
      <p>Generated ${formatDate(new Date().toISOString())}</p>
      <h2>Summary</h2>
      <div style="margin:12px 0">${stats}</div>
      <h2>Expense Trend</h2>
      <table><thead><tr><th>Month</th><th>Expenses</th><th>Budget</th></tr></thead><tbody>
      ${expenseTrend.map((d) => `<tr><td>${d.month}</td><td style="text-align:right">${formatCurrency(d.expenses)}</td><td style="text-align:right">${formatCurrency(d.budget)}</td></tr>`).join('')}
      </tbody></table>
      <h2>Recent Transactions</h2>
      <table><thead><tr><th>ID</th><th>Vendor</th><th>Date</th><th>Category</th><th>Status</th><th style="text-align:right">Amount</th></tr></thead><tbody>${txRows}</tbody></table>
      <h2>AI Insights</h2>
      <ul>${insightsHtml}</ul>
    `;
  };

  const handlePDF = () => exportPDF('Mzansi Ledger Report', buildReportHTML(), 'mzansi-ledger-report.pdf');
  const handleExcel = () => exportExcel(rows.map((r) => ({ id: r.id, vendor: r.vendor, date: r.date, amount: r.amount, vat: r.vat, category: r.category, status: r.status })), 'mzansi-ledger-report.xls');
  const handleCSV = () => exportCSV(rows.map((r) => ({ id: r.id, vendor: r.vendor, date: r.date, amount: r.amount, vat: r.vat, category: r.category, status: r.status })), 'mzansi-ledger-report.csv');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reports</h1>
          <p className="mt-1 text-sm text-text-2">Generate and export professional financial reports.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" leftIcon={<FileText size={16} />} onClick={handlePDF}>Export PDF</Button>
          <Button variant="ghost" leftIcon={<FileSpreadsheet size={16} />} onClick={handleExcel}>Export Excel</Button>
          <Button variant="ghost" leftIcon={<FileIcon size={16} />} onClick={handleCSV}>Export CSV</Button>
          <Button leftIcon={<Download size={16} />} onClick={handlePDF}>Download</Button>
        </div>
      </div>

      <Card glow className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-white/8 bg-white/3 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-danger/60" />
            <span className="h-3 w-3 rounded-full bg-warning/60" />
            <span className="h-3 w-3 rounded-full bg-success/60" />
          </div>
          <p className="text-xs text-muted">Mzansi Ledger · Financial Report</p>
          <span className="text-xs text-muted">Page 1 of 4</span>
        </div>

        <div className="bg-[#0e0e11] p-8 sm:p-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <img src="/image.png" alt="Mzansi Ledger" className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10" />
                  <span className="text-sm font-bold text-white">Mzansi Ledger</span>
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">Financial Report</h2>
                <p className="mt-1 text-sm text-text-2">Generated {formatDate(new Date().toISOString())}</p>
              </div>
              <div className="rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-right">
                <p className="text-xs text-[#6ee7b7]">AI Health Score</p>
                <p className="text-2xl font-extrabold text-success"><AnimatedNumber value={score} /></p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Expenses', value: total, prefix: 'R' },
                { label: 'Transactions', value: rows.length },
                { label: 'VAT', value: vat, prefix: 'R' },
                { label: 'Savings', value: savings, prefix: 'R' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{s.label}</p>
                  <p className="mt-1 text-xl font-bold text-white">{s.prefix}<AnimatedNumber value={s.value} compact={s.value >= 100000} /></p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-white/8 bg-white/3 p-5">
              <p className="text-sm font-semibold text-white">Expense Trend</p>
              <div className="mt-3 h-[180px]">
                {expenseTrend.length === 0 ? (
                  <p className="flex h-full items-center justify-center text-sm text-muted">No data yet</p>
                ) : (
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
                )}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-white">Category Breakdown</p>
              <div className="mt-3 space-y-2">
                {categoryBreakdown.length === 0 && <p className="text-xs text-muted">No categories yet.</p>}
                {categoryBreakdown.map((c) => {
                  const catTotal = categoryBreakdown.reduce((a, b) => a + b.value, 0);
                  const pct = catTotal > 0 ? Math.round((c.value / catTotal) * 100) : 0;
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

            <div className="mt-6">
              <p className="text-sm font-semibold text-white">AI Insights & Recommendations</p>
              <div className="mt-3 space-y-2">
                {insights.length === 0 && <p className="text-xs text-muted">No insights yet.</p>}
                {insights.slice(0, 4).map((ins) => {
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
              <span>Generated by Mzansi Ledger AI</span>
              <span>Confidential</span>
            </div>
          </motion.div>
        </div>
      </Card>

      <div>
        <SectionHeader title="Report Templates" subtitle="Quick-generate common reports" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Monthly Expense Report', desc: 'Detailed breakdown of all expenses', icon: TrendingUp, tone: 'from-primary/15 to-primary/5', action: handlePDF },
            { name: 'VAT Summary', desc: 'VAT collected and owed for the period', icon: FileText, tone: 'from-accent/15 to-accent/5', action: handleExcel },
            { name: 'Savings Report', desc: 'AI-identified savings opportunities', icon: Lightbulb, tone: 'from-success/15 to-success/5', action: handleCSV },
            { name: 'Cash Flow Statement', desc: 'Inflows and outflows by week', icon: TrendingDown, tone: 'from-purple/15 to-purple/5', action: handleExcel },
            { name: 'Anomaly Report', desc: 'Flagged and duplicate transactions', icon: AlertTriangle, tone: 'from-warning/15 to-warning/5', action: handleCSV },
            { name: 'Annual Summary', desc: 'Year-over-year financial overview', icon: Sparkles, tone: 'from-primary/15 to-accent/5', action: handlePDF },
          ].map((t) => (
            <motion.div key={t.name} whileHover={{ y: -2 }}>
              <Card className={`bg-gradient-to-br ${t.tone}`}>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white"><t.icon size={18} /></span>
                <p className="mt-3 text-sm font-bold text-white">{t.name}</p>
                <p className="mt-1 text-xs text-text-2">{t.desc}</p>
                <Button size="sm" variant="ghost" className="mt-3" rightIcon={<Download size={14} />} onClick={t.action}>Generate</Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
