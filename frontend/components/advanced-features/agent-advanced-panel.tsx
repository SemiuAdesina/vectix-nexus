'use client';

import { PreflightStatsCard } from './preflight-stats';
import { SupervisorRulesCard } from './supervisor-rules';
import { ShadowModeCard } from './shadow-mode';

interface AgentAdvancedPanelProps {
  agentId: string;
}

export function AgentAdvancedPanel({ agentId }: AgentAdvancedPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <PreflightStatsCard agentId={agentId} />
        <ShadowModeCard agentId={agentId} />
      </div>
      <SupervisorRulesCard />
    </div>
  );
}

