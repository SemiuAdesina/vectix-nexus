'use client';

import { Shield, AlertTriangle, DollarSign, CheckCircle2, Send } from 'lucide-react';

const CARD_CLASS = 'rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-[0_0_24px_-8px_rgba(20,184,166,0.08)]';
const ICON_BOX_CLASS = 'w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30';

export default function BugBountyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-white">Bug Bounty Program</h1>
        <p className="text-slate-400">
          Help us secure the platform and earn rewards for finding vulnerabilities
        </p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-4" />
      </div>

      <div className={CARD_CLASS}>
        <div className="flex items-center gap-3 mb-4">
          <div className={ICON_BOX_CLASS}>
            <Shield className="w-5 h-5 text-teal-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Program Overview</h2>
        </div>
        <div className="space-y-3 text-sm text-slate-400">
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
              <AlertTriangle className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Severity Levels</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
              <span className="font-medium text-red-400">Critical</span>
              <p className="text-slate-400 mt-0.5">Remote code execution, fund loss, data breach</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
              <span className="font-medium text-orange-400">High</span>
              <p className="text-slate-400 mt-0.5">Authentication bypass, privilege escalation</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
              <span className="font-medium text-amber-400">Medium</span>
              <p className="text-slate-400 mt-0.5">Information disclosure, CSRF, XSS</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
              <span className="font-medium text-sky-400">Low</span>
              <p className="text-slate-400 mt-0.5">Minor issues, best practice violations</p>
            </div>
          </div>
        </div>

        <div className={CARD_CLASS}>
          <div className="flex items-center gap-3 mb-4">
            <div className={ICON_BOX_CLASS}>
              <DollarSign className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Rewards</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
              <span className="text-slate-400">Critical</span>
              <span className="font-medium text-white">$5,000 - $50,000</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
              <span className="text-slate-400">High</span>
              <span className="font-medium text-white">$1,000 - $5,000</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
              <span className="text-slate-400">Medium</span>
              <span className="font-medium text-white">$100 - $1,000</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-800/50">
              <span className="text-slate-400">Low</span>
              <span className="font-medium text-white">$50 - $100</span>
            </div>
            <p className="text-slate-400 mt-4 text-sm">
              Rewards are determined based on impact, exploitability, and report quality.
            </p>
          </div>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex items-center gap-3 mb-4">
          <div className={ICON_BOX_CLASS}>
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Scope</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-white">In Scope:</span>
            <ul className="list-disc list-inside ml-4 mt-1 text-slate-400">
              <li>Smart contract vulnerabilities</li>
              <li>API security issues</li>
              <li>Authentication and authorization flaws</li>
              <li>Frontend security vulnerabilities</li>
              <li>Backend security issues</li>
            </ul>
          </div>
          <div className="mt-4">
            <span className="font-medium text-white">Out of Scope:</span>
            <ul className="list-disc list-inside ml-4 mt-1 text-slate-400">
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
            <Send className="w-5 h-5 text-teal-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Report a Vulnerability</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Use the security reporting endpoint or contact security@vectix-nexus.com
        </p>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/80">
          <code className="text-sm font-mono text-teal-400">POST /api/security/bug-report</code>
        </div>
      </div>
    </div>
  );
}
