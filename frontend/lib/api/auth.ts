const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';

type TokenGetter = () => Promise<string | null>;

const AUTH_GETTER_KEY = '__VECTIX_AUTH_GET_TOKEN__';

let registeredTokenGetter: TokenGetter | null = null;

export function registerAuthTokenGetter(getter: TokenGetter | null): void {
  registeredTokenGetter = getter;
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, TokenGetter | null>)[AUTH_GETTER_KEY] = getter;
  }
}

function getGlobalTokenGetter(): TokenGetter | null {
  if (typeof window === 'undefined') return registeredTokenGetter;
  const w = window as unknown as Record<string, TokenGetter | null>;
  return w[AUTH_GETTER_KEY] ?? registeredTokenGetter;
}

interface ClerkClient {
  session?: {
    getToken: (options?: { template?: string }) => Promise<string | null>;
  };
}

function getClerkClient(): ClerkClient | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { Clerk?: ClerkClient }).Clerk || null;
}

async function getTokenFromClerk(): Promise<string | null> {
  const clerk = getClerkClient();
  if (clerk?.session) {
    try {
      return await clerk.session.getToken();
    } catch {
      return null;
    }
  }
  return null;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  try {
    const getter = getGlobalTokenGetter();
    const token = getter ? await getter() : await getTokenFromClerk();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Auth token error:', error);
  }

  return headers;
}

export function getBackendUrl(): string {
  return BACKEND_URL;
}
