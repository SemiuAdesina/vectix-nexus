import { Bot, Wallet, LineChart, Shield } from 'lucide-react';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI-Powered Agents',
    desc: 'Autonomous trading agents built on ElizaOS with GPT-4 or Claude intelligence',
    accent: 'from-teal-500/20 to-teal-500/5',
  },
  {
    icon: Wallet,
    title: 'Secure Wallets',
    desc: 'AES-256-GCM encrypted Solana wallets with PBKDF2 key derivation (600K iterations)',
    accent: 'from-cyan-500/20 to-cyan-500/5',
  },
  {
    icon: LineChart,
    title: 'Real-Time Analytics',
    desc: 'Live performance monitoring, shadow mode paper trading, and comprehensive risk assessment',
    accent: 'from-blue-500/20 to-blue-500/5',
  },
  {
    icon: Shield,
    title: 'Institutional Security',
    desc: 'Pre-flight simulation, TEE encryption, on-chain audit trails, and US regulatory compliance',
    accent: 'from-emerald-500/20 to-emerald-500/5',
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-20 lg:py-28 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.04)_0%,_transparent_70%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Built for <span className="text-teal-400">Institutional Grade</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Enterprise security infrastructure protecting users and the broader ecosystem
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="group relative rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 hover:border-teal-500/30 transition-all duration-300"
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-b ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
