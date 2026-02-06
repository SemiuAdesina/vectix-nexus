'use client';

import { Link2 } from 'lucide-react';

export function HowItWorksCard() {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.12)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
          <Link2 className="w-5 h-5 text-teal-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">How It Works</h2>
      </div>

      <div className="space-y-3 text-sm text-slate-400">
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
              <span className="w-5 h-5 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 text-xs font-bold shrink-0">
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
