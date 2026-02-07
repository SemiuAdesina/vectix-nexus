'use client';

import { useState } from 'react';
import { Shield, Brain, Ghost, Lock } from 'lucide-react';
import { RiskDisclaimer } from '@/components/risk-disclaimer';
import {
  PreflightStatsCard,
  SupervisorRulesCard,
  ShadowModeCard,
  TEEStatusCard
} from '@/components/advanced-features';

export default function AdvancedFeaturesPage() {
  const [selectedAgentId] = useState('demo-agent-1');

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <RiskDisclaimer />
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white">Security & Intelligence Suite</h1>
        <p className="text-sm sm:text-base text-slate-400">
          Enterprise-grade features that make your AI agents robust, secure, and profitable.
        </p>
        <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500/50 mt-3 sm:mt-4" />
      </div>

      <div className="grid gap-4 sm:gap-6">
        <FeatureSection
          icon={<Shield className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />}
          title="Transaction Protection"
          description="Pre-flight simulation prevents rug-pulls and bad trades"
        >
          <PreflightStatsCard agentId={selectedAgentId} />
        </FeatureSection>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <FeatureSection
            icon={<Brain className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />}
            title="Risk Management"
            description="Constitutional rules the AI cannot break"
          >
            <SupervisorRulesCard />
          </FeatureSection>

          <FeatureSection
            icon={<Ghost className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />}
            title="Paper Trading"
            description="Test strategies risk-free with live data"
          >
            <ShadowModeCard agentId={selectedAgentId} />
          </FeatureSection>
        </div>

        <FeatureSection
          icon={<Lock className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />}
          title="Hardware Security"
          description="TEE-protected keys that even we cannot access"
        >
          <TEEStatusCard />
        </FeatureSection>
      </div>
    </div>
  );
}

function FeatureSection({
  icon,
  title,
  description,
  children
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 flex items-center justify-center border border-teal-500/30 shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-white truncate">{title}</h3>
          <p className="text-xs sm:text-sm text-slate-400 truncate">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
