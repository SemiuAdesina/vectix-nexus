"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeLockService = exports.TimeLockService = void 0;
const TIME_LOCKS = new Map();
class TimeLockService {
    async createTimeLock(transaction) {
        const id = `timelock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const timelock = {
            id,
            ...transaction,
            status: 'pending',
            createdAt: new Date(),
        };
        TIME_LOCKS.set(id, timelock);
        return timelock;
    }
    async cancelTimeLock(id) {
        const timelock = TIME_LOCKS.get(id);
        if (!timelock)
            return false;
        if (timelock.status !== 'pending')
            return false;
        if (Date.now() >= timelock.executeAt.getTime() - timelock.cancelWindow)
            return false;
        timelock.status = 'cancelled';
        return true;
    }
    async getTimeLock(id) {
        return TIME_LOCKS.get(id) || null;
    }
    async getPendingTimeLocks(agentId) {
        return Array.from(TIME_LOCKS.values())
            .filter(t => t.agentId === agentId && t.status === 'pending')
            .sort((a, b) => a.executeAt.getTime() - b.executeAt.getTime());
    }
    async checkExecutable() {
        const now = new Date();
        return Array.from(TIME_LOCKS.values())
            .filter(t => t.status === 'pending' && t.executeAt <= now);
    }
    async executeTimeLock(id) {
        const timelock = TIME_LOCKS.get(id);
        if (!timelock)
            return false;
        if (timelock.status !== 'pending')
            return false;
        if (timelock.executeAt > new Date())
            return false;
        timelock.status = 'executed';
        timelock.executedAt = new Date();
        return true;
    }
}
exports.TimeLockService = TimeLockService;
exports.timeLockService = new TimeLockService();
