'use client';

import { Sidebar } from './sidebar';
import { Breadcrumb } from './breadcrumb';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-16 lg:pl-60 transition-all duration-300">
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="h-full flex items-center px-6 lg:px-8 max-w-7xl">
            <Breadcrumb />
          </div>
        </header>
        <main className="p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
