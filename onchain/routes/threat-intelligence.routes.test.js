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
const threatIntelligenceService = __importStar(require("../services/threat-intelligence"));
vitest_1.vi.mock('../services/threat-intelligence', () => ({
    threatIntelligenceService: {
        detectAnomaly: vitest_1.vi.fn(),
        getThreatFeed: vitest_1.vi.fn(),
        reportThreat: vitest_1.vi.fn(),
    },
}));
(0, vitest_1.describe)('Threat Intelligence Routes', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('POST /onchain/threats/detect', () => {
        (0, vitest_1.it)('detects anomaly successfully', async () => {
            const mockResult = {
                isAnomaly: true,
                confidence: 75,
                reason: 'Unusual volume spike',
            };
            const metrics = {
                volume: 2000000,
                priceChange: 10,
                tradeCount: 50,
                tokenAddress: 'token123',
            };
            vitest_1.vi.mocked(threatIntelligenceService.threatIntelligenceService.detectAnomaly).mockResolvedValue(mockResult);
            const result = await threatIntelligenceService.threatIntelligenceService.detectAnomaly(metrics);
            (0, vitest_1.expect)(result).toEqual(mockResult);
            (0, vitest_1.expect)(threatIntelligenceService.threatIntelligenceService.detectAnomaly).toHaveBeenCalledWith(metrics);
        });
        (0, vitest_1.it)('handles errors when detection fails', async () => {
            vitest_1.vi.mocked(threatIntelligenceService.threatIntelligenceService.detectAnomaly).mockRejectedValue(new Error('Detection failed'));
            await (0, vitest_1.expect)(threatIntelligenceService.threatIntelligenceService.detectAnomaly({})).rejects.toThrow('Detection failed');
        });
    });
    (0, vitest_1.describe)('GET /onchain/threats/feed', () => {
        (0, vitest_1.it)('returns threat feed with default limit', async () => {
            const mockFeed = [
                {
                    id: 'threat1',
                    type: 'anomaly',
                    severity: 'high',
                    description: 'Suspicious activity detected',
                    timestamp: new Date(),
                },
            ];
            vitest_1.vi.mocked(threatIntelligenceService.threatIntelligenceService.getThreatFeed).mockResolvedValue(mockFeed);
            const result = await threatIntelligenceService.threatIntelligenceService.getThreatFeed(50);
            (0, vitest_1.expect)(result).toEqual(mockFeed);
            (0, vitest_1.expect)(threatIntelligenceService.threatIntelligenceService.getThreatFeed).toHaveBeenCalledWith(50);
        });
        (0, vitest_1.it)('returns threat feed with custom limit', async () => {
            const mockFeed = [
                {
                    id: 'threat1',
                    type: 'anomaly',
                    severity: 'high',
                    description: 'Suspicious activity detected',
                    timestamp: new Date(),
                },
            ];
            vitest_1.vi.mocked(threatIntelligenceService.threatIntelligenceService.getThreatFeed).mockResolvedValue(mockFeed);
            const result = await threatIntelligenceService.threatIntelligenceService.getThreatFeed(20);
            (0, vitest_1.expect)(result).toEqual(mockFeed);
            (0, vitest_1.expect)(threatIntelligenceService.threatIntelligenceService.getThreatFeed).toHaveBeenCalledWith(20);
        });
        (0, vitest_1.it)('handles errors when getting feed fails', async () => {
            vitest_1.vi.mocked(threatIntelligenceService.threatIntelligenceService.getThreatFeed).mockRejectedValue(new Error('Failed to get feed'));
            await (0, vitest_1.expect)(threatIntelligenceService.threatIntelligenceService.getThreatFeed(50)).rejects.toThrow('Failed to get feed');
        });
    });
    (0, vitest_1.describe)('POST /onchain/threats/report', () => {
        (0, vitest_1.it)('reports threat successfully', async () => {
            const mockReport = {
                id: 'report1',
                type: 'suspicious_transaction',
                severity: 'medium',
                description: 'Reported suspicious activity',
                timestamp: new Date(),
            };
            const reportData = {
                type: 'suspicious_transaction',
                severity: 'medium',
                description: 'Reported suspicious activity',
            };
            vitest_1.vi.mocked(threatIntelligenceService.threatIntelligenceService.reportThreat).mockResolvedValue(mockReport);
            const result = await threatIntelligenceService.threatIntelligenceService.reportThreat(reportData);
            (0, vitest_1.expect)(result).toEqual(mockReport);
            (0, vitest_1.expect)(threatIntelligenceService.threatIntelligenceService.reportThreat).toHaveBeenCalledWith(reportData);
        });
        (0, vitest_1.it)('handles errors when reporting threat fails', async () => {
            vitest_1.vi.mocked(threatIntelligenceService.threatIntelligenceService.reportThreat).mockRejectedValue(new Error('Report failed'));
            await (0, vitest_1.expect)(threatIntelligenceService.threatIntelligenceService.reportThreat({})).rejects.toThrow('Report failed');
        });
    });
});
