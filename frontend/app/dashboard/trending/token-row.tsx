'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { SafeToken } from '@/lib/api/security';
import { formatVolume, formatPriceChange } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const gradeColors: Record<string, string> = {
  A: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  B: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  C: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  D: 'bg-red-500/10 text-red-400 border border-red-500/20',
  F: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export function TokenRowDesktop({ token, rank }: { token: SafeToken; rank: number }) {
  const isPositive = token.priceChange24h >= 0;

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-slate-700/50 last:border-0 hover:bg-teal-500/5 transition-colors items-center">
      <div className="col-span-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
          <span className="text-xs font-bold text-teal-400">{rank}</span>
        </div>
        <div>
          <p className="font-semibold text-white">${token.symbol}</p>
          <p className="text-xs text-slate-400 truncate max-w-[120px]">{token.name}</p>
        </div>
      </div>
      <div>
        <span className={`px-2 py-1 rounded text-xs font-bold border ${gradeColors[token.trustGrade]}`}>
          {token.trustScore} ({token.trustGrade})
        </span>
      </div>
      <div className={`flex items-center gap-1 ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
        <TrendingUp className={`w-4 h-4 ${!isPositive ? 'rotate-180' : ''}`} />
        <span className="font-medium">{formatPriceChange(token.priceChange24h)}</span>
      </div>
      <div className="text-slate-400">{formatVolume(token.volume24h)}</div>
      <div className="flex justify-end">
        <Link href={`/dashboard/analysis/${token.address}`}>
          <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400">Analyze</Button>
        </Link>
      </div>
    </div>
  );
}

export function TokenCardMobile({ token, rank }: { token: SafeToken; rank: number }) {
  const isPositive = token.priceChange24h >= 0;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
            <span className="text-xs font-bold text-teal-400">{rank}</span>
          </div>
          <div>
            <p className="font-semibold text-white">${token.symbol}</p>
            <p className="text-xs text-slate-400 truncate max-w-[140px]">{token.name}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-bold border ${gradeColors[token.trustGrade]}`}>
          {token.trustScore}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className={`flex items-center gap-1 ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-3 h-3 ${!isPositive ? 'rotate-180' : ''}`} />
            {formatPriceChange(token.priceChange24h)}
          </span>
          <span className="text-slate-400">{formatVolume(token.volume24h)}</span>
        </div>
        <Link href={`/dashboard/analysis/${token.address}`}>
          <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 hover:bg-teal-500/10 hover:text-teal-400">Analyze</Button>
        </Link>
      </div>
    </div>
  );
}
