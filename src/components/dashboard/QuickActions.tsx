import { Upload, FileText, FileSpreadsheet, BarChart3, Target, Sparkles, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  icon: LucideIcon;
  tone: string;
  to: string;
}

const actions: QuickAction[] = [
  { label: 'Upload Receipt', icon: Upload, tone: 'from-primary/20 to-primary/5 text-[#93c5fd]', to: '/upload' },
  { label: 'Upload Invoice', icon: FileText, tone: 'from-purple/20 to-purple/5 text-[#c4b5fd]', to: '/upload' },
  { label: 'Upload CSV', icon: FileSpreadsheet, tone: 'from-accent/20 to-accent/5 text-[#67e8f9]', to: '/upload' },
  { label: 'Generate Report', icon: BarChart3, tone: 'from-success/20 to-success/5 text-[#6ee7b7]', to: '/reports' },
  { label: 'Analyze Spending', icon: Sparkles, tone: 'from-warning/20 to-warning/5 text-[#fcd34d]', to: '/analytics' },
  { label: 'Create Goal', icon: Target, tone: 'from-primary/20 to-accent/5 text-[#93c5fd]', to: '/goals' },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {actions.map((a, i) => (
        <motion.button
          key={a.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -2 }}
          className={cn(
            'group flex items-center gap-3 rounded-2xl border border-white/8 bg-gradient-to-br p-4 text-left transition hover:border-white/15',
            a.tone,
          )}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10">
            <a.icon size={18} />
          </span>
          <span className="text-sm font-semibold text-white">{a.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
