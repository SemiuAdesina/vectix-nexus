"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const security_scanning_1 = require("../services/security-scanning");
const router = (0, express_1.Router)();
router.post('/onchain/security/scan', async (req, res) => {
    try {
        const { tokenAddress } = req.body;
        const result = await security_scanning_1.securityScanningService.scanToken(tokenAddress);
        res.json({ success: true, result });
    }
    catch (error) {
        console.error('Failed to scan token:', error);
        res.status(500).json({ success: false, error: 'Failed to scan token' });
    }
});
router.get('/onchain/security/alerts', async (req, res) => {
    try {
        const filters = {
            severity: req.query.severity,
            tokenAddress: req.query.tokenAddress,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        };
        const alerts = await security_scanning_1.securityScanningService.getAlerts(filters);
        res.json({ success: true, alerts });
    }
    catch (error) {
        console.error('Failed to get alerts:', error);
        res.status(500).json({ success: false, error: 'Failed to get alerts' });
    }
});
exports.default = router;
