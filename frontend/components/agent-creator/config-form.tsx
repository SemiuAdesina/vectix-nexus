'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StrategyStore } from '@/components/marketplace/strategy-store';
import { getStrategyIcon } from '@/components/marketplace/strategy-card';
import type { AgentCreatorFormData, RiskLevel } from '@/lib/agent-creator/agent-creator.types';
import type { Strategy } from '@/lib/api/marketplace';
import { Store, ArrowRight, X, Gauge, Replace } from 'lucide-react';

const RISK_OPTIONS: { value: RiskLevel; label: string; desc: string }[] = [
  { value: 'Low', label: 'Conservative', desc: 'Lower risk' },
  { value: 'Medium', label: 'Balanced', desc: 'Moderate risk' },
  { value: 'High', label: 'Degen', desc: 'Higher risk' },
];

interface ConfigFormProps {
  formData: AgentCreatorFormData;
  onFormDataChange: (data: AgentCreatorFormData) => void;
  onSubmit: () => void;
  selectedStrategy: Strategy | null;
  onStrategySelect: (strategy: Strategy | null) => void;
}

export function ConfigForm({ formData, onFormDataChange, onSubmit, selectedStrategy, onStrategySelect }: ConfigFormProps) {
  const [showStore, setShowStore] = useState(false);

  const handleStrategySelect = (strategy: Strategy) => {
    onStrategySelect(strategy);
    setShowStore(false);
  };

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-white">Agent Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            placeholder="CryptoAlphaBot"
            className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 h-11 rounded-lg transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-white">Bio / Personality</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => onFormDataChange({ ...formData, bio: e.target.value })}
            placeholder="A cunning trader who spots alpha before anyone else..."
            className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 min-h-[100px] resize-none rounded-lg transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-white">Ticker Symbol</Label>
          <Input
            value={formData.tickerSymbol}
            onChange={(e) => onFormDataChange({ ...formData, tickerSymbol: e.target.value })}
            placeholder="$ALPHA"
            className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 h-11 font-mono rounded-lg transition-all"
            required
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-white">Strategy</Label>
            {selectedStrategy && (
              <button type="button" onClick={() => onStrategySelect(null)} className="text-xs text-slate-400 hover:text-teal-400 flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          {selectedStrategy ? (
            <div className="rounded-xl p-3 sm:p-4 border border-slate-700/50 bg-teal-500/5">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
                  {(() => {
                    const Icon = getStrategyIcon(selectedStrategy);
                    return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base text-white">{selectedStrategy.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{selectedStrategy.description}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowStore(true)}
                    className="mt-2 sm:hidden border-slate-600 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50 text-xs"
                  >
                    <Replace className="w-3 h-3 mr-1" /> Change
                  </Button>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowStore(true)}
                  className="shrink-0 hidden sm:flex border-slate-600 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50"
                >
                  <Replace className="w-3.5 h-3.5 mr-1.5" /> Change
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowStore(true)}
              className="w-full py-4 rounded-xl border-2 border-dashed border-slate-600 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all duration-200 flex items-center justify-center gap-3 text-slate-400 hover:text-teal-400 group"
            >
              <Store className="w-5 h-5 transition-all" />
              <span className="font-medium">Browse Strategy Store</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-white flex items-center gap-2">
            <Gauge className="w-4 h-4 text-teal-400" /> Risk Level
          </Label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 rounded-xl bg-slate-800/50 border border-slate-700/50">
            {RISK_OPTIONS.map((opt) => {
              const isSelected = formData.riskLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onFormDataChange({ ...formData, riskLevel: opt.value })}
                  className={`
                    flex flex-col items-center gap-0.5 py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border
                    ${isSelected
                      ? 'bg-teal-500 text-white border-teal-500 shadow-[0_0_16px_-6px_rgba(20,184,166,0.5)]'
                      : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-teal-500/10 hover:border-teal-500/20'}
                  `}
                >
                  <span>{opt.label}</span>
                  <span className={`text-[9px] sm:text-[10px] font-normal ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          Continue to API Keys <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {showStore && <StrategyStore onSelectStrategy={handleStrategySelect} onClose={() => setShowStore(false)} />}
    </>
  );
}
