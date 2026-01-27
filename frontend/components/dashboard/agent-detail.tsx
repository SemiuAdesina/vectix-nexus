'use client';

import { Button } from '@/components/ui/button';
import { Agent } from '@/lib/api/client';
import { AgentLogs } from './agent-logs';
import { AgentWallet } from './agent-wallet';
import { TokenLauncher } from './token-launcher';
import { AgentAdvancedPanel } from '@/components/advanced-features';
import { useState } from 'react';
import { X, ScrollText, Wallet, Coins, Settings, Bot, Shield } from 'lucide-react';

interface AgentDetailProps {
  agent: Agent;
  onClose: () => void;
}

type Tab = 'logs' | 'wallet' | 'token' | 'advanced' | 'config';

const tabs: { id: Tab; label: string; icon: typeof ScrollText }[] = [
  { id: 'logs', label: 'Logs', icon: ScrollText },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'token', label: 'Token', icon: Coins },
  { id: 'advanced', label: 'Security', icon: Shield },
  { id: 'config', label: 'Config', icon: Settings },
];

export function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('logs');

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{agent.name}</h2>
            <p className="text-xs text-muted-foreground font-mono">{agent.id.slice(0, 8)}...</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'logs' && <AgentLogs agentId={agent.id} isRunning={agent.status === 'running'} />}
        {activeTab === 'wallet' && <AgentWallet agentId={agent.id} walletAddress={agent.walletAddress} />}
        {activeTab === 'token' && <TokenLauncher agentId={agent.id} agentName={agent.name} />}
        {activeTab === 'advanced' && <AgentAdvancedPanel agentId={agent.id} />}
        {activeTab === 'config' && (
          <div className="bg-background rounded-lg p-4 font-mono text-xs overflow-auto max-h-[400px] border border-border">
            <pre className="text-foreground/80">{JSON.stringify(agent, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
