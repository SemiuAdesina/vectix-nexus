'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeBlock } from './code-block';
import { EndpointsTable } from './endpoints-table';

export function QuickStart() {
  return (
    <section className="mb-10 sm:mb-16">
      <h2 className="text-2xl font-bold mb-6">Quick Start</h2>
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">1. Get your API Key</h3>
          <p className="text-muted-foreground mb-3">
            Create a key at <a href="/dashboard/api-keys" className="text-primary hover:underline">/dashboard/api-keys</a>
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">2. Make your first request</h3>
          <CodeBlock>{`curl -X GET https://api.vectix.com/v1/agents \\
  -H "x-api-key: vx_your_key_here"`}</CodeBlock>
        </div>
        <div>
          <h3 className="font-semibold mb-2">3. Example Response</h3>
          <CodeBlock>{`{
  "agents": [
    {
      "id": "clx123abc",
      "name": "My Trading Bot",
      "status": "running",
      "walletAddress": "7xKx..."
    }
  ]
}`}</CodeBlock>
        </div>
      </div>
    </section>
  );
}

export function Authentication() {
  return (
    <section className="mb-10 sm:mb-16">
      <h2 className="text-2xl font-bold mb-6">Authentication</h2>
      <p className="text-muted-foreground mb-4">
        Include your API key in the <code className="bg-secondary px-2 py-0.5 rounded">x-api-key</code> header:
      </p>
      <CodeBlock>{`curl -H "x-api-key: vx_your_key_here" https://api.vectix.com/v1/agents`}</CodeBlock>
    </section>
  );
}

export function EndpointsSection() {
  return (
    <section className="mb-10 sm:mb-16">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Endpoints</h2>
      <EndpointsTable />
    </section>
  );
}

export function TradeExample() {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6">Execute a Trade</h2>
      <CodeBlock>{`curl -X POST https://api.vectix.com/v1/agents/abc123/trade \\
  -H "x-api-key: vx_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "buy",
    "token": "SOL",
    "amount": 0.5,
    "mode": "paper"
  }'`}</CodeBlock>
      <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <p className="text-sm">
          <strong>Note:</strong> Free tier keys are automatically forced to <code>paper</code> mode.
        </p>
      </div>
    </section>
  );
}

export function RateLimitsSection() {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6">Rate Limits & Errors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass rounded-lg p-4 sm:p-6">
          <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Rate Limits
          </h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li>- Free: 100 requests/day, 10/minute</li>
            <li>- Pro: 10,000 requests/day, 100/minute</li>
            <li>- Status polling: 60s interval (free tier)</li>
          </ul>
        </div>
        <div className="glass rounded-lg p-4 sm:p-6">
          <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Error Codes</h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li><code className="text-red-400">401</code> - Invalid or missing API key</li>
            <li><code className="text-red-400">403</code> - Missing scope or Pro required</li>
            <li><code className="text-red-400">429</code> - Rate limit exceeded</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function SdksSection() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">SDKs & Libraries</h2>
      <p className="text-muted-foreground mb-4">Coming soon: Official SDKs for Python, JavaScript, and Go.</p>
      <Button variant="outline" asChild>
        <a href="/dashboard/api-keys">Get Your API Key</a>
      </Button>
    </section>
  );
}
