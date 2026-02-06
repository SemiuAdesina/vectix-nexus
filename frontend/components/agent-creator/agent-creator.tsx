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
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Create Your AI Agent</h1>
        <p className="text-slate-400 text-base">Configure, connect, and deploy in minutes</p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mx-auto mt-4" />
      </div>

      <div className="mb-10 rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4">
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
                        ? 'border-teal-500 bg-teal-500/20 text-teal-400 shadow-[0_0_16px_-4px_rgba(20,184,166,0.35)]'
                        : isCompleted
                          ? 'border-teal-500/40 bg-teal-500/10 text-teal-400'
                          : 'border-slate-600 bg-slate-800/80 text-slate-400 group-hover:border-teal-500/40 group-hover:bg-teal-500/5'
                    } ${isDisabled ? 'group-hover:border-slate-600 group-hover:bg-slate-800/80' : ''}`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">Step {i + 1}</span>
                    <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>{s.label}</p>
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 min-w-6 flex-1 max-w-16 rounded-full ${
                      stepIndex > i ? 'bg-teal-500/60' : 'bg-slate-700'
                    }`}
                    aria-hidden
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent transition-opacity duration-500 ease-out"
          style={{ opacity: step === 'config' ? 1 : 0 }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tl from-teal-500/10 via-teal-500/5 to-transparent transition-opacity duration-500 ease-out"
          style={{ opacity: step === 'secrets' ? 1 : 0 }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/15 via-cyan-500/5 to-transparent transition-opacity duration-500 ease-out"
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
