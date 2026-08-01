import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileText, PiggyBank, Receipt, Plus, Sparkles } from 'lucide-react';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { KPICard, MiniSparkline, MiniBars } from '@/components/dashboard/KPICard';
import { AIInsights, deriveInsights } from '@/components/ai/AIInsights';
import { AIChat } from '@/components/ai/AIChat';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { NewTransactionModal } from '@/components/transactions/NewTransactionModal';
import { useTransactions, useInvoices, useGoals } from '@/lib/hooks';

export function DashboardPage() {
  const navigate = useNavigate();
  const { rows, insert } = useTransactions();
  const { rows: invoices } = useInvoices();
  const { rows: goals } = useGoals();
  const [newTxOpen, setNewTxOpen] = useState(false);

  const kpis = useMemo(() => {
    const total = rows.reduce((a, r) => a + Number(r.amount), 0);
    const vat = rows.reduce((a, r) => a + Number(r.vat || 0), 0);
    const invCount = invoices.length;
    const { insights } = deriveInsights(rows, goals);
    const savings = insights.filter((i) => i.amount && (i.type === 'savings' || i.type === 'duplicate')).reduce((a, i) => a + (i.amount ?? 0), 0);
    return { total, vat, invoices: invCount, savings };
  }, [rows, invoices, goals]);

  const sparkData = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const tx of rows) {
      const m = (tx.date || '').slice(0, 7);
      byMonth.set(m, (byMonth.get(m) ?? 0) + Number(tx.amount));
    }
    const sorted = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-7);
    return sorted.map(([, v]) => v);
  }, [rows]);

  const handleNewTx = async (tx: Omit<typeof rows[number], 'id' | 'user_id'>) => {
    await insert(tx);
  };

  return (
    <div className="space-y-6">
      <DashboardHero onNewTransaction={() => setNewTxOpen(true)} transactions={rows} goals={goals} />

      {/* Action bar */}
      <div className="flex flex-wrap gap-2.5">
        <Button leftIcon={<Plus size={16} />} onClick={() => setNewTxOpen(true)}>New Transaction</Button>
        <Button variant="ghost" leftIcon={<Sparkles size={16} />} onClick={() => navigate('/copilot')}>Ask AI Copilot</Button>
        <Button variant="ghost" onClick={() => navigate('/ledger')}>Ledger Workflow</Button>
        <Button variant="ghost" onClick={() => navigate('/reports')}>Generate Report</Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          label="Total Expenses"
          value={kpis.total}
          delta={9}
          icon={DollarSign}
          iconTone="bg-primary/15 text-[#93c5fd]"
          chart={<MiniSparkline data={sparkData.length ? sparkData : [0]} color="#2563EB" />}
          delay={0}
        />
        <KPICard
          label="Invoices"
          value={kpis.invoices}
          format="number"
          delta={12}
          icon={FileText}
          iconTone="bg-purple/15 text-[#c4b5fd]"
          chart={<MiniBars data={[12, 18, 14, 22, 19, 28, 24, 30]} color="#7C3AED" />}
          delay={0.08}
        />
        <KPICard
          label="Potential Savings"
          value={kpis.savings}
          delta={23}
          icon={PiggyBank}
          iconTone="bg-success/15 text-[#6ee7b7]"
          chart={<MiniSparkline data={[4, 6, 5, 8, 7, 10, 12]} color="#10B981" />}
          delay={0.16}
        />
        <KPICard
          label="VAT"
          value={kpis.vat}
          delta={-4}
          icon={Receipt}
          iconTone="bg-accent/15 text-[#67e8f9]"
          chart={<MiniBars data={[20, 24, 22, 26, 23, 25, 24]} color="#06B6D4" />}
          delay={0.24}
        />
      </div>

      {/* AI Insights */}
      <AIInsights transactions={rows} goals={goals} />

      {/* AI Chat + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" glow>
          <SectionHeader
            title="AI Copilot"
            subtitle="Chat with your financial copilot"
            action={<span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs text-[#6ee7b7]"><span className="h-1.5 w-1.5 rounded-full bg-success" />Online</span>}
          />
          <div className="mt-4">
            <AIChat compact />
          </div>
        </Card>
        <Card glow>
          <SectionHeader title="Quick Actions" subtitle="Jump to common tasks" />
          <div className="mt-4">
            <QuickActions />
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions rows={rows} />

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/8 pt-6 text-xs text-muted sm:flex-row">
        <p>Mzansi Ledger — Your AI Financial Copilot</p>
        <p>All systems operational · v1.0</p>
      </footer>

      <NewTransactionModal open={newTxOpen} onClose={() => setNewTxOpen(false)} onSave={handleNewTx} />
    </div>
  );
}
