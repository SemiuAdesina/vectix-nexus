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
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-foreground">Market Analysis</h1>
        <p className="text-muted-foreground">Analyze token safety with real-time security data</p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
      </div>

      <div className="rounded-2xl border border-primary/20 bg-card p-6 mb-8 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.12)]">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.25)]">
            <Shield className="w-5 h-5 text-primary" />
          </div>
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
              className="w-full h-12 pl-11 pr-4 rounded-lg bg-secondary/80 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
            />
          </div>
          <Button type="submit" size="lg" disabled={!tokenAddress.trim()} className="shrink-0 shadow-[0_0_14px_-4px_hsl(var(--primary)/0.4)]">
            Analyze Token
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">
          Real-time security report from RugCheck and DexScreener APIs
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <FeatureCard
          icon={<Shield className="w-5 h-5 text-primary" />}
          title="Trust Score"
          description="0-100 safety rating based on 8 security checks"
          href="/dashboard/trending"
        />
        <FeatureCard
          icon={<AlertTriangle className="w-5 h-5 text-primary" />}
          title="Risk Detection"
          description="Honeypot, rug-pull, and scam detection"
          href="/dashboard/trending"
        />
        <FeatureCard
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
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
    <Link
      href={href}
      className="rounded-xl p-5 border border-primary/20 bg-card hover:border-primary/40 hover:shadow-[0_0_20px_-8px_hsl(var(--primary)/0.2)] transition-all duration-200 group block"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 mb-3 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.2)] group-hover:shadow-[0_0_16px_-6px_hsl(var(--primary)/0.3)] transition-shadow">
        {icon}
      </div>
      <h3 className="font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
