import Redis from 'ioredis';
import type {
  StateStorage,
  RateLimitRecord,
  LockoutRecord,
  CircuitBreakerRecord,
} from './state-storage.types';

const RATE_LIMIT_PREFIX = 'rl:';
const LOCKOUT_PREFIX = 'lockout:';
const CIRCUIT_BREAKER_PREFIX = 'cb:';

export class RedisStorage implements StateStorage {
  private client: Redis;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, { maxRetriesPerRequest: 3 });
  }

  async getRateLimit(key: string): Promise<RateLimitRecord | null> {
    const data = await this.client.get(`${RATE_LIMIT_PREFIX}${key}`);
    return data ? JSON.parse(data) : null;
  }

  async setRateLimit(key: string, record: RateLimitRecord, ttlMs: number): Promise<void> {
    await this.client.set(`${RATE_LIMIT_PREFIX}${key}`, JSON.stringify(record), 'PX', ttlMs);
  }

  async incrementRateLimit(key: string): Promise<number> {
    const data = await this.client.get(`${RATE_LIMIT_PREFIX}${key}`);
    if (data) {
      const record: RateLimitRecord = JSON.parse(data);
      record.count++;
      const ttl = await this.client.pttl(`${RATE_LIMIT_PREFIX}${key}`);
      if (ttl > 0) {
        await this.client.set(`${RATE_LIMIT_PREFIX}${key}`, JSON.stringify(record), 'PX', ttl);
      }
      return record.count;
    }
    return 0;
  }

  async deleteRateLimit(key: string): Promise<void> {
    await this.client.del(`${RATE_LIMIT_PREFIX}${key}`);
  }

  async getRateLimitCount(): Promise<number> {
    const keys = await this.client.keys(`${RATE_LIMIT_PREFIX}*`);
    return keys.length;
  }

  async getLockout(key: string): Promise<LockoutRecord | null> {
    const data = await this.client.get(`${LOCKOUT_PREFIX}${key}`);
    return data ? JSON.parse(data) : null;
  }

  async setLockout(key: string, record: LockoutRecord): Promise<void> {
    await this.client.set(`${LOCKOUT_PREFIX}${key}`, JSON.stringify(record));
  }

  async deleteLockout(key: string): Promise<void> {
    await this.client.del(`${LOCKOUT_PREFIX}${key}`);
  }

  async cleanupExpiredLockouts(resetWindowMs: number): Promise<number> {
    const keys = await this.client.keys(`${LOCKOUT_PREFIX}*`);
    const now = Date.now();
    let cleaned = 0;

    for (const key of keys) {
      const data = await this.client.get(key);
      if (data) {
        const record: LockoutRecord = JSON.parse(data);
        const expired = record.firstAttempt + resetWindowMs < now;
        const lockoutExpired = record.lockedUntil && record.lockedUntil < now;

        if (expired || lockoutExpired) {
          await this.client.del(key);
          cleaned++;
        }
      }
    }

    return cleaned;
  }

  async getCircuitBreaker(agentId: string): Promise<CircuitBreakerRecord | null> {
    const data = await this.client.get(`${CIRCUIT_BREAKER_PREFIX}${agentId}`);
    return data ? JSON.parse(data) : null;
  }

  async setCircuitBreaker(agentId: string, record: CircuitBreakerRecord): Promise<void> {
    await this.client.set(`${CIRCUIT_BREAKER_PREFIX}${agentId}`, JSON.stringify(record));
  }

  async deleteCircuitBreaker(agentId: string): Promise<void> {
    await this.client.del(`${CIRCUIT_BREAKER_PREFIX}${agentId}`);
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}
