'use client';

import { useState } from 'react';
import { generateCharacterConfig } from '@/lib/agent-creator/generate-character-config';
import { mergeStrategyIntoConfig } from '@/lib/agent-creator/merge-strategy';
import type { AgentCreatorFormData } from '@/lib/agent-creator/agent-creator.types';
import { ConfigForm } from './config-form';
import { SecretsForm } from './secrets-form';
import { ReviewStep } from './review-step';
import { AgentSecrets, deployAgent } from '@/lib/api/client';
import type { Strategy } from '@/lib/api/marketplace';
import { Settings, Key, Rocket, ChevronRight } from 'lucide-react';

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
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Create Your AI Agent</h1>
        <p className="text-muted-foreground">Configure, connect, and deploy in minutes</p>
      </div>

      <div className="flex justify-center mb-10">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => (s.id === 'config' || generatedJson) && setStep(s.id)}
              disabled={s.id !== 'config' && !generatedJson}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                step === s.id ? 'bg-primary text-background' : 'text-muted-foreground hover:text-foreground'
              } ${s.id !== 'config' && !generatedJson ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <s.icon className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-border mx-2" />}
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-8">
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
