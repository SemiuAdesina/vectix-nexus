'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useSidebar } from './sidebar-context';
import { SidebarNav } from './sidebar-nav';
import { SidebarUser } from './sidebar-user';
import { getBackendUrl } from '@/lib/api/auth';
import { useAuthEnabled } from '@/contexts/auth-enabled';
import { Zap, X, PanelLeftClose, PanelLeftOpen, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SidebarAuthBlock({ collapsed }: { collapsed: boolean }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
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

  return <SidebarUser collapsed={collapsed} plan={plan} />;
}

function SidebarSignInFallback({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={`shrink-0 border-t border-slate-800/80 p-4 ${collapsed ? 'flex flex-col items-center' : ''}`}
    >
      <Link href="/sign-in">
        <Button
          variant="outline"
          size={collapsed ? 'icon' : 'sm'}
          className="w-full justify-start gap-2 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400"
        >
          <LogIn className="w-4 h-4" />
          {!collapsed && <span>Sign In</span>}
        </Button>
      </Link>
    </div>
  );
}

export function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const authEnabled = useAuthEnabled();

  useEffect(() => { setMobileOpen(false); }, []);

  const sidebarContent = (
    <>
      <SidebarNav collapsed={collapsed} onItemClick={() => setMobileOpen(false)} />
      {authEnabled ? (
        <SidebarAuthBlock collapsed={collapsed} />
      ) : (
        <SidebarSignInFallback collapsed={collapsed} />
      )}
    </>
  );

  const headerBlock = (
    <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
      <Link href="/" className="flex items-center gap-3 overflow-hidden group">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/25 ring-1 ring-white/10">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden min-w-0">
            <span className="font-bold text-sm tracking-tight text-white block truncate">VECTIX FOUNDRY</span>
            <span className="text-[10px] text-slate-400 tracking-widest uppercase font-medium">v1.0</span>
          </div>
        )}
      </Link>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-2 rounded-lg hover:bg-slate-800/80 hover:text-teal-400 text-slate-400 shrink-0 transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
      </button>
    </div>
  );

  const mobileOverlay = mobileOpen && (
    <div className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
  );

  const desktopAside = (
    <aside
      className={`
        hidden md:flex fixed left-0 top-0 h-screen flex-col z-40 transition-all duration-300 ease-out
        bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80
        shadow-[4px_0_32px_-8px_rgba(0,0,0,0.5)]
        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-teal-500/40 via-cyan-500/20 to-transparent pointer-events-none" />
      {headerBlock}
      {sidebarContent}
    </aside>
  );

  const mobileAside = (
    <aside
      className={`
        md:hidden fixed left-0 top-0 h-screen w-72 flex flex-col z-50 transition-transform duration-300 ease-out
        bg-slate-950 border-r border-slate-800 shadow-2xl
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-teal-500/40 to-transparent pointer-events-none" />
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">VECTIX FOUNDRY</span>
            <span className="text-[10px] text-slate-400 tracking-widest uppercase">v1.0</span>
          </div>
        </Link>
        <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-teal-400">
          <X className="w-4 h-4" />
        </button>
      </div>
      {sidebarContent}
    </aside>
  );

  return (
    <>
      {mobileOverlay}
      {mobileAside}
      {desktopAside}
    </>
  );
}
