'use client';

import { Button } from '@/components/ui/button';
import type { AgentSecrets } from '@/lib/api/client';
import Link from 'next/link';
import { Check, X, ArrowLeft, Rocket, Loader2, ArrowRight, FileJson } from 'lucide-react';

interface ReviewStepProps {
  generatedJson: string;
  secrets: AgentSecrets;
  isDeploying: boolean;
  deployResult: { success: boolean; message: string } | null;
  onBack: () => void;
  onDeploy: () => void;
}

const CARD = 'rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6';
const ICON_BOX = 'w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30';

export function ReviewStep({ generatedJson, secrets, isDeploying, deployResult, onBack, onDeploy }: ReviewStepProps) {
  const checks = [
    { label: 'OpenAI API Key', ok: !!secrets.openaiApiKey },
    { label: 'Anthropic API Key', ok: !!secrets.anthropicApiKey },
    { label: 'Twitter Integration', ok: !!secrets.twitterUsername },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className={ICON_BOX}>
            <Rocket className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Review & Deploy</h3>
            <p className="text-sm text-slate-400">Verify your configuration before deployment</p>
          </div>
        </div>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-4" />
      </div>

      <div className={CARD}>
        <div className="space-y-2">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center justify-between p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-teal-500/30 transition-colors">
              <span className="text-sm font-medium text-white">{c.label}</span>
              <span className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium ${c.ok ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30' : 'bg-slate-800 text-slate-500 border border-slate-600'}`}>
                {c.ok ? <><Check className="w-3 h-3" /> Ready</> : <><X className="w-3 h-3" /> Not set</>}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={CARD}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={ICON_BOX}>
              <FileJson className="w-5 h-5 text-teal-400" />
            </div>
            <span className="font-semibold text-white">Character Config</span>
          </div>
          <span className="text-xs font-mono text-slate-400">{generatedJson.length} bytes</span>
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-950/80 p-4 max-h-[200px] overflow-auto">
          <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words">{generatedJson}</pre>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button size="lg" variant="outline" onClick={onBack} className="flex-1 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400 hover:border-teal-500/30">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button size="lg" onClick={onDeploy} disabled={isDeploying} className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20 disabled:opacity-50">
          {isDeploying ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Deploying...</> : <><Rocket className="w-4 h-4 mr-2" /> Deploy Agent</>}
        </Button>
      </div>

      {deployResult && (
        <div className={`rounded-2xl border p-5 ${deployResult.success ? 'bg-teal-500/10 border-teal-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <p className={`text-sm font-medium flex items-center gap-2 ${deployResult.success ? 'text-teal-400' : 'text-red-400'}`}>
            {deployResult.success ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {deployResult.message}
          </p>
          {deployResult.success && (
            <Link href="/dashboard" className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
