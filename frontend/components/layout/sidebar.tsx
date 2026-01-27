'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutGrid,
  Bot,
  Plus,
  Store,
  Eye,
  Flame,
  CreditCard,
  Users,
  Shield,
  Key,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
      { icon: Bot, label: 'My Agents', href: '/dashboard/agents' },
      { icon: Plus, label: 'New Agent', href: '/create' },
    ],
  },
  {
    title: 'DISCOVERY',
    items: [
      { icon: Store, label: 'Marketplace', href: '/dashboard/marketplace' },
      { icon: Eye, label: 'Analysis', href: '/dashboard/analysis' },
      { icon: Flame, label: 'Trending', href: '/dashboard/trending' },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
      { icon: Users, label: 'Affiliates', href: '/dashboard/affiliates' },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { icon: Shield, label: 'Security', href: '/advanced' },
      { icon: Key, label: 'API Keys', href: '/dashboard/api-keys' },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-40 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-background" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm truncate">VECTIX FOUNDRY</span>
              <span className="text-[10px] text-muted-foreground">v1.0</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-6">
            {!collapsed && (
              <p className="text-[10px] font-semibold text-muted-foreground px-2 mb-2 tracking-wider uppercase">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    {!collapsed && <span className="text-sm truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={`p-3 border-t border-border shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? '' : 'px-2'}`}>
          <UserButton afterSignOutUrl="/" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Account</p>
              <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
