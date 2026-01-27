import type { CircuitBreakerConfig, CircuitBreakerState, CircuitBreakerEvent } from './onchain-types';

export class CircuitBreakerService {
  private breakers: Map<string, CircuitBreakerState> = new Map();

  async initializeBreaker(agentId: string, config: CircuitBreakerConfig): Promise<void> {
    this.breakers.set(agentId, {
      agentId,
      config,
      status: 'closed',
      failureCount: 0,
      lastFailureTime: null,
      lastResetTime: new Date(),
      pausedUntil: null,
    });
  }

  async checkBreaker(agentId: string, metrics: { volume?: number; priceChange?: number; tradeCount?: number }): Promise<{ allowed: boolean; reason?: string }> {
    const breaker = this.breakers.get(agentId);
    if (!breaker) return { allowed: true };

    if (breaker.status === 'open') {
      if (breaker.pausedUntil && breaker.pausedUntil > new Date()) {
        return { allowed: false, reason: 'Circuit breaker is open - paused until ' + breaker.pausedUntil.toISOString() };
      }
      if (breaker.lastResetTime && Date.now() - breaker.lastResetTime.getTime() > breaker.config.resetTimeout) {
        breaker.status = 'half-open';
        breaker.lastResetTime = new Date();
      } else {
        return { allowed: false, reason: 'Circuit breaker is open' };
      }
    }

    if (breaker.status === 'half-open') {
      breaker.status = 'closed';
      breaker.failureCount = 0;
    }

    if (metrics.volume && metrics.volume > breaker.config.maxVolume) {
      await this.tripBreaker(agentId, 'Volume threshold exceeded');
      return { allowed: false, reason: 'Volume threshold exceeded' };
    }

    if (metrics.priceChange && Math.abs(metrics.priceChange) > breaker.config.maxPriceChange) {
      await this.tripBreaker(agentId, 'Price change threshold exceeded');
      return { allowed: false, reason: 'Price change threshold exceeded' };
    }

    if (metrics.tradeCount && metrics.tradeCount > breaker.config.maxTradesPerPeriod) {
      await this.tripBreaker(agentId, 'Trade count threshold exceeded');
      return { allowed: false, reason: 'Trade count threshold exceeded' };
    }

    return { allowed: true };
  }

  async tripBreaker(agentId: string, reason: string): Promise<void> {
    const breaker = this.breakers.get(agentId);
    if (!breaker) return;

    breaker.status = 'open';
    breaker.failureCount++;
    breaker.lastFailureTime = new Date();
    breaker.pausedUntil = new Date(Date.now() + breaker.config.pauseDuration);
  }

  async resetBreaker(agentId: string): Promise<void> {
    const breaker = this.breakers.get(agentId);
    if (!breaker) return;

    breaker.status = 'closed';
    breaker.failureCount = 0;
    breaker.lastResetTime = new Date();
    breaker.pausedUntil = null;
  }

  async getBreakerState(agentId: string): Promise<CircuitBreakerState | null> {
    return this.breakers.get(agentId) || null;
  }
}

export const circuitBreakerService = new CircuitBreakerService();
