export interface CircuitBreakerConfig {
  maxVolume: number;
  maxPriceChange: number;
  maxTradesPerPeriod: number;
  failureThreshold: number;
  resetTimeout: number;
  pauseDuration: number;
}

export interface CircuitBreakerState {
  agentId: string;
  config: CircuitBreakerConfig;
  status: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: Date | null;
  lastResetTime: Date;
  pausedUntil: Date | null;
}
