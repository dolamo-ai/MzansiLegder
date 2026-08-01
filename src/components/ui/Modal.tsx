import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, title, subtitle, footer, className }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'relative w-full max-w-2xl rounded-modal border border-white/10 bg-card shadow-2xl',
              className,
            )}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {(title || subtitle) && (
              <div className="flex items-start justify-between gap-4 border-b border-white/8 p-6">
                <div>
                  {title && <h2 className="text-lg font-bold text-white">{title}</h2>}
                  {subtitle && <p className="mt-1 text-sm text-text-2">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 text-text-2 transition hover:bg-white/5 hover:text-white"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
            {footer && <div className="border-t border-white/8 p-6">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
