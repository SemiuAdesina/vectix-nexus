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
const securityScanningService = __importStar(require("../services/security-scanning"));
vitest_1.vi.mock('../services/security-scanning', () => ({
    securityScanningService: {
        scanToken: vitest_1.vi.fn(),
        getAlerts: vitest_1.vi.fn(),
    },
}));
(0, vitest_1.describe)('Security Scanning Routes', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('POST /onchain/security/scan', () => {
        (0, vitest_1.it)('scans token successfully', async () => {
            const mockResult = {
                tokenAddress: 'token123',
                trustScore: 85,
                trustGrade: 'A',
                risks: [],
                passed: ['liquidity', 'holder_distribution'],
                timestamp: new Date(),
            };
            vitest_1.vi.mocked(securityScanningService.securityScanningService.scanToken).mockResolvedValue(mockResult);
            const result = await securityScanningService.securityScanningService.scanToken('token123');
            (0, vitest_1.expect)(result).toEqual(mockResult);
            (0, vitest_1.expect)(securityScanningService.securityScanningService.scanToken).toHaveBeenCalledWith('token123');
        });
        (0, vitest_1.it)('handles errors when scan fails', async () => {
            vitest_1.vi.mocked(securityScanningService.securityScanningService.scanToken).mockRejectedValue(new Error('Scan failed'));
            await (0, vitest_1.expect)(securityScanningService.securityScanningService.scanToken('invalid-token')).rejects.toThrow('Scan failed');
        });
    });
    (0, vitest_1.describe)('GET /onchain/security/alerts', () => {
        (0, vitest_1.it)('returns alerts without filters', async () => {
            const mockAlerts = [
                {
                    id: 'alert1',
                    tokenAddress: 'token123',
                    severity: 'high',
                    message: 'High risk detected',
                    timestamp: new Date(),
                },
            ];
            vitest_1.vi.mocked(securityScanningService.securityScanningService.getAlerts).mockResolvedValue(mockAlerts);
            const result = await securityScanningService.securityScanningService.getAlerts({});
            (0, vitest_1.expect)(result).toEqual(mockAlerts);
            (0, vitest_1.expect)(securityScanningService.securityScanningService.getAlerts).toHaveBeenCalledWith({});
        });
        (0, vitest_1.it)('returns filtered alerts with query parameters', async () => {
            const mockAlerts = [
                {
                    id: 'alert1',
                    tokenAddress: 'token123',
                    severity: 'high',
                    message: 'High risk detected',
                    timestamp: new Date(),
                },
            ];
            vitest_1.vi.mocked(securityScanningService.securityScanningService.getAlerts).mockResolvedValue(mockAlerts);
            const filters = {
                severity: 'high',
                tokenAddress: 'token123',
                limit: 10,
            };
            const result = await securityScanningService.securityScanningService.getAlerts(filters);
            (0, vitest_1.expect)(result).toEqual(mockAlerts);
            (0, vitest_1.expect)(securityScanningService.securityScanningService.getAlerts).toHaveBeenCalledWith(filters);
        });
        (0, vitest_1.it)('handles errors when getting alerts fails', async () => {
            vitest_1.vi.mocked(securityScanningService.securityScanningService.getAlerts).mockRejectedValue(new Error('Failed to get alerts'));
            await (0, vitest_1.expect)(securityScanningService.securityScanningService.getAlerts({})).rejects.toThrow('Failed to get alerts');
        });
    });
});
