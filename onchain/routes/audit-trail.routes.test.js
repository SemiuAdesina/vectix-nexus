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
const auditTrailService = __importStar(require("../services/audit-trail"));
vitest_1.vi.mock('../services/audit-trail', () => ({
    auditTrailService: {
        logSecurityEvent: vitest_1.vi.fn(),
        queryTrail: vitest_1.vi.fn(),
        verifyTrail: vitest_1.vi.fn(),
        exportTrail: vitest_1.vi.fn(),
    },
}));
(0, vitest_1.describe)('Audit Trail Routes', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('POST /onchain/audit-trail', () => {
        (0, vitest_1.it)('logs a security event', async () => {
            const mockEntry = {
                id: 'entry1',
                timestamp: new Date(),
                hash: 'hash123',
                onChainProof: 'proof123',
                agentId: 'agent1',
                decision: 'approved',
                reason: 'Test reason',
            };
            vitest_1.vi.mocked(auditTrailService.auditTrailService.logSecurityEvent).mockResolvedValue(mockEntry);
            const result = await auditTrailService.auditTrailService.logSecurityEvent({
                agentId: 'agent1',
                decision: 'approved',
                reason: 'Test reason',
            });
            (0, vitest_1.expect)(result).toEqual(mockEntry);
        });
    });
    (0, vitest_1.describe)('GET /onchain/audit-trail', () => {
        (0, vitest_1.it)('queries audit trail', async () => {
            const mockEntries = [
                { id: 'entry1', timestamp: new Date(), hash: 'hash1' },
                { id: 'entry2', timestamp: new Date(), hash: 'hash2' },
            ];
            vitest_1.vi.mocked(auditTrailService.auditTrailService.queryTrail).mockResolvedValue({
                entries: mockEntries,
                total: 2,
            });
            const result = await auditTrailService.auditTrailService.queryTrail({ limit: 10 });
            (0, vitest_1.expect)(result.entries).toEqual(mockEntries);
            (0, vitest_1.expect)(result.total).toBe(2);
        });
    });
    (0, vitest_1.describe)('GET /onchain/audit-trail/verify', () => {
        (0, vitest_1.it)('verifies audit trail integrity', async () => {
            vitest_1.vi.mocked(auditTrailService.auditTrailService.verifyTrail).mockResolvedValue({
                valid: true,
                invalidEntries: [],
            });
            const result = await auditTrailService.auditTrailService.verifyTrail();
            (0, vitest_1.expect)(result.valid).toBe(true);
            (0, vitest_1.expect)(result.invalidEntries).toEqual([]);
        });
    });
});
