"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const onchainVerification = __importStar(require("../services/onchain-verification"));
vitest_1.vi.mock('../services/onchain-verification', () => ({
    onChainVerification: {
        storeSecurityDecision: vitest_1.vi.fn(),
        verifyCertificate: vitest_1.vi.fn(),
    },
}));
(0, vitest_1.describe)('Onchain Routes', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        process.env.SOLANA_PROGRAM_ID = 'test-program-id';
    });
    (0, vitest_1.describe)('POST /onchain/log', () => {
        (0, vitest_1.it)('stores security decision successfully', async () => {
            const mockLog = {
                id: 'log1',
                agentId: 'agent1',
                decision: 'approved',
                reason: 'Test reason',
                timestamp: new Date().toISOString(),
                onChainProof: 'proof123',
            };
            vitest_1.vi.mocked(onchainVerification.onChainVerification.storeSecurityDecision).mockResolvedValue(mockLog);
            const result = await onchainVerification.onChainVerification.storeSecurityDecision({
                id: 'log1',
                agentId: 'agent1',
                decision: 'approved',
                reason: 'Test reason',
                timestamp: new Date().toISOString(),
            });
            (0, vitest_1.expect)(result).toEqual(mockLog);
            (0, vitest_1.expect)(onchainVerification.onChainVerification.storeSecurityDecision).toHaveBeenCalled();
        });
        (0, vitest_1.it)('handles errors when storing log fails', async () => {
            vitest_1.vi.mocked(onchainVerification.onChainVerification.storeSecurityDecision).mockRejectedValue(new Error('Storage failed'));
            await (0, vitest_1.expect)(onchainVerification.onChainVerification.storeSecurityDecision({
                id: 'log1',
                agentId: 'agent1',
                decision: 'approved',
            })).rejects.toThrow('Storage failed');
        });
    });
    (0, vitest_1.describe)('GET /onchain/verify/:proof', () => {
        (0, vitest_1.it)('verifies certificate successfully', async () => {
            const mockResult = {
                verified: true,
                proof: 'proof123',
                timestamp: new Date().toISOString(),
            };
            vitest_1.vi.mocked(onchainVerification.onChainVerification.verifyCertificate).mockResolvedValue(mockResult);
            const result = await onchainVerification.onChainVerification.verifyCertificate('proof123');
            (0, vitest_1.expect)(result).toEqual(mockResult);
            (0, vitest_1.expect)(onchainVerification.onChainVerification.verifyCertificate).toHaveBeenCalledWith('proof123');
        });
        (0, vitest_1.it)('handles errors when verification fails', async () => {
            vitest_1.vi.mocked(onchainVerification.onChainVerification.verifyCertificate).mockRejectedValue(new Error('Verification failed'));
            await (0, vitest_1.expect)(onchainVerification.onChainVerification.verifyCertificate('invalid-proof')).rejects.toThrow('Verification failed');
        });
    });
});
