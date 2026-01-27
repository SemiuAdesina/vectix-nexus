import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

describe('fly-logs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FLY_API_TOKEN = 'test-token';
  });

  describe('getMachineLogs', () => {
    it('returns machine logs', async () => {
      const { getMachineLogs } = await import('./fly-logs');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { timestamp: '2024-01-01T00:00:00Z', message: 'Test log', level: 'info', source: 'agent' },
          ],
          meta: { next_token: 'token123' },
        }),
      } as Response);

      const result = await getMachineLogs('machine1');
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].message).toBe('Test log');
      expect(result.nextToken).toBe('token123');
    });

    it('returns empty logs on 404', async () => {
      const { getMachineLogs } = await import('./fly-logs');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const result = await getMachineLogs('machine1');
      expect(result.logs).toEqual([]);
    });
  });

  describe('parseLogLevel', () => {
    it('parses log levels correctly', async () => {
      const { getMachineLogs } = await import('./fly-logs');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { level: 'error', message: 'Error log' },
            { level: 'warn', message: 'Warning log' },
            { level: 'info', message: 'Info log' },
          ],
        }),
      } as Response);

      const result = await getMachineLogs('machine1');
      expect(result.logs[0].level).toBe('error');
      expect(result.logs[1].level).toBe('warn');
      expect(result.logs[2].level).toBe('info');
    });
  });
});
