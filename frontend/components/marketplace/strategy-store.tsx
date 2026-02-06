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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-200"
      style={{ opacity: mounted ? 1 : 0 }}
    >
      <div
        className="rounded-2xl border border-slate-700/50 w-full max-w-4xl flex flex-col overflow-hidden shadow-2xl bg-slate-900 transition-[opacity,transform] duration-200"
        style={{
          height: MODAL_HEIGHT,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(0.98)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
              <Store className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Strategy Store</h2>
              <p className="text-sm text-slate-400">Choose a pre-built strategy</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 rounded-lg text-slate-400 hover:bg-teal-500/10 hover:text-teal-400">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="shrink-0 flex gap-2 px-6 py-3 border-b border-slate-700/80 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/30'
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
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            </div>
          ) : strategies.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-slate-400 text-center">
              <PackageOpen className="w-12 h-12 mb-4 text-slate-500" />
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
