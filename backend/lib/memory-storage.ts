import type {
  StateStorage,
  RateLimitRecord,
  LockoutRecord,
  CircuitBreakerRecord,
} from './state-storage.types';

export class MemoryStorage implements StateStorage {
  private rateLimits = new Map<string, RateLimitRecord>();
  private lockouts = new Map<string, LockoutRecord>();
  private circuitBreakers = new Map<string, CircuitBreakerRecord>();

  async getRateLimit(key: string): Promise<RateLimitRecord | null> {
    return this.rateLimits.get(key) || null;
  }

  async setRateLimit(key: string, record: RateLimitRecord, _ttlMs: number): Promise<void> {
    this.rateLimits.set(key, record);
  }

  async incrementRateLimit(key: string): Promise<number> {
    const record = this.rateLimits.get(key);
    if (record) {
      record.count++;
      return record.count;
    }
    return 0;
  }

  async deleteRateLimit(key: string): Promise<void> {
    this.rateLimits.delete(key);
  }

  async getRateLimitCount(): Promise<number> {
    return this.rateLimits.size;
  }

  async getLockout(key: string): Promise<LockoutRecord | null> {
    return this.lockouts.get(key) || null;
  }

  async setLockout(key: string, record: LockoutRecord): Promise<void> {
    this.lockouts.set(key, record);
  }

  async deleteLockout(key: string): Promise<void> {
    this.lockouts.delete(key);
  }

  async cleanupExpiredLockouts(resetWindowMs: number): Promise<number> {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, record] of this.lockouts.entries()) {
      const expired = record.firstAttempt + resetWindowMs < now;
      const lockoutExpired = record.lockedUntil && record.lockedUntil < now;

      if (expired || lockoutExpired) {
        this.lockouts.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  async getCircuitBreaker(agentId: string): Promise<CircuitBreakerRecord | null> {
    return this.circuitBreakers.get(agentId) || null;
  }

  async setCircuitBreaker(agentId: string, record: CircuitBreakerRecord): Promise<void> {
    this.circuitBreakers.set(agentId, record);
  }

  async deleteCircuitBreaker(agentId: string): Promise<void> {
    this.circuitBreakers.delete(agentId);
  }

  async close(): Promise<void> {
    this.rateLimits.clear();
    this.lockouts.clear();
    this.circuitBreakers.clear();
  }
}

export const memoryStorage = new MemoryStorage();
