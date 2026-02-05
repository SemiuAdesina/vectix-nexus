import { Router, Request, Response } from 'express';
import { getUserIdFromRequest } from '../lib/auth';
import { checkSubscriptionStatus } from '../lib/subscription';
import { prisma } from '../lib/prisma';
import { createCheckoutSession, handleWebhookEvent, PRICING_PLANS, PlanType } from '../services/stripe';

const router = Router();

router.get('/pricing', (_req: Request, res: Response) => {
  res.json({ plans: PRICING_PLANS });
});

router.post('/stripe/create-checkout', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { plan } = req.body as { plan: PlanType };
    if (!plan || !PRICING_PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const checkoutUrl = await createCheckoutSession({
      userId,
      userEmail: user.email,
      plan,
      successUrl: `${frontendUrl}/dashboard?subscription=success`,
      cancelUrl: `${frontendUrl}/pricing?subscription=canceled`,
    });

    return res.json({ url: checkoutUrl });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
});

router.post('/stripe/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) return res.status(400).json({ error: 'Missing stripe-signature header' });

    const { type, data } = await handleWebhookEvent(req.body, signature);

    if (type === 'checkout.session.completed') {
      if (data.type === 'strategy_purchase' && data.userId && data.strategyId) {
        const strategy = await prisma.strategy.findUnique({ where: { id: data.strategyId } });
        if (strategy) {
          await prisma.strategyPurchase.create({
            data: { userId: data.userId, strategyId: data.strategyId, pricePaid: strategy.priceUsd },
          });
          await prisma.strategy.update({ where: { id: data.strategyId }, data: { purchaseCount: { increment: 1 } } });
        }
      } else if (data.userId && data.plan) {
        await prisma.subscription.create({
          data: {
            userId: data.userId,
            plan: data.plan,
            status: 'active',
            stripeSubscriptionId: data.subscriptionId,
            currentPeriodEnd: data.currentPeriodEnd,
          },
        });
      }
    }

    if (type === 'customer.subscription.updated' && data.subscriptionId) {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: data.subscriptionId },
        data: { status: data.status || 'active', currentPeriodEnd: data.currentPeriodEnd },
      });
    }

    if (type === 'customer.subscription.deleted' && data.subscriptionId) {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: data.subscriptionId },
        data: { status: 'canceled' },
      });
    }

    if (type === 'invoice.payment_failed' && data.subscriptionId) {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: data.subscriptionId },
        data: { status: 'past_due' },
      });
    }

    return res.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(400).json({ error: errorMessage });
  }
});

router.get('/subscription/status', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const status = await checkSubscriptionStatus(userId);
    return res.json(status);
  } catch {
    return res.status(200).json({
      hasActiveSubscription: false,
      plan: undefined,
      planName: undefined,
      subscriptionId: undefined,
      stripeSubscriptionId: undefined,
      currentPeriodEnd: undefined,
      status: undefined,
    });
  }
});

router.post('/stripe/billing-portal', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    });

    if (!subscription?.stripeSubscriptionId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const { createBillingPortalSession, stripe } = await import('../services/stripe');
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    const customerId = stripeSubscription.customer as string;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const portalUrl = await createBillingPortalSession(customerId, `${frontendUrl}/dashboard/billing`);

    return res.json({ url: portalUrl });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
});

export default router;

