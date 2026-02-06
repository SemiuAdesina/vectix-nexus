'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Bot, LayoutDashboard, Wallet, Loader2 } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, useAuth } from '@clerk/nextjs';

export function HeroSection() {
  const { isLoaded } = useAuth();

  return (
    <section className="relative pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,184,166,0.08)_0%,_transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-sm text-teal-300 font-medium">Now Live on Solana Mainnet</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            <span className="gradient-text">Enterprise AI Agents</span>
            <br />
            <span className="text-white">on Solana</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Deploy autonomous trading agents with institutional-grade security,
            real-time monitoring, and full US regulatory compliance. Built on ElizaOS.
          </p>

          <HeroCta isLoaded={isLoaded} />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 via-cyan-500/10 to-teal-500/20 rounded-2xl blur-2xl" />
          <Image
            src="/landingpage/hero_sec.png"
            alt="Vectix Foundry Platform"
            width={1200}
            height={600}
            className="relative rounded-xl border border-slate-700/50 shadow-2xl shadow-teal-500/10"
            priority
          />
        </div>
      </div>
    </section>
  );
}

function HeroCta({ isLoaded }: { isLoaded: boolean }) {
  if (!isLoaded) {
    return <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" />;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <SignedOut>
        <SignInButton mode="modal">
          <Button size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold px-8 h-14 text-lg border-0">
            <Bot className="w-5 h-5" /> Get Started Free
          </Button>
        </SignInButton>
        <Link href="/pricing">
          <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 px-8 h-14 text-lg w-full sm:w-auto">
            <Wallet className="w-5 h-5" /> View Pricing
          </Button>
        </Link>
      </SignedOut>
      <SignedIn>
        <Link href="/create">
          <Button size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold px-8 h-14 text-lg border-0">
            <Bot className="w-5 h-5" /> Create Your Agent
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 px-8 h-14 text-lg">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Button>
        </Link>
      </SignedIn>
    </div>
  );
}
