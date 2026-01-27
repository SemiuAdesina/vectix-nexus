"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const audit_trail_1 = require("./audit-trail");
vitest_1.vi.mock('./onchain-verification', () => ({
    onChainVerification: {
        storeSecurityDecision: vitest_1.vi.fn().mockResolvedValue({
            onChainProof: 'proof123',
        }),
    },
}));
(0, vitest_1.describe)('AuditTrailService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        service = new audit_trail_1.AuditTrailService();
    });
    (0, vitest_1.describe)('logSecurityEvent', () => {
        (0, vitest_1.it)('creates audit trail entry with hash', async () => {
            const entry = await service.logSecurityEvent({
                agentId: 'agent1',
                tokenAddress: 'token123',
                decision: 'approved',
                reason: 'Test reason',
            });
            (0, vitest_1.expect)(entry.id).toBeDefined();
            (0, vitest_1.expect)(entry.timestamp).toBeInstanceOf(Date);
            (0, vitest_1.expect)(entry.hash).toBeDefined();
            (0, vitest_1.expect)(entry.previousHash).toBeNull();
            (0, vitest_1.expect)(entry.onChainProof).toBe('proof123');
            (0, vitest_1.expect)(entry.agentId).toBe('agent1');
            (0, vitest_1.expect)(entry.decision).toBe('approved');
        });
        (0, vitest_1.it)('links entries with previous hash', async () => {
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
            (0, vitest_1.expect)(entry2.previousHash).toBe(entry1.hash);
        });
    });
    (0, vitest_1.describe)('queryTrail', () => {
        (0, vitest_1.beforeEach)(async () => {
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
        (0, vitest_1.it)('returns all entries when no filters', async () => {
            const result = await service.queryTrail({});
            (0, vitest_1.expect)(result.entries.length).toBeGreaterThanOrEqual(2);
            (0, vitest_1.expect)(result.total).toBeGreaterThanOrEqual(2);
        });
        (0, vitest_1.it)('filters by agentId', async () => {
            const result = await service.queryTrail({ agentId: 'agent1' });
            (0, vitest_1.expect)(result.entries.every(e => e.agentId === 'agent1')).toBe(true);
        });
        (0, vitest_1.it)('filters by tokenAddress', async () => {
            const result = await service.queryTrail({ tokenAddress: 'token1' });
            (0, vitest_1.expect)(result.entries.every(e => e.tokenAddress === 'token1')).toBe(true);
        });
        (0, vitest_1.it)('filters by decision', async () => {
            const result = await service.queryTrail({ decision: 'approved' });
            (0, vitest_1.expect)(result.entries.every(e => e.decision === 'approved')).toBe(true);
        });
        (0, vitest_1.it)('respects limit', async () => {
            const result = await service.queryTrail({ limit: 1 });
            (0, vitest_1.expect)(result.entries.length).toBeLessThanOrEqual(1);
        });
    });
    (0, vitest_1.describe)('verifyTrailIntegrity', () => {
        (0, vitest_1.it)('verifies trail integrity', async () => {
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
            (0, vitest_1.expect)(entry2.previousHash).toBe(entry1.hash);
            const result = await service.verifyTrailIntegrity();
            (0, vitest_1.expect)(result).toHaveProperty('valid');
            (0, vitest_1.expect)(result).toHaveProperty('invalidEntries');
            (0, vitest_1.expect)(Array.isArray(result.invalidEntries)).toBe(true);
        });
    });
});
