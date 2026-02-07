'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Store, Search } from 'lucide-react';
import { StrategyCard } from '@/components/marketplace/strategy-card';
import { getStrategies, getPurchasedStrategies, purchaseStrategy, Strategy } from '@/lib/api/marketplace';
import { useRouter } from 'next/navigation';

export default function MarketplacePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [all, owned] = await Promise.all([
          getStrategies(),
          isSignedIn ? getPurchasedStrategies() : Promise.resolve([]),
        ]);
        if (!cancelled) {
          setStrategies(all);
          setOwnedIds(new Set(owned.map(s => s.id)));
        }
      } catch (error) {
        if (!cancelled) console.error('Failed to fetch strategies:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn]);

  const handlePurchase = async (strategy: Strategy) => {
    setPurchasing(strategy.id);
    try {
      const result = await purchaseStrategy(strategy.id);
      if (result.success || result.alreadyOwned) {
        setOwnedIds(prev => new Set([...Array.from(prev), strategy.id]));
        router.push(`/create?strategy=${strategy.id}`);
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

  const handleSelect = (strategy: Strategy) => {
    router.push(`/create?strategy=${strategy.id}`);
  };

  const filtered = strategies.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white">Strategy Marketplace</h1>
          <p className="text-sm sm:text-base text-slate-400">Browse and purchase trading strategies</p>
          <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-3" />
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search strategies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 h-10 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm w-full sm:w-64 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-lg sm:rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 sm:p-6 animate-pulse">
              <div className="h-9 w-9 sm:h-10 sm:w-10 bg-slate-700 rounded-lg mb-3 sm:mb-4" />
              <div className="h-4 sm:h-5 bg-slate-700 rounded w-2/3 mb-2" />
              <div className="h-3 sm:h-4 bg-slate-700 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg sm:rounded-xl border border-slate-700/50 bg-slate-900/50 p-8 sm:p-12 text-center">
          <Store className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-slate-500" />
          <p className="text-sm sm:text-base text-slate-400">No strategies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map(strategy => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              owned={ownedIds.has(strategy.id)}
              onSelect={handleSelect}
              onPurchase={handlePurchase}
              isPurchasing={purchasing === strategy.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
