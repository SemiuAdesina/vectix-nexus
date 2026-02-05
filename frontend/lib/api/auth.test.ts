import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import * as auth from './auth';

vi.mock('./config', () => ({
  getApiBaseUrl: vi.fn(() => 'http://localhost:3001'),
}));

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.registerAuthTokenGetter(null);
    delete (window as unknown as { Clerk?: unknown }).Clerk;
    delete (window as unknown as Record<string, unknown>)['__VECTIX_AUTH_GET_TOKEN__'];
  });

  describe('registerAuthTokenGetter', () => {
    it('allows getAuthHeaders to use registered getter', async () => {
      const mockGetToken = vi.fn().mockResolvedValue('registered-token');
      auth.registerAuthTokenGetter(mockGetToken);

      const headers = await auth.getAuthHeaders();
      expect(headers.Authorization).toBe('Bearer registered-token');
    });
  });

  describe('getAuthHeaders', () => {
    it('returns headers without token when Clerk not available', async () => {
      const headers = await auth.getAuthHeaders();
      expect(headers).toEqual({ 'Content-Type': 'application/json' });
      expect(headers.Authorization).toBeUndefined();
    });

    it('returns headers with token when Clerk available', async () => {
      const mockGetToken = vi.fn().mockResolvedValue('test-token');
      (window as unknown as { Clerk?: { session: { getToken: Mock } } }).Clerk = {
        session: {
          getToken: mockGetToken,
        },
      };

      const headers = await auth.getAuthHeaders();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      });
    });

    it('prefers registered getter over window.Clerk', async () => {
      auth.registerAuthTokenGetter(() => Promise.resolve('from-register'));
      (window as unknown as { Clerk?: { session: { getToken: Mock } } }).Clerk = {
        session: { getToken: vi.fn().mockResolvedValue('from-window') },
      };

      const headers = await auth.getAuthHeaders();
      expect(headers.Authorization).toBe('Bearer from-register');
    });

    it('handles token fetch error gracefully', async () => {
      const mockGetToken = vi.fn().mockRejectedValue(new Error('Token error'));
      (window as unknown as { Clerk?: { session: { getToken: Mock } } }).Clerk = {
        session: {
          getToken: mockGetToken,
        },
      };

      const headers = await auth.getAuthHeaders();
      expect(headers).toEqual({ 'Content-Type': 'application/json' });
    });
  });

  describe('getBackendUrl', () => {
    it('returns backend URL', () => {
      const url = auth.getBackendUrl();
      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
    });
  });
});
