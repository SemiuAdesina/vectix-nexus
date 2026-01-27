import { Router, Response } from 'express';
import { apiKeyAuth, requireScope, requireTier, ApiAuthRequest } from '../middleware/api-auth.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

router.use(apiKeyAuth);

router.get('/agents', requireScope('read:agents'), async (req: ApiAuthRequest, res: Response) => {
  const agents = await prisma.agent.findMany({
    where: { userId: req.apiAuth!.userId },
    select: { id: true, name: true, status: true, walletAddress: true, createdAt: true },
  });
  res.json({ agents });
});

router.get('/agents/:id', requireScope('read:agents'), async (req: ApiAuthRequest, res: Response) => {
  const agent = await prisma.agent.findFirst({
    where: { id: req.params.id, userId: req.apiAuth!.userId },
    select: { id: true, name: true, status: true, walletAddress: true, createdAt: true, updatedAt: true },
  });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json({ agent });
});

router.get('/agents/:id/logs', requireScope('read:logs'), async (req: ApiAuthRequest, res: Response) => {
  const agent = await prisma.agent.findFirst({
    where: { id: req.params.id, userId: req.apiAuth!.userId },
  });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  
  const limit = req.apiAuth!.tier === 'free' ? 10 : 100;
  res.json({ 
    logs: [],
    limit,
    message: 'Logs available when agent is deployed',
  });
});

router.post('/agents/:id/start', requireScope('write:control'), requireTier('pro'), async (req: ApiAuthRequest, res: Response) => {
  const agent = await prisma.agent.findFirst({
    where: { id: req.params.id, userId: req.apiAuth!.userId },
  });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  
  await prisma.agent.update({
    where: { id: agent.id },
    data: { status: 'starting' },
  });
  
  res.json({ success: true, message: 'Agent start initiated' });
});

router.post('/agents/:id/stop', requireScope('write:control'), requireTier('pro'), async (req: ApiAuthRequest, res: Response) => {
  const agent = await prisma.agent.findFirst({
    where: { id: req.params.id, userId: req.apiAuth!.userId },
  });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  
  await prisma.agent.update({
    where: { id: agent.id },
    data: { status: 'stopping' },
  });
  
  res.json({ success: true, message: 'Agent stop initiated' });
});

router.get('/market/trending', requireScope('read:market'), async (req: ApiAuthRequest, res: Response) => {
  const delayed = req.apiAuth!.tier === 'free';
  res.json({
    delayed,
    message: delayed ? 'Data delayed 15 minutes (upgrade to Pro for real-time)' : 'Real-time data',
    tokens: [],
  });
});

export default router;

