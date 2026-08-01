import { DollarSign, FileText, PiggyBank, Receipt } from 'lucide-react';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { KPICard, MiniSparkline, MiniBars } from '@/components/dashboard/KPICard';
import { AIInsights } from '@/components/ai/AIInsights';
import { AIChat } from '@/components/ai/AIChat';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { kpis, expenseTrend } from '@/data/mock';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHero />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          label="Total Expenses"
          value={kpis.totalExpenses}
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
          value={kpis.potentialSavings}
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
      <RecentTransactions />

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/8 pt-6 text-xs text-muted sm:flex-row">
        <p>CostPilot AI — Your AI Financial Copilot</p>
        <p>All systems operational · v2.4.0</p>
      </footer>
    </div>
  );
}
