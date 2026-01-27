export interface ThreatIntelligence {
  id: string;
  type: 'anomaly' | 'pattern_match' | 'community_report';
  tokenAddress?: string;
  agentId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ThreatReport {
  id: string;
  reporter: string;
  tokenAddress?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'confirmed' | 'false_positive';
  createdAt: Date;
}
