import type { ThreatIntelligence, ThreatPattern, ThreatReport } from './onchain-types';

const THREAT_DB: Map<string, ThreatIntelligence> = new Map();
const PATTERNS: ThreatPattern[] = [];
const REPORTS: ThreatReport[] = [];

export class ThreatIntelligenceService {
  async detectAnomaly(metrics: {
    volume?: number;
    priceChange?: number;
    tradeCount?: number;
    tokenAddress?: string;
  }): Promise<{ isAnomaly: boolean; confidence: number; reason: string }> {
    let anomalyScore = 0;
    const reasons: string[] = [];

    if (metrics.volume && metrics.volume > 1000000) {
      anomalyScore += 30;
      reasons.push('Unusual volume spike');
    }

    if (metrics.priceChange && Math.abs(metrics.priceChange) > 50) {
      anomalyScore += 40;
      reasons.push('Extreme price movement');
    }

    if (metrics.tradeCount && metrics.tradeCount > 100) {
      anomalyScore += 20;
      reasons.push('High trade frequency');
    }

    const matchingPatterns = PATTERNS.filter(p => {
      if (p.volumeThreshold && metrics.volume && metrics.volume > p.volumeThreshold) return true;
      if (p.priceChangeThreshold && metrics.priceChange && Math.abs(metrics.priceChange) > p.priceChangeThreshold) return true;
      return false;
    });

    if (matchingPatterns.length > 0) {
      anomalyScore += 30;
      reasons.push(`Matches ${matchingPatterns.length} known threat pattern(s)`);
    }

    const isAnomaly = anomalyScore >= 50;
    const confidence = Math.min(anomalyScore, 100);

    return {
      isAnomaly,
      confidence,
      reason: reasons.join('; ') || 'No anomalies detected',
    };
  }

  async addThreatPattern(pattern: Omit<ThreatPattern, 'id' | 'createdAt'>): Promise<ThreatPattern> {
    const id = `pattern_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const threatPattern: ThreatPattern = {
      id,
      ...pattern,
      createdAt: new Date(),
    };

    PATTERNS.push(threatPattern);
    return threatPattern;
  }

  async reportThreat(report: Omit<ThreatReport, 'id' | 'status' | 'createdAt'>): Promise<ThreatReport> {
    const id = `report_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const threatReport: ThreatReport = {
      id,
      ...report,
      status: 'pending',
      createdAt: new Date(),
    };

    REPORTS.push(threatReport);

    if (REPORTS.length > 1000) {
      REPORTS.splice(0, 500);
    }

    // Convert report to ThreatIntelligence and add to feed
    const threatIntelligence: ThreatIntelligence = {
      id: threatReport.id,
      type: 'community_report',
      tokenAddress: threatReport.tokenAddress,
      severity: threatReport.severity,
      description: threatReport.description,
      confidence: this.getConfidenceFromSeverity(threatReport.severity),
      timestamp: threatReport.createdAt,
      metadata: {
        reporter: threatReport.reporter,
        status: threatReport.status,
      },
    };

    THREAT_DB.set(threatIntelligence.id, threatIntelligence);

    
    if (THREAT_DB.size > 1000) {
      const entries = Array.from(THREAT_DB.entries())
        .sort((a, b) => b[1].timestamp.getTime() - a[1].timestamp.getTime());
      const toKeep = entries.slice(0, 500);
      THREAT_DB.clear();
      toKeep.forEach(([id, threat]) => THREAT_DB.set(id, threat));
    }

    return threatReport;
  }

  private getConfidenceFromSeverity(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    switch (severity) {
      case 'critical':
        return 95;
      case 'high':
        return 80;
      case 'medium':
        return 60;
      case 'low':
        return 40;
      default:
        return 50;
    }
  }

  async getThreatFeed(limit = 50): Promise<ThreatIntelligence[]> {
    return Array.from(THREAT_DB.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getThreatPatterns(): Promise<ThreatPattern[]> {
    return [...PATTERNS];
  }
}

export const threatIntelligenceService = new ThreatIntelligenceService();
