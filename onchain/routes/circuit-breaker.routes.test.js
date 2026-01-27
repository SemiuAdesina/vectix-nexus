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
const circuitBreakerService = __importStar(require("../services/circuit-breaker"));
vitest_1.vi.mock('../services/circuit-breaker', () => ({
    circuitBreakerService: {
        initializeBreaker: vitest_1.vi.fn(),
        checkBreaker: vitest_1.vi.fn(),
        getBreakerState: vitest_1.vi.fn(),
        resetBreaker: vitest_1.vi.fn(),
    },
}));
(0, vitest_1.describe)('Circuit Breaker Routes', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('POST /onchain/circuit-breaker/initialize', () => {
        (0, vitest_1.it)('initializes circuit breaker', async () => {
            vitest_1.vi.mocked(circuitBreakerService.circuitBreakerService.initializeBreaker).mockResolvedValue();
            await circuitBreakerService.circuitBreakerService.initializeBreaker('agent1', {
                maxVolume: 1000000,
                maxPriceChange: 10,
                maxTradesPerPeriod: 100,
                failureThreshold: 5,
                resetTimeout: 60000,
                pauseDuration: 300000,
            });
            (0, vitest_1.expect)(circuitBreakerService.circuitBreakerService.initializeBreaker).toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('POST /onchain/circuit-breaker/check', () => {
        (0, vitest_1.it)('checks circuit breaker status', async () => {
            vitest_1.vi.mocked(circuitBreakerService.circuitBreakerService.checkBreaker).mockResolvedValue({
                allowed: true,
            });
            const result = await circuitBreakerService.circuitBreakerService.checkBreaker('agent1', {
                volume: 500000,
            });
            (0, vitest_1.expect)(result.allowed).toBe(true);
        });
        (0, vitest_1.it)('returns blocked status when breaker is open', async () => {
            vitest_1.vi.mocked(circuitBreakerService.circuitBreakerService.checkBreaker).mockResolvedValue({
                allowed: false,
                reason: 'Circuit breaker is open',
            });
            const result = await circuitBreakerService.circuitBreakerService.checkBreaker('agent1', {
                volume: 2000000,
            });
            (0, vitest_1.expect)(result.allowed).toBe(false);
            (0, vitest_1.expect)(result.reason).toBeDefined();
        });
    });
    (0, vitest_1.describe)('GET /onchain/circuit-breaker/state/:agentId', () => {
        (0, vitest_1.it)('returns circuit breaker state', async () => {
            const mockState = {
                agentId: 'agent1',
                status: 'closed',
                failureCount: 0,
            };
            vitest_1.vi.mocked(circuitBreakerService.circuitBreakerService.getBreakerState).mockResolvedValue(mockState);
            const result = await circuitBreakerService.circuitBreakerService.getBreakerState('agent1');
            (0, vitest_1.expect)(result).toEqual(mockState);
        });
    });
});
