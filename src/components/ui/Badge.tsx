import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'accent';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}

const tones: Record<Tone, string> = {
  neutral: 'bg-white/5 text-text-2 border-white/10',
  primary: 'bg-primary/15 text-[#93c5fd] border-primary/30',
  success: 'bg-success/15 text-[#6ee7b7] border-success/30',
  warning: 'bg-warning/15 text-[#fcd34d] border-warning/30',
  danger: 'bg-danger/15 text-[#fca5a5] border-danger/30',
  purple: 'bg-purple/15 text-[#c4b5fd] border-purple/30',
  accent: 'bg-accent/15 text-[#67e8f9] border-accent/30',
};

const dotColors: Record<Tone, string> = {
  neutral: 'bg-text-2',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  purple: 'bg-purple',
  accent: 'bg-accent',
};

export function Badge({ children, tone = 'neutral', dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[tone])} />}
      {children}
    </span>
  );
}
