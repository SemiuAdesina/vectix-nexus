import { describe, it, expect } from 'vitest';
import { PreflightGuard } from './preflight-guard';

describe('preflight-guard', () => {
  describe('PreflightGuard', () => {
    it('gets stats for agent returns empty stats for new agent', () => {
      const guard = new PreflightGuard('https://api.mainnet-beta.solana.com');
      const stats = guard.getStats('agent1');
      expect(stats).toBeDefined();
      expect(stats.total).toBe(0);
      expect(stats.approved).toBe(0);
      expect(stats.blocked).toBe(0);
      expect(stats.blockedReasons).toEqual([]);
    });

    it('getHistory returns empty array for new agent', () => {
      const guard = new PreflightGuard('https://api.mainnet-beta.solana.com');
      const history = guard.getHistory('newAgent');
      expect(history).toEqual([]);
    });

    it('constructor creates instance', () => {
      const guard = new PreflightGuard('https://api.mainnet-beta.solana.com');
      expect(guard).toBeInstanceOf(PreflightGuard);
    });
  });
});
