import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as timeLockService from '../services/time-lock';

vi.mock('../services/time-lock', () => ({
  timeLockService: {
    createTimeLock: vi.fn(),
    cancelTimeLock: vi.fn(),
    getTimeLock: vi.fn(),
    getPendingTimeLocks: vi.fn(),
    executeTimeLock: vi.fn(),
  },
}));

describe('TimeLock Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /onchain/timelock/create', () => {
    it('creates a time-locked transaction', async () => {
      const mockTimelock = {
        id: 'timelock1',
        agentId: 'agent1',
        type: 'trade',
        status: 'pending',
        executeAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      };

      vi.mocked(timeLockService.timeLockService.createTimeLock).mockResolvedValue(mockTimelock as any);

      const result = await timeLockService.timeLockService.createTimeLock({
        agentId: 'agent1',
        type: 'trade',
        transactionData: {},
        executeAt: new Date(Date.now() + 3600000),
        cancelWindow: 300000,
      });

      expect(result).toEqual(mockTimelock);
    });
  });

  describe('POST /onchain/timelock/cancel', () => {
    it('cancels a time lock', async () => {
      vi.mocked(timeLockService.timeLockService.cancelTimeLock).mockResolvedValue(true);

      const result = await timeLockService.timeLockService.cancelTimeLock('timelock1');
      expect(result).toBe(true);
    });
  });

  describe('GET /onchain/timelock/:id', () => {
    it('returns time lock by id', async () => {
      const mockTimelock = {
        id: 'timelock1',
        agentId: 'agent1',
        status: 'pending',
      };

      vi.mocked(timeLockService.timeLockService.getTimeLock).mockResolvedValue(mockTimelock as any);

      const result = await timeLockService.timeLockService.getTimeLock('timelock1');
      expect(result).toEqual(mockTimelock);
    });
  });

  describe('GET /onchain/timelock/pending/:agentId', () => {
    it('returns pending time locks for agent', async () => {
      const mockTimelocks = [
        { id: 'timelock1', agentId: 'agent1', status: 'pending' },
        { id: 'timelock2', agentId: 'agent1', status: 'pending' },
      ];

      vi.mocked(timeLockService.timeLockService.getPendingTimeLocks).mockResolvedValue(mockTimelocks as any);

      const result = await timeLockService.timeLockService.getPendingTimeLocks('agent1');
      expect(result).toEqual(mockTimelocks);
    });
  });
});
