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
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.12)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)_/_0.2)]">
          <CheckCircle2 className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Verify Proof</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Proof Signature</label>
          <input
            type="text"
            value={proofInput}
            onChange={(e) => setProofInput(e.target.value)}
            placeholder="Enter on-chain proof signature..."
            className="w-full px-4 py-2 bg-secondary/80 border border-border rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={!proofInput.trim() || loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_14px_-4px_hsl(var(--primary)_/_0.4)]"
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
              ? 'bg-primary/10 border-primary/30'
              : 'bg-destructive/10 border-destructive/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {verificationResult.verified ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
              <span className={`font-medium ${verificationResult.verified ? 'text-primary' : 'text-destructive'}`}>
                {verificationResult.verified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Proof: <code className="text-xs bg-background px-1.5 py-0.5 rounded border border-border">{verificationResult.proof}</code></p>
              <p>Timestamp: {new Date(verificationResult.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
