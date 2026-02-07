'use client';

import { useEffect, useState } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Filter } from 'lucide-react';
import { getSafeTrending, getAllTrending, SafeToken } from '@/lib/api/security';
import { Button } from '@/components/ui/button';
import { TokenRowDesktop, TokenCardMobile } from './token-row';

export default function TrendingPage() {
  const [tokens, setTokens] = useState<SafeToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [safeOnly, setSafeOnly] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      const data = safeOnly ? await getSafeTrending(70) : await getAllTrending();
      setTokens(data);
      setLoading(false);
    };
    fetchTokens();
  }, [safeOnly]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Verified Trending</h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">Safety-filtered tokens with trust scores</p>
          <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-3" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={safeOnly ? 'default' : 'outline'}
            onClick={() => setSafeOnly(true)}
            size="sm"
            className={`gap-1.5 text-xs sm:text-sm ${safeOnly ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20' : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400 hover:border-teal-500/30'}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Safe Only
          </Button>
          <Button
            variant={!safeOnly ? 'default' : 'outline'}
            onClick={() => setSafeOnly(false)}
            size="sm"
            className={`gap-1.5 text-xs sm:text-sm ${!safeOnly ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20' : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400 hover:border-teal-500/30'}`}
          >
            <Filter className="w-3.5 h-3.5" /> All Tokens
          </Button>
        </div>
      </div>

      {safeOnly && <SafetyBanner />}

      {loading ? (
        <LoadingSkeleton />
      ) : tokens.length === 0 ? (
        <EmptyState />
      ) : (
        <TokenList tokens={tokens} />
      )}
    </div>
  );
}

function SafetyBanner() {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-3 sm:p-4 mb-4 sm:mb-6 flex items-start sm:items-center gap-3">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
      </div>
      <div className="text-xs sm:text-sm">
        <strong className="text-teal-400">Safety Filters Active</strong>
        <p className="text-slate-400 mt-0.5">Liquidity &gt; $50k &middot; Trust Score &gt; 70 &middot; LP Locked &gt; 90%</p>
      </div>
    </div>
  );
}

function TokenList({ tokens }: { tokens: SafeToken[] }) {
  return (
    <>
      <div className="hidden md:block rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
        <div className="grid grid-cols-6 gap-4 px-6 py-3 border-b border-slate-700/80 text-sm font-medium text-slate-400 bg-slate-800/30">
          <span className="col-span-2">Token</span>
          <span>Trust Score</span>
          <span>24h Change</span>
          <span>Volume</span>
          <span />
        </div>
        {tokens.map((token, i) => (
          <TokenRowDesktop key={token.address} token={token} rank={i + 1} />
        ))}
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {tokens.map((token, i) => (
          <TokenCardMobile key={token.address} token={token} rank={i + 1} />
        ))}
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-20 sm:h-16 bg-slate-800/80 rounded-xl animate-pulse border border-slate-700/50" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 p-8 sm:p-12 text-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-teal-500/15 flex items-center justify-center mx-auto mb-4 border border-teal-500/30">
        <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 text-teal-400" />
      </div>
      <p className="text-sm sm:text-base text-slate-400">No tokens match the safety criteria</p>
    </div>
  );
}
