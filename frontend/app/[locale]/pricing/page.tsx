'use client';

import { PricingPage } from '@/components/pricing/pricing-page';
import { AppShell } from '@/components/layout';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthEnabled } from '@/contexts/auth-enabled';

function PricingSignedIn() {
  return (
    <AppShell>
      <PricingPage isSignedIn />
    </AppShell>
  );
}

function PricingPublic({ isSignedIn = false }: { isSignedIn?: boolean }) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">Vectix Foundry</span>
            </Link>
          </div>
        </div>
      </nav>
      <div className="pt-16">
        <PricingPage isSignedIn={isSignedIn} />
      </div>
    </>
  );
}

function PricingWithClerk() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return <PricingSignedIn />;
  return <PricingPublic isSignedIn={false} />;
}

export default function Pricing() {
  const authEnabled = useAuthEnabled();
  if (!authEnabled) return <PricingPublic />;
  return <PricingWithClerk />;
}
