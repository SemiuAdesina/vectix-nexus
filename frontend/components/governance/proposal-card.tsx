'use client';

import { CheckCircle2, XCircle, Vote, Loader2 } from 'lucide-react';
import type { GovernanceProposal } from '@/lib/api/onchain/types';

interface ProposalCardProps {
  proposal: GovernanceProposal;
  voting: string | null;
  onVote: (proposalId: string, support: boolean) => void;
}

export function ProposalCard({ proposal, voting, onVote }: ProposalCardProps) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{proposal.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="capitalize">{proposal.type.replace('_', ' ')}</span>
            <span>•</span>
            <span>Quorum: {proposal.quorum}</span>
            <span>•</span>
            <span>{proposal.createdAt.toLocaleString()}</span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          proposal.status === 'passed' ? 'bg-success/10 text-success' :
          proposal.status === 'active' ? 'bg-warning/10 text-warning' :
          proposal.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
          'bg-secondary text-muted-foreground'
        }`}>
          {proposal.status}
        </span>
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-sm font-medium">{proposal.votesFor}</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium">{proposal.votesAgainst}</span>
        </div>
      </div>

      {proposal.status === 'active' && (
        <div className="flex gap-2">
          <button
            onClick={() => onVote(proposal.id, true)}
            disabled={voting === proposal.id}
            className="flex-1 px-4 py-2 bg-success/10 text-success rounded-lg hover:bg-success/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {voting === proposal.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Vote className="w-4 h-4" />
            )}
            Vote For
          </button>
          <button
            onClick={() => onVote(proposal.id, false)}
            disabled={voting === proposal.id}
            className="flex-1 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {voting === proposal.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Vote className="w-4 h-4" />
            )}
            Vote Against
          </button>
        </div>
      )}
    </div>
  );
}
