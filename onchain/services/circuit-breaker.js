"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.circuitBreakerService = exports.CircuitBreakerService = void 0;
class CircuitBreakerService {
    constructor() {
        this.breakers = new Map();
    }
    async initializeBreaker(agentId, config) {
        this.breakers.set(agentId, {
            agentId,
            config,
            status: 'closed',
            failureCount: 0,
            lastFailureTime: null,
            lastResetTime: new Date(),
            pausedUntil: null,
        });
    }
    async checkBreaker(agentId, metrics) {
        const breaker = this.breakers.get(agentId);
        if (!breaker)
            return { allowed: true };
        if (breaker.status === 'open') {
            if (breaker.pausedUntil && breaker.pausedUntil > new Date()) {
                return { allowed: false, reason: 'Circuit breaker is open - paused until ' + breaker.pausedUntil.toISOString() };
            }
            if (breaker.lastResetTime && Date.now() - breaker.lastResetTime.getTime() > breaker.config.resetTimeout) {
                breaker.status = 'half-open';
                breaker.lastResetTime = new Date();
            }
            else {
                return { allowed: false, reason: 'Circuit breaker is open' };
            }
        }
        if (breaker.status === 'half-open') {
            breaker.status = 'closed';
            breaker.failureCount = 0;
        }
        if (metrics.volume && metrics.volume > breaker.config.maxVolume) {
            await this.tripBreaker(agentId, 'Volume threshold exceeded');
            return { allowed: false, reason: 'Volume threshold exceeded' };
        }
        if (metrics.priceChange && Math.abs(metrics.priceChange) > breaker.config.maxPriceChange) {
            await this.tripBreaker(agentId, 'Price change threshold exceeded');
            return { allowed: false, reason: 'Price change threshold exceeded' };
        }
        if (metrics.tradeCount && metrics.tradeCount > breaker.config.maxTradesPerPeriod) {
            await this.tripBreaker(agentId, 'Trade count threshold exceeded');
            return { allowed: false, reason: 'Trade count threshold exceeded' };
        }
        return { allowed: true };
    }
    async tripBreaker(agentId, reason) {
        const breaker = this.breakers.get(agentId);
        if (!breaker)
            return;
        breaker.status = 'open';
        breaker.failureCount++;
        breaker.lastFailureTime = new Date();
        breaker.pausedUntil = new Date(Date.now() + breaker.config.pauseDuration);
    }
    async resetBreaker(agentId) {
        const breaker = this.breakers.get(agentId);
        if (!breaker)
            return;
        breaker.status = 'closed';
        breaker.failureCount = 0;
        breaker.lastResetTime = new Date();
        breaker.pausedUntil = null;
    }
    async getBreakerState(agentId) {
        return this.breakers.get(agentId) || null;
    }
}
exports.CircuitBreakerService = CircuitBreakerService;
exports.circuitBreakerService = new CircuitBreakerService();
