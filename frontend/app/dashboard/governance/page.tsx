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
      const data = await getGovernanceProposals();
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
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Security Governance</h1>
          <p className="text-muted-foreground">DAO-style voting on security rules and parameters</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Proposal
        </button>
      </div>

      {showCreate && (
        <ProposalForm
          onSuccess={handleProposalCreated}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div className="space-y-4">
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            voting={voting}
            onVote={handleVote}
          />
        ))}

        {proposals.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active proposals</p>
          </div>
        )}
      </div>
    </div>
  );
}
