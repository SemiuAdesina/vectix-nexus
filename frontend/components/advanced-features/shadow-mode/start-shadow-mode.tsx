'use client';

import { Play } from 'lucide-react';

interface StartShadowModeProps {
  startingSol: number;
  onStartingSolChange: (v: number) => void;
  onStart: () => void;
  loading: boolean;
}

export function StartShadowMode({ 
  startingSol, 
  onStartingSolChange, 
  onStart, 
  loading 
}: StartShadowModeProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-muted-foreground block mb-2">
          Starting Balance (Paper Trading)
        </label>
        <input
          type="number"
          value={startingSol}
          onChange={e => onStartingSolChange(Number(e.target.value))}
          className="w-full h-11 px-4 rounded-lg bg-secondary border border-border text-sm"
          min={1}
          max={1000}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Uses live market data for realistic simulation
        </p>
      </div>
      <button
        onClick={onStart}
        disabled={loading}
        className="w-full h-11 rounded-lg bg-primary text-background font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        <Play className="w-4 h-4" />
        Start Shadow Mode
      </button>
      <p className="text-xs text-muted-foreground text-center">
        Test strategies risk-free with real-time market prices
      </p>
    </div>
  );
}

