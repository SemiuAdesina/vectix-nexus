'use client';

import { useTranslations } from 'next-intl';
import {
  Navbar,
  HeroSection,
  FeaturesGrid,
  ShowcaseSection,
  CurvedFooter,
} from '@/components/landing';

const SHOWCASE_KEYS = [
  { key: 'showcaseIntelligence', imageSrc: '/landingpage/intelegentfac.png', reverse: false },
  { key: 'showcaseShadow', imageSrc: '/landingpage/shadow-mode-dashboard.png.png', reverse: true },
  { key: 'showcaseCompliance', imageSrc: '/landingpage/shield-of-compliance.png.png.png', reverse: false },
  { key: 'showcaseApi', imageSrc: '/landingpage/Api_and_M2M_integration.png', reverse: true },
] as const;

export default function Home() {
  const t = useTranslations('HomePage');
  const sections = SHOWCASE_KEYS.map(({ key, imageSrc, reverse }) => ({
    title: t(`${key}.title`),
    highlight: t(`${key}.highlight`),
    description: t(`${key}.description`),
    imageSrc,
    imageAlt: t(`${key}.title`) + ' - ' + t(`${key}.highlight`),
    reverse,
  }));
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      {sections.map((section, i) => (
        <ShowcaseSection key={i} {...section} />
      ))}
      <CurvedFooter />
    </main>
  );
}
