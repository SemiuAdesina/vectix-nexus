'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StrategyCard } from './strategy-card';
import { getStrategies, getPurchasedStrategies, purchaseStrategy, Strategy } from '@/lib/api/marketplace';
import { X, Loader2, Store, Flame, TrendingUp, Coins, Building, MessageSquare, PackageOpen } from 'lucide-react';

interface StrategyStoreProps {
  onSelectStrategy: (strategy: Strategy) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Flame },
  { id: 'trading', label: 'Trading', icon: TrendingUp },
  { id: 'meme', label: 'Meme', icon: Coins },
  { id: 'defi', label: 'DeFi', icon: Building },
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="glass rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Strategy Store</h2>
              <p className="text-sm text-muted-foreground">Choose a pre-built strategy</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="flex gap-2 px-6 py-3 border-b border-border overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat.id ? 'bg-primary text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}>
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : strategies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <PackageOpen className="w-12 h-12 mb-4" />
              <p>No strategies found in this category</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
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
