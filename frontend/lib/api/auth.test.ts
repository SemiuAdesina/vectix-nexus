import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import * as auth from './auth';

vi.mock('./config', () => ({
  getApiBaseUrl: vi.fn(() => 'http://localhost:3001'),
}));

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as unknown as { Clerk?: unknown }).Clerk;
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
