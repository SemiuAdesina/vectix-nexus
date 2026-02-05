'use client';

import { Shield, Check } from 'lucide-react';

export function RateLimitsCard() {
  const rows = [
    { label: 'Free Tier', value: '100 requests/hour' },
    { label: 'Per IP', value: 'Automatic' },
    { label: 'No Auth Required', value: '✓' },
  ];

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Rate Limits</h2>
      </div>

      <div className="space-y-3 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-colors"
          >
            <span className="text-muted-foreground">{row.label}</span>
            {row.label === 'No Auth Required' ? (
              <span className="font-medium text-primary flex items-center gap-1">
                <Check className="w-4 h-4" />
                Yes
              </span>
            ) : (
              <span className="font-medium text-foreground">{row.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
