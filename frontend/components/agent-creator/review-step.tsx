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

const CARD = 'rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]';
const ICON_BOX = 'w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30';

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
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Review & Deploy</h3>
            <p className="text-sm text-muted-foreground">Verify your configuration before deployment</p>
          </div>
        </div>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
      </div>

      <div className={CARD}>
        <div className="space-y-2">
          {checks.map((c) => (
            <div
              key={c.label}
              className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-background/50 hover:border-primary/40 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{c.label}</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium ${
                  c.ok ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-background/80 text-muted-foreground border border-primary/20'
                }`}
              >
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
              <FileJson className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Character Config</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">{generatedJson.length} bytes</span>
        </div>
        <div className="rounded-xl border border-primary/20 bg-background/80 p-4 max-h-[200px] overflow-auto">
          <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap break-words">{generatedJson}</pre>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button size="lg" variant="outline" onClick={onBack} className="flex-1 border-primary/30 hover:bg-primary/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button size="lg" onClick={onDeploy} disabled={isDeploying} className="flex-1 shadow-[0_0_16px_-4px_hsl(var(--primary)_/_0.4)]">
          {isDeploying ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Deploying...</>
          ) : (
            <><Rocket className="w-4 h-4 mr-2" /> Deploy Agent</>
          )}
        </Button>
      </div>

      {deployResult && (
        <div
          className={`rounded-2xl border p-5 ${
            deployResult.success ? 'bg-primary/10 border-primary/30' : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <p className={`text-sm font-medium flex items-center gap-2 ${deployResult.success ? 'text-primary' : 'text-red-400'}`}>
            {deployResult.success ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {deployResult.message}
          </p>
          {deployResult.success && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
