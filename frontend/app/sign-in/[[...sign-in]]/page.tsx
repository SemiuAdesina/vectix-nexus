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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
        <p className="text-slate-400 mb-4 text-center">Sign-in is not configured. Use the homepage to continue.</p>
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
