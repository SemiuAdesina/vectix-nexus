'use client';

import { Link2 } from 'lucide-react';

export function HowItWorksCard() {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.12)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)_/_0.2)]">
          <Link2 className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">How It Works</h2>
      </div>

      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          All security decisions are stored on-chain using Solana Program Derived Addresses (PDAs),
          making them verifiable by anyone without trusting our backend.
        </p>
        <ul className="space-y-2">
          {[
            'Security decisions are immutable once stored',
            'Anyone can verify proofs independently',
            'No single point of failure',
            'Transparent and auditable',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
