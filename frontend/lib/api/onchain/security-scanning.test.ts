import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as securityScanning from './security-scanning';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('@/lib/api/config', () => ({
  getApiBaseUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

describe('security-scanning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scanToken', () => {
    it('scans token for security issues', async () => {
      const mockResponse = {
        success: true,
        result: { tokenAddress: 'token1', risks: [], score: 85 },
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await securityScanning.scanToken('token1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSecurityAlerts', () => {
    it('fetches security alerts', async () => {
      const mockResponse = {
        success: true,
        alerts: [{ id: 'alert1', severity: 'high', tokenAddress: 'token1' }],
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await securityScanning.getSecurityAlerts();
      expect(result).toEqual(mockResponse);
    });

    it('fetches security alerts with filters', async () => {
      const mockResponse = {
        success: true,
        alerts: [{ id: 'alert1', severity: 'high' }],
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await securityScanning.getSecurityAlerts({
        severity: 'high',
        tokenAddress: 'token1',
        limit: 10,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
