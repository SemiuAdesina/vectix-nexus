import { describe, it, expect, afterEach } from 'vitest';
import { GET } from './route';

describe('env-check API (Clerk)', () => {
  const origPublishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const origSecret = process.env.CLERK_SECRET_KEY;

  afterEach(() => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = origPublishable;
    process.env.CLERK_SECRET_KEY = origSecret;
  });

  it('returns clerkConfigured true when both keys are set', async () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_abc';
    process.env.CLERK_SECRET_KEY = 'sk_test_xyz';
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ clerkConfigured: true });
  });

  it('returns clerkConfigured false when publishable key is missing', async () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = '';
    process.env.CLERK_SECRET_KEY = 'sk_test_xyz';
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ clerkConfigured: false });
  });

  it('returns clerkConfigured false when secret key is missing', async () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_abc';
    process.env.CLERK_SECRET_KEY = '';
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ clerkConfigured: false });
  });

  it('returns clerkConfigured false when both keys are empty', async () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = '';
    process.env.CLERK_SECRET_KEY = '';
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ clerkConfigured: false });
  });
});
