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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = safeOnly ? await getSafeTrending(70) : await getAllTrending();
        const tokens = Array.isArray(data) ? data : [];
        setTokens(tokens);
      } catch (err) {
        console.error('Failed to fetch trending tokens:', err);
        setError('Failed to load trending tokens. Please try again later.');
        setTokens([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTokens();
  }, [safeOnly]);

  return (
    <div className="w-full">
      <Header safeOnly={safeOnly} setSafeOnly={setSafeOnly} />
      {safeOnly && <SafetyBanner />}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : tokens.length === 0 ? (
        <EmptyState safeOnly={safeOnly} onSwitchToAll={() => setSafeOnly(false)} />
      ) : (
        <TokenList tokens={tokens} />
      )}
    </div>
  );
}

function Header({ safeOnly, setSafeOnly }: { safeOnly: boolean; setSafeOnly: (v: boolean) => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Verified Trending</h1>
        <p className="text-sm text-muted-foreground">Safety-filtered tokens with trust scores</p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant={safeOnly ? 'default' : 'outline'} onClick={() => setSafeOnly(true)} className="gap-1.5">
          <ShieldCheck className="w-4 h-4" /><span className="hidden sm:inline">Safe Only</span>
        </Button>
        <Button size="sm" variant={!safeOnly ? 'default' : 'outline'} onClick={() => setSafeOnly(false)} className="gap-1.5">
          <Filter className="w-4 h-4" /><span className="hidden sm:inline">All Tokens</span>
        </Button>
      </div>
    </div>
  );
}

function SafetyBanner() {
  return (
    <div className="glass rounded-xl p-3 sm:p-4 mb-6 flex items-start sm:items-center gap-3 border-primary/30">
      <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
      <p className="text-xs sm:text-sm">
        <strong className="text-primary">Safety Filters:</strong> Liquidity &gt; $50k, Trust &gt; 70, LP Locked &gt; 90%
      </p>
    </div>
  );
}

function TokenList({ tokens }: { tokens: SafeToken[] }) {
  return (
    <div className="space-y-3 sm:space-y-0">
      <div className="hidden sm:grid grid-cols-6 gap-4 px-6 py-3 glass rounded-t-xl border-b border-border text-sm font-medium text-muted-foreground">
        <span className="col-span-2">Token</span>
        <span>Trust Score</span>
        <span>24h Change</span>
        <span>Volume</span>
        <span></span>
      </div>
      <div className="hidden sm:block glass rounded-b-xl overflow-hidden">
        {tokens.map((token, i) => <TokenRowDesktop key={token.address} token={token} rank={i + 1} />)}
      </div>
      <div className="sm:hidden space-y-3">
        {tokens.map((token, i) => <TokenCardMobile key={token.address} token={token} rank={i + 1} />)}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="glass rounded-xl h-20 sm:h-16 animate-pulse" />)}
    </div>
  );
}

function EmptyState({ safeOnly, onSwitchToAll }: { safeOnly: boolean; onSwitchToAll?: () => void }) {
  return (
    <div className="glass rounded-xl p-12 text-center">
      <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-muted-foreground mb-2">
        {safeOnly ? 'No tokens match the safety criteria' : 'No trending tokens found'}
      </p>
      {safeOnly && onSwitchToAll && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-3">
            Try switching to &quot;All Tokens&quot; to see more results
          </p>
          <Button size="sm" variant="outline" onClick={onSwitchToAll}>
            <Filter className="w-4 h-4 mr-2" />
            Show All Tokens
          </Button>
        </div>
      )}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="glass rounded-xl p-12 text-center border-destructive/50">
      <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-destructive" />
      <p className="text-destructive font-medium mb-2">Error loading tokens</p>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
