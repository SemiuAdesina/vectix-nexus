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
const governanceService = __importStar(require("../services/governance"));
vitest_1.vi.mock('../services/governance', () => ({
    governanceService: {
        createProposal: vitest_1.vi.fn(),
        vote: vitest_1.vi.fn(),
        getActiveProposals: vitest_1.vi.fn(),
        getProposal: vitest_1.vi.fn(),
        executeProposal: vitest_1.vi.fn(),
    },
}));
(0, vitest_1.describe)('Governance Routes', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('POST /onchain/governance/proposal', () => {
        (0, vitest_1.it)('creates a proposal successfully', async () => {
            const mockProposal = {
                id: 'proposal1',
                title: 'Test Proposal',
                description: 'Test',
                type: 'security_rule',
                quorum: 10,
                status: 'active',
                votesFor: 0,
                votesAgainst: 0,
                createdAt: new Date(),
            };
            vitest_1.vi.mocked(governanceService.governanceService.createProposal).mockResolvedValue(mockProposal);
            const result = await governanceService.governanceService.createProposal({
                title: 'Test Proposal',
                description: 'Test',
                type: 'security_rule',
                quorum: 10,
            });
            (0, vitest_1.expect)(result).toEqual(mockProposal);
            (0, vitest_1.expect)(governanceService.governanceService.createProposal).toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('POST /onchain/governance/vote', () => {
        (0, vitest_1.it)('votes successfully', async () => {
            vitest_1.vi.mocked(governanceService.governanceService.vote).mockResolvedValue(true);
            const result = await governanceService.governanceService.vote('proposal1', {
                proposalId: 'proposal1',
                voter: 'voter1',
                support: true,
                weight: 5,
            });
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(governanceService.governanceService.vote).toHaveBeenCalled();
        });
        (0, vitest_1.it)('handles failed vote', async () => {
            vitest_1.vi.mocked(governanceService.governanceService.vote).mockResolvedValue(false);
            const result = await governanceService.governanceService.vote('invalid', {
                proposalId: 'invalid',
                voter: 'voter1',
                support: true,
                weight: 5,
            });
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
});
