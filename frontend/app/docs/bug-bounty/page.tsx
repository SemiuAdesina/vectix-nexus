'use client';

import { Shield, AlertTriangle, DollarSign, CheckCircle2, Send } from 'lucide-react';

const CARD_CLASS = 'rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]';
const ICON_BOX_CLASS = 'w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30';

export default function BugBountyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">Bug Bounty Program</h1>
          <p className="text-muted-foreground">
            Help us secure the platform and earn rewards for finding vulnerabilities
          </p>
          <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
        </div>

        <div className={CARD_CLASS}>
          <div className="flex items-center gap-3 mb-4">
            <div className={ICON_BOX_CLASS}>
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Program Overview</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
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
          <div className={CARD_CLASS}>
            <div className="flex items-center gap-3 mb-4">
              <div className={ICON_BOX_CLASS}>
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Severity Levels</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl border border-primary/20 bg-background/50">
                <span className="font-medium text-destructive">Critical</span>
                <p className="text-muted-foreground mt-0.5">Remote code execution, fund loss, data breach</p>
              </div>
              <div className="p-3 rounded-xl border border-primary/20 bg-background/50">
                <span className="font-medium text-orange-500">High</span>
                <p className="text-muted-foreground mt-0.5">Authentication bypass, privilege escalation</p>
              </div>
              <div className="p-3 rounded-xl border border-primary/20 bg-background/50">
                <span className="font-medium text-amber-500">Medium</span>
                <p className="text-muted-foreground mt-0.5">Information disclosure, CSRF, XSS</p>
              </div>
              <div className="p-3 rounded-xl border border-primary/20 bg-background/50">
                <span className="font-medium text-blue-500">Low</span>
                <p className="text-muted-foreground mt-0.5">Minor issues, best practice violations</p>
              </div>
            </div>
          </div>

          <div className={CARD_CLASS}>
            <div className="flex items-center gap-3 mb-4">
              <div className={ICON_BOX_CLASS}>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Rewards</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-3 rounded-xl border border-primary/20 bg-background/50">
                <span className="text-muted-foreground">Critical</span>
                <span className="font-medium text-foreground">$5,000 - $50,000</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl border border-primary/20 bg-background/50">
                <span className="text-muted-foreground">High</span>
                <span className="font-medium text-foreground">$1,000 - $5,000</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl border border-primary/20 bg-background/50">
                <span className="text-muted-foreground">Medium</span>
                <span className="font-medium text-foreground">$100 - $1,000</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl border border-primary/20 bg-background/50">
                <span className="text-muted-foreground">Low</span>
                <span className="font-medium text-foreground">$50 - $100</span>
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                Rewards are determined based on impact, exploitability, and report quality.
              </p>
            </div>
          </div>
        </div>

        <div className={CARD_CLASS}>
          <div className="flex items-center gap-3 mb-4">
            <div className={ICON_BOX_CLASS}>
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Scope</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-foreground">In Scope:</span>
              <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                <li>Smart contract vulnerabilities</li>
                <li>API security issues</li>
                <li>Authentication and authorization flaws</li>
                <li>Frontend security vulnerabilities</li>
                <li>Backend security issues</li>
              </ul>
            </div>
            <div className="mt-4">
              <span className="font-medium text-foreground">Out of Scope:</span>
              <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                <li>Social engineering attacks</li>
                <li>Physical security</li>
                <li>Denial of service attacks</li>
                <li>Issues requiring physical access</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={CARD_CLASS}>
          <div className="flex items-center gap-3 mb-4">
            <div className={ICON_BOX_CLASS}>
              <Send className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Report a Vulnerability</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Use the security reporting endpoint or contact security@vectix-nexus.com
          </p>
          <div className="p-4 rounded-xl border border-primary/20 bg-background/80">
            <code className="text-sm font-mono text-primary">POST /api/security/bug-report</code>
          </div>
        </div>
      </div>
    </div>
  );
}
