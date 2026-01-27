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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Verified Trending</h1>
          <p className="text-muted-foreground">Safety-filtered tokens with trust scores</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={safeOnly ? 'default' : 'outline'}
            onClick={() => setSafeOnly(true)}
            className="gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Safe Only
          </Button>
          <Button
            variant={!safeOnly ? 'default' : 'outline'}
            onClick={() => setSafeOnly(false)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" /> All Tokens
          </Button>
        </div>
      </div>

      {safeOnly && (
        <div className="glass rounded-xl p-4 mb-6 flex items-center gap-3 border-primary/30">
          <Shield className="w-5 h-5 text-primary" />
          <p className="text-sm">
            <strong className="text-primary">Safety Filters Active:</strong>{' '}
            Liquidity &gt; $50k, Trust Score &gt; 70, LP Locked &gt; 90%
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
    <div className="glass rounded-xl overflow-hidden">
      <div className="grid grid-cols-6 gap-4 px-6 py-3 border-b border-border text-sm font-medium text-muted-foreground">
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
    A: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
    B: 'bg-primary/10 text-primary',
    C: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
    D: 'bg-destructive/10 text-destructive',
    F: 'bg-destructive/10 text-destructive',
  };

  const isPositive = token.priceChange24h >= 0;

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors items-center">
      <div className="col-span-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{rank}</span>
        </div>
        <div>
          <p className="font-semibold">${token.symbol}</p>
          <p className="text-xs text-muted-foreground">{token.name}</p>
        </div>
      </div>
      <div>
        <span className={`px-2 py-1 rounded text-xs font-bold ${gradeColors[token.trustGrade]}`}>
          {token.trustScore} ({token.trustGrade})
        </span>
      </div>
      <div className={`flex items-center gap-1 ${isPositive ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
        <TrendingUp className={`w-4 h-4 ${!isPositive ? 'rotate-180' : ''}`} />
        <span className="font-medium">{formatPriceChange(token.priceChange24h)}</span>
      </div>
      <div className="text-muted-foreground">{formatVolume(token.volume24h)}</div>
      <div className="flex justify-end">
        <Link href={`/dashboard/analysis/${token.address}`}>
          <Button size="sm" variant="outline">
            Analyze <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-16 bg-secondary rounded animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-xl p-12 text-center">
      <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-muted-foreground">No tokens match the safety criteria</p>
    </div>
  );
}
