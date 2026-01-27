'use client';

import { Link2 } from 'lucide-react';

export function HowItWorksCard() {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Link2 className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">How It Works</h2>
      </div>
      
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          All security decisions are stored on-chain using Solana Program Derived Addresses (PDAs),
          making them verifiable by anyone without trusting our backend.
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Security decisions are immutable once stored</li>
          <li>Anyone can verify proofs independently</li>
          <li>No single point of failure</li>
          <li>Transparent and auditable</li>
        </ul>
      </div>
    </div>
  );
}
