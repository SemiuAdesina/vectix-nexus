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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-w-0">
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
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_-4px_hsl(var(--primary)_/_0.2)]">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Fleet</h1>
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">{runningCount} Active</span>
              <span className="mx-1.5 text-muted-foreground">/</span>
              <span>{totalCount} Total Agents</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} className="border-primary/30 hover:bg-primary/10">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link href="/create">
            <Button size="sm" className="shadow-[0_0_16px_-4px_hsl(var(--primary)_/_0.4)]">
              <Plus className="w-4 h-4" /> Deploy New
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50" />
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
          <div key={i} className="rounded-2xl border border-primary/20 bg-card p-5 animate-pulse shadow-[0_0_24px_-8px_hsl(var(--primary)_/_0.08)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10" />
              <div>
                <div className="h-5 w-24 bg-primary/10 rounded mb-1" />
                <div className="h-3 w-16 bg-primary/10 rounded" />
              </div>
            </div>
            <div className="h-16 rounded-xl bg-background/80 border border-primary/20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full">
      <div className="relative rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm p-12 text-center overflow-hidden shadow-[0_0_40px_-12px_hsl(var(--primary)/0.2),inset_0_1px_0_hsl(var(--primary)/0.05)]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center mx-auto mb-6 shadow-[0_0_32px_-8px_hsl(var(--primary)/0.5),0_8px_24px_-8px_rgba(0,0,0,0.4)] ring-2 ring-primary/30 ring-offset-2 ring-offset-[hsl(var(--card))]">
            <Bot className="w-10 h-10 text-primary-foreground drop-shadow-sm" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
            Deploy Your First Agent
          </h2>
          <div className="w-16 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 mx-auto mb-6" />
          <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md mx-auto">
            Create an AI agent that trades crypto, manages social media, or executes custom strategies automatically.
          </p>
          <Link href="/create" className="inline-flex">
            <Button
              size="lg"
              className="shadow-[0_0_24px_-6px_hsl(var(--primary)_/_0.4)] hover:shadow-[0_0_32px_-8px_hsl(var(--primary)_/_0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Rocket className="w-5 h-5" /> Launch Agent
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

