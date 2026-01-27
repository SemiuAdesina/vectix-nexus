"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityScanningService = exports.SecurityScanningService = void 0;
const token_security_1 = require("../../backend/services/security/token-security");
const SCAN_CACHE = new Map();
const ALERTS = [];
class SecurityScanningService {
    constructor() {
        this.scanInterval = null;
        this.SCAN_INTERVAL = 5 * 60 * 1000;
    }
    startContinuousScanning() {
        if (this.scanInterval)
            return;
        this.scanInterval = setInterval(async () => {
            await this.scanActiveTokens();
        }, this.SCAN_INTERVAL);
    }
    stopContinuousScanning() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
    }
    async scanToken(tokenAddress) {
        const cached = SCAN_CACHE.get(tokenAddress);
        if (cached && Date.now() - cached.timestamp.getTime() < this.SCAN_INTERVAL) {
            return cached.result;
        }
        const analysis = await (0, token_security_1.analyzeToken)(tokenAddress);
        if (!analysis) {
            throw new Error('Failed to analyze token');
        }
        const result = {
            tokenAddress,
            trustScore: analysis.trustScore.score,
            trustGrade: analysis.trustScore.grade,
            risks: analysis.trustScore.risks,
            passed: analysis.trustScore.passed,
            timestamp: new Date(),
            previousScore: cached?.result.trustScore,
            scoreChange: cached ? analysis.trustScore.score - cached.result.trustScore : 0,
        };
        SCAN_CACHE.set(tokenAddress, { result, timestamp: new Date() });
        if (cached && Math.abs(result.scoreChange) > 10) {
            await this.createAlert({
                type: 'score_change',
                tokenAddress,
                severity: Math.abs(result.scoreChange) > 20 ? 'high' : 'medium',
                message: `Trust score changed by ${result.scoreChange > 0 ? '+' : ''}${result.scoreChange.toFixed(1)} points`,
                timestamp: new Date(),
            });
        }
        return result;
    }
    async scanActiveTokens() {
        const activeTokens = Array.from(SCAN_CACHE.keys());
        const results = await Promise.allSettled(activeTokens.map(addr => this.scanToken(addr)));
        return results
            .filter((r) => r.status === 'fulfilled')
            .map(r => r.value);
    }
    async getTokenHistory(tokenAddress, limit = 30) {
        const cached = SCAN_CACHE.get(tokenAddress);
        if (!cached)
            return [];
        return [cached.result];
    }
    async createAlert(alert) {
        const id = `alert_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const fullAlert = { id, ...alert };
        ALERTS.push(fullAlert);
        if (ALERTS.length > 1000) {
            ALERTS.splice(0, 500);
        }
        return fullAlert;
    }
    async getAlerts(filters) {
        let filtered = [...ALERTS];
        if (filters?.severity) {
            filtered = filtered.filter(a => a.severity === filters.severity);
        }
        if (filters?.tokenAddress) {
            filtered = filtered.filter(a => a.tokenAddress === filters.tokenAddress);
        }
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return filtered.slice(0, filters?.limit || 50);
    }
}
exports.SecurityScanningService = SecurityScanningService;
exports.securityScanningService = new SecurityScanningService();
