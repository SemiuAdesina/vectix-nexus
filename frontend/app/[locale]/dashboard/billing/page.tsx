'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { CreditCard, Check, Zap, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSubscriptionStatus, openBillingPortal } from '@/lib/api/subscription';
import type { SubscriptionStatus } from '@/lib/api/types';
import Link from 'next/link';

const BYPASS_SUBSCRIPTION = process.env.NEXT_PUBLIC_ALLOW_SUBSCRIPTION_BYPASS === 'true';
const PLAN_FEATURES: Record<string, string[]> = {
  hobby: ['1 AI Agent', 'Basic support', '10GB logs', 'Standard monitoring'],
  pro: ['5 AI Agents', 'Priority support', '100GB logs', 'Advanced analytics', 'Token launching', 'Strategy marketplace'],
};

export default function BillingPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (BYPASS_SUBSCRIPTION) {
      setSubscription({ hasActiveSubscription: true, plan: 'pro', planName: 'Pro Plan' });
      setLoading(false);
      return;
    }
    if (!isSignedIn) {
      setSubscription({ hasActiveSubscription: false });
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchSubscription = async () => {
      try {
        const status = await getSubscriptionStatus();
        if (!cancelled) setSubscription(status);
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSubscription();
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn]);

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
        <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white">Billing & Subscription</h1>
        <p className="text-sm sm:text-base text-slate-400">Manage your subscription and payment methods</p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-3 sm:mt-4" />
      </div>

      <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <p className="text-xs sm:text-sm text-slate-400">Current Plan</p>
            <p className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white mt-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
              </div>
              {subscription.planName || 'Pro Plan'}
            </p>
            {subscription.status === 'past_due' && (
              <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-2">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> Payment past due
              </p>
            )}
          </div>
          <div className="sm:text-right">
            <p className="text-xs sm:text-sm text-slate-400">Next billing date</p>
            <p className="font-medium text-sm sm:text-base text-white">{billingDate}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading} className="border-slate-600 text-slate-400 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-xs sm:text-sm">
          {portalLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : null}
          Manage Subscription
        </Button>
      </div>

      <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-white">Plan Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
          {features.map(feature => (
            <div key={feature} className="flex items-center gap-2 text-xs sm:text-sm text-white">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-teal-500/15 flex items-center justify-center border border-teal-500/20 shrink-0">
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-400" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-white">Payment Method</h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4">
          Manage your payment methods through the Stripe billing portal.
        </p>
        <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading} className="border-slate-600 text-slate-400 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400 text-xs sm:text-sm">
          <CreditCard className="w-4 h-4 shrink-0" /> Update Payment Method
        </Button>
      </div>
    </div>
  );
}

function NoSubscription() {
  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white">Billing & Subscription</h1>
        <p className="text-sm sm:text-base text-slate-400">You dont have an active subscription</p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-3 sm:mt-4" />
      </div>
      <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-5 sm:p-8 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-teal-500/30">
          <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-white">No Active Subscription</h2>
        <p className="text-sm sm:text-base text-slate-400 mb-4 sm:mb-6">Subscribe to unlock AI agent deployment.</p>
        <Link href="/pricing">
          <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20 text-sm sm:text-base">
            <CreditCard className="w-4 h-4 shrink-0" /> View Plans
          </Button>
        </Link>
      </div>
    </div>
  );
}
