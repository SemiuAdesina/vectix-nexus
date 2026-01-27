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
