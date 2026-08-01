import { Search, Bell, Moon, Sun, Sparkles, Menu, Command } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const [dark, setDark] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/8 bg-bg/80 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-xl p-2 text-text-2 hover:bg-white/5 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search transactions, invoices, vendors…"
          className="input-base h-10 w-full pl-11 pr-16 text-sm"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-muted sm:flex">
          <Command size={10} /> K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* AI status */}
        <div className="hidden items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-xs font-medium text-[#6ee7b7]">AI Active</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-xl p-2.5 text-text-2 transition hover:bg-white/5 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-bg" />
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-12 z-20 w-80 rounded-2xl border border-white/10 bg-card p-2 shadow-2xl">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted">Notifications</p>
                {[
                  { t: 'Duplicate charge flagged', d: 'Google Ads TX-10427', c: 'text-danger' },
                  { t: 'Budget exceeded', d: 'Marketing at 108%', c: 'text-warning' },
                  { t: 'Receipt processed', d: 'United Airlines', c: 'text-success' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-white/5">
                    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.c.replace('text-', 'bg-'))} />
                    <div>
                      <p className="text-sm font-medium text-white">{n.t}</p>
                      <p className="text-xs text-text-2">{n.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDark((v) => !v)}
          className="rounded-xl p-2.5 text-text-2 transition hover:bg-white/5 hover:text-white"
          aria-label="Toggle theme"
        >
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* AI button */}
        <button className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 px-3.5 py-2 text-sm font-medium text-white ring-1 ring-white/10 transition hover:from-primary/30 hover:to-accent/30 sm:flex">
          <Sparkles size={15} className="text-accent" />
          Ask AI
        </button>

        {/* Avatar */}
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-purple to-primary text-sm font-bold text-white ring-2 ring-white/10">
          AM
        </div>
      </div>
    </header>
  );
}
