'use client';

import { useState } from 'react';
import { Globe, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { ApiEndpointsCard } from '@/components/public-api/api-endpoints-card';
import { RateLimitsCard } from '@/components/public-api/rate-limits-card';

export default function PublicApiPage() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [result, setResult] = useState<{ success: boolean; trustScore?: number; trustGrade?: string; risks?: unknown[]; passed?: unknown[]; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!tokenAddress.trim()) return;
    
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const res = await fetch(`${apiBase}/api/public/security/score/${tokenAddress}`);
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to check:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Public Security API</h1>
        <p className="text-muted-foreground">
          Free, rate-limited API for token security scores - no authentication required
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Try It Now</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Token Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter Solana token address..."
                className="flex-1 px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleCheck}
                disabled={!tokenAddress.trim() || loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Check
              </button>
            </div>
          </div>

          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'
            }`}>
              {result.success ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="font-medium">Security Score: {result.trustScore}/100</span>
                    <span className="text-sm text-muted-foreground">({result.trustGrade})</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Risks: {result.risks?.length || 0} | Passed: {result.passed?.length || 0}
                  </div>
                </div>
              ) : (
                <p className="text-destructive">{result.error}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ApiEndpointsCard />
        <RateLimitsCard />
      </div>
    </div>
  );
}
