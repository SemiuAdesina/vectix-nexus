import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as prisma from '../../lib/prisma';
import * as apiKeyService from './api-key.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    subscription: {
      findFirst: vi.fn(),
    },
    apiKey: {
      create: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('api-key.service', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('createApiKey', () => {
    it('creates API key for free tier user', async () => {
      vi.mocked(prisma.prisma.subscription.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.prisma.apiKey.create).mockResolvedValue({
        id: 'key1',
        name: 'Test Key',
        keyPrefix: 'vx_abc123...xyz',
        scopes: JSON.stringify(['read:agents']),
        tier: 'free',
        requestCount: 0,
        lastUsedAt: null,
        createdAt: new Date(),
      } as any);

      const result = await apiKeyService.createApiKey('user1', 'Test Key', ['read:agents']);
      expect(result.key).toMatch(/^vx_/);
      expect(result.data.tier).toBe('free');
    });

    it('creates API key for pro tier user', async () => {
      vi.mocked(prisma.prisma.subscription.findFirst).mockResolvedValue({ status: 'active' } as any);
      vi.mocked(prisma.prisma.apiKey.create).mockResolvedValue({
        id: 'key1',
        name: 'Test Key',
        keyPrefix: 'vx_abc123...xyz',
        scopes: JSON.stringify(['read:agents', 'write:trade']),
        tier: 'pro',
        requestCount: 0,
        lastUsedAt: null,
        createdAt: new Date(),
      } as any);

      const result = await apiKeyService.createApiKey('user1', 'Test Key', ['read:agents', 'write:trade']);
      expect(result.data.tier).toBe('pro');
    });
  });

  describe('listApiKeys', () => {
    it('lists API keys for user', async () => {
      vi.mocked(prisma.prisma.apiKey.findMany).mockResolvedValue([
        {
          id: 'key1',
          name: 'Test Key',
          keyPrefix: 'vx_abc123...xyz',
          scopes: JSON.stringify(['read:agents']),
          tier: 'free',
          requestCount: 10,
          lastUsedAt: new Date(),
          createdAt: new Date(),
        },
      ] as any);

      const keys = await apiKeyService.listApiKeys('user1');
      expect(keys).toHaveLength(1);
      expect(keys[0].name).toBe('Test Key');
    });
  });

  describe('revokeApiKey', () => {
    it('revokes API key', async () => {
      vi.mocked(prisma.prisma.apiKey.updateMany).mockResolvedValue({ count: 1 } as any);

      const result = await apiKeyService.revokeApiKey('user1', 'key1');
      expect(result).toBe(true);
    });

    it('returns false if key not found', async () => {
      vi.mocked(prisma.prisma.apiKey.updateMany).mockResolvedValue({ count: 0 } as any);

      const result = await apiKeyService.revokeApiKey('user1', 'key1');
      expect(result).toBe(false);
    });
  });

  describe('validateApiKey', () => {
    it('validates API key successfully', async () => {
      vi.mocked(prisma.prisma.apiKey.findUnique).mockResolvedValue({
        id: 'key1',
        userId: 'user1',
        scopes: JSON.stringify(['read:agents']),
        tier: 'free',
        revokedAt: null,
        expiresAt: null,
      } as any);
      vi.mocked(prisma.prisma.apiKey.update).mockResolvedValue({} as any);

      const result = await apiKeyService.validateApiKey('vx_test123');
      expect(result).toEqual({
        userId: 'user1',
        scopes: ['read:agents'],
        tier: 'free',
      });
    });

    it('returns null for revoked key', async () => {
      vi.mocked(prisma.prisma.apiKey.findUnique).mockResolvedValue({
        id: 'key1',
        revokedAt: new Date(),
      } as any);

      const result = await apiKeyService.validateApiKey('vx_test123');
      expect(result).toBeNull();
    });

    it('validates legacy SHA-256 hashed key when PBKDF2 lookup misses', async () => {
      vi.mocked(prisma.prisma.apiKey.findUnique)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'key1',
          userId: 'user1',
          scopes: JSON.stringify(['read:agents']),
          tier: 'free',
          revokedAt: null,
          expiresAt: null,
        } as any);
      vi.mocked(prisma.prisma.apiKey.update).mockResolvedValue({} as any);

      const result = await apiKeyService.validateApiKey('vx_legacy_key');
      expect(result).toEqual({
        userId: 'user1',
        scopes: ['read:agents'],
        tier: 'free',
      });
      expect(prisma.prisma.apiKey.findUnique).toHaveBeenCalledTimes(2);
    });

    it('returns null when key not found by PBKDF2 or legacy hash', async () => {
      vi.mocked(prisma.prisma.apiKey.findUnique).mockResolvedValue(null);

      const result = await apiKeyService.validateApiKey('vx_unknown');
      expect(result).toBeNull();
      expect(prisma.prisma.apiKey.findUnique).toHaveBeenCalledTimes(2);
    });
  });
});
