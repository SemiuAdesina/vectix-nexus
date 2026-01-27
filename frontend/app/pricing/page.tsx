'use client';

import { PricingPage } from '@/components/pricing/pricing-page';
import { AppShell } from '@/components/layout';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pricing() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <AppShell>
        <PricingPage />
      </AppShell>
    );
  }

  return (
    <>
      <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-background" />
              </div>
              <span className="font-semibold">VectixLogic</span>
            </Link>
          </div>
        </div>
      </nav>
      <div className="pt-16">
        <PricingPage />
      </div>
    </>
  );
}
