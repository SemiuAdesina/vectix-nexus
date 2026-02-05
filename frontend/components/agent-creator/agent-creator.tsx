'use client';

import React, { useState } from 'react';
import { generateCharacterConfig } from '@/lib/agent-creator/generate-character-config';
import { mergeStrategyIntoConfig } from '@/lib/agent-creator/merge-strategy';
import type { AgentCreatorFormData } from '@/lib/agent-creator/agent-creator.types';
import { ConfigForm } from './config-form';
import { SecretsForm } from './secrets-form';
import { ReviewStep } from './review-step';
import { AgentSecrets, deployAgent } from '@/lib/api/client';
import type { Strategy } from '@/lib/api/marketplace';
import { Settings, Key, Rocket, Check } from 'lucide-react';

type Step = 'config' | 'secrets' | 'review';

const STEPS: { id: Step; label: string; icon: typeof Settings }[] = [
  { id: 'config', label: 'Configure', icon: Settings },
  { id: 'secrets', label: 'API Keys', icon: Key },
  { id: 'review', label: 'Deploy', icon: Rocket },
];

export function AgentCreator() {
  const [formData, setFormData] = useState<AgentCreatorFormData>({
    name: '', bio: '', tickerSymbol: '', riskLevel: 'Medium', tradingStrategy: 'Copy Trader',
  });
  const [secrets, setSecrets] = useState<AgentSecrets>({});
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [generatedJson, setGeneratedJson] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ success: boolean; message: string } | null>(null);
  const [step, setStep] = useState<Step>('config');

  const handleGenerateJson = () => {
    const baseConfigStr = generateCharacterConfig(formData);
    let finalConfig = JSON.parse(baseConfigStr);
    if (selectedStrategy) {
      finalConfig = mergeStrategyIntoConfig(finalConfig, selectedStrategy.configJson);
    }
    setGeneratedJson(JSON.stringify(finalConfig, null, 2));
    setStep('secrets');
  };

  const handleDeploy = async () => {
    if (!generatedJson || (!secrets.openaiApiKey && !secrets.anthropicApiKey)) {
      setDeployResult({ success: false, message: 'At least one AI provider API key is required' });
      return;
    }
    setIsDeploying(true);
    setDeployResult(null);
    try {
      const result = await deployAgent({ characterJson: JSON.parse(generatedJson), secrets });
      setDeployResult({
        success: result.success,
        message: result.success ? `Agent deployed! ID: ${result.agentId}` : result.error || 'Deployment failed',
      });
    } catch (e) {
      setDeployResult({ success: false, message: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Create Your AI Agent</h1>
        <p className="text-muted-foreground text-base">Configure, connect, and deploy in minutes</p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mx-auto mt-4" />
      </div>

      <div className="mb-10 rounded-2xl border border-primary/20 bg-card/60 p-4 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const stepIndex = STEPS.findIndex((st) => st.id === step);
            const isActive = step === s.id;
            const deploySuccess = deployResult?.success === true;
            const isCompleted = stepIndex > i || (i === 2 && deploySuccess);
            const isClickable = s.id === 'config' || !!generatedJson;
            const isDisabled = !isClickable;

            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  onClick={() => isClickable && setStep(s.id)}
                  disabled={isDisabled}
                  className={`group flex flex-1 flex-col items-center gap-2 sm:flex-row sm:gap-3 ${
                    isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
                      isActive
                        ? 'border-primary bg-primary/20 text-primary shadow-[0_0_16px_-4px_hsl(var(--primary)_/_0.35)]'
                        : isCompleted
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-primary/20 bg-background/80 text-muted-foreground group-hover:border-primary/40 group-hover:bg-primary/5'
                    } ${isDisabled ? 'group-hover:border-primary/20 group-hover:bg-background/80' : ''}`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">Step {i + 1}</span>
                    <p className={`text-sm font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</p>
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 min-w-6 flex-1 max-w-16 rounded-full ${
                      stepIndex > i ? 'bg-primary/60' : 'bg-primary/20'
                    }`}
                    aria-hidden
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm p-8 shadow-[0_0_40px_-12px_hsl(var(--primary)_/_0.15),inset_0_1px_0_hsl(var(--primary)_/_0.05)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/8 to-transparent transition-opacity duration-500 ease-out"
          style={{ opacity: step === 'config' ? 1 : 0 }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tl from-primary/25 via-primary/10 to-transparent transition-opacity duration-500 ease-out"
          style={{ opacity: step === 'secrets' ? 1 : 0 }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/30 via-primary/12 to-primary/5 transition-opacity duration-500 ease-out"
          style={{ opacity: step === 'review' ? 1 : 0 }}
        />
        <div className="relative z-10">
          {step === 'config' && (
            <ConfigForm formData={formData} onFormDataChange={setFormData} onSubmit={handleGenerateJson} selectedStrategy={selectedStrategy} onStrategySelect={setSelectedStrategy} />
          )}
          {step === 'secrets' && (
            <SecretsForm secrets={secrets} onSecretsChange={setSecrets} onBack={() => setStep('config')} onNext={() => setStep('review')} />
          )}
          {step === 'review' && (
            <ReviewStep generatedJson={generatedJson} secrets={secrets} isDeploying={isDeploying} deployResult={deployResult} onBack={() => setStep('secrets')} onDeploy={handleDeploy} />
          )}
        </div>
      </div>
    </div>
  );
}
