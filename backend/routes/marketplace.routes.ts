import { Router, Request, Response } from 'express';
import { getUserIdFromRequest, getOrCreateUser } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { DEFAULT_STRATEGIES } from '../data/default-strategies';
import { createStrategyCheckout } from '../services/stripe';
import { getParam } from '../lib/route-helpers';

const router = Router();

router.get('/marketplace/strategies', async (req: Request, res: Response) => {
  try {
    const { category, featured } = req.query;
    const where: Record<string, unknown> = { verified: true };
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;

    const strategies = await prisma.strategy.findMany({
      where,
      include: { author: { select: { id: true, name: true } } },
      orderBy: [{ featured: 'desc' }, { purchaseCount: 'desc' }],
    });

    return res.status(200).json({ success: true, strategies });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/marketplace/strategies/:id', async (req: Request, res: Response) => {
  try {
    const strategy = await prisma.strategy.findUnique({
      where: { id: getParam(req, 'id') },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!strategy) return res.status(404).json({ success: false, error: 'Strategy not found' });
    return res.status(200).json({ success: true, strategy });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/marketplace/strategies/:id/purchase', async (req: Request, res: Response) => {
  try {
    const authResult = await getOrCreateUser(req);
    if (!authResult) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const { userId, user } = authResult;
    const id = getParam(req, 'id');
    
    const strategy = await prisma.strategy.findUnique({ where: { id } });
    if (!strategy) return res.status(404).json({ success: false, error: 'Strategy not found' });

    const existing = await prisma.strategyPurchase.findUnique({ where: { userId_strategyId: { userId, strategyId: id } } });
    if (existing) return res.status(200).json({ success: true, alreadyOwned: true });

    if (strategy.priceUsd === 0) {
      await prisma.strategyPurchase.create({ data: { userId, strategyId: id, pricePaid: 0 } });
      await prisma.strategy.update({ where: { id }, data: { purchaseCount: { increment: 1 } } });
      return res.status(200).json({ success: true, purchased: true });
    }

    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const checkoutUrl = await createStrategyCheckout({
        userId,
        userEmail: user.email,
        strategyId: id,
        strategyName: strategy.name,
        priceUsd: strategy.priceUsd,
        successUrl: `${frontendUrl}/create?strategy=${id}&purchased=true`,
        cancelUrl: `${frontendUrl}/create?strategy=${id}&canceled=true`,
      });
      return res.status(200).json({ success: false, requiresPayment: true, checkoutUrl });
    } catch (stripeError) {
      const msg = stripeError instanceof Error ? stripeError.message : 'Stripe error';
      return res.status(500).json({ success: false, error: msg });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/marketplace/purchased', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const purchases = await prisma.strategyPurchase.findMany({ where: { userId }, include: { strategy: true } });
    return res.status(200).json({ success: true, strategies: purchases.map((p: { strategy: unknown }) => p.strategy) });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/marketplace/strategies', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { name, description, priceUsd, configJson, category, icon } = req.body;
    if (!name || !description || !configJson || !category) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const strategy = await prisma.strategy.create({
      data: {
        name, description, priceUsd: priceUsd || 0, category, icon, authorId: userId, verified: false,
        configJson: typeof configJson === 'string' ? configJson : JSON.stringify(configJson),
      },
    });

    return res.status(201).json({ success: true, strategy });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/marketplace/seed', async (_req: Request, res: Response) => {
  try {
    let admin = await prisma.user.findFirst({ where: { email: 'admin@vectixlogic.com' } });
    if (!admin) admin = await prisma.user.create({ data: { email: 'admin@vectixlogic.com', name: 'VectixLogic' } });

    const created: string[] = [];
    for (const s of DEFAULT_STRATEGIES) {
      const exists = await prisma.strategy.findFirst({ where: { name: s.name } });
      if (!exists) {
        await prisma.strategy.create({ data: { ...s, authorId: admin.id } });
        created.push(s.name);
      }
    }

    return res.status(200).json({ success: true, message: `Created ${created.length} strategies`, created });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
