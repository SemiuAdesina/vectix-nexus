'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSubscriptionStatus, openBillingPortal } from '@/lib/api/subscription';
import type { SubscriptionStatus } from '@/lib/api/types';
import Link from 'next/link';

const PLAN_FEATURES: Record<string, string[]> = {
  hobby: ['1 AI Agent', 'Basic support', '10GB logs', 'Standard monitoring'],
  pro: ['5 AI Agents', 'Priority support', '100GB logs', 'Advanced analytics', 'Token launching', 'Strategy marketplace'],
};

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const status = await getSubscriptionStatus();
        setSubscription(status);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      await openBillingPortal();
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!subscription?.hasActiveSubscription) {
    return <NoSubscription />;
  }

  const billingDate = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'N/A';

  const features = PLAN_FEATURES[subscription.plan || 'hobby'] || PLAN_FEATURES.hobby;

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
      </div>

      <div className="rounded-2xl border border-primary/20 bg-card p-6 mb-6 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.12)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="text-xl font-bold flex items-center gap-2 text-foreground mt-1">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              {subscription.planName || 'Pro Plan'}
            </p>
            {subscription.status === 'past_due' && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> Payment past due
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Next billing date</p>
            <p className="font-medium text-foreground">{billingDate}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading} className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary">
            {portalLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : null}
            Manage Subscription
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-card p-6 mb-6 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.08)]">
        <h3 className="font-semibold mb-4 text-foreground">Plan Features</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {features.map(feature => (
            <div key={feature} className="flex items-center gap-2 text-sm text-foreground">
              <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/20 shrink-0">
                <Check className="w-3.5 h-3.5 text-primary" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.08)]">
        <h3 className="font-semibold mb-4 text-foreground">Payment Method</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manage your payment methods through the Stripe billing portal.
        </p>
        <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading} className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary">
          <CreditCard className="w-4 h-4 shrink-0" /> Update Payment Method
        </Button>
      </div>
    </div>
  );
}

function NoSubscription() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">You dont have an active subscription</p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
      </div>
      <div className="rounded-2xl border border-primary/20 bg-card p-8 text-center shadow-[0_0_24px_-8px_hsl(var(--primary)/0.12)]">
        <div className="w-16 h-16 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-[0_0_16px_-6px_hsl(var(--primary)/0.2)]">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-foreground">No Active Subscription</h2>
        <p className="text-muted-foreground mb-6">Subscribe to unlock AI agent deployment.</p>
        <Link href="/pricing">
          <Button className="shadow-[0_0_14px_-4px_hsl(var(--primary)/0.4)]">
            <CreditCard className="w-4 h-4 shrink-0" /> View Plans
          </Button>
        </Link>
      </div>
    </div>
  );
}
