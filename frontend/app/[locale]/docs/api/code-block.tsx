'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-[#1a1a2e] rounded-lg p-3 pr-10 sm:p-4 sm:pr-12 overflow-x-auto text-[11px] sm:text-sm font-mono text-gray-300 whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">
        <code>{children}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-1.5 sm:p-2 rounded bg-white/10 hover:bg-white/20"
      >
        {copied ? (
          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
        ) : (
          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
        )}
      </button>
    </div>
  );
}
