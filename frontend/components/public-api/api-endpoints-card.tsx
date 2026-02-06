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
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30">
          <Key className="w-5 h-5 text-teal-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">API Endpoints</h2>
      </div>

      <div className="space-y-3 text-sm">
        <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-white">Get Security Score</span>
            <button
              type="button"
              onClick={() => copyExample('GET /api/public/security/score/:tokenAddress')}
              className="p-1.5 rounded-lg hover:bg-teal-500/10 hover:text-teal-400 transition-colors text-slate-400"
              aria-label="Copy endpoint"
            >
              {copied === 'GET /api/public/security/score/:tokenAddress' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <code className="text-xs bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-700 block text-white font-mono">
            GET /api/public/security/score/:tokenAddress
          </code>
        </div>
        <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-white">Get Trending</span>
            <button
              type="button"
              onClick={() => copyExample('GET /api/public/security/trending')}
              className="p-1.5 rounded-lg hover:bg-teal-500/10 hover:text-teal-400 transition-colors text-slate-400"
              aria-label="Copy endpoint"
            >
              {copied === 'GET /api/public/security/trending' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <code className="text-xs bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-700 block text-white font-mono">
            GET /api/public/security/trending
          </code>
        </div>
      </div>
    </div>
  );
}
