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
