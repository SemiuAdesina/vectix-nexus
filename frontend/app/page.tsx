import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Rocket, LayoutDashboard, Bot, Wallet, LineChart, Zap, ArrowRight, Shield, LogIn } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-background" />
            </div>
            <span className="font-semibold text-lg"><span className="sm:hidden">VL</span><span className="hidden sm:inline">VectixLogic</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Pricing</span>
            </Link>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="default" variant="outline" className="gap-2">
                  <LogIn className="w-4 h-4" /> Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="default" className="gap-2">
                  <Rocket className="w-4 h-4" /><span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      <section className="flex-1 flex items-center justify-center pt-16">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">Now Live on Solana Mainnet</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-primary">Spawn Profitable</span>
              <br />
              <span className="text-foreground">AI Agents</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Deploy autonomous trading agents with their own wallets and tokens.
              No code required. Built on ElizaOS.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="xl" className="w-full sm:w-auto">
                    <Bot className="w-5 h-5" /> Get Started Free
                  </Button>
                </SignInButton>
                <Link href="/pricing">
                  <Button size="xl" variant="secondary" className="w-full sm:w-auto border border-border">
                    <Wallet className="w-5 h-5" /> View Pricing
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/create">
                  <Button size="xl" className="w-full sm:w-auto">
                    <Bot className="w-5 h-5" /> Create Your Agent
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="xl" variant="secondary" className="w-full sm:w-auto border border-border">
                    <LayoutDashboard className="w-5 h-5" /> View Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Bot, title: 'AI-Powered', desc: 'Agents think and trade autonomously using GPT-4 or Claude' },
              { icon: Wallet, title: 'Own Wallet', desc: 'Each agent has its own Solana wallet and can launch tokens' },
              { icon: LineChart, title: 'Real-Time', desc: 'Monitor logs, balance, and performance in real-time' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Pre-flight simulation, TEE encryption, and supervisor AI' },
            ].map((feature, i) => (
              <div key={i} className="glass rounded-xl p-6 hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 flex items-center justify-between text-muted-foreground text-sm">
          <span>Built with ElizaOS</span>
          <Link href="/create" className="flex items-center gap-1 hover:text-primary transition-colors">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
