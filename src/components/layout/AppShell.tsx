import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[280px]">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
