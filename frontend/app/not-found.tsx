'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RootNotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-slate-400 mb-6">The page you are looking for does not exist.</p>
      <Link href="/">
        <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
