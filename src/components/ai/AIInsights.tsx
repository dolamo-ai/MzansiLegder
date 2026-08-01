import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Copy, TrendingDown, PiggyBank, ShieldAlert, Lightbulb, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import type { Transaction, Goal } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';

export interface AIInsight {
  id: string;
  type: 'duplicate' | 'savings' | 'budget' | 'risk' | 'recommendation';
  title: string;
  detail: string;
  amount?: number;
  severity: 'low' | 'medium' | 'high';
}

const typeMeta: Record<AIInsight['type'], { icon: typeof Copy; tone: string; label: string }> = {
  duplicate: { icon: Copy, tone: 'text-danger bg-danger/10', label: 'Duplicate' },
  savings: { icon: PiggyBank, tone: 'text-success bg-success/10', label: 'Savings' },
  budget: { icon: TrendingDown, tone: 'text-warning bg-warning/10', label: 'Budget' },
  risk: { icon: ShieldAlert, tone: 'text-warning bg-warning/10', label: 'Risk' },
  recommendation: { icon: Lightbulb, tone: 'text-accent bg-accent/10', label: 'Recommendation' },
};

export function deriveInsights(transactions: Transaction[], goals: Goal[]): { insights: AIInsight[]; score: number } {
  const insights: AIInsight[] = [];

  // Duplicate detection: same vendor + same amount
  const seen = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const key = `${tx.vendor.toLowerCase()}|${tx.amount}`;
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(tx);
  }
  for (const [key, txs] of seen) {
    if (txs.length > 1) {
      insights.push({
        id: `DUP-${key}`,
        type: 'duplicate',
        title: `Duplicate ${txs[0].vendor} charge detected`,
        detail: `${txs.map((t) => t.id).join(' and ')} are identical ${formatCurrency(Number(txs[0].amount))} charges. One may be a duplicate.`,
        amount: Number(txs[0].amount),
        severity: 'high',
      });
    }
  }

  // Flagged transactions
  for (const tx of transactions) {
    if (tx.status === 'flagged') {
      insights.push({
        id: `RISK-${tx.id}`,
        type: 'risk',
        title: `Flagged transaction: ${tx.vendor}`,
        detail: `${tx.id} (${formatCurrency(Number(tx.amount))}) is flagged for review. ${tx.notes ?? 'Please review.'}`,
        severity: 'medium',
      });
    }
  }

  // Missing VAT
  for (const tx of transactions) {
    if (Number(tx.amount) > 0 && (Number(tx.vat) === 0 || !tx.vat)) {
      insights.push({
        id: `VAT-${tx.id}`,
        type: 'risk',
        title: `Missing VAT on ${tx.vendor}`,
        detail: `${tx.id} has no VAT recorded. Confirm whether this is VAT-exempt.`,
        severity: 'low',
      });
    }
  }

  // Budget exceeded from goals
  for (const g of goals) {
    if (Number(g.current) > Number(g.target)) {
      insights.push({
        id: `BUD-${g.id}`,
        type: 'budget',
        title: `${g.name} budget exceeded`,
        detail: `${g.category} spend is at ${Math.round((Number(g.current) / Number(g.target)) * 100)}% of the target.`,
        severity: 'high',
      });
    }
  }

  // Savings recommendation: high software spend
  const softwareTotal = transactions.filter((t) => t.category === 'Software').reduce((a, t) => a + Number(t.amount), 0);
  if (softwareTotal > 3000) {
    insights.push({
      id: 'SAV-SOFTWARE',
      type: 'savings',
      title: 'Review software subscriptions',
      detail: `You've spent ${formatCurrency(softwareTotal)} on software this period. Consider annual billing to save ~20%.`,
      amount: Math.round(softwareTotal * 0.2),
      severity: 'medium',
    });
  }

  // Score: start at 100, deduct for issues
  let score = 100;
  const dupCount = insights.filter((i) => i.type === 'duplicate').length;
  const riskCount = insights.filter((i) => i.type === 'risk').length;
  const budgetCount = insights.filter((i) => i.type === 'budget').length;
  score -= dupCount * 12;
  score -= riskCount * 5;
  score -= budgetCount * 8;
  score = Math.max(20, Math.min(100, score));

  return { insights: insights.slice(0, 8), score };
}

interface AIInsightsProps {
  transactions: Transaction[];
  goals?: Goal[];
}

export function AIInsights({ transactions, goals = [] }: AIInsightsProps) {
  const { insights, score } = useMemo(() => deriveInsights(transactions, goals), [transactions, goals]);

  return (
    <Card glow className="overflow-hidden">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex shrink-0 flex-col items-center justify-center lg:w-[260px]">
          <AIScoreRing score={score} />
          <p className="mt-4 text-sm font-medium text-text-2">AI Financial Health Score</p>
          <p className="mt-1 text-xs text-muted">Based on {transactions.length} transactions</p>
        </div>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <h3 className="text-sm font-bold text-white">AI Insights & Recommendations</h3>
            </div>
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-text-2">{insights.length} findings</span>
          </div>
          <div className="space-y-2.5">
            {insights.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-success/10 text-success"><Sparkles size={22} /></span>
                <p className="text-sm font-medium text-white">All clear!</p>
                <p className="text-xs text-text-2">No issues detected in your transactions.</p>
              </div>
            )}
            {insights.map((ins, i) => {
              const meta = typeMeta[ins.type];
              return (
                <motion.div
                  key={ins.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="group flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 p-3.5 transition hover:border-white/15 hover:bg-white/5"
                >
                  <span className={cn('mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl', meta.tone)}>
                    <meta.icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">{ins.title}</p>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', meta.tone)}>{meta.label}</span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-text-2">{ins.detail}</p>
                  </div>
                  {ins.amount && (
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(ins.amount)}</p>
                      <p className="text-[10px] text-muted">impact</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          {insights.length > 0 && (
            <div className="mt-4 flex gap-2">
              <Button size="sm" leftIcon={<Sparkles size={14} />}>View Analysis</Button>
              <Button size="sm" variant="ghost" rightIcon={<ArrowRight size={14} />}>Ask AI</Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function AIScoreRing({ score }: { score: number }) {
  const r = 78;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const tone = score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-danger';
  const label = score >= 80 ? 'Healthy' : score >= 60 ? 'Fair' : 'At Risk';
  return (
    <div className="relative h-[200px] w-[200px]">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <motion.circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={score} className="text-5xl font-extrabold tracking-tight text-white" />
        <span className={cn('mt-1 text-xs font-medium uppercase tracking-wider', tone)}>{label}</span>
      </div>
      <div className="absolute -inset-2 -z-10 rounded-full bg-primary/20 blur-2xl" />
    </div>
  );
}
