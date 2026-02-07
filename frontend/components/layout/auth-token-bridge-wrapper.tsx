'use client';

import { useAuthEnabled } from '@/contexts/auth-enabled';
import { AuthTokenBridge } from './auth-token-bridge';

export function AuthTokenBridgeWrapper() {
  const authEnabled = useAuthEnabled();
  if (!authEnabled) return null;
  return <AuthTokenBridge />;
}
