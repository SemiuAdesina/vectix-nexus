'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Rocket, Wallet, LogIn, Loader2 } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';
import { useAuthEnabled } from '@/contexts/auth-enabled';

function NavbarAuthActions() {
  const { isLoaded } = useAuth();
  if (!isLoaded) {
    return <Loader2 className="w-5 h-5 animate-spin text-slate-500" />;
  }
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800">
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard">
          <Button className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0">
            <Rocket className="w-4 h-4" /> Dashboard
          </Button>
        </Link>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  );
}

export function Navbar() {
  const authEnabled = useAuthEnabled();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Vectix Foundry</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-slate-400 hover:text-white transition-colors hidden sm:flex items-center gap-2 text-sm"
          >
            <Wallet className="w-4 h-4" />
            Pricing
          </Link>
          {authEnabled ? (
            <NavbarAuthActions />
          ) : (
            <Link href="/sign-in">
              <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800">
                <LogIn className="w-4 h-4" /> Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
