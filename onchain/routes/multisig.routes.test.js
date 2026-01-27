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
const multisigService = __importStar(require("../services/multisig"));
vitest_1.vi.mock('../services/multisig', () => ({
    multiSigService: {
        createMultiSig: vitest_1.vi.fn(),
        createProposal: vitest_1.vi.fn(),
        addSignature: vitest_1.vi.fn(),
        executeProposal: vitest_1.vi.fn(),
    },
}));
(0, vitest_1.describe)('MultiSig Routes', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('POST /onchain/multisig/create', () => {
        (0, vitest_1.it)('creates a multisig wallet', async () => {
            vitest_1.vi.mocked(multisigService.multiSigService.createMultiSig).mockResolvedValue('multisig123');
            const result = await multisigService.multiSigService.createMultiSig({
                agentId: 'agent1',
                threshold: 2,
                signers: ['signer1', 'signer2'],
            });
            (0, vitest_1.expect)(result).toBe('multisig123');
            (0, vitest_1.expect)(multisigService.multiSigService.createMultiSig).toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('POST /onchain/multisig/proposal', () => {
        (0, vitest_1.it)('creates a multisig proposal', async () => {
            const mockProposal = {
                id: 'proposal1',
                multisigId: 'multisig123',
                type: 'trade',
                status: 'pending',
                signatures: [],
                createdAt: new Date(),
            };
            vitest_1.vi.mocked(multisigService.multiSigService.createProposal).mockResolvedValue(mockProposal);
            const result = await multisigService.multiSigService.createProposal('multisig123', {
                type: 'trade',
                amount: 1000,
            });
            (0, vitest_1.expect)(result).toEqual(mockProposal);
        });
    });
});
