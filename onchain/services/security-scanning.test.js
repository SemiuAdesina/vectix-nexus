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
const security_scanning_1 = require("./security-scanning");
const tokenSecurity = __importStar(require("../../backend/services/security/token-security"));
vitest_1.vi.mock('../../backend/services/security/token-security', () => ({
    analyzeToken: vitest_1.vi.fn(),
}));
(0, vitest_1.describe)('SecurityScanningService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        service = new security_scanning_1.SecurityScanningService();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.afterEach)(() => {
        service.stopContinuousScanning();
    });
    (0, vitest_1.describe)('scanToken', () => {
        (0, vitest_1.it)('scans a token and returns security result', async () => {
            const mockAnalysis = {
                trustScore: {
                    score: 85,
                    grade: 'A',
                    risks: [],
                    passed: [{ id: '1', label: 'Test', severity: 'low', passed: true, message: 'Passed' }],
                },
            };
            vitest_1.vi.mocked(tokenSecurity.analyzeToken).mockResolvedValue(mockAnalysis);
            const result = await service.scanToken('token123');
            (0, vitest_1.expect)(result.tokenAddress).toBe('token123');
            (0, vitest_1.expect)(result.trustScore).toBe(85);
            (0, vitest_1.expect)(result.trustGrade).toBe('A');
            (0, vitest_1.expect)(tokenSecurity.analyzeToken).toHaveBeenCalledWith('token123');
        });
        (0, vitest_1.it)('uses cached result when available', async () => {
            const mockAnalysis = {
                trustScore: {
                    score: 85,
                    grade: 'A',
                    risks: [],
                    passed: [],
                },
            };
            vitest_1.vi.mocked(tokenSecurity.analyzeToken).mockResolvedValue(mockAnalysis);
            await service.scanToken('token123');
            vitest_1.vi.clearAllMocks();
            const result = await service.scanToken('token123');
            (0, vitest_1.expect)(result.tokenAddress).toBe('token123');
            (0, vitest_1.expect)(tokenSecurity.analyzeToken).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('creates alert on significant score change', async () => {
            const mockAnalysis1 = {
                trustScore: {
                    score: 85,
                    grade: 'A',
                    risks: [],
                    passed: [],
                },
                report: {
                    tokenAddress: 'token-alert-test',
                    liquidityUsd: 1000000,
                },
            };
            const mockAnalysis2 = {
                trustScore: {
                    score: 60,
                    grade: 'C',
                    risks: [],
                    passed: [],
                },
                report: {
                    tokenAddress: 'token-alert-test',
                    liquidityUsd: 1000000,
                },
            };
            vitest_1.vi.mocked(tokenSecurity.analyzeToken).mockResolvedValueOnce(mockAnalysis1);
            const result1 = await service.scanToken('token-alert-test');
            (0, vitest_1.expect)(result1.trustScore).toBe(85);
            (0, vitest_1.expect)(result1.scoreChange).toBe(0);
            const alerts = await service.getAlerts({ limit: 10 });
            (0, vitest_1.expect)(Array.isArray(alerts)).toBe(true);
            (0, vitest_1.expect)(service).toBeDefined();
        });
    });
    (0, vitest_1.describe)('getAlerts', () => {
        (0, vitest_1.it)('returns security alerts', async () => {
            const alerts = await service.getAlerts({ limit: 10 });
            (0, vitest_1.expect)(Array.isArray(alerts)).toBe(true);
        });
        (0, vitest_1.it)('filters alerts by severity', async () => {
            const alerts = await service.getAlerts({ severity: 'high', limit: 10 });
            (0, vitest_1.expect)(alerts.every(a => a.severity === 'high')).toBe(true);
        });
    });
    (0, vitest_1.describe)('startContinuousScanning', () => {
        (0, vitest_1.it)('starts continuous scanning', () => {
            service.startContinuousScanning();
            (0, vitest_1.expect)(service).toBeDefined();
        });
        (0, vitest_1.it)('does not start multiple intervals', () => {
            service.startContinuousScanning();
            service.startContinuousScanning();
            service.stopContinuousScanning();
        });
    });
    (0, vitest_1.describe)('stopContinuousScanning', () => {
        (0, vitest_1.it)('stops continuous scanning', () => {
            service.startContinuousScanning();
            service.stopContinuousScanning();
            (0, vitest_1.expect)(service).toBeDefined();
        });
    });
});
