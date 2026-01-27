'use client';

import { Shield, AlertTriangle, DollarSign, CheckCircle2 } from 'lucide-react';

export default function BugBountyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bug Bounty Program</h1>
        <p className="text-muted-foreground">
          Help us secure the platform and earn rewards for finding vulnerabilities
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Program Overview</h2>
        </div>
        <div className="space-y-3 text-sm">
          <p>
            We welcome security researchers to help identify vulnerabilities in our platform.
            Responsible disclosure is encouraged, and we offer rewards based on severity.
          </p>
          <p>
            All reports are reviewed by our security team, and valid findings are rewarded
            according to our severity classification.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h2 className="text-xl font-semibold">Severity Levels</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-destructive">Critical</span>
              <p className="text-muted-foreground">Remote code execution, fund loss, data breach</p>
            </div>
            <div>
              <span className="font-medium text-orange-500">High</span>
              <p className="text-muted-foreground">Authentication bypass, privilege escalation</p>
            </div>
            <div>
              <span className="font-medium text-warning">Medium</span>
              <p className="text-muted-foreground">Information disclosure, CSRF, XSS</p>
            </div>
            <div>
              <span className="font-medium text-blue-500">Low</span>
              <p className="text-muted-foreground">Minor issues, best practice violations</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-success" />
            <h2 className="text-xl font-semibold">Rewards</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Critical: $5,000 - $50,000</span>
            </div>
            <div>
              <span className="font-medium">High: $1,000 - $5,000</span>
            </div>
            <div>
              <span className="font-medium">Medium: $100 - $1,000</span>
            </div>
            <div>
              <span className="font-medium">Low: $50 - $100</span>
            </div>
            <p className="text-muted-foreground mt-4">
              Rewards are determined based on impact, exploitability, and report quality.
            </p>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Scope</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">In Scope:</span>
            <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
              <li>Smart contract vulnerabilities</li>
              <li>API security issues</li>
              <li>Authentication and authorization flaws</li>
              <li>Frontend security vulnerabilities</li>
              <li>Backend security issues</li>
            </ul>
          </div>
          <div className="mt-4">
            <span className="font-medium">Out of Scope:</span>
            <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
              <li>Social engineering attacks</li>
              <li>Physical security</li>
              <li>Denial of service attacks</li>
              <li>Issues requiring physical access</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Report a Vulnerability</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use the security reporting endpoint or contact security@vectix-nexus.com
        </p>
        <div className="bg-secondary/50 p-4 rounded-lg">
          <code className="text-xs">
            POST /api/security/bug-report
          </code>
        </div>
      </div>
    </div>
  );
}
