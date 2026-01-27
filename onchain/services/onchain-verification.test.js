"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const onchain_verification_1 = require("./onchain-verification");
vitest_1.vi.mock('@solana/web3.js', () => ({
    Connection: vitest_1.vi.fn().mockImplementation(() => ({
        getAccountInfo: vitest_1.vi.fn(),
    })),
    PublicKey: vitest_1.vi.fn().mockImplementation((key) => ({ toString: () => key })),
}));
(0, vitest_1.describe)('OnChainVerificationService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        service = new onchain_verification_1.OnChainVerificationService();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('storeSecurityDecision', () => {
        (0, vitest_1.it)('stores security decision and returns log with proof', async () => {
            const log = {
                id: 'log1',
                type: 'security_decision',
                agentId: 'agent1',
                tokenAddress: 'token123',
                decision: 'approved',
                reason: 'Test reason',
                timestamp: new Date().toISOString(),
            };
            const result = await service.storeSecurityDecision(log);
            (0, vitest_1.expect)(result.id).toBe(log.id);
            (0, vitest_1.expect)(result.onChainProof).toBeDefined();
            (0, vitest_1.expect)(typeof result.onChainProof).toBe('string');
        });
    });
    (0, vitest_1.describe)('verifyCertificate', () => {
        (0, vitest_1.it)('verifies a certificate proof', async () => {
            const proof = 'proof123';
            const result = await service.verifyCertificate(proof);
            (0, vitest_1.expect)(result.verified).toBeDefined();
            (0, vitest_1.expect)(typeof result.verified).toBe('boolean');
            (0, vitest_1.expect)(result.proof).toBe(proof);
            (0, vitest_1.expect)(result.timestamp).toBeDefined();
        });
        (0, vitest_1.it)('returns verified true for non-onchain proofs (mock mode)', async () => {
            const result = await service.verifyCertificate('invalid-proof');
            (0, vitest_1.expect)(result.verified).toBe(true);
            (0, vitest_1.expect)(result.proof).toBe('invalid-proof');
        });
    });
    (0, vitest_1.describe)('connection and programId', () => {
        (0, vitest_1.it)('initializes with connection and optional programId', () => {
            (0, vitest_1.expect)(service).toBeDefined();
            (0, vitest_1.expect)(service.constructor.name).toBe('OnChainVerificationService');
        });
    });
});
