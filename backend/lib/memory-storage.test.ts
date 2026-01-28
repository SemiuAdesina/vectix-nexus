import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorage } from './memory-storage';
import type { RateLimitRecord, LockoutRecord, CircuitBreakerRecord } from './state-storage.types';

describe('MemoryStorage', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
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

    it('should return correct count of rate limit records', async () => {
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

    it('should cleanup expired lockouts based on reset window', async () => {
      const now = Date.now();
      const oldRecord: LockoutRecord = { count: 3, firstAttempt: now - 120000, lockedUntil: null };
      const newRecord: LockoutRecord = { count: 1, firstAttempt: now, lockedUntil: null };

      await storage.setLockout('old-user', oldRecord);
      await storage.setLockout('new-user', newRecord);

      const cleaned = await storage.cleanupExpiredLockouts(60000);
      expect(cleaned).toBe(1);

      expect(await storage.getLockout('old-user')).toBeNull();
      expect(await storage.getLockout('new-user')).not.toBeNull();
    });

    it('should cleanup expired lockouts based on lockout expiry', async () => {
      const now = Date.now();
      const expiredLockout: LockoutRecord = { count: 5, firstAttempt: now, lockedUntil: now - 1000 };
      const activeLockout: LockoutRecord = { count: 5, firstAttempt: now, lockedUntil: now + 60000 };

      await storage.setLockout('expired-user', expiredLockout);
      await storage.setLockout('active-user', activeLockout);

      const cleaned = await storage.cleanupExpiredLockouts(120000);
      expect(cleaned).toBe(1);

      expect(await storage.getLockout('expired-user')).toBeNull();
      expect(await storage.getLockout('active-user')).not.toBeNull();
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

  describe('Cleanup', () => {
    it('should clear all data on close', async () => {
      await storage.setRateLimit('ip1', { count: 1, resetAt: Date.now() }, 60000);
      await storage.setLockout('user1', { count: 1, firstAttempt: Date.now(), lockedUntil: null });

      await storage.close();

      expect(await storage.getRateLimitCount()).toBe(0);
    });
  });
});
