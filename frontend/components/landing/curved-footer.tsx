import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';

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
                  <span className="font-bold text-lg text-white">Vectix Foundry</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                  Enterprise-grade autonomous AI trading agents on Solana with institutional
                  security and US regulatory compliance.
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

            <div className="border-t border-slate-700/50 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </footer>
    </div>
  );
}
