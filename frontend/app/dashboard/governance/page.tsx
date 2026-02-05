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
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">Security Governance</h1>
          <p className="text-muted-foreground">DAO-style voting on security rules and parameters</p>
          <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2 shrink-0 shadow-[0_0_14px_-4px_hsl(var(--primary)_/_0.4)]"
        >
          <Plus className="w-4 h-4 shrink-0" />
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
          <div className="rounded-2xl border border-primary/20 bg-card p-12 text-center shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
            <div className="w-16 h-16 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-[0_0_16px_-6px_hsl(var(--primary)_/_0.2)]">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">No active proposals</p>
          </div>
        )}
      </div>
    </div>
  );
}
