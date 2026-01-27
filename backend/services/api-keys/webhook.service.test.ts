import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../../lib/prisma';
import * as webhookService from './webhook.service';

global.fetch = vi.fn();

vi.mock('../../lib/prisma', () => ({
  prisma: {
    webhook: {
      create: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe('webhook.service', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('createWebhook', () => {
    it('creates webhook with secret', async () => {
      vi.mocked(prisma.prisma.webhook.create).mockResolvedValue({
        id: 'webhook1',
        url: 'https://example.com/webhook',
        events: JSON.stringify(['trade.executed']),
        secret: 'whsec_test123',
        isActive: true,
        createdAt: new Date(),
      } as any);

      const result = await webhookService.createWebhook('user1', 'https://example.com/webhook', ['trade.executed']);
      expect(result.id).toBe('webhook1');
      expect(result.secret).toMatch(/^whsec_/);
      expect(result.events).toEqual(['trade.executed']);
    });
  });

  describe('listWebhooks', () => {
    it('lists webhooks for user', async () => {
      vi.mocked(prisma.prisma.webhook.findMany).mockResolvedValue([
        {
          id: 'webhook1',
          url: 'https://example.com/webhook',
          events: JSON.stringify(['trade.executed']),
          isActive: true,
          createdAt: new Date(),
        },
      ] as any);

      const webhooks = await webhookService.listWebhooks('user1');
      expect(webhooks).toHaveLength(1);
      expect(webhooks[0].url).toBe('https://example.com/webhook');
    });
  });

  describe('deleteWebhook', () => {
    it('deletes webhook', async () => {
      vi.mocked(prisma.prisma.webhook.deleteMany).mockResolvedValue({ count: 1 } as any);

      const result = await webhookService.deleteWebhook('user1', 'webhook1');
      expect(result).toBe(true);
    });

    it('returns false if webhook not found', async () => {
      vi.mocked(prisma.prisma.webhook.deleteMany).mockResolvedValue({ count: 0 } as any);

      const result = await webhookService.deleteWebhook('user1', 'webhook1');
      expect(result).toBe(false);
    });
  });

  describe('triggerWebhook', () => {
    it('triggers webhook for matching event', async () => {
      vi.mocked(prisma.prisma.webhook.findMany).mockResolvedValue([
        {
          id: 'webhook1',
          url: 'https://example.com/webhook',
          events: JSON.stringify(['trade.executed']),
          secret: 'whsec_test123',
          isActive: true,
        },
      ] as any);
      vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);

      await webhookService.triggerWebhook('user1', 'trade.executed', { tradeId: 'trade1' });
      expect(global.fetch).toHaveBeenCalled();
    });

    it('skips webhook for non-matching event', async () => {
      vi.mocked(prisma.prisma.webhook.findMany).mockResolvedValue([
        {
          id: 'webhook1',
          url: 'https://example.com/webhook',
          events: JSON.stringify(['agent.started']),
          secret: 'whsec_test123',
          isActive: true,
        },
      ] as any);

      await webhookService.triggerWebhook('user1', 'trade.executed', { tradeId: 'trade1' });
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
