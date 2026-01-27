'use client';

import { useState } from 'react';
import { Zap, Shield, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleMevProtection } from '@/lib/api/protection';

interface MevShieldCardProps {
  agentId: string;
  initialEnabled?: boolean;
}

export function MevShieldCard({ agentId, initialEnabled = false }: MevShieldCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const success = await toggleMevProtection(agentId, !enabled);
    if (success) setEnabled(!enabled);
    setLoading(false);
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            enabled ? 'bg-[hsl(var(--success))]/10' : 'bg-secondary'
          }`}>
            <Shield className={`w-5 h-5 ${enabled ? 'text-[hsl(var(--success))]' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <h3 className="font-semibold">Sandwich Protection</h3>
            <p className="text-xs text-muted-foreground">MEV Shield via Jito Bundles</p>
          </div>
        </div>
        <Button
          variant={enabled ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggle}
          disabled={loading}
        >
          {enabled ? 'Enabled' : 'Disabled'}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
          <Zap className="w-4 h-4 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Stealth Mode</p>
            <p className="text-xs text-muted-foreground">Trades hidden from MEV bots</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
          <Rocket className="w-4 h-4 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Priority Landing</p>
            <p className="text-xs text-muted-foreground">Direct validator submission</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg border border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Est. Savings per Trade</span>
          <span className="font-semibold text-[hsl(var(--success))]">~0.02 SOL</span>
        </div>
      </div>
    </div>
  );
}

