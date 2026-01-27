import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PreflightGuard } from './preflight-guard';
import * as transactionSimulator from './transaction-simulator';
import * as auditTrailService from '../../../onchain/services/audit-trail';

vi.mock('./transaction-simulator', () => ({
  TransactionSimulator: vi.fn().mockImplementation(() => ({
    simulate: vi.fn(),
  })),
}));

vi.mock('../../../onchain/services/audit-trail', () => ({
  auditTrailService: {
    logSecurityEvent: vi.fn(),
  },
}));

describe('preflight-guard', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('PreflightGuard', () => {
    it('evaluates preflight request', async () => {
      const mockSimulator = {
        simulate: vi.fn().mockResolvedValue({
          success: true,
          approved: true,
          balanceChange: -1,
          expectedChange: -1,
          slippagePercent: 0,
          riskFlags: [],
          logs: [],
        }),
      };
      (transactionSimulator.TransactionSimulator as any).mockImplementation(() => mockSimulator);
      vi.mocked(auditTrailService.auditTrailService.logSecurityEvent).mockResolvedValue({} as any);

      const guard = new PreflightGuard('https://api.mainnet-beta.solana.com');
      const decision = await guard.evaluate({
        agentId: 'agent1',
        walletAddress: 'wallet123',
        transaction: {} as any,
        expectedBalanceChange: -1,
        action: 'BUY',
      });

      expect(decision.approved).toBe(true);
      expect(decision.action).toBe('BUY');
    });

    it('rejects transaction with critical risk flags', async () => {
      const mockSimulator = {
        simulate: vi.fn().mockResolvedValue({
          success: true,
          approved: false,
          balanceChange: -100,
          expectedChange: -1,
          slippagePercent: 50,
          riskFlags: [
            { type: 'EXCESSIVE_LOSS', severity: 'critical', message: 'Excessive loss detected' },
          ],
          logs: [],
        }),
      };
      (transactionSimulator.TransactionSimulator as any).mockImplementation(() => mockSimulator);
      vi.mocked(auditTrailService.auditTrailService.logSecurityEvent).mockResolvedValue({} as any);

      const guard = new PreflightGuard('https://api.mainnet-beta.solana.com');
      const decision = await guard.evaluate({
        agentId: 'agent1',
        walletAddress: 'wallet123',
        transaction: {} as any,
        expectedBalanceChange: -1,
        action: 'BUY',
      });

      expect(decision.approved).toBe(false);
      expect(decision.reason).toContain('Blocked');
    });

    it('gets stats for agent', () => {
      const guard = new PreflightGuard('https://api.mainnet-beta.solana.com');
      const stats = guard.getStats('agent1');
      expect(stats).toBeDefined();
      expect(stats.total).toBe(0);
      expect(stats.approved).toBe(0);
      expect(stats.blocked).toBe(0);
    });
  });
});
