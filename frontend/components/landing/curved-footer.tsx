import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';

const LIVE_URL = 'https://vectixfoundry.com';

const PLATFORM_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Create Agent', href: '/create' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'API Keys', href: '/dashboard/api-keys' },
];

const TECH_STACK = ['ElizaOS Framework', 'Solana Blockchain', 'Phala TEE Network', 'Prisma ORM'];

export function CurvedFooter() {
  return (
    <div className="pt-12 sm:pt-16 lg:pt-20">
      <footer className="relative">
        <div className="bg-slate-900 rounded-t-[2rem] sm:rounded-t-[3rem]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <Link href={LIVE_URL} className="font-bold text-lg text-white hover:text-teal-400 transition-colors" target="_blank" rel="noopener noreferrer">
                    Vectix Foundry
                  </Link>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                  Enterprise-grade autonomous AI trading agents on Solana with institutional
                  security and US regulatory compliance.{' '}
                  <Link href={LIVE_URL} className="text-teal-400 hover:text-teal-300 transition-colors underline" target="_blank" rel="noopener noreferrer">
                    Live
                  </Link>
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Platform</h4>
                <ul className="space-y-2.5">
                  {PLATFORM_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-teal-400 transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Built With</h4>
                <ul className="space-y-2.5 text-slate-400 text-sm">
                  {TECH_STACK.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-700/50 mt-10 pt-8 space-y-4">
              <p className="text-slate-500 text-xs sm:text-sm text-center sm:text-left max-w-2xl">
                This software is protected under the Business Source License 1.1. Commercial reproduction or production use without a license is prohibited.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-slate-500 text-sm">Vectix Foundry - Institutional AI Trading</span>
                <Link
                  href="/create"
                  className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 transition-colors text-sm font-medium"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
