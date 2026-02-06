'use client';

import {
  Navbar,
  HeroSection,
  FeaturesGrid,
  ShowcaseSection,
  CurvedFooter,
} from '@/components/landing';

const SHOWCASE_SECTIONS = [
  {
    title: 'The Intelligence',
    highlight: 'Factory',
    description:
      'Deploy and manage AI agents powered by ElizaOS. Each agent operates autonomously with customizable strategies, real-time market analysis, and full lifecycle control from a unified dashboard.',
    imageSrc: '/landingpage/intelegentfac.png',
    imageAlt: 'Intelligence Factory - ElizaOS Agent Deployment',
  },
  {
    title: 'Shadow Mode:',
    highlight: 'Risk-Free Testing',
    description:
      'Test strategies with live market data before deploying capital. Shadow mode provides detailed performance reports, allowing you to validate and optimize trading strategies without financial risk.',
    imageSrc: '/landingpage/shadow-mode-dashboard.png.png',
    imageAlt: 'Shadow Mode Dashboard - Risk-Free Strategy Testing',
    reverse: true,
  },
  {
    title: 'Shield of',
    highlight: 'Compliance',
    description:
      'Full adherence to US financial regulations including FinCEN/BSA compliance, OFAC sanctions screening, AML transaction monitoring, and NIST 800-63B authentication with comprehensive audit trails.',
    imageSrc: '/landingpage/shield-of-compliance.png.png.png',
    imageAlt: 'Compliance Shield - US Regulatory Standards',
  },
  {
    title: 'M2M API &',
    highlight: 'Public Intelligence',
    description:
      'RESTful API with tiered rate limits and scope-based authorization. Public security intelligence APIs provide free access to security scores and threat data for the entire community.',
    imageSrc: '/landingpage/Api_and_M2M_integration.png',
    imageAlt: 'API and M2M Integration',
    reverse: true,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      {SHOWCASE_SECTIONS.map((section, i) => (
        <ShowcaseSection key={i} {...section} />
      ))}
      <CurvedFooter />
    </main>
  );
}
