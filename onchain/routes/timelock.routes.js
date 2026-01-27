"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const time_lock_1 = require("../services/time-lock");
const router = (0, express_1.Router)();
router.post('/onchain/timelock/create', async (req, res) => {
    try {
        const { executeAt, cancelWindow, ...rest } = req.body;
        const timelock = await time_lock_1.timeLockService.createTimeLock({
            ...rest,
            executeAt: new Date(executeAt),
            cancelWindow,
        });
        res.json({ success: true, timelock });
    }
    catch (error) {
        console.error('Failed to create timelock:', error);
        res.status(500).json({ success: false, error: 'Failed to create timelock' });
    }
});
router.post('/onchain/timelock/cancel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await time_lock_1.timeLockService.cancelTimeLock(id);
        res.json({ success: result });
    }
    catch (error) {
        console.error('Failed to cancel timelock:', error);
        res.status(500).json({ success: false, error: 'Failed to cancel timelock' });
    }
});
router.get('/onchain/timelock/pending', async (req, res) => {
    try {
        const { agentId } = req.query;
        if (!agentId || typeof agentId !== 'string') {
            return res.status(400).json({ success: false, error: 'agentId required' });
        }
        const timelocks = await time_lock_1.timeLockService.getPendingTimeLocks(agentId);
        res.json({ success: true, timelocks });
    }
    catch (error) {
        console.error('Failed to get pending timelocks:', error);
        res.status(500).json({ success: false, error: 'Failed to get pending timelocks' });
    }
});
exports.default = router;
