import Stripe from 'stripe';
import { stripe, WebhookEventData } from './stripe.config';

export async function handleWebhookEvent(payload: Buffer, signature: string): Promise<{ type: string; data: WebhookEventData }> {
  if (!stripe) throw new Error('Stripe not configured');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  return processStripeEvent(event);
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
