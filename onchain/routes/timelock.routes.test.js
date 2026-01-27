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
const timeLockService = __importStar(require("../services/time-lock"));
vitest_1.vi.mock('../services/time-lock', () => ({
    timeLockService: {
        createTimeLock: vitest_1.vi.fn(),
        cancelTimeLock: vitest_1.vi.fn(),
        getTimeLock: vitest_1.vi.fn(),
        getPendingTimeLocks: vitest_1.vi.fn(),
        executeTimeLock: vitest_1.vi.fn(),
    },
}));
(0, vitest_1.describe)('TimeLock Routes', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('POST /onchain/timelock/create', () => {
        (0, vitest_1.it)('creates a time-locked transaction', async () => {
            const mockTimelock = {
                id: 'timelock1',
                agentId: 'agent1',
                type: 'trade',
                status: 'pending',
                executeAt: new Date(Date.now() + 3600000),
                createdAt: new Date(),
            };
            vitest_1.vi.mocked(timeLockService.timeLockService.createTimeLock).mockResolvedValue(mockTimelock);
            const result = await timeLockService.timeLockService.createTimeLock({
                agentId: 'agent1',
                type: 'trade',
                transactionData: {},
                executeAt: new Date(Date.now() + 3600000),
                cancelWindow: 300000,
            });
            (0, vitest_1.expect)(result).toEqual(mockTimelock);
        });
    });
    (0, vitest_1.describe)('POST /onchain/timelock/cancel', () => {
        (0, vitest_1.it)('cancels a time lock', async () => {
            vitest_1.vi.mocked(timeLockService.timeLockService.cancelTimeLock).mockResolvedValue(true);
            const result = await timeLockService.timeLockService.cancelTimeLock('timelock1');
            (0, vitest_1.expect)(result).toBe(true);
        });
    });
    (0, vitest_1.describe)('GET /onchain/timelock/:id', () => {
        (0, vitest_1.it)('returns time lock by id', async () => {
            const mockTimelock = {
                id: 'timelock1',
                agentId: 'agent1',
                status: 'pending',
            };
            vitest_1.vi.mocked(timeLockService.timeLockService.getTimeLock).mockResolvedValue(mockTimelock);
            const result = await timeLockService.timeLockService.getTimeLock('timelock1');
            (0, vitest_1.expect)(result).toEqual(mockTimelock);
        });
    });
    (0, vitest_1.describe)('GET /onchain/timelock/pending/:agentId', () => {
        (0, vitest_1.it)('returns pending time locks for agent', async () => {
            const mockTimelocks = [
                { id: 'timelock1', agentId: 'agent1', status: 'pending' },
                { id: 'timelock2', agentId: 'agent1', status: 'pending' },
            ];
            vitest_1.vi.mocked(timeLockService.timeLockService.getPendingTimeLocks).mockResolvedValue(mockTimelocks);
            const result = await timeLockService.timeLockService.getPendingTimeLocks('agent1');
            (0, vitest_1.expect)(result).toEqual(mockTimelocks);
        });
    });
});
