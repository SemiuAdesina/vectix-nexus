'use client';

import { Shield } from 'lucide-react';

export function RateLimitsCard() {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Rate Limits</h2>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Free Tier</span>
          <span className="font-medium">100 requests/hour</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Per IP</span>
          <span className="font-medium">Automatic</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">No Auth Required</span>
          <span className="font-medium text-success">✓</span>
        </div>
      </div>
    </div>
  );
}
