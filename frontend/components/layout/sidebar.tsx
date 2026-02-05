'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useSidebar } from './sidebar-context';
import { SidebarNav } from './sidebar-nav';
import { SidebarUser } from './sidebar-user';
import { getBackendUrl } from '@/lib/api/auth';
import { Shield, Menu, X, Sparkles, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (cancelled || !token) return;
        const r = await fetch(`${getBackendUrl()}/api/subscription/status`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (cancelled) return;
        if (r.ok) {
          const data = await r.json();
          if (data?.plan === 'pro') setPlan('pro');
        }
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => { setMobileOpen(false); }, []);

  const sidebarContent = (
    <>
      <SidebarNav collapsed={collapsed} onItemClick={() => setMobileOpen(false)} />
      <SidebarUser collapsed={collapsed} plan={plan} />
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-primary/30 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        md:hidden fixed left-0 top-0 h-screen w-72 bg-card/95 backdrop-blur-xl border-r border-primary/10
        flex flex-col z-50 transition-transform duration-300 ease-out shadow-2xl shadow-primary/5
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-primary/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-105">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              <Shield className="w-5 h-5 text-primary-foreground relative z-10" />
              <Sparkles className="w-3 h-3 text-primary-foreground/60 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent block leading-tight">VECTIX FOUNDRY</span>
              <span className="text-[9px] text-muted-foreground tracking-wider uppercase font-medium">v1.0</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      <aside className={`
        hidden md:flex fixed left-0 top-0 h-screen bg-card/60 backdrop-blur-xl border-r border-primary/10
        flex-col z-40 transition-all duration-300 ease-out shadow-[4px_0_24px_-8px_hsl(var(--primary)/0.15)]
        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-primary/10 shrink-0">
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shrink-0 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-105">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              <Shield className="w-5 h-5 text-primary-foreground relative z-10" />
              <Sparkles className="w-3 h-3 text-primary-foreground/60 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent block leading-tight">VECTIX FOUNDRY</span>
                <span className="text-[9px] text-muted-foreground tracking-wider uppercase font-medium">v1.0</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary shrink-0 transition-all duration-200 group"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
