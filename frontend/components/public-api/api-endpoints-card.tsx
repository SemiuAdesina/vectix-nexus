'use client';

import { useState } from 'react';
import { Key, Copy, CheckCircle2 } from 'lucide-react';

export function ApiEndpointsCard() {
  const [copied, setCopied] = useState(false);

  const copyExample = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Key className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">API Endpoints</h2>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">Get Security Score</span>
            <button
              onClick={() => copyExample('GET /api/public/security/score/:tokenAddress')}
              className="p-1 hover:bg-secondary/50 rounded"
            >
              {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <code className="text-xs bg-background px-2 py-1 rounded block">GET /api/public/security/score/:tokenAddress</code>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">Get Trending</span>
            <button
              onClick={() => copyExample('GET /api/public/security/trending')}
              className="p-1 hover:bg-secondary/50 rounded"
            >
              {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <code className="text-xs bg-background px-2 py-1 rounded block">GET /api/public/security/trending</code>
        </div>
      </div>
    </div>
  );
}
