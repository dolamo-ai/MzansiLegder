import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  glow?: boolean;
  className?: string;
}

export function Card({ children, glow = false, className, ...rest }: CardProps) {
  return (
    <motion.div
      className={cn(
        'card-base relative p-6',
        glow && 'card-glow',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
