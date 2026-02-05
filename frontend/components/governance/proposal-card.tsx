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
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)] hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2 text-foreground">{proposal.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{proposal.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="capitalize">{proposal.type.replace('_', ' ')}</span>
            <span>•</span>
            <span>Quorum: {proposal.quorum}</span>
            <span>•</span>
            <span>{proposal.createdAt.toLocaleString()}</span>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium shrink-0 ${
          proposal.status === 'passed' ? 'bg-primary/10 text-primary border-primary/20' :
          proposal.status === 'active' ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20' :
          proposal.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
          'bg-secondary text-muted-foreground border-border'
        }`}>
          {proposal.status}
        </span>
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/20">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">{proposal.votesFor}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center border border-destructive/20">
            <XCircle className="w-4 h-4 text-destructive" />
          </div>
          <span className="text-sm font-medium text-foreground">{proposal.votesAgainst}</span>
        </div>
      </div>

      {proposal.status === 'active' && (
        <div className="flex gap-2">
          {proposal.userVote != null ? (
            <p className="text-sm text-muted-foreground py-2">
              You voted {proposal.userVote === 'for' ? 'For' : 'Against'} this proposal.
            </p>
          ) : (
            <>
              <button
                onClick={() => onVote(proposal.id, true)}
                disabled={voting === proposal.id}
                className="flex-1 px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
              >
                {voting === proposal.id ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Vote className="w-4 h-4 shrink-0" />
                )}
                Vote For
              </button>
              <button
                onClick={() => onVote(proposal.id, false)}
                disabled={voting === proposal.id}
                className="flex-1 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
              >
                {voting === proposal.id ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Vote className="w-4 h-4 shrink-0" />
                )}
                Vote Against
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
