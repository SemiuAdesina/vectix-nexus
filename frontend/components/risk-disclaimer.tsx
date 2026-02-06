'use client';

export function RiskDisclaimer({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-400/90 ${className}`}>
      <p>
        Trading involves substantial risk of loss. Past performance is not indicative of future results. 
        You trade at your own risk. Only invest what you can afford to lose.
      </p>
    </div>
  );
}
