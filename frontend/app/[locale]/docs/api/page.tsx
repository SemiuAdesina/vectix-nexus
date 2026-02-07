'use client';

import { Key, Zap, Shield } from 'lucide-react';
import {
  QuickStart,
  Authentication,
  EndpointsSection,
  TradeExample,
  RateLimitsSection,
  SdksSection,
} from './sections';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <Header />
        <FeatureCards />
        <QuickStart />
        <Authentication />
        <EndpointsSection />
        <TradeExample />
        <RateLimitsSection />
        <SdksSection />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="mb-8 sm:mb-12">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4">Vectix API Documentation</h1>
      <p className="text-base sm:text-xl text-muted-foreground">
        Build custom dashboards, trading bots, and mobile apps with our REST API.
      </p>
    </div>
  );
}

function FeatureCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
      <Card icon={<Key className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />} title="API Keys">
        Create keys with granular permissions in your dashboard.
      </Card>
      <Card icon={<Zap className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />} title="Rate Limits">
        Free: 100/day - Pro: 10,000/day
      </Card>
      <Card icon={<Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />} title="Secure by Design">
        Withdrawals require 2FA. Never exposed via API.
      </Card>
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="mb-3 sm:mb-4">{icon}</div>
      <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
