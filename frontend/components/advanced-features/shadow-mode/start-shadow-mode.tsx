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
          Starting Balance (Fake SOL)
        </label>
        <input
          type="number"
          value={startingSol}
          onChange={e => onStartingSolChange(Number(e.target.value))}
          className="w-full h-11 px-4 rounded-lg bg-secondary/80 border border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          min={1}
          max={1000}
        />
      </div>
      <button
        onClick={onStart}
        disabled={loading}
        className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-[0_0_14px_-4px_hsl(var(--primary)/0.4)]"
      >
        <Play className="w-4 h-4 shrink-0" />
        Start Shadow Mode
      </button>
      <p className="text-xs text-muted-foreground text-center">
        Test the agent risk-free before going live
      </p>
    </div>
  );
}

