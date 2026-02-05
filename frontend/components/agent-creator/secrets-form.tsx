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

const CARD = 'rounded-2xl border border-primary/20 bg-card p-6 shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]';
const ICON_BOX = 'w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30';
const INPUT_CLASS = 'rounded-xl bg-background/80 border border-primary/20 focus:ring-2 focus:ring-primary focus:border-primary/40 font-mono transition-colors';

export function SecretsForm({ onSecretsChange, secrets, onBack, onNext }: SecretsFormProps) {
  const [showTwitter, setShowTwitter] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const update = (key: keyof AgentSecrets, value: string) => onSecretsChange({ ...secrets, [key]: value || undefined });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className={ICON_BOX}>
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Bring Your Own Keys</h3>
            <p className="text-sm text-muted-foreground">Your keys are encrypted with AES-256 and never exposed</p>
          </div>
        </div>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mt-4" />
      </div>

      <div className={CARD}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              OpenAI API Key <span className="text-xs text-primary flex items-center gap-1"><Check className="w-3 h-3" /> Recommended</span>
            </Label>
            <Input
              type="password"
              placeholder="sk-..."
              value={secrets.openaiApiKey || ''}
              onChange={(e) => update('openaiApiKey', e.target.value)}
              className={`${INPUT_CLASS} h-11`}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Anthropic API Key</Label>
            <Input
              type="password"
              placeholder="sk-ant-..."
              value={secrets.anthropicApiKey || ''}
              onChange={(e) => update('anthropicApiKey', e.target.value)}
              className={`${INPUT_CLASS} h-11`}
            />
          </div>
        </div>
      </div>

      <div className={CARD}>
        <button
          type="button"
          onClick={() => setShowTwitter(!showTwitter)}
          className="w-full text-left flex items-center justify-between py-2 rounded-xl hover:bg-primary/5 transition-colors -m-2 p-2"
        >
          <span className="flex items-center gap-3">
            <div className={ICON_BOX}>
              <Twitter className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium text-foreground">Twitter Integration</span>
          </span>
          <span className="flex items-center gap-2">
            {secrets.twitterUsername && (
              <span className="text-xs text-primary flex items-center gap-1"><Check className="w-3 h-3" /> Configured</span>
            )}
            {showTwitter ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </span>
        </button>
        {showTwitter && (
          <div className="space-y-3 mt-4 pt-4 border-t border-primary/20">
            <Input placeholder="@username" value={secrets.twitterUsername || ''} onChange={(e) => update('twitterUsername', e.target.value)} className={`${INPUT_CLASS} h-10 text-sm`} />
            <Input type="password" placeholder="Password" value={secrets.twitterPassword || ''} onChange={(e) => update('twitterPassword', e.target.value)} className={`${INPUT_CLASS} h-10 text-sm`} />
            <Input type="email" placeholder="Email" value={secrets.twitterEmail || ''} onChange={(e) => update('twitterEmail', e.target.value)} className={`${INPUT_CLASS} h-10 text-sm`} />
          </div>
        )}
      </div>

      <div className={CARD}>
        <button
          type="button"
          onClick={() => setShowOther(!showOther)}
          className="w-full text-left flex items-center justify-between py-2 rounded-xl hover:bg-primary/5 transition-colors -m-2 p-2"
        >
          <span className="flex items-center gap-3">
            <div className={ICON_BOX}>
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium text-foreground">Other Integrations</span>
          </span>
          {showOther ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {showOther && (
          <div className="space-y-3 mt-4 pt-4 border-t border-primary/20">
            <Input type="password" placeholder="Discord Bot Token" value={secrets.discordToken || ''} onChange={(e) => update('discordToken', e.target.value)} className={`${INPUT_CLASS} h-10 text-sm`} />
            <Input type="password" placeholder="Telegram Bot Token" value={secrets.telegramToken || ''} onChange={(e) => update('telegramToken', e.target.value)} className={`${INPUT_CLASS} h-10 text-sm`} />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button size="lg" variant="outline" onClick={onBack} className="flex-1 border-primary/30 hover:bg-primary/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button size="lg" onClick={onNext} className="flex-1 shadow-[0_0_16px_-4px_hsl(var(--primary)_/_0.4)]">
          Review <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
