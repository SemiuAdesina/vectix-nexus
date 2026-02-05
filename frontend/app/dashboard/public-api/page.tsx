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
    setResult(null);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const url = apiBase ? `${apiBase}/api/public/security/score/${encodeURIComponent(tokenAddress.trim())}` : `/api/public/security/score/${encodeURIComponent(tokenAddress.trim())}`;
      const res = await fetch(url);
      const text = await res.text();
      if (text.trimStart().startsWith('<')) {
        setResult({ success: false, error: 'API not available. Ensure the backend is running and Public Security API is enabled.' });
        return;
      }
      const data = JSON.parse(text) as { success: boolean; trustScore?: number; trustGrade?: string; risks?: unknown[]; passed?: unknown[]; error?: string };
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error instanceof Error ? error.message : 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-foreground">Public Security API</h1>
        <p className="text-muted-foreground">
          Free, rate-limited API for token security scores - no authentication required
        </p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
      </div>

      <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.12)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)_/_0.2)]">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Try It Now</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Token Address</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter Solana token address..."
                className="flex-1 px-4 py-2 bg-secondary/80 border border-border rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                onClick={handleCheck}
                disabled={!tokenAddress.trim() || loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-[0_0_14px_-4px_hsl(var(--primary)_/_0.4)]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Shield className="w-4 h-4 shrink-0" />}
                Check
              </button>
            </div>
          </div>

          {result && (
            <div className={`p-4 rounded-xl border ${
              result.success ? 'bg-primary/10 border-primary/30' : 'bg-destructive/10 border-destructive/30'
            }`}>
              {result.success ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/20">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">Security Score: {result.trustScore}/100</span>
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
