import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreakerService } from './circuit-breaker';
import type { CircuitBreakerConfig } from './onchain-types';

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;

  beforeEach(() => {
    service = new CircuitBreakerService();
  });

  describe('initializeBreaker', () => {
    it('initializes circuit breaker with closed status', async () => {
      const config: CircuitBreakerConfig = {
        maxVolume: 1000000,
        maxPriceChange: 10,
        maxTradesPerPeriod: 100,
        failureThreshold: 5,
        resetTimeout: 60000,
        pauseDuration: 300000,
      };

      await service.initializeBreaker('agent1', config);
      const state = await service.getBreakerState('agent1');

      expect(state).toBeDefined();
      expect(state?.status).toBe('closed');
      expect(state?.failureCount).toBe(0);
      expect(state?.config).toEqual(config);
    });
  });

  describe('checkBreaker', () => {
    beforeEach(async () => {
      await service.initializeBreaker('agent1', {
        maxVolume: 1000000,
        maxPriceChange: 10,
        maxTradesPerPeriod: 100,
        failureThreshold: 5,
        resetTimeout: 60000,
        pauseDuration: 300000,
      });
    });

    it('allows operations when breaker is closed and metrics are within limits', async () => {
      const result = await service.checkBreaker('agent1', {
        volume: 500000,
        priceChange: 5,
        tradeCount: 50,
      });

      expect(result.allowed).toBe(true);
    });

    it('blocks operations when volume exceeds limit', async () => {
      const result = await service.checkBreaker('agent1', {
        volume: 2000000,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Volume threshold exceeded');
    });

    it('blocks operations when price change exceeds limit', async () => {
      const result = await service.checkBreaker('agent1', {
        priceChange: 15,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Price change threshold exceeded');
    });

    it('blocks operations when trade count exceeds limit', async () => {
      const result = await service.checkBreaker('agent1', {
        tradeCount: 150,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Trade count threshold exceeded');
    });

    it('returns allowed for non-initialized breakers', async () => {
      const result = await service.checkBreaker('non-existent', {});
      expect(result.allowed).toBe(true);
    });
  });

  describe('tripBreaker', () => {
    beforeEach(async () => {
      await service.initializeBreaker('agent1', {
        maxVolume: 1000000,
        maxPriceChange: 10,
        maxTradesPerPeriod: 100,
        failureThreshold: 3,
        resetTimeout: 60000,
        pauseDuration: 300000,
      });
    });

    it('opens breaker when failure threshold is reached', async () => {
      await service.tripBreaker('agent1', 'Test failure');
      await service.tripBreaker('agent1', 'Test failure');
      await service.tripBreaker('agent1', 'Test failure');

      const state = await service.getBreakerState('agent1');
      expect(state?.status).toBe('open');
      expect(state?.failureCount).toBe(3);
    });

    it('sets pause duration when breaker opens', async () => {
      await service.tripBreaker('agent1', 'Test failure');
      await service.tripBreaker('agent1', 'Test failure');
      await service.tripBreaker('agent1', 'Test failure');

      const state = await service.getBreakerState('agent1');
      expect(state?.pausedUntil).toBeDefined();
      if (state?.pausedUntil) {
        expect(state.pausedUntil.getTime()).toBeGreaterThan(Date.now());
      }
    });
  });

  describe('getBreakerState', () => {
    it('returns null for non-existent breaker', async () => {
      const state = await service.getBreakerState('non-existent');
      expect(state).toBeNull();
    });

    it('returns state for initialized breaker', async () => {
      await service.initializeBreaker('agent1', {
        maxVolume: 1000000,
        maxPriceChange: 10,
        maxTradesPerPeriod: 100,
        failureThreshold: 5,
        resetTimeout: 60000,
        pauseDuration: 300000,
      });

      const state = await service.getBreakerState('agent1');
      expect(state).toBeDefined();
      expect(state?.agentId).toBe('agent1');
    });
  });
});
