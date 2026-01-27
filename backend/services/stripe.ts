import Stripe from 'stripe';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
const isStripeConfigured = STRIPE_KEY && !STRIPE_KEY.includes('placeholder');

const stripe = isStripeConfigured
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

export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<string> {
  if (!stripe) throw new Error('Stripe not configured. Add STRIPE_SECRET_KEY to .env');

  const { userId, userEmail, plan, successUrl, cancelUrl } = params;
  const planConfig = PRICING_PLANS[plan];

  if (!planConfig.priceId) throw new Error(`Price ID not configured for plan: ${plan}`);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: userEmail,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, plan },
  });

  if (!session.url) throw new Error('Failed to create checkout session');
  return session.url;
}

export async function createBillingPortalSession(customerId: string, returnUrl: string): Promise<string> {
  if (!stripe) throw new Error('Stripe not configured');
  const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
  return session.url;
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

export async function createStrategyCheckout(params: StrategyCheckoutParams): Promise<string> {
  if (!stripe) throw new Error('Stripe not configured. Add STRIPE_SECRET_KEY to .env');

  const { userId, userEmail, strategyId, strategyName, priceUsd, successUrl, cancelUrl } = params;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: userEmail,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Strategy: ${strategyName}`, description: 'One-time purchase' },
        unit_amount: priceUsd,
      },
      quantity: 1,
    }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, strategyId, type: 'strategy_purchase' },
  });

  if (!session.url) throw new Error('Failed to create checkout session');
  return session.url;
}

export async function handleWebhookEvent(payload: Buffer, signature: string): Promise<{ type: string; data: WebhookEventData }> {
  if (!stripe) throw new Error('Stripe not configured');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  return processStripeEvent(event);
}

interface WebhookEventData {
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

function processStripeEvent(event: Stripe.Event): { type: string; data: WebhookEventData } {
  const data: WebhookEventData = {};

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      data.subscriptionId = session.subscription as string;
      data.customerId = session.customer as string;
      data.userId = session.metadata?.userId;
      data.plan = session.metadata?.plan;
      data.strategyId = session.metadata?.strategyId;
      data.type = session.metadata?.type;
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      data.subscriptionId = subscription.id;
      data.customerId = subscription.customer as string;
      data.status = subscription.status;
      const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
      if (periodEnd) data.currentPeriodEnd = new Date(periodEnd * 1000);
      data.priceId = subscription.items.data[0]?.price.id;
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      data.subscriptionId = subscription.id;
      data.status = 'canceled';
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceSubscription = (invoice as unknown as { subscription?: string }).subscription;
      if (invoiceSubscription) data.subscriptionId = invoiceSubscription;
      data.status = 'past_due';
      break;
    }
  }

  return { type: event.type, data };
}

export { stripe, isStripeConfigured };
