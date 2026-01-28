import type { CircuitBreakerConfig, CircuitBreakerState } from './onchain-types';
import { getStateStorage, CircuitBreakerRecord } from '../../backend/lib/state-storage';

export class CircuitBreakerService {
  private storage = getStateStorage();

  async initializeBreaker(agentId: string, config: CircuitBreakerConfig): Promise<void> {
    const record: CircuitBreakerRecord = {
      status: 'closed',
      failureCount: 0,
      lastFailureTime: null,
      lastResetTime: Date.now(),
      pausedUntil: null,
      config: {
        maxVolume: config.maxVolume,
        maxPriceChange: config.maxPriceChange,
        maxTradesPerPeriod: config.maxTradesPerPeriod,
        failureThreshold: config.failureThreshold,
        resetTimeout: config.resetTimeout,
        pauseDuration: config.pauseDuration,
      },
    };
    await this.storage.setCircuitBreaker(agentId, record);
  }

  async checkBreaker(agentId: string, metrics: { volume?: number; priceChange?: number; tradeCount?: number }): Promise<{ allowed: boolean; reason?: string }> {
    const breaker = await this.storage.getCircuitBreaker(agentId);
    if (!breaker) return { allowed: true };

    const now = Date.now();

    if (breaker.status === 'open') {
      if (breaker.pausedUntil && breaker.pausedUntil > now) {
        return { allowed: false, reason: 'Circuit breaker is open - paused until ' + new Date(breaker.pausedUntil).toISOString() };
      }
      if (breaker.lastResetTime && now - breaker.lastResetTime > breaker.config.resetTimeout) {
        breaker.status = 'half-open';
        breaker.lastResetTime = now;
        await this.storage.setCircuitBreaker(agentId, breaker);
      } else {
        return { allowed: false, reason: 'Circuit breaker is open' };
      }
    }

    if (breaker.status === 'half-open') {
      breaker.status = 'closed';
      breaker.failureCount = 0;
      await this.storage.setCircuitBreaker(agentId, breaker);
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

  async tripBreaker(agentId: string, _reason: string): Promise<void> {
    const breaker = await this.storage.getCircuitBreaker(agentId);
    if (!breaker) return;

    breaker.status = 'open';
    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();
    breaker.pausedUntil = Date.now() + breaker.config.pauseDuration;
    await this.storage.setCircuitBreaker(agentId, breaker);
  }

  async resetBreaker(agentId: string): Promise<void> {
    const breaker = await this.storage.getCircuitBreaker(agentId);
    if (!breaker) return;

    breaker.status = 'closed';
    breaker.failureCount = 0;
    breaker.lastResetTime = Date.now();
    breaker.pausedUntil = null;
    await this.storage.setCircuitBreaker(agentId, breaker);
  }

  async getBreakerState(agentId: string): Promise<CircuitBreakerState | null> {
    const record = await this.storage.getCircuitBreaker(agentId);
    if (!record) return null;

    return {
      agentId,
      config: record.config,
      status: record.status,
      failureCount: record.failureCount,
      lastFailureTime: record.lastFailureTime ? new Date(record.lastFailureTime) : null,
      lastResetTime: new Date(record.lastResetTime),
      pausedUntil: record.pausedUntil ? new Date(record.pausedUntil) : null,
    };
  }
}

export const circuitBreakerService = new CircuitBreakerService();
