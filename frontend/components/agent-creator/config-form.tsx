'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { StrategyStore } from '@/components/marketplace/strategy-store';
import type { AgentCreatorFormData, RiskLevel } from '@/lib/agent-creator/agent-creator.types';
import type { Strategy } from '@/lib/api/marketplace';
import { Store, ArrowRight, X, Gauge } from 'lucide-react';

const riskMap: Record<RiskLevel, number> = { Low: 0, Medium: 50, High: 100 };
const getRisk = (v: number): RiskLevel => v <= 33 ? 'Low' : v <= 66 ? 'Medium' : 'High';

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
          <Label className="text-sm font-medium">Agent Name</Label>
          <Input value={formData.name} onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })} placeholder="CryptoAlphaBot"
            className="bg-secondary border-border focus:border-primary h-11" required />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Bio / Personality</Label>
          <Textarea value={formData.bio} onChange={(e) => onFormDataChange({ ...formData, bio: e.target.value })} placeholder="A cunning trader who spots alpha before anyone else..."
            className="bg-secondary border-border focus:border-primary min-h-[100px] resize-none" required />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Ticker Symbol</Label>
          <Input value={formData.tickerSymbol} onChange={(e) => onFormDataChange({ ...formData, tickerSymbol: e.target.value })} placeholder="$ALPHA"
            className="bg-secondary border-border focus:border-primary h-11 font-mono" required />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Strategy</Label>
            {selectedStrategy && (
              <button type="button" onClick={() => onStrategySelect(null)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          {selectedStrategy ? (
            <div className="glass rounded-lg p-4 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">{selectedStrategy.icon || '🤖'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{selectedStrategy.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedStrategy.description}</p>
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowStore(true)}>Change</Button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowStore(true)}
              className="w-full py-4 rounded-lg border-2 border-dashed border-border hover:border-primary/30 transition-all flex items-center justify-center gap-3 text-muted-foreground hover:text-foreground">
              <Store className="w-5 h-5" />
              <span>Browse Strategy Store</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium flex items-center gap-2"><Gauge className="w-4 h-4" /> Risk Level</Label>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              formData.riskLevel === 'High' ? 'bg-red-500/20 text-red-400' :
              formData.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-success/20 text-success'
            }`}>{formData.riskLevel}</span>
          </div>
          <Slider value={[riskMap[formData.riskLevel]]} onValueChange={(v) => onFormDataChange({ ...formData, riskLevel: getRisk(v[0]) })} max={100} step={1} className="py-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Conservative</span><span>Balanced</span><span>Degen</span>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Continue to API Keys <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {showStore && <StrategyStore onSelectStrategy={handleStrategySelect} onClose={() => setShowStore(false)} />}
    </>
  );
}
