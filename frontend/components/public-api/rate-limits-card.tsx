'use client';

import { Shield, Check } from 'lucide-react';

export function RateLimitsCard() {
  const rows = [
    { label: 'Free Tier', value: '100 requests/hour' },
    { label: 'Per IP', value: 'Automatic' },
    { label: 'No Auth Required', value: '✓' },
  ];

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
          <Shield className="w-5 h-5 text-teal-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Rate Limits</h2>
      </div>

      <div className="space-y-3 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/40 transition-colors"
          >
            <span className="text-slate-400">{row.label}</span>
            {row.label === 'No Auth Required' ? (
              <span className="font-medium text-teal-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Yes
              </span>
            ) : (
              <span className="font-medium text-white">{row.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
