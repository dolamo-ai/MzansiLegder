import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export function Input({ label, leftIcon, rightIcon, containerClassName, className, id, ...rest }: InputProps) {
  const inputId = id || (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-xs font-medium text-text-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'input-base h-12 w-full px-4 text-sm',
            leftIcon && 'pl-11',
            rightIcon && 'pr-11',
            className,
          )}
          {...rest}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{rightIcon}</span>
        )}
      </div>
    </div>
  );
}
