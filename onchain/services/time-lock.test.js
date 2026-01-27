"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const time_lock_1 = require("./time-lock");
(0, vitest_1.describe)('TimeLockService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        service = new time_lock_1.TimeLockService();
    });
    (0, vitest_1.describe)('createTimeLock', () => {
        (0, vitest_1.it)('creates a time-locked transaction', async () => {
            const executeAt = new Date(Date.now() + 3600000);
            const timelock = await service.createTimeLock({
                agentId: 'agent1',
                type: 'trade',
                transactionData: { amount: 1000 },
                executeAt,
                cancelWindow: 300000,
            });
            (0, vitest_1.expect)(timelock.id).toBeDefined();
            (0, vitest_1.expect)(timelock.status).toBe('pending');
            (0, vitest_1.expect)(timelock.agentId).toBe('agent1');
            (0, vitest_1.expect)(timelock.type).toBe('trade');
            (0, vitest_1.expect)(timelock.executeAt).toEqual(executeAt);
            (0, vitest_1.expect)(timelock.createdAt).toBeInstanceOf(Date);
        });
    });
    (0, vitest_1.describe)('cancelTimeLock', () => {
        (0, vitest_1.it)('cancels a pending time lock within cancel window', async () => {
            const executeAt = new Date(Date.now() + 3600000);
            const timelock = await service.createTimeLock({
                agentId: 'agent1',
                type: 'trade',
                transactionData: {},
                executeAt,
                cancelWindow: 300000,
            });
            const result = await service.cancelTimeLock(timelock.id);
            (0, vitest_1.expect)(result).toBe(true);
            const cancelled = await service.getTimeLock(timelock.id);
            (0, vitest_1.expect)(cancelled?.status).toBe('cancelled');
        });
        (0, vitest_1.it)('fails to cancel non-existent time lock', async () => {
            const result = await service.cancelTimeLock('non-existent');
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('fails to cancel when outside cancel window', async () => {
            const executeAt = new Date(Date.now() + 10000);
            const timelock = await service.createTimeLock({
                agentId: 'agent1',
                type: 'trade',
                transactionData: {},
                executeAt,
                cancelWindow: 300000,
            });
            const result = await service.cancelTimeLock(timelock.id);
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
    (0, vitest_1.describe)('getTimeLock', () => {
        (0, vitest_1.it)('returns time lock by id', async () => {
            const created = await service.createTimeLock({
                agentId: 'agent1',
                type: 'trade',
                transactionData: {},
                executeAt: new Date(Date.now() + 3600000),
                cancelWindow: 300000,
            });
            const retrieved = await service.getTimeLock(created.id);
            (0, vitest_1.expect)(retrieved).toEqual(created);
        });
        (0, vitest_1.it)('returns null for non-existent time lock', async () => {
            const result = await service.getTimeLock('non-existent');
            (0, vitest_1.expect)(result).toBeNull();
        });
    });
    (0, vitest_1.describe)('getPendingTimeLocks', () => {
        (0, vitest_1.it)('returns pending time locks for agent', async () => {
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
            (0, vitest_1.expect)(pending.length).toBeGreaterThanOrEqual(2);
            (0, vitest_1.expect)(pending.every(t => t.agentId === 'agent1' && t.status === 'pending')).toBe(true);
        });
        (0, vitest_1.it)('sorts by executeAt time', async () => {
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
            (0, vitest_1.expect)(pending[0].executeAt.getTime()).toBeLessThanOrEqual(pending[1].executeAt.getTime());
        });
    });
    (0, vitest_1.describe)('checkExecutable', () => {
        (0, vitest_1.it)('returns time locks ready for execution', async () => {
            const past = new Date(Date.now() - 1000);
            await service.createTimeLock({
                agentId: 'agent1',
                type: 'trade',
                transactionData: {},
                executeAt: past,
                cancelWindow: 300000,
            });
            const executable = await service.checkExecutable();
            (0, vitest_1.expect)(executable.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(executable.every(t => t.executeAt <= new Date())).toBe(true);
        });
    });
    (0, vitest_1.describe)('executeTimeLock', () => {
        (0, vitest_1.it)('executes a ready time lock', async () => {
            const past = new Date(Date.now() - 1000);
            const timelock = await service.createTimeLock({
                agentId: 'agent1',
                type: 'trade',
                transactionData: {},
                executeAt: past,
                cancelWindow: 300000,
            });
            const result = await service.executeTimeLock(timelock.id);
            (0, vitest_1.expect)(result).toBe(true);
            const executed = await service.getTimeLock(timelock.id);
            (0, vitest_1.expect)(executed?.status).toBe('executed');
            (0, vitest_1.expect)(executed?.executedAt).toBeInstanceOf(Date);
        });
        (0, vitest_1.it)('fails to execute non-existent time lock', async () => {
            const result = await service.executeTimeLock('non-existent');
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('fails to execute time lock not ready', async () => {
            const future = new Date(Date.now() + 3600000);
            const timelock = await service.createTimeLock({
                agentId: 'agent1',
                type: 'trade',
                transactionData: {},
                executeAt: future,
                cancelWindow: 300000,
            });
            const result = await service.executeTimeLock(timelock.id);
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
});
