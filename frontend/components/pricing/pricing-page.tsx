'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createCheckoutSession, PricingPlan } from '@/lib/api/client';
import { Check, Loader2, Sparkles } from 'lucide-react';

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

export function PricingPage() {
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const handleSubscribe = async (planKey: string) => {
    setSubscribing(planKey);
    try {
      const url = await createCheckoutSession(planKey as 'hobby' | 'pro');
      window.location.href = url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Backend not connected. Please start the backend server.');
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 pt-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start deploying AI agents that trade, tweet, and earn for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {Object.entries(DEFAULT_PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`relative rounded-xl p-8 transition-all duration-200 ${
                key === 'pro'
                  ? 'glass border-2 border-primary'
                  : 'glass hover:border-primary/30'
              }`}
            >
              {key === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-background text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-primary">${(plan.price / 100).toFixed(0)}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                variant={key === 'pro' ? 'default' : 'secondary'}
                className="w-full"
                onClick={() => handleSubscribe(key)}
                disabled={subscribing !== null}
              >
                {subscribing === key ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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
