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
    <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)] hover:border-teal-500/40 transition-colors">
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-white">{proposal.title}</h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3">{proposal.description}</p>
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-400 flex-wrap">
            <span className="capitalize">{proposal.type.replace('_', ' ')}</span>
            <span>•</span>
            <span>Quorum: {proposal.quorum}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{proposal.createdAt.toLocaleString()}</span>
          </div>
        </div>
        <span className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border font-medium shrink-0 capitalize ${
          proposal.status === 'passed' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' :
          proposal.status === 'active' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
          proposal.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
          'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {proposal.status}
        </span>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-white">{proposal.votesFor}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/30">
            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-white">{proposal.votesAgainst}</span>
        </div>
      </div>

      {proposal.status === 'active' && (
        <div className="flex gap-2">
          {proposal.userVote != null ? (
            <p className="text-xs sm:text-sm text-slate-400 py-1.5 sm:py-2">
              You voted {proposal.userVote === 'for' ? 'For' : 'Against'} this proposal.
            </p>
          ) : (
            <>
              <button
                onClick={() => onVote(proposal.id, true)}
                disabled={voting === proposal.id}
                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/20 hover:border-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 transition-colors font-medium"
              >
                {voting === proposal.id ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
                ) : (
                  <Vote className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                )}
                Vote For
              </button>
              <button
                onClick={() => onVote(proposal.id, false)}
                disabled={voting === proposal.id}
                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 transition-colors font-medium"
              >
                {voting === proposal.id ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
                ) : (
                  <Vote className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
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
