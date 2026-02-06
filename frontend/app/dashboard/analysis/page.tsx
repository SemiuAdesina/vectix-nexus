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
        <h1 className="text-2xl font-bold mb-2 text-white">Market Analysis</h1>
        <p className="text-slate-400">Analyze token safety with real-time security data</p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-4" />
      </div>

      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 mb-8">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-white">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
            <Shield className="w-5 h-5 text-teal-400" />
          </div>
          Token Security Scanner
        </h2>
        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Enter Solana token address"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={!tokenAddress.trim()}
            className="shrink-0 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20 disabled:opacity-50"
          >
            Analyze Token
          </Button>
        </form>
        <p className="text-xs text-slate-400 mt-3">
          Real-time security report from RugCheck and DexScreener APIs
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <FeatureCard
          icon={<Shield className="w-5 h-5 text-teal-400" />}
          title="Trust Score"
          description="0-100 safety rating based on 8 security checks"
          href="/dashboard/trending"
        />
        <FeatureCard
          icon={<AlertTriangle className="w-5 h-5 text-teal-400" />}
          title="Risk Detection"
          description="Honeypot, rug-pull, and scam detection"
          href="/dashboard/trending"
        />
        <FeatureCard
          icon={<TrendingUp className="w-5 h-5 text-teal-400" />}
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
      className="rounded-xl p-5 border border-slate-700/50 bg-slate-900/50 hover:border-teal-500/40 hover:shadow-[0_0_20px_-8px_rgba(20,184,166,0.15)] transition-all duration-200 group block"
    >
      <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 mb-3 group-hover:shadow-[0_0_16px_-6px_rgba(20,184,166,0.25)] transition-shadow">
        {icon}
      </div>
      <h3 className="font-semibold mb-1 text-white group-hover:text-teal-400 transition-colors">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </Link>
  );
}
