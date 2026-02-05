'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StrategyCard } from './strategy-card';
import { getStrategies, getPurchasedStrategies, purchaseStrategy, Strategy } from '@/lib/api/marketplace';
import { X, Loader2, Store, PackageOpen, TrendingUp, Rocket, Shield, MessageSquare } from 'lucide-react';

const MODAL_HEIGHT = 'min(85vh, 640px)';

interface StrategyStoreProps {
  onSelectStrategy: (strategy: Strategy) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: PackageOpen },
  { id: 'trading', label: 'Trading', icon: TrendingUp },
  { id: 'meme', label: 'Meme', icon: Rocket },
  { id: 'defi', label: 'DeFi', icon: Shield },
  { id: 'social', label: 'Social', icon: MessageSquare },
];

export function StrategyStore({ onSelectStrategy, onClose }: StrategyStoreProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [all, owned] = await Promise.all([
          getStrategies(category !== 'all' ? { category } : undefined),
          getPurchasedStrategies(),
        ]);
        setStrategies(all);
        setOwnedIds(new Set(owned.map((s) => s.id)));
      } catch (error) {
        console.error('Failed to fetch strategies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category]);

  const handlePurchase = async (strategy: Strategy) => {
    setPurchasing(strategy.id);
    try {
      const result = await purchaseStrategy(strategy.id);
      console.log('Purchase result:', result);
      
      if (result.success || result.alreadyOwned) {
        setOwnedIds((prev) => new Set([...Array.from(prev), strategy.id]));
        onSelectStrategy(strategy);
      } else if (result.requiresPayment && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert('Stripe not configured. Add STRIPE_SECRET_KEY to backend .env');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Failed to connect to backend. Is it running?');
    } finally {
      setPurchasing(null);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-200"
      style={{ opacity: mounted ? 1 : 0 }}
    >
      <div
        className="rounded-2xl border border-primary/20 w-full max-w-4xl flex flex-col overflow-hidden shadow-2xl bg-card transition-[opacity,transform] duration-200"
        style={{
          height: MODAL_HEIGHT,
          backgroundColor: 'hsl(var(--card))',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(0.98)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Strategy Store</h2>
              <p className="text-sm text-muted-foreground">Choose a pre-built strategy</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 rounded-lg hover:bg-primary/10 hover:text-primary">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="shrink-0 flex gap-2 px-6 py-3 border-b border-primary/20 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-primary text-primary-foreground shadow-[0_0_12px_-4px_hsl(var(--primary)_/_0.4)]'
                  : 'bg-secondary text-muted-foreground border border-transparent hover:text-primary hover:bg-primary/10 hover:border-primary/20'
              }`}
            >
              <cat.icon className="w-4 h-4 shrink-0" />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : strategies.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground text-center">
              <PackageOpen className="w-12 h-12 mb-4 text-muted-foreground/50" />
              <p>No strategies found in this category</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 pb-2">
              {strategies.map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  owned={ownedIds.has(strategy.id)}
                  onSelect={onSelectStrategy}
                  onPurchase={handlePurchase}
                  isPurchasing={purchasing === strategy.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
