'use client';

import { useState, useEffect } from 'react';
import { Rocket, Zap, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTurboFees, TurboFees } from '@/lib/api/protection';

interface TurboModeCardProps {
  onToggle?: (enabled: boolean) => void;
}

export function TurboModeCard({ onToggle }: TurboModeCardProps) {
  const [enabled, setEnabled] = useState(false);
  const [fees, setFees] = useState<TurboFees | null>(null);

  useEffect(() => {
    const fetchFees = async () => {
      const data = await getTurboFees();
      setFees(data);
    };
    fetchFees();
  }, []);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    onToggle?.(newState);
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            enabled ? 'bg-primary/20' : 'bg-secondary'
          }`}>
            <Rocket className={`w-5 h-5 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <h3 className="font-semibold">Turbo Priority</h3>
            <p className="text-xs text-muted-foreground">Fast lane for congested network</p>
          </div>
        </div>
        <Button
          variant={enabled ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggle}
        >
          {enabled ? 'ON' : 'OFF'}
        </Button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-secondary">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>Fee per Trade</span>
          </div>
          <span className="font-mono">{fees?.userFee?.toFixed(4) || '0.002'} SOL</span>
        </div>

        <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-secondary">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span>Priority Tip</span>
          </div>
          <span className="font-mono">{fees?.validatorTip?.toFixed(4) || '0.001'} SOL</span>
        </div>
      </div>

      {enabled && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <p className="text-sm text-primary font-medium flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            Turbo Mode Active - Trades prioritized
          </p>
        </div>
      )}

      {!enabled && (
        <p className="text-xs text-muted-foreground">
          Enable during network congestion to ensure trade execution
        </p>
      )}
    </div>
  );
}

