'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function AuthGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <p className="text-slate-400 mb-4">Sign in to view this page.</p>
      <Link href="/sign-in">
        <Button className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0">
          <LogIn className="w-4 h-4" /> Sign In
        </Button>
      </Link>
    </div>
  );
}
