'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { SafeToken } from '@/lib/api/security';
import { formatVolume, formatPriceChange } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const gradeColors: Record<string, string> = {
  A: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
  B: 'bg-primary/10 text-primary',
  C: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
  D: 'bg-destructive/10 text-destructive',
  F: 'bg-destructive/10 text-destructive',
};

export function TokenRowDesktop({ token, rank }: { token: SafeToken; rank: number }) {
  const isPositive = token.priceChange24h >= 0;

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors items-center">
      <div className="col-span-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{rank}</span>
        </div>
        <div>
          <p className="font-semibold">${token.symbol}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[120px]">{token.name}</p>
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
          <Button size="sm" variant="outline">Analyze</Button>
        </Link>
      </div>
    </div>
  );
}

export function TokenCardMobile({ token, rank }: { token: SafeToken; rank: number }) {
  const isPositive = token.priceChange24h >= 0;

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{rank}</span>
          </div>
          <div>
            <p className="font-semibold">${token.symbol}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]">{token.name}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-bold ${gradeColors[token.trustGrade]}`}>
          {token.trustScore}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className={`flex items-center gap-1 ${isPositive ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
            <TrendingUp className={`w-3 h-3 ${!isPositive ? 'rotate-180' : ''}`} />
            {formatPriceChange(token.priceChange24h)}
          </span>
          <span className="text-muted-foreground">{formatVolume(token.volume24h)}</span>
        </div>
        <Link href={`/dashboard/analysis/${token.address}`}>
          <Button size="sm" variant="outline">Analyze</Button>
        </Link>
      </div>
    </div>
  );
}
