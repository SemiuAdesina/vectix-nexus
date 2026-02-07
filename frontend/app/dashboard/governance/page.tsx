'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getGovernanceProposals, voteOnProposal } from '@/lib/api/onchain';
import type { GovernanceProposal } from '@/lib/api/onchain/types';
import { ProposalForm } from '@/components/governance/proposal-form';
import { ProposalCard } from '@/components/governance/proposal-card';
import { getVoterId } from '@/lib/governance/voter-id';

export default function GovernancePage() {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const voterId = typeof window !== 'undefined' ? getVoterId() : undefined;
      const data = await getGovernanceProposals(voterId);
      if (data.success) {
        setProposals(data.proposals.map(p => ({ ...p, createdAt: new Date(p.createdAt) })));
      }
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: string, support: boolean) => {
    if (voting === proposalId) return;

    setVoting(proposalId);
    try {
      const result = await voteOnProposal(proposalId, {
        voter: getVoterId(),
        support,
        weight: 1
      });

      if (result.success) {
        toast.success('Vote submitted successfully!');
        await fetchProposals();
      } else {
        toast.error(result.error || 'Failed to vote. You may have already voted on this proposal.');
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit vote. Please try again.';
      toast.error(errorMessage);
    } finally {
      setVoting(null);
    }
  };

  const handleProposalCreated = async () => {
    setShowCreate(false);
    await fetchProposals();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white">Security Governance</h1>
          <p className="text-sm sm:text-base text-slate-400">DAO-style voting on security rules and parameters</p>
          <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-3 sm:mt-4" />
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg flex items-center gap-1.5 sm:gap-2 shrink-0 shadow-lg shadow-teal-500/20 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          New Proposal
        </button>
      </div>

      {showCreate && (
        <ProposalForm
          onSuccess={handleProposalCreated}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div className="space-y-3 sm:space-y-4">
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            voting={voting}
            onVote={handleVote}
          />
        ))}

        {proposals.length === 0 && (
          <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-8 sm:p-12 text-center shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-teal-500/30">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" />
            </div>
            <p className="text-sm sm:text-base text-slate-400">No active proposals</p>
          </div>
        )}
      </div>
    </div>
  );
}
