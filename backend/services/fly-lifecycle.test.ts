import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

describe('fly-lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FLY_API_TOKEN = 'test-token';
  });

  describe('getMachineStatus', () => {
    it('returns machine status', async () => {
      const { getMachineStatus } = await import('./fly-lifecycle');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'machine1',
          name: 'test-machine',
          state: 'started',
          region: 'lax',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          private_ip: '10.0.0.1',
        }),
      } as Response);

      const status = await getMachineStatus('machine1');
      expect(status.id).toBe('machine1');
      expect(status.state).toBe('started');
    });

    it('throws error on API failure', async () => {
      const { getMachineStatus } = await import('./fly-lifecycle');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Not found',
      } as Response);

      await expect(getMachineStatus('machine1')).rejects.toThrow();
    });
  });

  describe('startMachine', () => {
    it('starts machine successfully', async () => {
      const { startMachine } = await import('./fly-lifecycle');
      vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);

      await startMachine('machine1');
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('stopMachine', () => {
    it('stops machine successfully', async () => {
      const { stopMachine } = await import('./fly-lifecycle');
      vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);

      await stopMachine('machine1');
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('restartMachine', () => {
    it('restarts machine successfully', async () => {
      const { restartMachine } = await import('./fly-lifecycle');
      vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);

      await restartMachine('machine1');
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('destroyMachine', () => {
    it('destroys machine successfully', async () => {
      const { destroyMachine } = await import('./fly-lifecycle');
      vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);

      await destroyMachine('machine1');
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
