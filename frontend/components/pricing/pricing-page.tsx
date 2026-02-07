'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createCheckoutSession, PricingPlan } from '@/lib/api/client';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

const BYPASS_SUBSCRIPTION = process.env.NEXT_PUBLIC_ALLOW_SUBSCRIPTION_BYPASS === 'true';

const DEFAULT_PLANS: Record<string, PricingPlan> = {
  hobby: {
    name: 'Hobby Agent',
    price: 2900,
    priceId: 'price_hobby',
    features: ['1 AI Agent', 'Basic Analytics', 'Community Support', '10K API calls/month'],
  },
  pro: {
    name: 'Pro Agent',
    price: 9900,
    priceId: 'price_pro',
    features: ['5 AI Agents', 'Advanced Analytics', 'Priority Support', 'Unlimited API calls', 'Custom Strategies', 'Webhook Integrations'],
  },
};

interface PricingPageProps {
  isSignedIn?: boolean;
}

export function PricingPage({ isSignedIn = false }: PricingPageProps) {
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const router = useRouter();

  const handleSubscribe = async (planKey: string) => {
    setSubscribing(planKey);
    if (BYPASS_SUBSCRIPTION) {
      if (isSignedIn) {
        router.push('/create');
        return;
      }
      router.push(`/sign-in?redirect_url=${encodeURIComponent('/create')}`);
      return;
    }
    try {
      const url = await createCheckoutSession(planKey as 'hobby' | 'pro');
      window.location.href = url;
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (/unauthorized|sign in/i.test(msg)) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      console.error('Failed to create checkout session:', error);
      if (error instanceof TypeError || /fetch|network/i.test(msg)) {
        alert('Backend not connected. Please start the backend server.');
        return;
      }
      alert(msg || 'Failed to create checkout session');
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-10 bg-slate-950">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 pt-2 sm:pt-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-white">
            Choose Your Plan
          </h1>
          <p className="text-sm sm:text-lg text-slate-400 max-w-xl mx-auto">
            Start deploying AI agents that trade, tweet, and earn for you
          </p>
          <div className="w-20 sm:w-24 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-4 sm:mt-6 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {Object.entries(DEFAULT_PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`relative rounded-xl sm:rounded-2xl border p-5 sm:p-8 transition-all duration-200 ${
                key === 'pro'
                  ? 'border-teal-500/40 bg-slate-900/50 shadow-[0_0_28px_-10px_rgba(20,184,166,0.18)] hover:shadow-[0_0_32px_-10px_rgba(20,184,166,0.22)]'
                  : 'border-slate-700/50 bg-slate-900/50 hover:border-teal-500/30 hover:shadow-[0_0_24px_-8px_rgba(20,184,166,0.12)]'
              }`}
            >
              {key === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-teal-500 text-white text-[10px] sm:text-xs font-semibold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 border border-teal-500/30 shadow-lg shadow-teal-500/25 whitespace-nowrap">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-teal-400">${(plan.price / 100).toFixed(0)}</span>
                  <span className="text-sm sm:text-base text-slate-400">/month</span>
                </div>
              </div>

              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-teal-500/15 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-400" />
                    </div>
                    <span className="text-slate-400 text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={key === 'pro' ? 'default' : 'outline'}
                className={`w-full h-10 sm:h-12 text-sm sm:text-base ${key === 'pro' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20' : 'border-slate-600 text-slate-400 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400'}`}
                onClick={() => handleSubscribe(key)}
                disabled={subscribing !== null}
              >
                {subscribing === key ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    Processing...
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
