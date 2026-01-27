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
    <div className={`p-4 border-t border-border/50 shrink-0 space-y-3 ${collapsed ? 'flex flex-col items-center' : ''}`}>
      <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : 'px-1'}`}>
        <div className="relative">
          <UserButton afterSignOutUrl="/" />
          {plan === 'pro' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.firstName || user?.emailAddresses[0]?.emailAddress || 'Operator'}</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${plan === 'pro' ? 'bg-amber-500' : 'bg-muted-foreground/50'}`} />
              <p className="text-[11px] text-muted-foreground truncate">
                {plan === 'pro' ? 'Pro Tier' : 'Free Tier'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {!collapsed && (
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full justify-start gap-2 text-sm"
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
          className="w-10 h-10"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
