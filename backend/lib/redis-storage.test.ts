import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RateLimitRecord, LockoutRecord, CircuitBreakerRecord } from './state-storage.types';

const mockData = new Map<string, string>();
const mockTtls = new Map<string, number>();

const mockRedisInstance = {
  get: vi.fn((key: string) => Promise.resolve(mockData.get(key) || null)),
  set: vi.fn((key: string, value: string, _px?: string, ttl?: number) => {
    mockData.set(key, value);
    if (ttl) mockTtls.set(key, Date.now() + ttl);
    return Promise.resolve('OK');
  }),
  del: vi.fn((key: string) => {
    mockData.delete(key);
    mockTtls.delete(key);
    return Promise.resolve(1);
  }),
  keys: vi.fn((pattern: string) => {
    const prefix = pattern.replace('*', '');
    const matching = Array.from(mockData.keys()).filter(k => k.startsWith(prefix));
    return Promise.resolve(matching);
  }),
  pttl: vi.fn((key: string) => {
    const expiry = mockTtls.get(key);
    if (!expiry) return Promise.resolve(-1);
    return Promise.resolve(Math.max(0, expiry - Date.now()));
  }),
  quit: vi.fn(() => Promise.resolve()),
};

vi.mock('ioredis', () => {
  return {
    default: class MockRedis {
      constructor() {
        return mockRedisInstance;
      }
    },
  };
});

import { RedisStorage } from './redis-storage';

describe('RedisStorage', () => {
  let storage: RedisStorage;

  beforeEach(() => {
    mockData.clear();
    mockTtls.clear();
    vi.clearAllMocks();
    storage = new RedisStorage('redis://localhost:6379');
  });

  afterEach(async () => {
    if (storage) {
      await storage.close();
    }
  });

  describe('Rate Limiting', () => {
    it('should store and retrieve rate limit records', async () => {
      const record: RateLimitRecord = { count: 5, resetAt: Date.now() + 60000 };
      await storage.setRateLimit('test-ip', record, 60000);

      const retrieved = await storage.getRateLimit('test-ip');
      expect(retrieved).toEqual(record);
    });

    it('should return null for non-existent rate limit', async () => {
      const retrieved = await storage.getRateLimit('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should increment rate limit count', async () => {
      const record: RateLimitRecord = { count: 5, resetAt: Date.now() + 60000 };
      await storage.setRateLimit('test-ip', record, 60000);

      const newCount = await storage.incrementRateLimit('test-ip');
      expect(newCount).toBe(6);
    });

    it('should return 0 when incrementing non-existent key', async () => {
      const count = await storage.incrementRateLimit('non-existent');
      expect(count).toBe(0);
    });

    it('should delete rate limit records', async () => {
      const record: RateLimitRecord = { count: 5, resetAt: Date.now() + 60000 };
      await storage.setRateLimit('test-ip', record, 60000);
      await storage.deleteRateLimit('test-ip');

      const retrieved = await storage.getRateLimit('test-ip');
      expect(retrieved).toBeNull();
    });

    it('should return count of rate limit records', async () => {
      await storage.setRateLimit('ip1', { count: 1, resetAt: Date.now() }, 60000);
      await storage.setRateLimit('ip2', { count: 1, resetAt: Date.now() }, 60000);

      const count = await storage.getRateLimitCount();
      expect(count).toBe(2);
    });
  });

  describe('Account Lockout', () => {
    it('should store and retrieve lockout records', async () => {
      const record: LockoutRecord = { count: 3, firstAttempt: Date.now(), lockedUntil: null };
      await storage.setLockout('user-123', record);

      const retrieved = await storage.getLockout('user-123');
      expect(retrieved).toEqual(record);
    });

    it('should return null for non-existent lockout', async () => {
      const retrieved = await storage.getLockout('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should delete lockout records', async () => {
      const record: LockoutRecord = { count: 3, firstAttempt: Date.now(), lockedUntil: null };
      await storage.setLockout('user-123', record);
      await storage.deleteLockout('user-123');

      const retrieved = await storage.getLockout('user-123');
      expect(retrieved).toBeNull();
    });

    it('should cleanup expired lockouts', async () => {
      const now = Date.now();
      const oldRecord: LockoutRecord = { count: 3, firstAttempt: now - 120000, lockedUntil: now - 60000 };
      const newRecord: LockoutRecord = { count: 1, firstAttempt: now, lockedUntil: null };

      await storage.setLockout('old-user', oldRecord);
      await storage.setLockout('new-user', newRecord);

      const cleaned = await storage.cleanupExpiredLockouts(60000);
      expect(cleaned).toBe(1);
    });
  });

  describe('Circuit Breaker', () => {
    const config = {
      maxVolume: 10000,
      maxPriceChange: 50,
      maxTradesPerPeriod: 100,
      failureThreshold: 5,
      resetTimeout: 30000,
      pauseDuration: 60000,
    };

    it('should store and retrieve circuit breaker records', async () => {
      const record: CircuitBreakerRecord = {
        status: 'closed',
        failureCount: 0,
        lastFailureTime: null,
        lastResetTime: Date.now(),
        pausedUntil: null,
        config,
      };
      await storage.setCircuitBreaker('agent-123', record);

      const retrieved = await storage.getCircuitBreaker('agent-123');
      expect(retrieved).toEqual(record);
    });

    it('should return null for non-existent circuit breaker', async () => {
      const retrieved = await storage.getCircuitBreaker('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should update circuit breaker status', async () => {
      const record: CircuitBreakerRecord = {
        status: 'closed',
        failureCount: 0,
        lastFailureTime: null,
        lastResetTime: Date.now(),
        pausedUntil: null,
        config,
      };
      await storage.setCircuitBreaker('agent-123', record);

      record.status = 'open';
      record.failureCount = 1;
      await storage.setCircuitBreaker('agent-123', record);

      const retrieved = await storage.getCircuitBreaker('agent-123');
      expect(retrieved?.status).toBe('open');
      expect(retrieved?.failureCount).toBe(1);
    });

    it('should delete circuit breaker records', async () => {
      const record: CircuitBreakerRecord = {
        status: 'closed',
        failureCount: 0,
        lastFailureTime: null,
        lastResetTime: Date.now(),
        pausedUntil: null,
        config,
      };
      await storage.setCircuitBreaker('agent-123', record);
      await storage.deleteCircuitBreaker('agent-123');

      const retrieved = await storage.getCircuitBreaker('agent-123');
      expect(retrieved).toBeNull();
    });
  });

  describe('Connection', () => {
    it('should close connection gracefully', async () => {
      await expect(storage.close()).resolves.not.toThrow();
      expect(mockRedisInstance.quit).toHaveBeenCalled();
    });
  });
});
