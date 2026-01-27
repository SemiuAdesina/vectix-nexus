export interface AuditTrailEntry {
  id: string;
  timestamp: Date;
  previousHash: string | null;
  hash: string;
  onChainProof: string;
  agentId?: string;
  tokenAddress?: string;
  decision: 'approved' | 'rejected' | 'pending';
  reason: string;
  metadata?: Record<string, unknown>;
}

export interface AuditTrailQuery {
  agentId?: string;
  tokenAddress?: string;
  decision?: 'approved' | 'rejected' | 'pending';
  startDate?: Date;
  endDate?: Date;
  offset?: number;
  limit?: number;
}
