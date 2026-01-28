import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('getStateStorage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return MemoryStorage when REDIS_URL is not set', async () => {
    delete process.env.REDIS_URL;

    const { getStateStorage } = await import('./state-storage');
    const storage = getStateStorage();

    expect(storage).toBeDefined();
    expect(storage.constructor.name).toBe('MemoryStorage');
  });

  it('should return same instance on multiple calls', async () => {
    delete process.env.REDIS_URL;

    const { getStateStorage } = await import('./state-storage');
    const storage1 = getStateStorage();
    const storage2 = getStateStorage();

    expect(storage1).toBe(storage2);
  });

  it('should close storage and reset instance', async () => {
    delete process.env.REDIS_URL;

    const { getStateStorage, closeStateStorage } = await import('./state-storage');
    const storage1 = getStateStorage();
    await closeStateStorage();

    const storage2 = getStateStorage();
    expect(storage1).not.toBe(storage2);
  });
});

describe('StateStorage interface contract', () => {
  it('should implement all required methods', async () => {
    delete process.env.REDIS_URL;

    const { getStateStorage } = await import('./state-storage');
    const storage = getStateStorage();

    expect(typeof storage.getRateLimit).toBe('function');
    expect(typeof storage.setRateLimit).toBe('function');
    expect(typeof storage.incrementRateLimit).toBe('function');
    expect(typeof storage.deleteRateLimit).toBe('function');
    expect(typeof storage.getRateLimitCount).toBe('function');

    expect(typeof storage.getLockout).toBe('function');
    expect(typeof storage.setLockout).toBe('function');
    expect(typeof storage.deleteLockout).toBe('function');
    expect(typeof storage.cleanupExpiredLockouts).toBe('function');

    expect(typeof storage.getCircuitBreaker).toBe('function');
    expect(typeof storage.setCircuitBreaker).toBe('function');
    expect(typeof storage.deleteCircuitBreaker).toBe('function');

    expect(typeof storage.close).toBe('function');
  });
});
