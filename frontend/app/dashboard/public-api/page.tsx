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
        <h1 className="text-2xl font-bold mb-2 text-white">Public Security API</h1>
        <p className="text-slate-400">
          Free, rate-limited API for token security scores - no authentication required
        </p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-4" />
      </div>

      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.12)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
            <Globe className="w-5 h-5 text-teal-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Try It Now</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Token Address</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter Solana token address..."
                className="flex-1 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
              <button
                onClick={handleCheck}
                disabled={!tokenAddress.trim() || loading}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-teal-500/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Shield className="w-4 h-4 shrink-0" />}
                Check
              </button>
            </div>
          </div>

          {result && (
            <div className={`p-4 rounded-xl border ${
              result.success ? 'bg-teal-500/10 border-teal-500/30' : 'bg-red-500/10 border-red-500/30'
            }`}>
              {result.success ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    </div>
                    <span className="font-medium text-white">Security Score: {result.trustScore}/100</span>
                    <span className="text-sm text-slate-400">({result.trustGrade})</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Risks: {result.risks?.length || 0} | Passed: {result.passed?.length || 0}
                  </div>
                </div>
              ) : (
                <p className="text-red-400">{result.error}</p>
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
