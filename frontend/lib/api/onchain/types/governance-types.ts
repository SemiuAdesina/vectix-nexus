export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  type: 'security_rule' | 'parameter_update' | 'emergency_pause' | 'other';
  targetRule?: string;
  proposedValue?: string;
  quorum: number;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  createdAt: Date;
  executedAt?: Date;
  userVote?: 'for' | 'against' | null;
}

export interface GovernanceVote {
  id: string;
  proposalId: string;
  voter: string;
  support: boolean;
  weight: number;
  timestamp: Date;
}
