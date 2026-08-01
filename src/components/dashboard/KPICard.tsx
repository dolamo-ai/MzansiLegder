import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { cn, formatCurrency } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: number;
  format?: 'currency' | 'number';
  delta: number;
  icon: LucideIcon;
  iconTone: string;
  chart: ReactNode;
  delay?: number;
}

export function KPICard({ label, value, format = 'currency', delta, icon: Icon, iconTone, chart, delay = 0 }: KPICardProps) {
  const up = delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card glow className="group relative overflow-hidden p-5">
        <div className="flex items-start justify-between">
          <span className={cn('grid h-10 w-10 place-items-center rounded-xl', iconTone)}>
            <Icon size={18} />
          </span>
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
            up ? 'bg-success/10 text-[#6ee7b7]' : 'bg-danger/10 text-[#fca5a5]',
          )}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta)}%
          </div>
        </div>
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-white">
          {format === 'currency' ? '$' : ''}
          <AnimatedNumber value={value} compact={value >= 100000} />
        </p>
        <div className="mt-3 h-12">{chart}</div>
      </Card>
    </motion.div>
  );
}

export function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return [x, y];
  });
  const line = pts.map((p) => p.join(',')).join(' ');
  const area = `0,${h} ${line} ${w},${h}`;
  const gid = `spark-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function MiniBars({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-full items-end gap-1">
      {data.map((v, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm"
          style={{ backgroundColor: color, opacity: 0.3 + (v / max) * 0.7 }}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.5 }}
        />
      ))}
    </div>
  );
}

export { formatCurrency };
