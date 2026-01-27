export interface TimeLockConfig {
  delay: number;
  cancelWindow: number;
}

export interface TimeLockedTransaction {
  id: string;
  agentId: string;
  type: 'trade' | 'withdrawal' | 'config_change';
  transactionData: Record<string, unknown>;
  executeAt: Date;
  cancelWindow: number;
  status: 'pending' | 'executed' | 'cancelled';
  createdAt: Date;
  executedAt?: Date;
}
