'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSidebar } from './sidebar-context';
import { SidebarNav } from './sidebar-nav';
import { SidebarUser } from './sidebar-user';
import { Shield, Menu, X, Sparkles, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');

  useEffect(() => {
    fetch('/api/subscription/status', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.isPro) setPlan('pro'); })
      .catch(() => { });
  }, []);

  useEffect(() => { setMobileOpen(false); }, []);

  const sidebarContent = (
    <>
      <SidebarNav collapsed={collapsed} onItemClick={() => setMobileOpen(false)} />
      <SidebarUser collapsed={collapsed} plan={plan} />
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`
        md:hidden fixed left-0 top-0 h-screen w-72 bg-card/95 backdrop-blur-xl border-r border-border/50
        flex flex-col z-50 transition-transform duration-300 ease-out shadow-2xl
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-border/50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-105">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              <Shield className="w-5 h-5 text-primary-foreground relative z-10" />
              <Sparkles className="w-3 h-3 text-primary-foreground/60 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent block leading-tight">VectixLogic</span>
              <span className="text-[9px] text-muted-foreground tracking-wider uppercase font-medium">Elite Security</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={`
        hidden md:flex fixed left-0 top-0 h-screen bg-card/50 backdrop-blur-xl border-r border-border/50
        flex-col z-40 transition-all duration-300 ease-out
        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50 shrink-0">
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shrink-0 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-105">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              <Shield className="w-5 h-5 text-primary-foreground relative z-10" />
              <Sparkles className="w-3 h-3 text-primary-foreground/60 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent block leading-tight">VectixLogic</span>
                <span className="text-[9px] text-muted-foreground tracking-wider uppercase font-medium">Elite Security</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-secondary/50 shrink-0 transition-colors group"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
