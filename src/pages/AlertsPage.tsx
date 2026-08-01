import { useMemo } from 'react';
import { AlertTriangle, Bell, CheckCircle, Info, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTransactions, useGoals } from '@/lib/hooks';
import { deriveInsights } from '@/components/ai/AIInsights';
import { cn, formatCurrency, timeAgo } from '@/lib/utils';

interface Alert {
  id: string;
  title: string;
  detail: string;
  level: 'info' | 'warning' | 'danger';
  createdAt: string;
}

const meta: Record<Alert['level'], { icon: LucideIcon; tone: string; bg: string }> = {
  danger: { icon: AlertTriangle, tone: 'text-danger', bg: 'bg-danger/10' },
  warning: { icon: AlertTriangle, tone: 'text-warning', bg: 'bg-warning/10' },
  info: { icon: Info, tone: 'text-accent', bg: 'bg-accent/10' },
};

export function AlertsPage() {
  const { rows } = useTransactions();
  const { rows: goals } = useGoals();

  const alerts: Alert[] = useMemo(() => {
    const { insights } = deriveInsights(rows, goals);
    return insights.map((ins) => {
      const level: Alert['level'] = ins.severity === 'high' ? 'danger' : ins.severity === 'medium' ? 'warning' : 'info';
      const detail = ins.amount ? `${ins.detail} Impact: ${formatCurrency(ins.amount)}` : ins.detail;
      return {
        id: ins.id,
        title: ins.title,
        detail,
        level,
        createdAt: new Date().toISOString(),
      };
    });
  }, [rows, goals]);

  const counts = {
    danger: alerts.filter((a) => a.level === 'danger').length,
    warning: alerts.filter((a) => a.level === 'warning').length,
    info: alerts.filter((a) => a.level === 'info').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Alerts</h1>
        <p className="mt-1 text-sm text-text-2">AI-detected anomalies, duplicates, and budget warnings.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Critical', value: counts.danger, tone: 'text-danger', bg: 'bg-danger/10' },
          { label: 'Warnings', value: counts.warning, tone: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Info', value: counts.info, tone: 'text-accent', bg: 'bg-accent/10' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <span className={cn('grid h-10 w-10 place-items-center rounded-xl', s.bg)}>
                <Bell size={18} className={s.tone} />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted">{s.label}</p>
                <p className={cn('text-2xl font-extrabold', s.tone)}>{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card glow className="p-0">
        <div className="p-6 pb-4">
          <SectionHeader title="All Alerts" subtitle="Sorted by most recent" action={<Button size="sm" variant="ghost" leftIcon={<CheckCircle size={14} />}>Mark all read</Button>} />
        </div>
        <div className="space-y-1 p-3">
          {alerts.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-success/10 text-success"><CheckCircle size={24} /></span>
              <p className="text-sm font-medium text-white">No alerts</p>
              <p className="text-xs text-text-2">Your transactions look clean.</p>
            </div>
          )}
          {alerts.map((a, i) => {
            const m = meta[a.level];
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 rounded-xl p-3.5 transition hover:bg-white/3"
              >
                <span className={cn('mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl', m.bg)}>
                  <m.icon size={17} className={m.tone} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{a.title}</p>
                  <p className="mt-0.5 text-xs text-text-2">{a.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted">{timeAgo(a.createdAt)}</span>
                  <Button size="sm" variant="ghost">Review</Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
