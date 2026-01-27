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
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Multi-Signature Wallet</h3>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <p>Require multiple signatures for critical operations</p>
        </div>

        <div className="space-y-2">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{proposal.type}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  proposal.status === 'approved' ? 'bg-success/10 text-success' :
                  proposal.status === 'pending' ? 'bg-warning/10 text-warning' :
                  'bg-secondary text-muted-foreground'
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
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Create Proposal
        </button>
      </div>
    </div>
  );
}
