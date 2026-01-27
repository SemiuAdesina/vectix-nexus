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
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle2 className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Verify Proof</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Proof Signature</label>
          <input
            type="text"
            value={proofInput}
            onChange={(e) => setProofInput(e.target.value)}
            placeholder="Enter on-chain proof signature..."
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <button
          onClick={handleVerify}
          disabled={!proofInput.trim() || loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </span>
          ) : (
            'Verify Proof'
          )}
        </button>

        {verificationResult && (
          <div className={`p-4 rounded-lg border ${
            verificationResult.verified 
              ? 'bg-success/10 border-success/20' 
              : 'bg-destructive/10 border-destructive/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {verificationResult.verified ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
              <span className="font-medium">
                {verificationResult.verified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Proof: <code className="text-xs bg-background px-1 rounded">{verificationResult.proof}</code></p>
              <p>Timestamp: {new Date(verificationResult.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
