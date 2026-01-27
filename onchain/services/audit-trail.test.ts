import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditTrailService } from './audit-trail';
import type { AuditTrailEntry } from './onchain-types';

vi.mock('./onchain-verification', () => ({
  onChainVerification: {
    storeSecurityDecision: vi.fn().mockResolvedValue({
      onChainProof: 'proof123',
    }),
  },
}));

describe('AuditTrailService', () => {
  let service: AuditTrailService;

  beforeEach(() => {
    service = new AuditTrailService();
  });

  describe('logSecurityEvent', () => {
    it('creates audit trail entry with hash', async () => {
      const entry = await service.logSecurityEvent({
        agentId: 'agent1',
        tokenAddress: 'token123',
        decision: 'approved',
        reason: 'Test reason',
      });

      expect(entry.id).toBeDefined();
      expect(entry.timestamp).toBeInstanceOf(Date);
      expect(entry.hash).toBeDefined();
      expect(entry.previousHash).toBeNull();
      expect(entry.onChainProof).toBe('proof123');
      expect(entry.agentId).toBe('agent1');
      expect(entry.decision).toBe('approved');
    });

    it('links entries with previous hash', async () => {
      const entry1 = await service.logSecurityEvent({
        agentId: 'agent1',
        decision: 'approved',
        reason: 'First',
      });

      const entry2 = await service.logSecurityEvent({
        agentId: 'agent1',
        decision: 'rejected',
        reason: 'Second',
      });

      expect(entry2.previousHash).toBe(entry1.hash);
    });
  });

  describe('queryTrail', () => {
    beforeEach(async () => {
      await service.logSecurityEvent({
        agentId: 'agent1',
        tokenAddress: 'token1',
        decision: 'approved',
        reason: 'Test 1',
      });
      await service.logSecurityEvent({
        agentId: 'agent2',
        tokenAddress: 'token2',
        decision: 'rejected',
        reason: 'Test 2',
      });
    });

    it('returns all entries when no filters', async () => {
      const result = await service.queryTrail({});
      expect(result.entries.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
    });

    it('filters by agentId', async () => {
      const result = await service.queryTrail({ agentId: 'agent1' });
      expect(result.entries.every(e => e.agentId === 'agent1')).toBe(true);
    });

    it('filters by tokenAddress', async () => {
      const result = await service.queryTrail({ tokenAddress: 'token1' });
      expect(result.entries.every(e => e.tokenAddress === 'token1')).toBe(true);
    });

    it('filters by decision', async () => {
      const result = await service.queryTrail({ decision: 'approved' });
      expect(result.entries.every(e => e.decision === 'approved')).toBe(true);
    });

    it('respects limit', async () => {
      const result = await service.queryTrail({ limit: 1 });
      expect(result.entries.length).toBeLessThanOrEqual(1);
    });
  });

  describe('verifyTrailIntegrity', () => {
    it('verifies trail integrity', async () => {
      const entry1 = await service.logSecurityEvent({
        agentId: 'agent1',
        decision: 'approved',
        reason: 'Test',
      });
      const entry2 = await service.logSecurityEvent({
        agentId: 'agent1',
        decision: 'rejected',
        reason: 'Test 2',
      });

      expect(entry2.previousHash).toBe(entry1.hash);
      
      const result = await service.verifyTrailIntegrity();
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('invalidEntries');
      expect(Array.isArray(result.invalidEntries)).toBe(true);
    });
  });
});
