'use client';

import { AgentFleetCard } from './agent-fleet-card';
import { useAgents } from '@/lib/hooks/use-agents';
import { Button } from '@/components/ui/button';
import { Plus, Rocket, Bot, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export function FleetGrid() {
  const { agents, isLoading, refresh } = useAgents();
  const runningCount = agents.filter(a => a.status === 'running').length;

  if (isLoading) return <LoadingState />;
  if (agents.length === 0) return <EmptyState />;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/30 shrink-0">
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">My Fleet</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              <span className="text-teal-400 font-medium">{runningCount} Active</span>
              <span className="mx-1 sm:mx-1.5 text-slate-500">/</span>
              <span>{totalCount} Total Agents</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2 ml-12 sm:ml-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400 hover:border-teal-500/30"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link href="/create">
            <Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20 text-xs sm:text-sm">
              <Plus className="w-4 h-4" /> Deploy New
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50" />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-32 bg-slate-800 rounded animate-pulse mb-2" />
          <div className="h-5 w-48 bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10" />
              <div>
                <div className="h-5 w-24 bg-slate-700 rounded mb-1" />
                <div className="h-3 w-16 bg-slate-700 rounded" />
              </div>
            </div>
            <div className="h-16 rounded-xl bg-slate-800/80 border border-slate-700/50" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full">
      <div className="relative rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-8 sm:p-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg shadow-teal-500/25 ring-2 ring-teal-500/30 ring-offset-2 ring-offset-slate-950">
            <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-sm" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-white">Deploy Your First Agent</h2>
          <div className="w-16 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mx-auto mb-4 sm:mb-6" />
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-md mx-auto">
            Create an AI agent that trades crypto, manages social media, or executes custom strategies automatically.
          </p>
          <Link href="/create" className="inline-flex">
            <Button
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base"
            >
              <Rocket className="w-5 h-5" /> Launch Agent
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
