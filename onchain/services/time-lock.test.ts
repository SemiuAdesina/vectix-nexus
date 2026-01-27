import { describe, it, expect, beforeEach } from 'vitest';
import { TimeLockService } from './time-lock';
import type { TimeLockedTransaction } from './onchain-types';

describe('TimeLockService', () => {
  let service: TimeLockService;

  beforeEach(() => {
    service = new TimeLockService();
  });

  describe('createTimeLock', () => {
    it('creates a time-locked transaction', async () => {
      const executeAt = new Date(Date.now() + 3600000);
      const timelock = await service.createTimeLock({
        agentId: 'agent1',
        type: 'trade',
        transactionData: { amount: 1000 },
        executeAt,
        cancelWindow: 300000,
      });

      expect(timelock.id).toBeDefined();
      expect(timelock.status).toBe('pending');
      expect(timelock.agentId).toBe('agent1');
      expect(timelock.type).toBe('trade');
      expect(timelock.executeAt).toEqual(executeAt);
      expect(timelock.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('cancelTimeLock', () => {
    it('cancels a pending time lock within cancel window', async () => {
      const executeAt = new Date(Date.now() + 3600000);
      const timelock = await service.createTimeLock({
        agentId: 'agent1',
        type: 'trade',
        transactionData: {},
        executeAt,
        cancelWindow: 300000,
      });

      const result = await service.cancelTimeLock(timelock.id);
      expect(result).toBe(true);

      const cancelled = await service.getTimeLock(timelock.id);
      expect(cancelled?.status).toBe('cancelled');
    });

    it('fails to cancel non-existent time lock', async () => {
      const result = await service.cancelTimeLock('non-existent');
      expect(result).toBe(false);
    });

    it('fails to cancel when outside cancel window', async () => {
      const executeAt = new Date(Date.now() + 10000);
      const timelock = await service.createTimeLock({
        agentId: 'agent1',
        type: 'trade',
        transactionData: {},
        executeAt,
        cancelWindow: 300000,
      });

      const result = await service.cancelTimeLock(timelock.id);
      expect(result).toBe(false);
    });
  });

  describe('getTimeLock', () => {
    it('returns time lock by id', async () => {
      const created = await service.createTimeLock({
        agentId: 'agent1',
        type: 'trade',
        transactionData: {},
        executeAt: new Date(Date.now() + 3600000),
        cancelWindow: 300000,
      });

      const retrieved = await service.getTimeLock(created.id);
      expect(retrieved).toEqual(created);
    });

    it('returns null for non-existent time lock', async () => {
      const result = await service.getTimeLock('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getPendingTimeLocks', () => {
    it('returns pending time locks for agent', async () => {
      await service.createTimeLock({
        agentId: 'agent1',
        type: 'trade',
        transactionData: {},
        executeAt: new Date(Date.now() + 3600000),
        cancelWindow: 300000,
      });
      await service.createTimeLock({
        agentId: 'agent1',
        type: 'withdrawal',
        transactionData: {},
        executeAt: new Date(Date.now() + 7200000),
        cancelWindow: 300000,
      });

      const pending = await service.getPendingTimeLocks('agent1');
      expect(pending.length).toBeGreaterThanOrEqual(2);
      expect(pending.every(t => t.agentId === 'agent1' && t.status === 'pending')).toBe(true);
    });

    it('sorts by executeAt time', async () => {
      const later = new Date(Date.now() + 7200000);
      const earlier = new Date(Date.now() + 3600000);

      await service.createTimeLock({
        agentId: 'agent1',
        type: 'trade',
        transactionData: {},
        executeAt: later,
        cancelWindow: 300000,
      });
      await service.createTimeLock({
        agentId: 'agent1',
        type: 'trade',
        transactionData: {},
        executeAt: earlier,
        cancelWindow: 300000,
      });

      const pending = await service.getPendingTimeLocks('agent1');
      expect(pending[0].executeAt.getTime()).toBeLessThanOrEqual(pending[1].executeAt.getTime());
    });
  });

  describe('checkExecutable', () => {
    it('returns time locks ready for execution', async () => {
      const past = new Date(Date.now() - 1000);
      await service.createTimeLock({
        agentId: 'agent1',
        type: 'trade',
        transactionData: {},
        executeAt: past,
        cancelWindow: 300000,
      });

      const executable = await service.checkExecutable();
      expect(executable.length).toBeGreaterThan(0);
      expect(executable.every(t => t.executeAt <= new Date())).toBe(true);
    });
  });

  describe('executeTimeLock', () => {
    it('executes a ready time lock', async () => {
      const past = new Date(Date.now() - 1000);
      const timelock = await service.createTimeLock({
        agentId: 'agent1',
        type: 'trade',
        transactionData: {},
        executeAt: past,
        cancelWindow: 300000,
      });

      const result = await service.executeTimeLock(timelock.id);
      expect(result).toBe(true);

      const executed = await service.getTimeLock(timelock.id);
      expect(executed?.status).toBe('executed');
      expect(executed?.executedAt).toBeInstanceOf(Date);
    });

    it('fails to execute non-existent time lock', async () => {
      const result = await service.executeTimeLock('non-existent');
      expect(result).toBe(false);
    });

    it('fails to execute time lock not ready', async () => {
      const future = new Date(Date.now() + 3600000);
      const timelock = await service.createTimeLock({
        agentId: 'agent1',
        type: 'trade',
        transactionData: {},
        executeAt: future,
        cancelWindow: 300000,
      });

      const result = await service.executeTimeLock(timelock.id);
      expect(result).toBe(false);
    });
  });
});
