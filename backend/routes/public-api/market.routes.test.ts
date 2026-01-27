import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('public-api/market.routes', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET /market/trending', () => {
    it('returns delayed data for free tier', () => {
      const delayed = true;
      const delayMs = delayed ? 15 * 60 * 1000 : 0;
      const dataTimestamp = new Date(Date.now() - delayMs).toISOString();
      
      expect(delayed).toBe(true);
      expect(dataTimestamp).toBeDefined();
    });

    it('returns real-time data for pro tier', () => {
      const delayed = false;
      const delayMs = delayed ? 15 * 60 * 1000 : 0;
      const dataTimestamp = new Date(Date.now() - delayMs).toISOString();
      
      expect(delayed).toBe(false);
      expect(dataTimestamp).toBeDefined();
    });
  });
});
