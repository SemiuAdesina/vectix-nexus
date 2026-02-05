'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { registerAuthTokenGetter } from '@/lib/api/auth';

export function AuthTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    registerAuthTokenGetter(getToken);
    return () => registerAuthTokenGetter(null);
  }, [getToken]);

  return null;
}
