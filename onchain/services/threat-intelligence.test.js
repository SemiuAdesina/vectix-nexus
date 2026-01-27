"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const threat_intelligence_1 = require("./threat-intelligence");
(0, vitest_1.describe)('ThreatIntelligenceService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        service = new threat_intelligence_1.ThreatIntelligenceService();
    });
    (0, vitest_1.describe)('detectAnomaly', () => {
        (0, vitest_1.it)('detects no anomaly for normal metrics', async () => {
            const result = await service.detectAnomaly({
                volume: 100000,
                priceChange: 5,
                tradeCount: 10,
            });
            (0, vitest_1.expect)(result.isAnomaly).toBe(false);
            (0, vitest_1.expect)(result.confidence).toBeLessThan(50);
        });
        (0, vitest_1.it)('detects anomaly for high volume', async () => {
            const result = await service.detectAnomaly({
                volume: 2000000,
                tradeCount: 120, // Add trade count (20 points) to reach 50 threshold: 30 + 20 = 50
            });
            (0, vitest_1.expect)(result.isAnomaly).toBe(true);
            (0, vitest_1.expect)(result.confidence).toBeGreaterThanOrEqual(50);
            (0, vitest_1.expect)(result.reason).toContain('Unusual volume spike');
        });
        (0, vitest_1.it)('detects anomaly for extreme price change', async () => {
            const result = await service.detectAnomaly({
                priceChange: 60,
                tradeCount: 120, // Add trade count (20 points) to reach 50 threshold: 40 + 20 = 60
            });
            (0, vitest_1.expect)(result.isAnomaly).toBe(true);
            (0, vitest_1.expect)(result.confidence).toBeGreaterThanOrEqual(50);
            (0, vitest_1.expect)(result.reason).toContain('Extreme price movement');
        });
        (0, vitest_1.it)('detects anomaly for high trade count', async () => {
            const result = await service.detectAnomaly({
                tradeCount: 150,
                volume: 1500000, // Add volume to reach threshold
            });
            (0, vitest_1.expect)(result.isAnomaly).toBe(true);
            (0, vitest_1.expect)(result.confidence).toBeGreaterThanOrEqual(50);
            (0, vitest_1.expect)(result.reason).toContain('High trade frequency');
        });
        (0, vitest_1.it)('combines multiple anomaly indicators', async () => {
            const result = await service.detectAnomaly({
                volume: 2000000,
                priceChange: 60,
                tradeCount: 150,
            });
            (0, vitest_1.expect)(result.isAnomaly).toBe(true);
            (0, vitest_1.expect)(result.confidence).toBeGreaterThan(50);
        });
    });
    (0, vitest_1.describe)('getThreatFeed', () => {
        (0, vitest_1.it)('returns threat feed with limit', async () => {
            const feed = await service.getThreatFeed(10);
            (0, vitest_1.expect)(Array.isArray(feed)).toBe(true);
            (0, vitest_1.expect)(feed.length).toBeLessThanOrEqual(10);
        });
    });
    (0, vitest_1.describe)('addThreatPattern', () => {
        (0, vitest_1.it)('adds a threat pattern', async () => {
            const pattern = {
                name: 'Test Pattern',
                description: 'Test description',
                volumeThreshold: 1000000,
            };
            const result = await service.addThreatPattern(pattern);
            (0, vitest_1.expect)(result.id).toBeDefined();
            (0, vitest_1.expect)(result.name).toBe('Test Pattern');
            (0, vitest_1.expect)(result.createdAt).toBeInstanceOf(Date);
        });
    });
    (0, vitest_1.describe)('reportThreat', () => {
        (0, vitest_1.it)('creates a threat report', async () => {
            const report = {
                reporter: 'reporter1',
                tokenAddress: 'token123',
                description: 'Suspicious activity detected',
                severity: 'high',
            };
            const result = await service.reportThreat(report);
            (0, vitest_1.expect)(result.id).toBeDefined();
            (0, vitest_1.expect)(result.status).toBe('pending');
            (0, vitest_1.expect)(result.createdAt).toBeInstanceOf(Date);
        });
    });
});
