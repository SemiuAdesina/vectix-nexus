"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_trail_1 = require("../services/audit-trail");
const router = (0, express_1.Router)();
router.get('/onchain/audit-trail', async (req, res) => {
    try {
        const query = {
            agentId: req.query.agentId,
            tokenAddress: req.query.tokenAddress,
            decision: req.query.decision,
            startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        };
        const result = await audit_trail_1.auditTrailService.queryTrail(query);
        res.json({ success: true, ...result });
    }
    catch (error) {
        console.error('Failed to query audit trail:', error);
        res.status(500).json({ success: false, error: 'Failed to query audit trail' });
    }
});
router.get('/onchain/audit-trail/verify', async (req, res) => {
    try {
        const result = await audit_trail_1.auditTrailService.verifyTrailIntegrity();
        res.json({ success: true, ...result });
    }
    catch (error) {
        console.error('Failed to verify audit trail:', error);
        res.status(500).json({ success: false, error: 'Failed to verify audit trail' });
    }
});
router.get('/onchain/audit-trail/export', async (req, res) => {
    try {
        const format = req.query.format || 'json';
        const data = await audit_trail_1.auditTrailService.exportTrail(format);
        res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=audit-trail.${format}`);
        res.send(data);
    }
    catch (error) {
        console.error('Failed to export audit trail:', error);
        res.status(500).json({ success: false, error: 'Failed to export audit trail' });
    }
});
exports.default = router;
