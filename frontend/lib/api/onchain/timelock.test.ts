import { describe, it, expect, vi, beforeEach, type Mock, type MockedFunction } from 'vitest';
import * as timelock from './timelock';

global.fetch = vi.fn() as MockedFunction<typeof fetch>;

vi.mock('@/lib/api/config', () => ({
  getApiBaseUrl: vi.fn().mockReturnValue('http://localhost:3001'),
}));

describe('timelock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTimeLock', () => {
    it('creates timelock transaction', async () => {
      const mockResponse = {
        success: true,
        timelock: {
          id: 'timelock1',
          agentId: 'agent1',
          transaction: 'tx123',
          executeAt: new Date().toISOString(),
          status: 'pending',
        },
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await timelock.createTimeLock({
        agentId: 'agent1',
        transaction: 'tx123',
        executeAt: new Date(),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancelTimeLock', () => {
    it('cancels timelock', async () => {
      const mockResponse = { success: true };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await timelock.cancelTimeLock('timelock1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPendingTimeLocks', () => {
    it('fetches pending timelocks', async () => {
      const mockResponse = {
        success: true,
        timelocks: [
          { id: 'timelock1', agentId: 'agent1', status: 'pending' },
        ],
      };
      (global.fetch as Mock).mockResolvedValue({
        json: async () => mockResponse,
      } as Response);

      const result = await timelock.getPendingTimeLocks('agent1');
      expect(result).toEqual(mockResponse);
    });
  });
});
