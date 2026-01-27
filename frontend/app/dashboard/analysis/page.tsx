'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NarrativeClustersCard } from '@/components/advanced-features';
import Link from 'next/link';

export default function AnalysisPage() {
  const [tokenAddress, setTokenAddress] = useState('');
  const router = useRouter();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenAddress.trim()) {
      router.push(`/dashboard/analysis/${tokenAddress.trim()}`);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Market Analysis</h1>
        <p className="text-sm text-muted-foreground">Analyze token safety with real-time security data</p>
      </div>

      <div className="glass rounded-xl p-4 sm:p-6 mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
          <Shield className="w-5 h-5 text-primary" />
          Token Security Scanner
        </h2>
        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter Solana token address"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="w-full h-11 sm:h-12 pl-11 pr-4 rounded-lg bg-secondary border border-border text-sm"
            />
          </div>
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!tokenAddress.trim()}>
            Analyze Token
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">
          Real-time security report from RugCheck and DexScreener APIs
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <FeatureCard
          icon={<Shield />}
          title="Trust Score"
          description="0-100 safety rating based on 8 security checks"
          href="/dashboard/trending"
        />
        <FeatureCard
          icon={<AlertTriangle />}
          title="Risk Detection"
          description="Honeypot, rug-pull, and scam detection"
          href="/dashboard/trending"
        />
        <FeatureCard
          icon={<TrendingUp />}
          title="Safe Trending"
          description="Pre-filtered tokens that pass safety checks"
          href="/dashboard/trending"
        />
      </div>

      <NarrativeClustersCard />
    </div>
  );
}

function FeatureCard({ icon, title, description, href }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="glass rounded-xl p-5 hover:border-primary/30 transition-all group">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
