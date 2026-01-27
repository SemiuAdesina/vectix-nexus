'use client';

import { Search } from 'lucide-react';

interface MarketplaceFiltersProps {
  search: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'trading', label: 'Trading' },
  { id: 'meme', label: 'Meme' },
  { id: 'defi', label: 'DeFi' },
  { id: 'social', label: 'Social' },
];

export function MarketplaceFilters({ search, selectedCategory, onSearchChange, onCategoryChange }: MarketplaceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search strategies..."
            className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
