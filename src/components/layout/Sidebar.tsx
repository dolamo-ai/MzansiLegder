import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Receipt,
  FileText,
  BarChart3,
  Upload,
  Target,
  Bell,
  Settings,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/copilot', label: 'AI Copilot', icon: Sparkles },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-white/8 bg-sidebar transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 16 L9 7 L12 12 L15 9 L20 16" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-white">CostPilot AI</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Financial Copilot</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-text-2 hover:bg-white/5 lg:hidden" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="no-scrollbar mt-2 flex-1 overflow-y-auto px-3">
          <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted">Workspace</p>
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-white/8 text-white'
                        : 'text-text-2 hover:bg-white/5 hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-primary to-accent"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <item.icon size={18} className={cn('transition-colors', isActive ? 'text-accent' : 'text-muted group-hover:text-text-2')} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* AI Copilot card */}
        <div className="p-3">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-primary/20 via-purple/10 to-accent/10 p-4">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/30 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10">
                  <Sparkles size={14} className="text-accent" />
                </span>
                <p className="text-sm font-semibold text-white">AI Copilot</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-2">
                Ask anything about your finances.
              </p>
              <NavLink
                to="/copilot"
                onClick={onClose}
                className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl bg-white/10 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                Chat with AI
              </NavLink>
            </div>
          </div>
        </div>

        {/* User profile */}
        <div className="border-t border-white/8 p-3">
          <div className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-purple to-primary text-sm font-bold text-white">
              AM
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">Alex Morgan</p>
              <p className="truncate text-xs text-muted">alex@northwind.co</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
