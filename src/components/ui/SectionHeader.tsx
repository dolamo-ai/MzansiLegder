import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div>
        <h2 className="text-base font-bold tracking-tight text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-text-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
