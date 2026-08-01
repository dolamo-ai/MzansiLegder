import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileText, PiggyBank, Receipt, Plus, Sparkles } from 'lucide-react';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { KPICard, MiniSparkline, MiniBars } from '@/components/dashboard/KPICard';
import { AIInsights } from '@/components/ai/AIInsights';
import { AIChat } from '@/components/ai/AIChat';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { NewTransactionModal } from '@/components/transactions/NewTransactionModal';
import { useTransactions } from '@/lib/hooks';
import { aiInsights, aiScore, expenseTrend } from '@/data/mock';
import { formatCurrency } from '@/lib/utils';

export function DashboardPage() {
  const navigate = useNavigate();
  const { rows, insert } = useTransactions();
  const [newTxOpen, setNewTxOpen] = useState(false);

  const kpis = useMemo(() => {
    const total = rows.reduce((a, r) => a + Number(r.amount), 0);
    const vat = rows.reduce((a, r) => a + Number(r.vat), 0);
    const invoices = rows.filter((r) => r.source === 'invoice').length;
    const savings = aiInsights.filter((i) => i.amount).reduce((a, i) => a + (i.amount ?? 0), 0);
    return { total, vat, invoices, savings };
  }, [rows]);

  const handleNewTx = async (tx: Omit<typeof rows[number], 'id'>) => {
    await insert(tx);
  };

  return (
    <div className="space-y-6">
      <DashboardHero onNewTransaction={() => setNewTxOpen(true)} />

      {/* Action bar */}
      <div className="flex flex-wrap gap-2.5">
        <Button leftIcon={<Plus size={16} />} onClick={() => setNewTxOpen(true)}>New Transaction</Button>
        <Button variant="ghost" leftIcon={<Sparkles size={16} />} onClick={() => navigate('/copilot')}>Ask AI Copilot</Button>
        <Button variant="ghost" onClick={() => navigate('/upload')}>Upload Receipt</Button>
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
          chart={<MiniSparkline data={expenseTrend.map((d) => d.expenses)} color="#2563EB" />}
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
      <AIInsights />

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
        <p>CostPilot AI — Your AI Financial Copilot</p>
        <p>All systems operational · v2.4.0</p>
      </footer>

      <NewTransactionModal open={newTxOpen} onClose={() => setNewTxOpen(false)} onSave={handleNewTx} />
    </div>
  );
}

export { formatCurrency, aiScore };
