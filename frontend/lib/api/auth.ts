import { getApiBaseUrl } from './config';

interface ClerkClient {
  session?: {
    getToken: (options?: { template?: string }) => Promise<string | null>;
  };
  user?: {
    id: string;
  };
}

function getClerkClient(): ClerkClient | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { Clerk?: ClerkClient }).Clerk || null;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const clerk = getClerkClient();
  if (!clerk?.session) {
    return headers;
  }

  try {
    const token = await clerk.session.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Auth token error:', error);
  }

  return headers;
}

export function getBackendUrl(): string {
  return getApiBaseUrl();
}
