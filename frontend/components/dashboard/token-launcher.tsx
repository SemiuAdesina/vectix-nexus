'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getBackendUrl, getAuthHeaders } from '@/lib/api/auth';
import { API_ENDPOINTS } from '@/lib/api/config';
import { Rocket, Loader2, Check, AlertCircle, Gem } from 'lucide-react';

interface TokenLauncherProps {
  agentId: string;
  agentName: string;
}

interface LaunchResult {
  success: boolean;
  tokenMint?: string;
  tokenName?: string;
  symbol?: string;
  treasuryPercentage?: number;
  message?: string;
  error?: string;
}

export function TokenLauncher({ agentId, agentName }: TokenLauncherProps) {
  const [tokenName, setTokenName] = useState(agentName);
  const [symbol, setSymbol] = useState(`$${agentName.slice(0, 4).toUpperCase()}`);
  const [launching, setLaunching] = useState(false);
  const [result, setResult] = useState<LaunchResult | null>(null);

  const handleLaunch = async () => {
    setLaunching(true);
    setResult(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${getBackendUrl()}${API_ENDPOINTS.agents.launchToken(agentId)}`, {
        method: 'POST', headers, body: JSON.stringify({ tokenName, symbol }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error instanceof Error ? error.message : 'Launch failed' });
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Rocket className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Launch Agent Token</h3>
        <p className="text-sm text-muted-foreground">Create a token for your agent on Pump.fun</p>
      </div>

      <div className="glass rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Token Name</Label>
            <Input value={tokenName} onChange={(e) => setTokenName(e.target.value)} placeholder="My Agent Token"
              className="bg-secondary border-border h-11" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Symbol</Label>
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="$AGENT"
              className="bg-secondary border-border h-11 font-mono" />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-secondary border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Gem className="w-5 h-5 text-primary" />
            <span className="font-semibold">Platform Fee</span>
          </div>
          <p className="text-sm text-muted-foreground">1% of token supply goes to VectixLogic treasury.</p>
        </div>
      </div>

      <Button size="lg" onClick={handleLaunch} disabled={launching || !tokenName || !symbol} className="w-full">
        {launching ? <><Loader2 className="w-4 h-4 animate-spin" /> Launching...</> : <><Rocket className="w-4 h-4" /> Launch Token on Pump.fun</>}
      </Button>

      {result && (
        <div className={`p-4 rounded-lg text-sm ${result.success ? 'bg-success/10 border border-success/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          {result.success ? (
            <div className="space-y-2">
              <p className="font-medium text-success flex items-center gap-2"><Check className="w-4 h-4" /> Token Launch Initiated</p>
              <div className="space-y-1 text-muted-foreground">
                <p>Name: {result.tokenName}</p>
                <p>Symbol: {result.symbol}</p>
                <p>Treasury: {result.treasuryPercentage}%</p>
                {result.tokenMint && <p className="font-mono text-xs break-all">Mint: {result.tokenMint}</p>}
              </div>
              <p className="text-xs text-yellow-400 mt-2">{result.message}</p>
            </div>
          ) : (
            <p className="text-red-400 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
