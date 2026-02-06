'use client';

import { useState, useEffect } from 'react';
import { FleetGrid } from '@/components/fleet';
import { RiskDisclaimer } from '@/components/risk-disclaimer';
import { getSubscriptionStatus, SubscriptionStatus } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Lock, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const status = await getSubscriptionStatus();
        setSubscription(status);
      } catch (error) {
        console.error('Failed to check subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    checkSubscription();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
      </div>
    );
  }

  const isDev = process.env.NODE_ENV === 'development';
  const noSubscription = subscription != null && !subscription.hasActiveSubscription;
  if (noSubscription && !isDev) {
    return <SubscriptionRequired />;
  }

  return (
    <div className="space-y-6">
      <RiskDisclaimer />
      <FleetGrid />
    </div>
  );
}

function SubscriptionRequired() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-10 max-w-md text-center backdrop-blur-sm">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6 border border-slate-700">
          <Lock className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-white">Subscription Required</h2>
        <p className="text-slate-400 mb-8">
          Unlock the power of AI agents with a subscription plan.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/pricing">
            <Button size="lg" className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0">
              <CreditCard className="w-5 h-5" /> View Plans
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline" className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400 hover:border-teal-500/30">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
