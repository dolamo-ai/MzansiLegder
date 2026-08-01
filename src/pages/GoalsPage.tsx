import { Target, Plus, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { goals, type Goal } from '@/data/mock';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

export function GoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Goals</h1>
          <p className="mt-1 text-sm text-text-2">Set spending targets and track your progress.</p>
        </div>
        <Button leftIcon={<Plus size={16} />}>Create Goal</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((g, i) => (
          <GoalCard key={g.id} goal={g} delay={i * 0.08} />
        ))}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: goals.length * 0.08 }}
          className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-white/10 text-text-2 transition hover:border-primary/40 hover:bg-primary/5 hover:text-white"
        >
          <Plus size={24} />
          <span className="text-sm font-medium">New goal</span>
        </motion.button>
      </div>

      <Card glow>
        <SectionHeader title="Goal Performance" subtitle="How you're tracking against all targets" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'On track', value: goals.filter((g) => g.current <= g.target).length, tone: 'text-success' },
            { label: 'Exceeded', value: goals.filter((g) => g.current > g.target).length, tone: 'text-danger' },
            { label: 'Avg progress', value: `${Math.round(goals.reduce((a, g) => a + Math.min(100, (g.current / g.target) * 100), 0) / goals.length)}%`, tone: 'text-accent' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">{s.label}</p>
              <p className={cn('mt-1.5 text-2xl font-extrabold', s.tone)}>{s.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function GoalCard({ goal, delay }: { goal: Goal; delay: number }) {
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const over = goal.current > goal.target;
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card glow className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <span className={cn('grid h-10 w-10 place-items-center rounded-xl', over ? 'bg-danger/15 text-[#fca5a5]' : 'bg-success/15 text-[#6ee7b7]')}>
            <Target size={18} />
          </span>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', over ? 'bg-danger/10 text-[#fca5a5]' : 'bg-success/10 text-[#6ee7b7]')}>
            {over ? 'Exceeded' : 'On track'}
          </span>
        </div>
        <p className="mt-4 text-sm font-bold text-white">{goal.name}</p>
        <p className="mt-0.5 text-xs text-muted">{goal.category} · Due {formatDate(goal.deadline)}</p>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-text-2">{formatCurrency(goal.current)}</span>
            <span className="text-muted">{formatCurrency(goal.target)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className={cn('h-full rounded-full', over ? 'bg-gradient-to-r from-danger to-warning' : 'bg-gradient-to-r from-primary to-accent')}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: delay + 0.2, duration: 0.8 }}
            />
          </div>
          <p className={cn('mt-2 text-xs font-semibold', over ? 'text-danger' : 'text-success')}>
            {over ? `${pct - 100}% over target` : `${100 - pct}% headroom remaining`}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

export { TrendingUp, Calendar };
