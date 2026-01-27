'use client';

import { AgentFleetCard } from './agent-fleet-card';
import { useAgents } from '@/lib/hooks/use-agents';
import { Button } from '@/components/ui/button';
import { Plus, Rocket, Bot, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export function FleetGrid() {
  const { agents, isLoading, refresh } = useAgents();
  const runningCount = agents.filter(a => a.status === 'running').length;

  if (isLoading) {
    return <LoadingState />;
  }

  if (agents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="w-full">
      <FleetHeader runningCount={runningCount} totalCount={agents.length} onRefresh={refresh} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(400px,1fr))]">
        {agents.map(agent => (
          <AgentFleetCard key={agent.id} agent={agent} onAction={refresh} />
        ))}
      </div>
    </div>
  );
}

function FleetHeader({
  runningCount,
  totalCount,
  onRefresh,
}: {
  runningCount: number;
  totalCount: number;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">My Fleet</h1>
        <p className="text-muted-foreground">
          <span className="text-success font-medium">{runningCount} Active</span>
          <span className="mx-2">/</span>
          <span>{totalCount} Total Agents</span>
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Link href="/create">
          <Button size="sm">
            <Plus className="w-4 h-4" /> Deploy New
          </Button>
        </Link>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-32 bg-secondary rounded animate-pulse mb-2" />
          <div className="h-5 w-48 bg-secondary rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-xl p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary rounded-lg" />
              <div>
                <div className="h-5 w-24 bg-secondary rounded mb-1" />
                <div className="h-3 w-16 bg-secondary rounded" />
              </div>
            </div>
            <div className="h-16 bg-zinc-900 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full">
      <div className="glass rounded-xl p-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Bot className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Deploy Your First Agent</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Create an AI agent that trades crypto, manages social media, or executes custom strategies automatically.
        </p>
        <Link href="/create">
          <Button size="lg">
            <Rocket className="w-5 h-5" /> Launch Agent
          </Button>
        </Link>
      </div>
    </div>
  );
}

