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
          <h1 className="text-2xl font-bold mb-2 text-foreground">Verified Trending</h1>
          <p className="text-muted-foreground">Safety-filtered tokens with trust scores</p>
          <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={safeOnly ? 'default' : 'outline'}
            onClick={() => setSafeOnly(true)}
            className="gap-2 shrink-0 shadow-[0_0_14px_-4px_hsl(var(--primary)/0.4)]"
          >
            <ShieldCheck className="w-4 h-4" /> Safe Only
          </Button>
          <Button
            variant={!safeOnly ? 'default' : 'outline'}
            onClick={() => setSafeOnly(false)}
            className={`gap-2 shrink-0 ${!safeOnly ? 'shadow-[0_0_14px_-4px_hsl(var(--primary)/0.4)]' : ''}`}
          >
            <Filter className="w-4 h-4" /> All Tokens
          </Button>
        </div>
      </div>

      {safeOnly && (
        <div className="rounded-2xl border border-primary/20 bg-card p-4 mb-6 flex items-center gap-3 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.08)]">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-foreground">
            <strong className="text-primary">Safety Filters Active:</strong>{' '}
            <span className="text-muted-foreground">Liquidity &gt; $50k, Trust Score &gt; 70, LP Locked &gt; 90%</span>
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
    <div className="rounded-2xl border border-primary/20 bg-card overflow-hidden shadow-[0_0_24px_-8px_hsl(var(--primary)/0.12)]">
      <div className="grid grid-cols-6 gap-4 px-6 py-3 border-b border-border text-sm font-medium text-muted-foreground bg-secondary/30">
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
    A: 'bg-primary/10 text-primary border-primary/20',
    B: 'bg-primary/10 text-primary border-primary/20',
    C: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20',
    D: 'bg-destructive/10 text-destructive border-destructive/20',
    F: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const isPositive = token.priceChange24h >= 0;

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-primary/5 transition-colors items-center">
      <div className="col-span-2 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_8px_-2px_hsl(var(--primary)/0.2)]">
          <span className="text-sm font-bold text-primary">{rank}</span>
        </div>
        <div>
          <p className="font-semibold text-foreground">${token.symbol}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{token.name}</p>
        </div>
      </div>
      <div>
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${gradeColors[token.trustGrade]}`}>
          {token.trustScore} ({token.trustGrade})
        </span>
      </div>
      <div className={`flex items-center gap-1.5 ${isPositive ? 'text-primary' : 'text-destructive'}`}>
        <TrendingUp className={`w-4 h-4 shrink-0 ${!isPositive ? 'rotate-180' : ''}`} />
        <span className="font-medium">{formatPriceChange(token.priceChange24h)}</span>
      </div>
      <div className="text-muted-foreground text-sm">{formatVolume(token.volume24h)}</div>
      <div className="flex justify-end">
        <Link href={`/dashboard/analysis/${token.address}`}>
          <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary">
            Analyze <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 space-y-4 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.08)]">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-16 bg-secondary/80 rounded-xl animate-pulse border border-border/50" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-12 text-center shadow-[0_0_24px_-8px_hsl(var(--primary)/0.08)]">
      <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4 border border-primary/30">
        <ShieldAlert className="w-7 h-7 text-primary" />
      </div>
      <p className="text-muted-foreground">No tokens match the safety criteria</p>
    </div>
  );
}
