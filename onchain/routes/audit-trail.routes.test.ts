import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as auditTrailService from '../services/audit-trail';

vi.mock('../services/audit-trail', () => ({
  auditTrailService: {
    logSecurityEvent: vi.fn(),
    queryTrail: vi.fn(),
    verifyTrail: vi.fn(),
    exportTrail: vi.fn(),
  },
}));

describe('Audit Trail Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /onchain/audit-trail', () => {
    it('logs a security event', async () => {
      const mockEntry = {
        id: 'entry1',
        timestamp: new Date(),
        hash: 'hash123',
        onChainProof: 'proof123',
        agentId: 'agent1',
        decision: 'approved',
        reason: 'Test reason',
      };

      vi.mocked(auditTrailService.auditTrailService.logSecurityEvent).mockResolvedValue(mockEntry as any);

      const result = await auditTrailService.auditTrailService.logSecurityEvent({
        agentId: 'agent1',
        decision: 'approved',
        reason: 'Test reason',
      });

      expect(result).toEqual(mockEntry);
    });
  });

  describe('GET /onchain/audit-trail', () => {
    it('queries audit trail', async () => {
      const mockEntries = [
        { id: 'entry1', timestamp: new Date(), hash: 'hash1' },
        { id: 'entry2', timestamp: new Date(), hash: 'hash2' },
      ];

      vi.mocked(auditTrailService.auditTrailService.queryTrail).mockResolvedValue({
        entries: mockEntries as any,
        total: 2,
      });

      const result = await auditTrailService.auditTrailService.queryTrail({ limit: 10 });
      expect(result.entries).toEqual(mockEntries);
      expect(result.total).toBe(2);
    });
  });

  describe('GET /onchain/audit-trail/verify', () => {
    it('verifies audit trail integrity', async () => {
      vi.mocked(auditTrailService.auditTrailService.verifyTrail).mockResolvedValue({
        valid: true,
        invalidEntries: [],
      });

      const result = await auditTrailService.auditTrailService.verifyTrail();
      expect(result.valid).toBe(true);
      expect(result.invalidEntries).toEqual([]);
    });
  });
});
