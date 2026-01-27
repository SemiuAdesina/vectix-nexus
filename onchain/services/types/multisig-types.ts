export interface MultiSigConfig {
  agentId: string;
  threshold: number;
  signers: string[];
  timeLock?: number;
}

export interface MultiSigProposal {
  id: string;
  multisigId: string;
  type: 'withdrawal' | 'trade' | 'config_change' | 'emergency_pause';
  amount?: number;
  tokenAddress?: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  signatures: MultiSigSignature[];
  createdAt: Date;
  executedAt?: Date;
}

export interface MultiSigSignature {
  signer: string;
  signature: string;
  timestamp: Date;
}
