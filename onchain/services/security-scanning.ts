import { analyzeToken } from '../../backend/services/security/token-security';
import type { SecurityScanResult, SecurityAlert } from './onchain-types';

const SCAN_CACHE: Map<string, { result: SecurityScanResult; timestamp: Date }> = new Map();
const ALERTS: SecurityAlert[] = [];

export class SecurityScanningService {
  private scanInterval: NodeJS.Timeout | null = null;
  private readonly SCAN_INTERVAL = 5 * 60 * 1000;

  startContinuousScanning(): void {
    if (this.scanInterval) return;

    this.scanInterval = setInterval(async () => {
      await this.scanActiveTokens();
    }, this.SCAN_INTERVAL);
  }

  stopContinuousScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  async scanToken(tokenAddress: string): Promise<SecurityScanResult> {
    const cached = SCAN_CACHE.get(tokenAddress);
    if (cached && Date.now() - cached.timestamp.getTime() < this.SCAN_INTERVAL) {
      return cached.result;
    }

    const analysis = await analyzeToken(tokenAddress);
    if (!analysis) {
      throw new Error('Failed to analyze token');
    }

    const result: SecurityScanResult = {
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

  async scanActiveTokens(): Promise<SecurityScanResult[]> {
    const activeTokens = Array.from(SCAN_CACHE.keys());
    const results = await Promise.allSettled(
      activeTokens.map(addr => this.scanToken(addr))
    );

    return results
      .filter((r): r is PromiseFulfilledResult<SecurityScanResult> => r.status === 'fulfilled')
      .map(r => r.value);
  }

  async getTokenHistory(tokenAddress: string, limit = 30): Promise<SecurityScanResult[]> {
    const cached = SCAN_CACHE.get(tokenAddress);
    if (!cached) return [];

    return [cached.result];
  }

  async createAlert(alert: Omit<SecurityAlert, 'id'>): Promise<SecurityAlert> {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const fullAlert: SecurityAlert = { id, ...alert };
    ALERTS.push(fullAlert);

    if (ALERTS.length > 1000) {
      ALERTS.splice(0, 500);
    }

    return fullAlert;
  }

  async getAlerts(filters?: { severity?: string; tokenAddress?: string; limit?: number }): Promise<SecurityAlert[]> {
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

export const securityScanningService = new SecurityScanningService();
