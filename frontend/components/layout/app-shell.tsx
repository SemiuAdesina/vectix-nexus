'use client';

import { Sidebar } from './sidebar';
import { Breadcrumb } from './breadcrumb';
import { useSidebar } from './sidebar-context';
import { SidebarProvider } from './sidebar-context';
import { Menu } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellContent({ children }: AppShellProps) {
  const { collapsed, setMobileOpen } = useSidebar();

  return (
    <div className="h-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <div
        className={`h-screen flex flex-col overflow-hidden transition-all duration-300 ml-0 min-w-0 ${collapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}
      >
        <header className="shrink-0 z-30 h-14 md:h-16 border-b border-slate-800/80 bg-slate-950 sm:bg-slate-950/95 sm:backdrop-blur-sm">
          <div className="h-full flex items-center gap-2.5 px-3 md:px-6 lg:px-8 max-w-7xl">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800/60 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="md:hidden h-4 w-px bg-slate-700/60" />
            <Breadcrumb />
          </div>
        </header>
        <main className="flex-1 min-h-0 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto w-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  );
}
