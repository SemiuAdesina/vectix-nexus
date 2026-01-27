import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

describe('fly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('createFlyMachine', () => {
    it('throws error when FLY_API_TOKEN not set', async () => {
      delete process.env.FLY_API_TOKEN;
      const { createFlyMachine } = await import('./fly');
      await expect(createFlyMachine('{"name":"test"}')).rejects.toThrow('FLY_API_TOKEN');
    });

    it('creates machine via API when token is set', async () => {
      process.env.FLY_API_TOKEN = 'test-token';
      const { createFlyMachine } = await import('./fly');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'machine1',
          name: 'test-machine',
          state: 'started',
          region: 'lax',
          private_ip: '10.0.0.1',
          config: { env: {} },
        }),
      } as Response);

      const result = await createFlyMachine('{"name":"test"}');
      expect(result.id).toBe('machine1');
    });
  });

  describe('getMachineIP', () => {
    it('throws error when FLY_API_TOKEN not set', async () => {
      delete process.env.FLY_API_TOKEN;
      const { getMachineIP } = await import('./fly');
      await expect(getMachineIP('machine1')).rejects.toThrow('FLY_API_TOKEN');
    });

    it('returns IP from API when token is set', async () => {
      process.env.FLY_API_TOKEN = 'test-token';
      const { getMachineIP } = await import('./fly');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          private_ip: '10.0.0.2',
        }),
      } as Response);

      const ip = await getMachineIP('machine1');
      expect(ip).toBe('10.0.0.2');
    });

    it('returns null on API failure', async () => {
      process.env.FLY_API_TOKEN = 'test-token';
      const { getMachineIP } = await import('./fly');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const ip = await getMachineIP('machine1');
      expect(ip).toBeNull();
    });
  });
});
