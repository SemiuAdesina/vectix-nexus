'use client';

import { useState } from 'react';
import { Users, CheckCircle2, Loader2 } from 'lucide-react';
import { createMultiSigProposal } from '@/lib/api/onchain';
import type { MultiSigProposal } from '@/lib/api/onchain/types';

export function MultiSigCard() {
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState<MultiSigProposal[]>([]);

  const handleCreateProposal = async () => {
    setLoading(true);
    try {
      const result = await createMultiSigProposal('multisig_1', {
        type: 'withdrawal',
        amount: 0,
      });
      if (result.success) {
        setProposals([...proposals, result.proposal]);
      }
    } catch (error) {
      console.error('Failed to create proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Multi-Signature Wallet</h3>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Require multiple signatures for critical operations
        </p>

        <div className="space-y-2">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="p-3 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize text-foreground">{proposal.type}</span>
                <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                  proposal.status === 'approved' ? 'bg-primary/10 text-primary border-primary/20' :
                  proposal.status === 'pending' ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20' :
                  'bg-secondary text-muted-foreground border-border'
                }`}>
                  {proposal.status}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Signatures: {proposal.signatures.length}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCreateProposal}
          disabled={loading}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_14px_-4px_hsl(var(--primary)_/_0.4)]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          Create Proposal
        </button>
      </div>
    </div>
  );
}
