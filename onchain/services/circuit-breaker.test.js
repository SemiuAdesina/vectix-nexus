"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const circuit_breaker_1 = require("./circuit-breaker");
(0, vitest_1.describe)('CircuitBreakerService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        service = new circuit_breaker_1.CircuitBreakerService();
    });
    (0, vitest_1.describe)('initializeBreaker', () => {
        (0, vitest_1.it)('initializes circuit breaker with closed status', async () => {
            const config = {
                maxVolume: 1000000,
                maxPriceChange: 10,
                maxTradesPerPeriod: 100,
                failureThreshold: 5,
                resetTimeout: 60000,
                pauseDuration: 300000,
            };
            await service.initializeBreaker('agent1', config);
            const state = await service.getBreakerState('agent1');
            (0, vitest_1.expect)(state).toBeDefined();
            (0, vitest_1.expect)(state?.status).toBe('closed');
            (0, vitest_1.expect)(state?.failureCount).toBe(0);
            (0, vitest_1.expect)(state?.config).toEqual(config);
        });
    });
    (0, vitest_1.describe)('checkBreaker', () => {
        (0, vitest_1.beforeEach)(async () => {
            await service.initializeBreaker('agent1', {
                maxVolume: 1000000,
                maxPriceChange: 10,
                maxTradesPerPeriod: 100,
                failureThreshold: 5,
                resetTimeout: 60000,
                pauseDuration: 300000,
            });
        });
        (0, vitest_1.it)('allows operations when breaker is closed and metrics are within limits', async () => {
            const result = await service.checkBreaker('agent1', {
                volume: 500000,
                priceChange: 5,
                tradeCount: 50,
            });
            (0, vitest_1.expect)(result.allowed).toBe(true);
        });
        (0, vitest_1.it)('blocks operations when volume exceeds limit', async () => {
            const result = await service.checkBreaker('agent1', {
                volume: 2000000,
            });
            (0, vitest_1.expect)(result.allowed).toBe(false);
            (0, vitest_1.expect)(result.reason).toContain('Volume threshold exceeded');
        });
        (0, vitest_1.it)('blocks operations when price change exceeds limit', async () => {
            const result = await service.checkBreaker('agent1', {
                priceChange: 15,
            });
            (0, vitest_1.expect)(result.allowed).toBe(false);
            (0, vitest_1.expect)(result.reason).toContain('Price change threshold exceeded');
        });
        (0, vitest_1.it)('blocks operations when trade count exceeds limit', async () => {
            const result = await service.checkBreaker('agent1', {
                tradeCount: 150,
            });
            (0, vitest_1.expect)(result.allowed).toBe(false);
            (0, vitest_1.expect)(result.reason).toContain('Trade count threshold exceeded');
        });
        (0, vitest_1.it)('returns allowed for non-initialized breakers', async () => {
            const result = await service.checkBreaker('non-existent', {});
            (0, vitest_1.expect)(result.allowed).toBe(true);
        });
    });
    (0, vitest_1.describe)('tripBreaker', () => {
        (0, vitest_1.beforeEach)(async () => {
            await service.initializeBreaker('agent1', {
                maxVolume: 1000000,
                maxPriceChange: 10,
                maxTradesPerPeriod: 100,
                failureThreshold: 3,
                resetTimeout: 60000,
                pauseDuration: 300000,
            });
        });
        (0, vitest_1.it)('opens breaker when failure threshold is reached', async () => {
            await service.tripBreaker('agent1', 'Test failure');
            await service.tripBreaker('agent1', 'Test failure');
            await service.tripBreaker('agent1', 'Test failure');
            const state = await service.getBreakerState('agent1');
            (0, vitest_1.expect)(state?.status).toBe('open');
            (0, vitest_1.expect)(state?.failureCount).toBe(3);
        });
        (0, vitest_1.it)('sets pause duration when breaker opens', async () => {
            await service.tripBreaker('agent1', 'Test failure');
            await service.tripBreaker('agent1', 'Test failure');
            await service.tripBreaker('agent1', 'Test failure');
            const state = await service.getBreakerState('agent1');
            (0, vitest_1.expect)(state?.pausedUntil).toBeDefined();
            if (state?.pausedUntil) {
                (0, vitest_1.expect)(state.pausedUntil.getTime()).toBeGreaterThan(Date.now());
            }
        });
    });
    (0, vitest_1.describe)('getBreakerState', () => {
        (0, vitest_1.it)('returns null for non-existent breaker', async () => {
            const state = await service.getBreakerState('non-existent');
            (0, vitest_1.expect)(state).toBeNull();
        });
        (0, vitest_1.it)('returns state for initialized breaker', async () => {
            await service.initializeBreaker('agent1', {
                maxVolume: 1000000,
                maxPriceChange: 10,
                maxTradesPerPeriod: 100,
                failureThreshold: 5,
                resetTimeout: 60000,
                pauseDuration: 300000,
            });
            const state = await service.getBreakerState('agent1');
            (0, vitest_1.expect)(state).toBeDefined();
            (0, vitest_1.expect)(state?.agentId).toBe('agent1');
        });
    });
});
