import { randomBytes, createHmac } from 'crypto';
import { prisma } from '../../lib/prisma';

export type WebhookEvent = 'agent.started' | 'agent.stopped' | 'agent.crashed' | 'trade.executed' | 'trade.failed';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
  createdAt: string;
}

function generateSecret(): string {
  return `whsec_${randomBytes(24).toString('hex')}`;
}

export async function createWebhook(userId: string, url: string, events: WebhookEvent[]): Promise<WebhookConfig & { secret: string }> {
  const secret = generateSecret();
  
  const webhook = await prisma.webhook.create({
    data: {
      userId,
      url,
      events: JSON.stringify(events),
      secret,
    },
  });
  
  return {
    id: webhook.id,
    url: webhook.url,
    events: JSON.parse(webhook.events),
    secret,
    isActive: webhook.isActive,
    createdAt: webhook.createdAt.toISOString(),
  };
}

export async function listWebhooks(userId: string): Promise<WebhookConfig[]> {
  const webhooks = await prisma.webhook.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  
  return webhooks.map(w => ({
    id: w.id,
    url: w.url,
    events: JSON.parse(w.events),
    isActive: w.isActive,
    createdAt: w.createdAt.toISOString(),
  }));
}

export async function deleteWebhook(userId: string, webhookId: string): Promise<boolean> {
  const result = await prisma.webhook.deleteMany({
    where: { id: webhookId, userId },
  });
  return result.count > 0;
}

export async function triggerWebhook(userId: string, event: WebhookEvent, data: Record<string, unknown>): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: { userId, isActive: true },
  });
  
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };
  
  for (const webhook of webhooks) {
    const events = JSON.parse(webhook.events) as WebhookEvent[];
    if (!events.includes(event)) continue;
    
    const signature = createHmac('sha256', webhook.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    try {
      await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vectix-Signature': signature,
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error(`Webhook delivery failed for ${webhook.id}:`, error);
    }
  }
}

