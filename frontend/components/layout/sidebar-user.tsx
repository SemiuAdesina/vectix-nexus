'use client';

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
    <div
      className={`
        shrink-0 border-t border-slate-800/80 bg-gradient-to-t from-slate-900/80 to-transparent
        p-4 space-y-3
        ${collapsed ? 'flex flex-col items-center' : ''}
      `}
    >
      <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
        <div className="relative rounded-full ring-2 ring-slate-700 ring-offset-2 ring-offset-slate-950 hover:ring-teal-500/40 transition-all">
          <UserButton afterSignOutUrl="/" />
          {plan === 'pro' && (
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">
              {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'Operator'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${plan === 'pro' ? 'bg-amber-500' : 'bg-teal-500'}`}
              />
              <span className={`text-[11px] font-medium truncate ${plan === 'pro' ? 'text-amber-400' : 'text-teal-400'}`}>
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
          size="sm"
          className="w-full justify-start gap-2 text-sm border-slate-700 hover:border-teal-500/40 hover:bg-teal-500/10 hover:text-teal-400 text-slate-400"
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
          className="w-10 h-10 border-slate-700 hover:border-teal-500/40 hover:bg-teal-500/10 hover:text-teal-400 text-slate-400"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
