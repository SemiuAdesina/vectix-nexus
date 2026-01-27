import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

describe('fly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.FLY_API_TOKEN;
  });

  describe('createFlyMachine', () => {
    it('creates machine in mock mode when token not set', async () => {
      const { createFlyMachine } = await import('./fly');
      const result = await createFlyMachine('{"name":"test"}');
      expect(result.id).toMatch(/^mock-machine-/);
      expect(result.state).toBe('started');
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
    it('returns mock IP when token not set', async () => {
      const { getMachineIP } = await import('./fly');
      const ip = await getMachineIP('machine1');
      expect(ip).toBe('10.0.0.1');
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
