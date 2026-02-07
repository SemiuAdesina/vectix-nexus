'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { useAuthEnabled } from '@/contexts/auth-enabled';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SignInPage() {
  const authEnabled = useAuthEnabled();

  if (!authEnabled) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 max-w-md mx-auto text-center">
        <p className="text-slate-400 mb-2">Sign-in is not configured.</p>
        <p className="text-slate-500 text-sm mb-6">
          Set <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">CLERK_SECRET_KEY</code> in the root <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">.env</code> (next to docker-compose.yml), then run: <code className="block mt-2 text-left bg-slate-800/80 px-3 py-2 rounded-lg text-xs text-slate-300 break-all">docker compose up -d --force-recreate frontend</code>
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute top-4 left-4">
        <Link href="/" className="text-slate-400 hover:text-teal-400 text-sm flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#14b8a6',
            colorBackground: '#020617',
            colorInputBackground: '#1e293b',
            colorInputText: '#f8fafc',
            colorText: '#f8fafc',
            colorTextSecondary: '#94a3b8',
            borderRadius: '0.5rem',
          },
        }}
      />
    </div>
  );
}
