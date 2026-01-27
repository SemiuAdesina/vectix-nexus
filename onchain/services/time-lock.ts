import type { TimeLockedTransaction, TimeLockConfig } from './onchain-types';

const TIME_LOCKS: Map<string, TimeLockedTransaction> = new Map();

export class TimeLockService {
  async createTimeLock(transaction: Omit<TimeLockedTransaction, 'id' | 'status' | 'createdAt'>): Promise<TimeLockedTransaction> {
    const id = `timelock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const timelock: TimeLockedTransaction = {
      id,
      ...transaction,
      status: 'pending',
      createdAt: new Date(),
    };

    TIME_LOCKS.set(id, timelock);
    return timelock;
  }

  async cancelTimeLock(id: string): Promise<boolean> {
    const timelock = TIME_LOCKS.get(id);
    if (!timelock) return false;

    if (timelock.status !== 'pending') return false;
    if (Date.now() >= timelock.executeAt.getTime() - timelock.cancelWindow) return false;

    timelock.status = 'cancelled';
    return true;
  }

  async getTimeLock(id: string): Promise<TimeLockedTransaction | null> {
    return TIME_LOCKS.get(id) || null;
  }

  async getPendingTimeLocks(agentId: string): Promise<TimeLockedTransaction[]> {
    return Array.from(TIME_LOCKS.values())
      .filter(t => t.agentId === agentId && t.status === 'pending')
      .sort((a, b) => a.executeAt.getTime() - b.executeAt.getTime());
  }

  async checkExecutable(): Promise<TimeLockedTransaction[]> {
    const now = new Date();
    return Array.from(TIME_LOCKS.values())
      .filter(t => t.status === 'pending' && t.executeAt <= now);
  }

  async executeTimeLock(id: string): Promise<boolean> {
    const timelock = TIME_LOCKS.get(id);
    if (!timelock) return false;

    if (timelock.status !== 'pending') return false;
    if (timelock.executeAt > new Date()) return false;

    timelock.status = 'executed';
    timelock.executedAt = new Date();
    return true;
  }
}

export const timeLockService = new TimeLockService();
