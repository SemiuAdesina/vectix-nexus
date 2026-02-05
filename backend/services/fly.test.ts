import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

describe('fly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('createFlyMachine', () => {
    it('returns mock machine when FLY_API_TOKEN not set', async () => {
      delete process.env.FLY_API_TOKEN;
      delete process.env.MOCK_FLY_DEPLOY;
      const { createFlyMachine } = await import('./fly');
      const result = await createFlyMachine('{"name":"test"}');
      expect(result.id).toMatch(/^mock-/);
      expect(result.state).toBe('started');
    });

    it('creates machine via API when token is set', async () => {
      process.env.FLY_API_TOKEN = 'test-token';
      delete process.env.MOCK_FLY_DEPLOY;
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
    it('returns null when FLY_API_TOKEN not set (mock mode)', async () => {
      delete process.env.FLY_API_TOKEN;
      delete process.env.MOCK_FLY_DEPLOY;
      const { getMachineIP } = await import('./fly');
      const ip = await getMachineIP('machine1');
      expect(ip).toBeNull();
    });

    it('returns IP from API when token is set', async () => {
      process.env.FLY_API_TOKEN = 'test-token';
      delete process.env.MOCK_FLY_DEPLOY;
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
      delete process.env.MOCK_FLY_DEPLOY;
      const { getMachineIP } = await import('./fly');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const ip = await getMachineIP('machine1');
      expect(ip).toBeNull();
    });

    it('returns null for invalid machineId without calling fetch', async () => {
      process.env.FLY_API_TOKEN = 'test-token';
      delete process.env.MOCK_FLY_DEPLOY;
      const { getMachineIP } = await import('./fly');
      const ip = await getMachineIP('machine/../../../etc');
      expect(ip).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('uses safe app name in URL when creating machine', async () => {
      process.env.FLY_API_TOKEN = 'test-token';
      delete process.env.MOCK_FLY_DEPLOY;
      const { createFlyMachine } = await import('./fly');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'm1',
          name: 'test',
          state: 'started',
          region: 'lax',
          config: {},
        }),
      } as Response);
      await createFlyMachine('{}', 'my-app_name');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/apps\/my-app_name\/machines$/),
        expect.any(Object)
      );
    });
  });
});
