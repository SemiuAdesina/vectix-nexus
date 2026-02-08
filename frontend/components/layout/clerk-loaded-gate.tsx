'use client';

import { useAuth } from '@clerk/nextjs';

export function ClerkLoadedGate({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useAuth();
  if (!isLoaded) {
    return <div className="min-h-screen bg-slate-950" aria-hidden="true" />;
  }
  return <>{children}</>;
}
