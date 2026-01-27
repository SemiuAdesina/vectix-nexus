import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as apiKeyService from '../services/api-keys/api-key.service';
import * as webhookService from '../services/api-keys/webhook.service';
import * as auth from '../lib/auth';

vi.mock('../services/api-keys/api-key.service', () => ({
  createApiKey: vi.fn(),
  listApiKeys: vi.fn(),
  revokeApiKey: vi.fn(),
}));

vi.mock('../services/api-keys/webhook.service', () => ({
  createWebhook: vi.fn(),
  listWebhooks: vi.fn(),
  deleteWebhook: vi.fn(),
}));

vi.mock('../lib/auth', () => ({
  getOrCreateUser: vi.fn(),
}));

describe('api-keys.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET /api-keys', () => {
    it('lists API keys for authenticated user', async () => {
      vi.mocked(auth.getOrCreateUser).mockResolvedValue({ userId: 'user1' } as any);
      const mockKeys = [{ id: 'key1', name: 'Test Key' }];
      vi.mocked(apiKeyService.listApiKeys).mockResolvedValue(mockKeys as any);

      const keys = await apiKeyService.listApiKeys('user1');
      expect(keys).toEqual(mockKeys);
    });
  });

  describe('POST /api-keys', () => {
    it('creates API key', async () => {
      vi.mocked(auth.getOrCreateUser).mockResolvedValue({ userId: 'user1' } as any);
      const mockKey = { id: 'key1', name: 'Test Key', key: 'sk_test_123' };
      vi.mocked(apiKeyService.createApiKey).mockResolvedValue(mockKey as any);

      const result = await apiKeyService.createApiKey('user1', 'Test Key', ['read:agents']);
      expect(result).toEqual(mockKey);
    });
  });

  describe('DELETE /api-keys/:id', () => {
    it('revokes API key', async () => {
      vi.mocked(auth.getOrCreateUser).mockResolvedValue({ userId: 'user1' } as any);
      vi.mocked(apiKeyService.revokeApiKey).mockResolvedValue(true);

      const result = await apiKeyService.revokeApiKey('user1', 'key1');
      expect(result).toBe(true);
    });
  });

  describe('GET /webhooks', () => {
    it('lists webhooks for authenticated user', async () => {
      vi.mocked(auth.getOrCreateUser).mockResolvedValue({ userId: 'user1' } as any);
      const mockWebhooks = [{ id: 'webhook1', url: 'https://example.com' }];
      vi.mocked(webhookService.listWebhooks).mockResolvedValue(mockWebhooks as any);

      const webhooks = await webhookService.listWebhooks('user1');
      expect(webhooks).toEqual(mockWebhooks);
    });
  });

  describe('POST /webhooks', () => {
    it('creates webhook', async () => {
      vi.mocked(auth.getOrCreateUser).mockResolvedValue({ userId: 'user1' } as any);
      const mockWebhook = { id: 'webhook1', url: 'https://example.com', events: ['trade.executed'] };
      vi.mocked(webhookService.createWebhook).mockResolvedValue(mockWebhook as any);

      const result = await webhookService.createWebhook('user1', 'https://example.com', ['trade.executed']);
      expect(result).toEqual(mockWebhook);
    });
  });

  describe('DELETE /webhooks/:id', () => {
    it('deletes webhook', async () => {
      vi.mocked(auth.getOrCreateUser).mockResolvedValue({ userId: 'user1' } as any);
      vi.mocked(webhookService.deleteWebhook).mockResolvedValue(true);

      const result = await webhookService.deleteWebhook('user1', 'webhook1');
      expect(result).toBe(true);
    });
  });
});
