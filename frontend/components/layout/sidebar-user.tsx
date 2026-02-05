'use client';

import React from 'react';
import { UserButton, useUser, useClerk } from '@clerk/nextjs';
import { Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarUserProps {
  collapsed: boolean;
  plan: 'free' | 'pro';
}

export function SidebarUser({ collapsed, plan }: SidebarUserProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl: '/' });
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className={`p-4 border-t border-primary/10 shrink-0 space-y-3 bg-gradient-to-t from-primary/5 to-transparent ${collapsed ? 'flex flex-col items-center' : ''}`}>
      <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : 'px-1'}`}>
        <div className="relative ring-2 ring-border/50 rounded-full ring-offset-2 ring-offset-transparent hover:ring-primary/40 transition-all duration-200">
          <UserButton afterSignOutUrl="/" />
          {plan === 'pro' && (
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{user?.firstName || user?.emailAddresses[0]?.emailAddress || 'Operator'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${plan === 'pro' ? 'bg-amber-500 shadow-[0_0_6px_rgba(251,191,36,0.4)]' : 'bg-primary/60 shadow-[0_0_6px_hsl(var(--primary)/0.3)]'}`} />
              <span className={`text-[11px] font-medium truncate ${plan === 'pro' ? 'text-amber-400/90' : 'text-primary/90'}`}>
                {plan === 'pro' ? 'Pro Tier' : 'Free Tier'}
              </span>
            </div>
          </div>
        )}
      </div>
      {!collapsed && (
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full justify-start gap-2 text-sm border-border/60 hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all duration-200"
          size="sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      )}
      {collapsed && (
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="icon"
          className="w-10 h-10 hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all duration-200"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
