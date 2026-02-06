'use client';

import { Sidebar } from './sidebar';
import { Breadcrumb } from './breadcrumb';
import { useSidebar } from './sidebar-context';
import { SidebarProvider } from './sidebar-context';

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellContent({ children }: AppShellProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div
        className={`transition-all duration-300 ml-0 ${collapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}
      >
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-sm pl-16 md:pl-0">
          <div className="h-full flex items-center px-4 md:px-6 lg:px-8 max-w-7xl">
            <Breadcrumb />
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)] bg-slate-950">
          <div className="max-w-7xl mx-auto">{children}</div>
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
