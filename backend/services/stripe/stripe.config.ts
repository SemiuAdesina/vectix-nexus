import Stripe from 'stripe';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
export const isStripeConfigured = Boolean(STRIPE_KEY && !STRIPE_KEY.includes('placeholder'));

export const stripe = isStripeConfigured
  ? new Stripe(STRIPE_KEY, { apiVersion: '2025-12-15.clover' })
  : null;

export const PRICING_PLANS = {
  hobby: {
    name: 'Hobby Agent',
    price: 2900,
    priceId: process.env.STRIPE_HOBBY_PRICE_ID || '',
    features: ['1 Agent', 'Basic support', '10GB logs'],
  },
  pro: {
    name: 'Pro Agent',
    price: 9900,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: ['5 Agents', 'Priority support', '100GB logs', 'Advanced analytics'],
  },
} as const;

export type PlanType = keyof typeof PRICING_PLANS;

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  plan: PlanType;
  successUrl: string;
  cancelUrl: string;
}

export interface StrategyCheckoutParams {
  userId: string;
  userEmail: string;
  strategyId: string;
  strategyName: string;
  priceUsd: number;
  successUrl: string;
  cancelUrl: string;
}

export interface WebhookEventData {
  subscriptionId?: string;
  customerId?: string;
  userId?: string;
  plan?: string;
  status?: string;
  currentPeriodEnd?: Date;
  priceId?: string;
  strategyId?: string;
  type?: string;
}
