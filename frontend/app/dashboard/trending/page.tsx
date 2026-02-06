'use client';

import { useEffect, useState } from 'react';
import { Shield, ShieldCheck, ShieldAlert, TrendingUp, ExternalLink, Filter } from 'lucide-react';
import { getSafeTrending, getAllTrending, SafeToken } from '@/lib/api/security';
import { formatVolume, formatPriceChange } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-white">Verified Trending</h1>
          <p className="text-slate-400">Safety-filtered tokens with trust scores</p>
          <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-4" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={safeOnly ? 'default' : 'outline'}
            onClick={() => setSafeOnly(true)}
            className={`gap-2 shrink-0 ${safeOnly ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20' : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400 hover:border-teal-500/30'}`}
          >
            <ShieldCheck className="w-4 h-4" /> Safe Only
          </Button>
          <Button
            variant={!safeOnly ? 'default' : 'outline'}
            onClick={() => setSafeOnly(false)}
            className={`gap-2 shrink-0 ${!safeOnly ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20' : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400 hover:border-teal-500/30'}`}
          >
            <Filter className="w-4 h-4" /> All Tokens
          </Button>
        </div>
      </div>

      {safeOnly && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
            <Shield className="w-5 h-5 text-teal-400" />
          </div>
          <p className="text-sm text-white">
            <strong className="text-teal-400">Safety Filters Active:</strong>{' '}
            <span className="text-slate-400">Liquidity &gt; $50k, Trust Score &gt; 70, LP Locked &gt; 90%</span>
          </p>
        </div>
      )}

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

function TokenList({ tokens }: { tokens: SafeToken[] }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
      <div className="grid grid-cols-6 gap-4 px-6 py-3 border-b border-slate-700/80 text-sm font-medium text-slate-400 bg-slate-800/30">
        <span className="col-span-2">Token</span>
        <span>Trust Score</span>
        <span>24h Change</span>
        <span>Volume</span>
        <span></span>
      </div>
      {tokens.map((token, i) => (
        <TokenRow key={token.address} token={token} rank={i + 1} />
      ))}
    </div>
  );
}

function TokenRow({ token, rank }: { token: SafeToken; rank: number }) {
  const gradeColors: Record<string, string> = {
    A: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    B: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    C: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    D: 'bg-red-500/10 text-red-400 border-red-500/20',
    F: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const isPositive = token.priceChange24h >= 0;

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-slate-700/50 last:border-0 hover:bg-teal-500/5 transition-colors items-center">
      <div className="col-span-2 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
          <span className="text-sm font-bold text-teal-400">{rank}</span>
        </div>
        <div>
          <p className="font-semibold text-white">${token.symbol}</p>
          <p className="text-xs text-slate-400 truncate max-w-[140px]">{token.name}</p>
        </div>
      </div>
      <div>
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${gradeColors[token.trustGrade]}`}>
          {token.trustScore} ({token.trustGrade})
        </span>
      </div>
      <div className={`flex items-center gap-1.5 ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
        <TrendingUp className={`w-4 h-4 shrink-0 ${!isPositive ? 'rotate-180' : ''}`} />
        <span className="font-medium">{formatPriceChange(token.priceChange24h)}</span>
      </div>
      <div className="text-slate-400 text-sm">{formatVolume(token.volume24h)}</div>
      <div className="flex justify-end">
        <Link href={`/dashboard/analysis/${token.address}`}>
          <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400">
            Analyze <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-16 bg-slate-800/80 rounded-xl animate-pulse border border-slate-700/50" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-12 text-center">
      <div className="w-14 h-14 rounded-xl bg-teal-500/15 flex items-center justify-center mx-auto mb-4 border border-teal-500/30">
        <ShieldAlert className="w-7 h-7 text-teal-400" />
      </div>
      <p className="text-slate-400">No tokens match the safety criteria</p>
    </div>
  );
}
