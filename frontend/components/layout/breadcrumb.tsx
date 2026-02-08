'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  agents: 'Agents',
  create: 'New Agent',
  marketplace: 'Marketplace',
  analysis: 'Analysis',
  trending: 'Trending',
  billing: 'Billing',
  affiliates: 'Affiliates',
  advanced: 'Security',
  'api-keys': 'API Keys',
  onchain: 'On-Chain',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const segments = mounted ? pathname.split('/').filter(Boolean) : [];
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Link>
      {breadcrumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-0.5 sm:gap-1">
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-none">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[80px] sm:max-w-none"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

