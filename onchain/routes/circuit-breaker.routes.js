"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const circuit_breaker_1 = require("../services/circuit-breaker");
const router = (0, express_1.Router)();
router.post('/onchain/circuit-breaker/initialize', async (req, res) => {
    try {
        const { agentId, config } = req.body;
        await circuit_breaker_1.circuitBreakerService.initializeBreaker(agentId, config);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to initialize circuit breaker:', error);
        res.status(500).json({ success: false, error: 'Failed to initialize circuit breaker' });
    }
});
router.post('/onchain/circuit-breaker/check', async (req, res) => {
    try {
        const { agentId, metrics } = req.body;
        const result = await circuit_breaker_1.circuitBreakerService.checkBreaker(agentId, metrics);
        res.json({ success: true, ...result });
    }
    catch (error) {
        console.error('Failed to check circuit breaker:', error);
        res.status(500).json({ success: false, error: 'Failed to check circuit breaker' });
    }
});
router.get('/onchain/circuit-breaker/state/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        const state = await circuit_breaker_1.circuitBreakerService.getBreakerState(agentId);
        res.json({ success: true, state });
    }
    catch (error) {
        console.error('Failed to get circuit breaker state:', error);
        res.status(500).json({ success: false, error: 'Failed to get circuit breaker state' });
    }
});
router.post('/onchain/circuit-breaker/reset', async (req, res) => {
    try {
        const { agentId } = req.body;
        await circuit_breaker_1.circuitBreakerService.resetBreaker(agentId);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to reset circuit breaker:', error);
        res.status(500).json({ success: false, error: 'Failed to reset circuit breaker' });
    }
});
exports.default = router;
