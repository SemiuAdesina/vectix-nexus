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
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
          <Users className="w-5 h-5 text-teal-400" />
        </div>
        <h3 className="font-semibold text-white">Multi-Signature Wallet</h3>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-slate-400">
          Require multiple signatures for critical operations
        </p>

        <div className="space-y-2">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize text-white">{proposal.type}</span>
                <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                  proposal.status === 'approved' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' :
                  proposal.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {proposal.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Signatures: {proposal.signatures.length}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCreateProposal}
          disabled={loading}
          className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          Create Proposal
        </button>
      </div>
    </div>
  );
}
