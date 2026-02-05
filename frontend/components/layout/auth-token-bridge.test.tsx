import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { AuthTokenBridge } from './auth-token-bridge';

const mockGetToken = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ getToken: mockGetToken }),
}));

vi.mock('@/lib/api/auth', () => ({
  registerAuthTokenGetter: vi.fn(),
}));

import { registerAuthTokenGetter } from '@/lib/api/auth';

describe('AuthTokenBridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers getToken on mount and unregisters on unmount', () => {
    const { unmount } = render(<AuthTokenBridge />);
    expect(registerAuthTokenGetter).toHaveBeenCalledWith(mockGetToken);

    unmount();
    expect(registerAuthTokenGetter).toHaveBeenLastCalledWith(null);
  });
});
