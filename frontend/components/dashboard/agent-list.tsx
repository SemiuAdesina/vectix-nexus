'use client';

import { Button } from '@/components/ui/button';
import { Agent } from '@/lib/api/client';
import { AgentCard } from './agent-card';
import Link from 'next/link';
import { Bot, Plus } from 'lucide-react';

interface AgentListProps {
  agents: Agent[];
  onUpdate: () => void;
  onSelect: (agent: Agent) => void;
}

export function AgentList({ agents, onUpdate, onSelect }: AgentListProps) {
  if (agents.length === 0) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
          <Bot className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-6">No agents yet</p>
        <Link href="/create">
          <Button size="lg" className="w-full">
            <Plus className="w-4 h-4" /> Create Your First Agent
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} onUpdate={onUpdate} onSelect={onSelect} />
      ))}
    </div>
  );
}
