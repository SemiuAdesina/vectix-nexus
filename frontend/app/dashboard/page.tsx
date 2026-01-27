'use client';

import { useState, useEffect } from 'react';
import { FleetGrid } from '@/components/fleet';
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
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const isDev = process.env.NODE_ENV === 'development';
  if (!subscription?.hasActiveSubscription && !isDev) {
    return <SubscriptionRequired />;
  }

  return <FleetGrid />;
}

function SubscriptionRequired() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="glass rounded-xl p-10 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Subscription Required</h2>
        <p className="text-muted-foreground mb-8">
          Unlock the power of AI agents with a subscription plan.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/pricing">
            <Button size="lg" className="w-full">
              <CreditCard className="w-5 h-5" /> View Plans
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
