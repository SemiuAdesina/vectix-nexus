import {
  Rocket,
  Shield,
  TrendingUp,
  Copy,
  MessageSquare,
  Gem,
  Zap,
  Coins,
  Building2,
  Activity,
  Target,
  BarChart3,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type StrategyIconName =
  | 'rocket'
  | 'shield'
  | 'whale'
  | 'copy'
  | 'social'
  | 'gem'
  | 'zap'
  | 'coins'
  | 'defi'
  | 'trading'
  | 'target'
  | 'chart';

export const STRATEGY_ICONS: Record<StrategyIconName, LucideIcon> = {
  rocket: Rocket,
  shield: Shield,
  whale: Activity, // Whale icon alternative
  copy: Copy,
  social: MessageSquare,
  gem: Gem,
  zap: Zap,
  coins: Coins,
  defi: Building2,
  trading: TrendingUp,
  target: Target,
  chart: BarChart3,
};

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  meme: Rocket,
  defi: Building2,
  trading: TrendingUp,
  social: MessageSquare,
  default: Zap,
};

export function getStrategyIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Zap;
  
  const normalized = iconName.toLowerCase().replace(/[^a-z]/g, '');
  const icon = STRATEGY_ICONS[normalized as StrategyIconName];
  return icon || Zap;
}

export function getCategoryIcon(category: string): LucideIcon {
  const normalized = category.toLowerCase();
  return CATEGORY_ICONS[normalized] || CATEGORY_ICONS.default;
}
