export interface SecurityCertificate {
  tokenAddress: string;
  agentId: string;
  trustScore: number;
  trustGrade: string;
  verifiedAt: string;
  onChainProof: string;
  securityChecks: SecurityCheck[];
}

export interface SecurityCheck {
  id: string;
  label: string;
  passed: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
}

export interface OnChainLog {
  id: string;
  type: 'security_decision' | 'trade_approval' | 'rule_violation' | 'audit_event';
  agentId?: string;
  tokenAddress?: string;
  decision: 'approved' | 'rejected' | 'pending';
  reason: string;
  timestamp: string;
  onChainProof: string;
  metadata?: Record<string, unknown>;
}

export interface VerificationResult {
  verified: boolean;
  proof: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface SecurityScanResult {
  tokenAddress: string;
  trustScore: number;
  trustGrade: string;
  risks: Array<{ id: string; label: string; severity: string; passed: boolean; message: string }>;
  passed: Array<{ id: string; label: string; severity: string; passed: boolean; message: string }>;
  timestamp: Date;
  previousScore?: number;
  scoreChange: number;
}

export interface SecurityAlert {
  id: string;
  type: 'score_change' | 'new_risk' | 'blacklist_update' | 'anomaly_detected';
  tokenAddress?: string;
  agentId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
