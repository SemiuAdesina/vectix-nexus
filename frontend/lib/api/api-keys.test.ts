import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as apiKeys from './api-keys';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('./auth', () => ({
  getAuthHeaders: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
  getBackendUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

vi.mock('./config', () => ({
  getApiBaseUrl: vi.fn(() => 'http://localhost:3001'),
  API_ENDPOINTS: {
    apiKeys: {
      list: '/api/api-keys',
      detail: (id: string) => `/api/api-keys/${id}`,
      config: '/api/api-keys/config',
    },
    webhooks: {
      list: '/api/webhooks',
      detail: (id: string) => `/api/webhooks/${id}`,
    },
  },
}));

describe('api-keys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getApiKeys', () => {
    it('fetches API keys', async () => {
      const mockKeys = [{ id: 'key1', name: 'Test Key' }];
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ keys: mockKeys }),
      } as Response);

      const keys = await apiKeys.getApiKeys();
      expect(keys).toEqual(mockKeys);
    });
  });

  describe('createApiKey', () => {
    it('creates API key', async () => {
      const mockResponse = { key: 'vx_test123', data: { id: 'key1', name: 'Test Key' } };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiKeys.createApiKey('Test Key', ['read:agents']);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('revokeApiKey', () => {
    it('revokes API key', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
      } as Response);

      const result = await apiKeys.revokeApiKey('key1');
      expect(result).toBe(true);
    });
  });

  describe('getApiConfig', () => {
    it('fetches API config', async () => {
      const mockConfig = { scopes: {}, tiers: { free: [], pro: [] }, rateLimits: {} };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockConfig,
      } as Response);

      const config = await apiKeys.getApiConfig();
      expect(config).toEqual(mockConfig);
    });
  });

  describe('getWebhooks', () => {
    it('fetches webhooks', async () => {
      const mockWebhooks = [{ id: 'webhook1', url: 'https://example.com' }];
      (global.fetch as Mock).mockResolvedValue({
        json: async () => ({ webhooks: mockWebhooks }),
      } as Response);

      const webhooks = await apiKeys.getWebhooks();
      expect(webhooks).toEqual(mockWebhooks);
    });
  });

  describe('createWebhook', () => {
    it('creates webhook', async () => {
      const mockWebhook = { id: 'webhook1', url: 'https://example.com', events: ['trade.executed'] };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockWebhook,
      } as Response);

      const webhook = await apiKeys.createWebhook('https://example.com', ['trade.executed']);
      expect(webhook).toEqual(mockWebhook);
    });
  });

  describe('deleteWebhook', () => {
    it('deletes webhook', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
      } as Response);

      const result = await apiKeys.deleteWebhook('webhook1');
      expect(result).toBe(true);
    });
  });
});
