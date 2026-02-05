'use client';

import { Button } from '@/components/ui/button';
import type { Strategy } from '@/lib/api/marketplace';
import {
  Check, Sparkles, ShoppingCart, Loader2, Rocket, Shield, Fish, MessageSquare, Gem, TrendingUp, LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  '🚀': Rocket, '🛡️': Shield, '🐋': Fish, '📈': TrendingUp, '💬': MessageSquare, '💎': Gem,
};
const NAME_ICON_MAP: Record<string, LucideIcon> = {
  'meme': Rocket, 'sniper': Rocket, 'yield': Shield, 'farmer': Shield, 'whale': Fish,
  'copy': TrendingUp, 'trader': TrendingUp, 'sentiment': MessageSquare, 'social': MessageSquare,
  'hodl': Gem, 'diamond': Gem,
};

export function getStrategyIcon(strategy: Strategy): LucideIcon {
  const byEmoji = strategy.icon && ICON_MAP[strategy.icon];
  if (byEmoji) return byEmoji;
  const name = strategy.name.toLowerCase();
  for (const [key, Icon] of Object.entries(NAME_ICON_MAP)) {
    if (name.includes(key)) return Icon;
  }
  return strategy.category === 'defi' ? Shield : strategy.category === 'social' ? MessageSquare : TrendingUp;
}

interface StrategyCardProps {
  strategy: Strategy;
  owned: boolean;
  onSelect: (strategy: Strategy) => void;
  onPurchase: (strategy: Strategy) => void;
  isPurchasing?: boolean;
}

export function StrategyCard({ strategy, owned, onSelect, onPurchase, isPurchasing }: StrategyCardProps) {
  const isFree = strategy.priceUsd === 0;
  const IconComponent = getStrategyIcon(strategy);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPurchasing) return;
    if (owned) onSelect(strategy);
    else onPurchase(strategy);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !isPurchasing && onSelect(strategy)}
      onKeyDown={(e) => e.key === 'Enter' && !isPurchasing && onSelect(strategy)}
      className={`rounded-xl p-4 border bg-card transition-all duration-200 cursor-pointer group text-left ${
        owned
          ? 'border-success/30 hover:border-success/50'
          : 'border-border hover:border-primary/40 hover:bg-card/95'
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 shrink-0 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.25)]">
          <IconComponent className="w-5 h-5 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap gap-y-1">
            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {strategy.name}
            </h3>
            {strategy.featured && (
              <span className="shrink-0 px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-medium flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Featured
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{strategy.category}</p>
        </div>
        {owned && (
          <span className="shrink-0 px-1.5 py-0.5 rounded bg-success/15 text-success text-[10px] font-medium flex items-center gap-0.5">
            <Check className="w-2.5 h-2.5" /> Owned
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{strategy.description}</p>

      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-bold">
          {isFree ? (
            <span className="text-success">Free</span>
          ) : (
            <span className="text-primary">${(strategy.priceUsd / 100).toFixed(0)}</span>
          )}
        </span>
        <Button
          size="sm"
          variant={owned ? 'outline' : 'default'}
          onClick={handleButtonClick}
          disabled={isPurchasing}
          className={
            owned
              ? 'shrink-0 border-success/50 text-success bg-success/10 hover:bg-success/20'
              : 'shrink-0 shadow-[0_0_14px_-4px_hsl(var(--primary)/0.5)] ring-2 ring-primary/20'
          }
        >
          {isPurchasing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : owned ? (
            <><Check className="w-3 h-3 mr-1" /> Use</>
          ) : isFree ? (
            'Get Free'
          ) : (
            <><ShoppingCart className="w-3 h-3 mr-1 text-primary-foreground" /> Buy</>
          )}
        </Button>
      </div>
    </div>
  );
}
