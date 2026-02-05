import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as circuitBreaker from './circuit-breaker';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('@/lib/api/config', () => ({
  getApiBaseUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

describe('circuit-breaker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeCircuitBreaker', () => {
    it('initializes circuit breaker', async () => {
      const mockResponse = { success: true };
      (global.fetch as Mock).mockResolvedValue({
        text: async () => JSON.stringify(mockResponse),
        json: async () => mockResponse,
      } as Response);

      const result = await circuitBreaker.initializeCircuitBreaker('agent1', {
        maxVolume: 1000000,
        maxPriceChange: 10,
        maxTradesPerPeriod: 100,
        failureThreshold: 3,
        resetTimeout: 60000,
        pauseDuration: 300000,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('checkCircuitBreaker', () => {
    it('checks circuit breaker state', async () => {
      const mockResponse = { success: true, allowed: true };
      (global.fetch as Mock).mockResolvedValue({
        text: async () => JSON.stringify(mockResponse),
        json: async () => mockResponse,
      } as Response);

      const result = await circuitBreaker.checkCircuitBreaker('agent1', {
        volume: 500000,
        priceChange: 5,
        tradeCount: 50,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCircuitBreakerState', () => {
    it('fetches circuit breaker state', async () => {
      const mockResponse = { success: true, state: { status: 'closed', failures: 0 } };
      (global.fetch as Mock).mockResolvedValue({
        text: async () => JSON.stringify(mockResponse),
        json: async () => mockResponse,
      } as Response);

      const result = await circuitBreaker.getCircuitBreakerState('agent1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetCircuitBreaker', () => {
    it('resets circuit breaker', async () => {
      const mockResponse = { success: true };
      (global.fetch as Mock).mockResolvedValue({
        text: async () => JSON.stringify(mockResponse),
        json: async () => mockResponse,
      } as Response);

      const result = await circuitBreaker.resetCircuitBreaker('agent1');
      expect(result).toEqual(mockResponse);
    });
  });
});
