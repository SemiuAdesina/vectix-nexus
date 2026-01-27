'use client';

import { useState } from 'react';
import { Shield, Brain, Ghost, Lock } from 'lucide-react';
import { 
  PreflightStatsCard, 
  SupervisorRulesCard, 
  ShadowModeCard, 
  TEEStatusCard 
} from '@/components/advanced-features';

export default function AdvancedFeaturesPage() {
  const [selectedAgentId] = useState('demo-agent-1');

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Security & Intelligence Suite</h1>
        <p className="text-muted-foreground">
          Enterprise-grade features that make your AI agents robust, secure, and profitable.
        </p>
      </div>

      <div className="grid gap-6">
        <FeatureSection
          icon={<Shield className="w-5 h-5" />}
          title="Transaction Protection"
          description="Pre-flight simulation prevents rug-pulls and bad trades"
        >
          <PreflightStatsCard agentId={selectedAgentId} />
        </FeatureSection>

        <div className="grid lg:grid-cols-2 gap-6">
          <FeatureSection
            icon={<Brain className="w-5 h-5" />}
            title="Risk Management"
            description="Constitutional rules the AI cannot break"
          >
            <SupervisorRulesCard />
          </FeatureSection>

          <FeatureSection
            icon={<Ghost className="w-5 h-5" />}
            title="Paper Trading"
            description="Test strategies risk-free with live data"
          >
            <ShadowModeCard agentId={selectedAgentId} />
          </FeatureSection>
        </div>

        <FeatureSection
          icon={<Lock className="w-5 h-5" />}
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
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
