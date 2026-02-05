'use client';

import { useState } from 'react';
import { Key, Copy, CheckCircle2 } from 'lucide-react';

export function ApiEndpointsCard() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyExample = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
          <Key className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">API Endpoints</h2>
      </div>

      <div className="space-y-3 text-sm">
        <div className="p-3 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-foreground">Get Security Score</span>
            <button
              type="button"
              onClick={() => copyExample('GET /api/public/security/score/:tokenAddress')}
              className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Copy endpoint"
            >
              {copied === 'GET /api/public/security/score/:tokenAddress' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
          <code className="text-xs bg-background px-2 py-1.5 rounded-lg border border-border block text-foreground font-mono">
            GET /api/public/security/score/:tokenAddress
          </code>
        </div>
        <div className="p-3 rounded-xl border border-primary/20 bg-card hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-foreground">Get Trending</span>
            <button
              type="button"
              onClick={() => copyExample('GET /api/public/security/trending')}
              className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Copy endpoint"
            >
              {copied === 'GET /api/public/security/trending' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
          <code className="text-xs bg-background px-2 py-1.5 rounded-lg border border-border block text-foreground font-mono">
            GET /api/public/security/trending
          </code>
        </div>
      </div>
    </div>
  );
}
