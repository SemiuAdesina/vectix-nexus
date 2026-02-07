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
    <div className="space-y-3 sm:space-y-4 min-w-0">
      <div>
        <label className="text-xs sm:text-sm text-slate-400 block mb-1.5 sm:mb-2">Starting Balance (Simulated SOL)</label>
        <input
          type="number"
          value={startingSol}
          onChange={e => onStartingSolChange(Number(e.target.value))}
          className="w-full h-10 sm:h-11 px-3 sm:px-4 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
          min={1}
          max={1000}
        />
      </div>
      <button
        onClick={onStart}
        disabled={loading}
        className="w-full h-10 sm:h-11 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-teal-500/20 transition-all"
      >
        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        Start Shadow Mode
      </button>
      <p className="text-[10px] sm:text-xs text-slate-400 text-center">
        Test the agent risk-free before going live
      </p>
    </div>
  );
}
