import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface DashboardHeroProps {
  onNewTransaction?: () => void;
}

export function DashboardHero({ onNewTransaction }: DashboardHeroProps) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-card border border-white/8 bg-gradient-to-br from-sidebar via-card to-bg p-6 sm:p-8"
    >
      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-purple/15 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-text-2">
            <Sparkles size={13} className="text-accent" />
            AI analyzed your latest transactions
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Good morning, <span className="text-gradient-blue">Alex</span>
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-text-2">
            Your finances are in good shape. I found <span className="font-semibold text-white">1 duplicate</span>,{' '}
            <span className="font-semibold text-white">2 savings opportunities</span>, and{' '}
            <span className="font-semibold text-white">$12,840</span> in potential savings this month.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button leftIcon={<Plus size={16} />} onClick={() => onNewTransaction?.() ?? navigate('/upload')}>New Transaction</Button>
            <Button variant="ghost" leftIcon={<Sparkles size={16} />} onClick={() => navigate('/copilot')}>Ask AI Copilot</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:w-[360px]">
          <HeroStat label="This month" value={184320} prefix="$" tone="text-white" />
          <HeroStat label="vs last month" value={9} suffix="%" tone="text-success" />
          <HeroStat label="Savings found" value={12840} prefix="$" tone="text-accent" />
          <HeroStat label="AI confidence" value={94} suffix="%" tone="text-purple" />
        </div>
      </div>
    </motion.div>
  );
}

function HeroStat({ label, value, prefix, suffix, tone }: { label: string; value: number; prefix?: string; suffix?: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold tracking-tight ${tone}`}>
        {prefix}
        <AnimatedNumber value={value} />
        {suffix}
      </p>
    </div>
  );
}
