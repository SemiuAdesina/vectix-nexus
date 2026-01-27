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
import { Settings, Key, Rocket } from 'lucide-react';

type Step = 'config' | 'secrets' | 'review';

const steps: { id: Step; label: string; icon: typeof Settings }[] = [
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
      <div className="text-center mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create Your AI Agent</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Configure, connect, and deploy in minutes</p>
      </div>

      {/* Modern Step Indicator */}
      <div className="flex items-center justify-center mb-8 sm:mb-10">
        {steps.map((s, i) => {
          const stepIndex = steps.findIndex(st => st.id === step);
          const isActive = step === s.id;
          const isCompleted = i < stepIndex;
          const isClickable = s.id === 'config' || generatedJson;

          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => isClickable && setStep(s.id)}
                disabled={!isClickable}
                className={`relative flex flex-col items-center group ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary text-background shadow-lg shadow-primary/30 scale-110' :
                  isCompleted ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                  } ${isClickable && !isActive ? 'group-hover:bg-primary/10' : ''}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className={`mt-2 text-xs sm:text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}>{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors ${i < stepIndex ? 'bg-primary' : 'bg-border'
                  }`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="glass rounded-xl p-4 sm:p-8">
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
  );
}
