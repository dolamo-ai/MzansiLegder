import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const variants: Record<Variant, string> = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  outline: 'bg-transparent border border-white/10 text-white hover:bg-white/5 hover:border-white/20',
  danger: 'bg-danger/90 hover:bg-danger text-white border border-danger/40 shadow-soft',
  success: 'bg-success/90 hover:bg-success text-white border border-success/40 shadow-soft',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', leftIcon, rightIcon, fullWidth, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-btn font-medium select-none whitespace-nowrap',
        'transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        sizes[size],
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
});
