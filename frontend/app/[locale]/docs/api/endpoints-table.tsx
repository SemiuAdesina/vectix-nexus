'use client';

import React from 'react';

const endpoints = [
  { method: 'GET', path: '/agents', scope: 'read:agents', tier: 'free', desc: 'List all agents' },
  { method: 'GET', path: '/agents/:id', scope: 'read:agents', tier: 'free', desc: 'Get agent details' },
  { method: 'GET', path: '/agents/:id/logs', scope: 'read:logs', tier: 'free', desc: 'Get agent logs' },
  { method: 'POST', path: '/agents/:id/start', scope: 'write:control', tier: 'pro', desc: 'Start agent' },
  { method: 'POST', path: '/agents/:id/stop', scope: 'write:control', tier: 'pro', desc: 'Stop agent' },
  { method: 'POST', path: '/agents/:id/restart', scope: 'write:control', tier: 'pro', desc: 'Restart agent' },
  { method: 'POST', path: '/agents/:id/trade', scope: 'write:trade', tier: 'free*', desc: 'Execute trade' },
  { method: 'GET', path: '/market/trending', scope: 'read:market', tier: 'free', desc: 'Trending tokens' },
];

export function EndpointsTable() {
  return (
    <>
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-3 px-4 font-semibold">Method</th>
              <th className="py-3 px-4 font-semibold">Endpoint</th>
              <th className="py-3 px-4 font-semibold">Scope</th>
              <th className="py-3 px-4 font-semibold">Tier</th>
              <th className="py-3 px-4 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                    ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {ep.method}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-sm">/v1{ep.path}</td>
                <td className="py-3 px-4">
                  <code className="text-xs bg-secondary px-2 py-0.5 rounded">{ep.scope}</code>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs ${ep.tier === 'pro' ? 'text-amber-400' : 'text-muted-foreground'}`}>
                    {ep.tier}
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{ep.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        * Free tier trades are paper-only. Live trading requires Pro.
      </p>
    </>
  );
}
