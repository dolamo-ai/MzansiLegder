import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  height?: number;
}

export function Progress({ value, max = 100, className, barClassName, height = 8 }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-white/5', className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
    >
      <div
        className={cn('h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-700 ease-out', barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
