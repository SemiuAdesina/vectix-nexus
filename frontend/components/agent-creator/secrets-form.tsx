'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AgentSecrets } from '@/lib/api/client';
import { Shield, Twitter, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, MessageCircle, Check } from 'lucide-react';

interface SecretsFormProps {
  onSecretsChange: (secrets: AgentSecrets) => void;
  secrets: AgentSecrets;
  onBack: () => void;
  onNext: () => void;
}

export function SecretsForm({ onSecretsChange, secrets, onBack, onNext }: SecretsFormProps) {
  const [showTwitter, setShowTwitter] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const update = (key: keyof AgentSecrets, value: string) => onSecretsChange({ ...secrets, [key]: value || undefined });

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Bring Your Own Keys</h3>
        <p className="text-sm text-muted-foreground">Your keys are encrypted with AES-256 and never exposed</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            OpenAI API Key <span className="text-xs text-success flex items-center gap-1"><Check className="w-3 h-3" /> Recommended</span>
          </Label>
          <Input type="password" placeholder="sk-..." value={secrets.openaiApiKey || ''} onChange={(e) => update('openaiApiKey', e.target.value)}
            className="bg-secondary border-border focus:border-primary h-11 font-mono" />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Anthropic API Key</Label>
          <Input type="password" placeholder="sk-ant-..." value={secrets.anthropicApiKey || ''} onChange={(e) => update('anthropicApiKey', e.target.value)}
            className="bg-secondary border-border focus:border-primary h-11 font-mono" />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <button type="button" onClick={() => setShowTwitter(!showTwitter)}
          className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between py-2">
          <span className="flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter Integration</span>
          <span className="flex items-center gap-2">
            {secrets.twitterUsername && <span className="text-xs text-success flex items-center gap-1"><Check className="w-3 h-3" /> Configured</span>}
            {showTwitter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>
        {showTwitter && (
          <div className="space-y-3 mt-3 pl-4 border-l border-border">
            <Input placeholder="@username" value={secrets.twitterUsername || ''} onChange={(e) => update('twitterUsername', e.target.value)}
              className="bg-secondary border-border h-10 text-sm" />
            <Input type="password" placeholder="Password" value={secrets.twitterPassword || ''} onChange={(e) => update('twitterPassword', e.target.value)}
              className="bg-secondary border-border h-10 text-sm" />
            <Input type="email" placeholder="Email" value={secrets.twitterEmail || ''} onChange={(e) => update('twitterEmail', e.target.value)}
              className="bg-secondary border-border h-10 text-sm" />
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <button type="button" onClick={() => setShowOther(!showOther)}
          className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between py-2">
          <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Other Integrations</span>
          {showOther ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showOther && (
          <div className="space-y-3 mt-3 pl-4 border-l border-border">
            <Input type="password" placeholder="Discord Bot Token" value={secrets.discordToken || ''} onChange={(e) => update('discordToken', e.target.value)}
              className="bg-secondary border-border h-10 text-sm" />
            <Input type="password" placeholder="Telegram Bot Token" value={secrets.telegramToken || ''} onChange={(e) => update('telegramToken', e.target.value)}
              className="bg-secondary border-border h-10 text-sm" />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button size="lg" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="lg" onClick={onNext} className="flex-1">
          Review <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
