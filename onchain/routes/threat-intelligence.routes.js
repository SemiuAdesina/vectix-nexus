"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const threat_intelligence_1 = require("../services/threat-intelligence");
const router = (0, express_1.Router)();
router.post('/onchain/threats/detect', async (req, res) => {
    try {
        const result = await threat_intelligence_1.threatIntelligenceService.detectAnomaly(req.body);
        res.json({ success: true, ...result });
    }
    catch (error) {
        console.error('Failed to detect threat:', error);
        res.status(500).json({ success: false, error: 'Failed to detect threat' });
    }
});
router.get('/onchain/threats/feed', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const feed = await threat_intelligence_1.threatIntelligenceService.getThreatFeed(limit);
        res.json({ success: true, threats: feed });
    }
    catch (error) {
        console.error('Failed to get threat feed:', error);
        res.status(500).json({ success: false, error: 'Failed to get threat feed' });
    }
});
router.post('/onchain/threats/report', async (req, res) => {
    try {
        const report = await threat_intelligence_1.threatIntelligenceService.reportThreat(req.body);
        res.json({ success: true, report });
    }
    catch (error) {
        console.error('Failed to report threat:', error);
        res.status(500).json({ success: false, error: 'Failed to report threat' });
    }
});
exports.default = router;
