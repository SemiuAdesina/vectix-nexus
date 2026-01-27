'use client';

import { Button } from '@/components/ui/button';
import type { Strategy } from '@/lib/api/marketplace';
import { Check, Sparkles, ShoppingCart, Loader2 } from 'lucide-react';

interface StrategyCardProps {
  strategy: Strategy;
  owned: boolean;
  onSelect: (strategy: Strategy) => void;
  onPurchase: (strategy: Strategy) => void;
  isPurchasing?: boolean;
}

export function StrategyCard({ strategy, owned, onSelect, onPurchase, isPurchasing }: StrategyCardProps) {
  const isFree = strategy.priceUsd === 0;

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPurchasing) return;
    if (owned) {
      onSelect(strategy);
    } else {
      onPurchase(strategy);
    }
  };

  return (
    <div
      onClick={() => !isPurchasing && onSelect(strategy)}
      className={`glass rounded-lg p-5 transition-all cursor-pointer group ${
        owned ? 'border-success/30 bg-success/5' : 'hover:border-primary/30'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl">
            {strategy.icon || '🤖'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold group-hover:text-primary transition-colors">{strategy.name}</h3>
              {strategy.featured && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Featured
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground capitalize">{strategy.category}</p>
          </div>
        </div>
        {owned && (
          <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium flex items-center gap-1">
            <Check className="w-3 h-3" /> Owned
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{strategy.description}</p>

      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">
          {isFree ? (
            <span className="text-success">Free</span>
          ) : (
            <span className="text-primary">${(strategy.priceUsd / 100).toFixed(0)}</span>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleButtonClick}
          disabled={isPurchasing}
          className={
            owned
              ? 'bg-success/20 text-success hover:bg-success/30'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }
        >
          {isPurchasing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : owned ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1" /> Use
            </>
          ) : isFree ? (
            'Get Free'
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Buy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
