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
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Billing & Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and payment methods</p>
      </div>

      <div className="glass rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {subscription.planName || 'Pro Plan'}
            </p>
            {subscription.status === 'past_due' && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" /> Payment past due
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Next billing date</p>
            <p className="font-medium">{billingDate}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading}>
            {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Manage Subscription
          </Button>
        </div>
      </div>

      <div className="glass rounded-xl p-6 mb-6">
        <h3 className="font-semibold mb-4">Plan Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map(feature => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-[hsl(var(--success))]" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-semibold mb-4">Payment Method</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manage your payment methods through the Stripe billing portal.
        </p>
        <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading}>
          <CreditCard className="w-4 h-4" /> Update Payment Method
        </Button>
      </div>
    </div>
  );
}

function NoSubscription() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Billing & Subscription</h1>
        <p className="text-sm text-muted-foreground">You don&apos;t have an active subscription</p>
      </div>
      <div className="glass rounded-xl p-6 sm:p-8 text-center">
        <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No Active Subscription</h2>
        <p className="text-muted-foreground mb-6">Subscribe to unlock AI agent deployment.</p>
        <Link href="/pricing">
          <Button><CreditCard className="w-4 h-4" /> View Plans</Button>
        </Link>
      </div>
    </div>
  );
}
