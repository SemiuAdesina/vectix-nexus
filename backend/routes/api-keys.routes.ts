import { Router, Request, Response } from 'express';
import { getOrCreateUser } from '../lib/auth';
import { createApiKey, listApiKeys, revokeApiKey } from '../services/api-keys/api-key.service';
import { createWebhook, listWebhooks, deleteWebhook, WebhookEvent } from '../services/api-keys/webhook.service';
import { ApiScope, SCOPE_DESCRIPTIONS, FREE_TIER_SCOPES, PRO_TIER_SCOPES, RATE_LIMITS } from '../services/api-keys/api-key.types';
import { getParam } from '../lib/route-helpers';

const router = Router();

router.get('/api-keys', async (req: Request, res: Response) => {
  const auth = await getOrCreateUser(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const keys = await listApiKeys(auth.userId);
  res.json({ keys });
});

router.post('/api-keys', async (req: Request, res: Response) => {
  const auth = await getOrCreateUser(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const { name, scopes } = req.body as { name: string; scopes: ApiScope[] };
  if (!name || !scopes?.length) {
    return res.status(400).json({ error: 'Name and scopes are required' });
  }
  const result = await createApiKey(auth.userId, name, scopes);
  res.json(result);
});

router.delete('/api-keys/:id', async (req: Request, res: Response) => {
  const auth = await getOrCreateUser(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const revoked = await revokeApiKey(auth.userId, getParam(req, 'id'));
  if (!revoked) return res.status(404).json({ error: 'API key not found' });
  
  res.json({ success: true });
});

router.get('/api-keys/config', async (_req: Request, res: Response) => {
  res.json({
    scopes: SCOPE_DESCRIPTIONS,
    tiers: { free: FREE_TIER_SCOPES, pro: PRO_TIER_SCOPES },
    rateLimits: RATE_LIMITS,
  });
});

router.get('/webhooks', async (req: Request, res: Response) => {
  const auth = await getOrCreateUser(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  
  const webhooks = await listWebhooks(auth.userId);
  res.json({ webhooks });
});

router.post('/webhooks', async (req: Request, res: Response) => {
  const auth = await getOrCreateUser(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  
  const { url, events } = req.body as { url: string; events: WebhookEvent[] };
  if (!url || !events?.length) {
    return res.status(400).json({ error: 'URL and events are required' });
  }
  
  const webhook = await createWebhook(auth.userId, url, events);
  res.json(webhook);
});

router.delete('/webhooks/:id', async (req: Request, res: Response) => {
  const auth = await getOrCreateUser(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  
  const deleted = await deleteWebhook(auth.userId, getParam(req, 'id'));
  if (!deleted) return res.status(404).json({ error: 'Webhook not found' });
  
  res.json({ success: true });
});

export default router;

