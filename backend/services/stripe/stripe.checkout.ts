import {
  stripe,
  PRICING_PLANS,
  CreateCheckoutSessionParams,
  StrategyCheckoutParams,
} from './stripe.config';

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
