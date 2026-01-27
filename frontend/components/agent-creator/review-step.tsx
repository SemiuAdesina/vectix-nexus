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

export function ReviewStep({ generatedJson, secrets, isDeploying, deployResult, onBack, onDeploy }: ReviewStepProps) {
  const checks = [
    { label: 'OpenAI API Key', ok: !!secrets.openaiApiKey },
    { label: 'Anthropic API Key', ok: !!secrets.anthropicApiKey },
    { label: 'Twitter Integration', ok: !!secrets.twitterUsername },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Rocket className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Review & Deploy</h3>
        <p className="text-sm text-muted-foreground">Verify your configuration before deployment</p>
      </div>

      <div className="space-y-3">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center justify-between py-2 px-4 rounded-lg bg-secondary">
            <span className="text-sm">{c.label}</span>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${c.ok ? 'bg-success/20 text-success' : 'bg-secondary text-muted-foreground'}`}>
              {c.ok ? <><Check className="w-3 h-3" /> Ready</> : <><X className="w-3 h-3" /> Not set</>}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <div className="px-4 py-2 bg-secondary text-xs font-medium text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-2"><FileJson className="w-4 h-4" /> Character Config</span>
          <span className="font-mono">{generatedJson.length} bytes</span>
        </div>
        <div className="bg-background p-4 max-h-[200px] overflow-auto">
          <pre className="text-xs font-mono text-foreground/70">{generatedJson}</pre>
        </div>
      </div>

      <div className="flex gap-3">
        <Button size="lg" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="lg" onClick={onDeploy} disabled={isDeploying} className="flex-1">
          {isDeploying ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Deploying...</>
          ) : (
            <><Rocket className="w-4 h-4" /> Deploy Agent</>
          )}
        </Button>
      </div>

      {deployResult && (
        <div className={`p-4 rounded-lg ${deployResult.success ? 'bg-success/10 border border-success/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          <p className={`text-sm font-medium flex items-center gap-2 ${deployResult.success ? 'text-success' : 'text-red-400'}`}>
            {deployResult.success ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {deployResult.message}
          </p>
          {deployResult.success && (
            <Link href="/dashboard" className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
