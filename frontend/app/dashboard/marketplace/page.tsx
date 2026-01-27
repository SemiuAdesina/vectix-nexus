'use client';

import { useState, useEffect } from 'react';
import { Store } from 'lucide-react';
import { StrategyCard } from '@/components/marketplace/strategy-card';
import { MarketplaceFilters } from '@/components/marketplace/marketplace-filters';
import { getStrategies, getPurchasedStrategies, purchaseStrategy, Strategy } from '@/lib/api/marketplace';
import { useRouter } from 'next/navigation';

export default function MarketplacePage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [all, owned] = await Promise.all([getStrategies(), getPurchasedStrategies()]);
        setStrategies(all);
        setOwnedIds(new Set(owned.map(s => s.id)));
      } catch (error) {
        console.error('Failed to fetch strategies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePurchase = async (strategy: Strategy) => {
    setPurchasing(strategy.id);
    try {
      const result = await purchaseStrategy(strategy.id);
      console.log('Purchase result:', result);

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

  const filtered = strategies.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || s.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">Strategy Store</h1>
          <p className="text-sm text-muted-foreground">Choose a pre-built strategy</p>
        </div>
        <MarketplaceFilters
          search={search}
          selectedCategory={selectedCategory}
          onSearchChange={setSearch}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass rounded-xl p-6 animate-pulse">
              <div className="h-10 w-10 bg-secondary rounded-lg mb-4" />
              <div className="h-5 bg-secondary rounded w-2/3 mb-2" />
              <div className="h-4 bg-secondary rounded w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {selectedCategory !== 'all'
              ? `No strategies found in this category`
              : 'No strategies found'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
