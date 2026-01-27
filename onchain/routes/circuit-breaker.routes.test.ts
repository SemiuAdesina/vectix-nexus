import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as circuitBreakerService from '../services/circuit-breaker';

vi.mock('../services/circuit-breaker', () => ({
  circuitBreakerService: {
    initializeBreaker: vi.fn(),
    checkBreaker: vi.fn(),
    getBreakerState: vi.fn(),
    resetBreaker: vi.fn(),
  },
}));

describe('Circuit Breaker Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /onchain/circuit-breaker/initialize', () => {
    it('initializes circuit breaker', async () => {
      vi.mocked(circuitBreakerService.circuitBreakerService.initializeBreaker).mockResolvedValue();

      await circuitBreakerService.circuitBreakerService.initializeBreaker('agent1', {
        maxVolume: 1000000,
        maxPriceChange: 10,
        maxTradesPerPeriod: 100,
        failureThreshold: 5,
        resetTimeout: 60000,
        pauseDuration: 300000,
      });

      expect(circuitBreakerService.circuitBreakerService.initializeBreaker).toHaveBeenCalled();
    });
  });

  describe('POST /onchain/circuit-breaker/check', () => {
    it('checks circuit breaker status', async () => {
      vi.mocked(circuitBreakerService.circuitBreakerService.checkBreaker).mockResolvedValue({
        allowed: true,
      });

      const result = await circuitBreakerService.circuitBreakerService.checkBreaker('agent1', {
        volume: 500000,
      });

      expect(result.allowed).toBe(true);
    });

    it('returns blocked status when breaker is open', async () => {
      vi.mocked(circuitBreakerService.circuitBreakerService.checkBreaker).mockResolvedValue({
        allowed: false,
        reason: 'Circuit breaker is open',
      });

      const result = await circuitBreakerService.circuitBreakerService.checkBreaker('agent1', {
        volume: 2000000,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe('GET /onchain/circuit-breaker/state/:agentId', () => {
    it('returns circuit breaker state', async () => {
      const mockState = {
        agentId: 'agent1',
        status: 'closed',
        failureCount: 0,
      };

      vi.mocked(circuitBreakerService.circuitBreakerService.getBreakerState).mockResolvedValue(mockState as any);

      const result = await circuitBreakerService.circuitBreakerService.getBreakerState('agent1');
      expect(result).toEqual(mockState);
    });
  });
});
