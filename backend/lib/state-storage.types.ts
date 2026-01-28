export interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export interface LockoutRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

export interface CircuitBreakerRecord {
  status: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: number | null;
  lastResetTime: number;
  pausedUntil: number | null;
  config: {
    maxVolume: number;
    maxPriceChange: number;
    maxTradesPerPeriod: number;
    failureThreshold: number;
    resetTimeout: number;
    pauseDuration: number;
  };
}

export interface StateStorage {
  getRateLimit(key: string): Promise<RateLimitRecord | null>;
  setRateLimit(key: string, record: RateLimitRecord, ttlMs: number): Promise<void>;
  incrementRateLimit(key: string): Promise<number>;
  deleteRateLimit(key: string): Promise<void>;
  getRateLimitCount(): Promise<number>;

  getLockout(key: string): Promise<LockoutRecord | null>;
  setLockout(key: string, record: LockoutRecord): Promise<void>;
  deleteLockout(key: string): Promise<void>;
  cleanupExpiredLockouts(resetWindowMs: number): Promise<number>;

  getCircuitBreaker(agentId: string): Promise<CircuitBreakerRecord | null>;
  setCircuitBreaker(agentId: string, record: CircuitBreakerRecord): Promise<void>;
  deleteCircuitBreaker(agentId: string): Promise<void>;

  close(): Promise<void>;
}
