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
          <Label className="text-sm font-medium text-foreground">Agent Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            placeholder="CryptoAlphaBot"
            className="bg-secondary/80 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 rounded-lg transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Bio / Personality</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => onFormDataChange({ ...formData, bio: e.target.value })}
            placeholder="A cunning trader who spots alpha before anyone else..."
            className="bg-secondary/80 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none rounded-lg transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Ticker Symbol</Label>
          <Input
            value={formData.tickerSymbol}
            onChange={(e) => onFormDataChange({ ...formData, tickerSymbol: e.target.value })}
            placeholder="$ALPHA"
            className="bg-secondary/80 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 font-mono rounded-lg transition-all"
            required
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-foreground">Strategy</Label>
            {selectedStrategy && (
              <button type="button" onClick={() => onStrategySelect(null)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          {selectedStrategy ? (
            <div className="rounded-xl p-4 border border-primary/20 bg-primary/5 shadow-[0_0_16px_-6px_hsl(var(--primary)/0.2)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.25)]">
                  {(() => {
                    const Icon = getStrategyIcon(selectedStrategy);
                    return <Icon className="w-6 h-6 text-primary" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{selectedStrategy.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{selectedStrategy.description}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowStore(true)}
                  className="shrink-0 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                >
                  <Replace className="w-3.5 h-3.5 mr-1.5" /> Change
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowStore(true)}
              className="w-full py-4 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-3 text-muted-foreground hover:text-primary group"
            >
              <Store className="w-5 h-5 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)] transition-all" />
              <span className="font-medium">Browse Strategy Store</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary/80" /> Risk Level
          </Label>
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-secondary/50 border border-border/50">
            {RISK_OPTIONS.map((opt) => {
              const isSelected = formData.riskLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onFormDataChange({ ...formData, riskLevel: opt.value })}
                  className={`
                    flex flex-col items-center gap-0.5 py-3 px-2 rounded-lg text-sm font-medium transition-all duration-200 border
                    ${isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_16px_-6px_hsl(var(--primary))]'
                      : 'bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-primary/10 hover:border-primary/20'}
                  `}
                >
                  <span>{opt.label}</span>
                  <span className={`text-[10px] font-normal ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground/80'}`}>
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
          className="w-full shadow-[0_0_24px_-6px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_32px_-8px_hsl(var(--primary)/0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          Continue to API Keys <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {showStore && <StrategyStore onSelectStrategy={handleStrategySelect} onClose={() => setShowStore(false)} />}
    </>
  );
}
