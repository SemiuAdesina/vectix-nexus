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
      onClick={() => {
        if (isPurchasing) return;
        if (owned || isFree) onSelect(strategy);
        else onPurchase(strategy);
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' || isPurchasing) return;
        if (owned || isFree) onSelect(strategy);
        else onPurchase(strategy);
      }}
      className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border transition-all duration-200 cursor-pointer group text-left ${
        owned
          ? 'border-emerald-500/30 bg-slate-900/50 hover:border-emerald-500/50'
          : 'border-slate-700/50 bg-slate-900/50 hover:border-teal-500/40 hover:shadow-[0_0_20px_-8px_rgba(20,184,166,0.15)]'
      }`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
        <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-lg bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap gap-y-1">
            <h3 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-teal-400 transition-colors">
              {strategy.name}
            </h3>
            {strategy.featured && (
              <span className="shrink-0 px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400 text-[10px] font-medium flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Featured
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 capitalize mt-0.5">{strategy.category}</p>
        </div>
        {owned && (
          <span className="shrink-0 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-medium flex items-center gap-0.5">
            <Check className="w-2.5 h-2.5" /> Owned
          </span>
        )}
      </div>

      <p className="text-[11px] sm:text-xs text-slate-400 mb-2.5 sm:mb-3 line-clamp-2 leading-relaxed">{strategy.description}</p>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm sm:text-base font-bold">
          {isFree ? (
            <span className="text-emerald-400">Free</span>
          ) : (
            <span className="text-teal-400">${(strategy.priceUsd / 100).toFixed(0)}</span>
          )}
        </span>
        <Button
          size="sm"
          variant={owned ? 'outline' : 'default'}
          onClick={handleButtonClick}
          disabled={isPurchasing}
          className={
            owned
              ? 'shrink-0 border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
              : 'shrink-0 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20'
          }
        >
          {isPurchasing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : owned ? (
            <><Check className="w-3 h-3 mr-1" /> Use</>
          ) : isFree ? (
            'Get Free'
          ) : (
            <><ShoppingCart className="w-3 h-3 mr-1" /> Buy</>
          )}
        </Button>
      </div>
    </div>
  );
}
