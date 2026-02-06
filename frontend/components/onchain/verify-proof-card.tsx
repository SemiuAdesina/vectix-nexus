'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyOnChainProof } from '@/lib/api/onchain';
import type { VerificationResult } from '@/lib/api/onchain';

export function VerifyProofCard() {
  const [proofInput, setProofInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!proofInput.trim()) return;

    setLoading(true);
    try {
      const result = await verifyOnChainProof(proofInput);
      setVerificationResult(result);
    } catch (error) {
      console.error('Failed to verify proof:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.12)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
          <CheckCircle2 className="w-5 h-5 text-teal-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Verify Proof</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Proof Signature</label>
          <input
            type="text"
            value={proofInput}
            onChange={(e) => setProofInput(e.target.value)}
            placeholder="Enter on-chain proof signature..."
            className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={!proofInput.trim() || loading}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-teal-500/20"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              Verifying...
            </span>
          ) : (
            'Verify Proof'
          )}
        </button>

        {verificationResult && (
          <div className={`p-4 rounded-xl border ${
            verificationResult.verified
              ? 'bg-teal-500/10 border-teal-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {verificationResult.verified ? (
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={`font-medium ${verificationResult.verified ? 'text-teal-400' : 'text-red-400'}`}>
                {verificationResult.verified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <div className="text-sm text-slate-400 space-y-1">
              <p>Proof: <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{verificationResult.proof}</code></p>
              <p>Timestamp: {new Date(verificationResult.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
