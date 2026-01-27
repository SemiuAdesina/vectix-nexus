'use client';

import { Button } from '@/components/ui/button';
import { Wallet, Copy, ExternalLink } from 'lucide-react';

interface WalletPanelProps {
  address?: string;
  balance: number;
}

export function WalletPanel({ address, balance }: WalletPanelProps) {
  const copyAddress = () => address && navigator.clipboard.writeText(address);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-primary" />
        <span className="font-medium">Wallet</span>
      </div>
      {address ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <code className="text-xs bg-secondary px-2 py-1 rounded truncate flex-1">
              {address}
            </code>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyAddress}>
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <a
              href={`https://solscan.io/account/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
          <div className="text-2xl font-bold">{balance.toFixed(4)} SOL</div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No wallet connected</p>
      )}
    </div>
  );
}

