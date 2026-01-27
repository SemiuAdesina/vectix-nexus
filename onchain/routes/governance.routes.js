"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const governance_1 = require("../services/governance");
const router = (0, express_1.Router)();
router.post('/onchain/governance/proposal', async (req, res) => {
    try {
        const proposal = await governance_1.governanceService.createProposal(req.body);
        res.json({ success: true, proposal });
    }
    catch (error) {
        console.error('Failed to create proposal:', error);
        res.status(500).json({ success: false, error: 'Failed to create proposal' });
    }
});
router.post('/onchain/governance/vote', async (req, res) => {
    try {
        const { proposalId, ...vote } = req.body;
        const result = await governance_1.governanceService.vote(proposalId, vote);
        if (result) {
            res.json({ success: true });
        }
        else {
            res.status(400).json({ success: false, error: 'Vote failed. You may have already voted on this proposal or the proposal is not active.' });
        }
    }
    catch (error) {
        console.error('Failed to vote:', error);
        res.status(500).json({ success: false, error: 'Failed to vote' });
    }
});
router.get('/onchain/governance/proposals', async (req, res) => {
    try {
        const proposals = await governance_1.governanceService.getActiveProposals();
        res.json({ success: true, proposals });
    }
    catch (error) {
        console.error('Failed to get proposals:', error);
        res.status(500).json({ success: false, error: 'Failed to get proposals' });
    }
});
router.get('/onchain/governance/proposal/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const proposal = await governance_1.governanceService.getProposal(id);
        if (!proposal) {
            return res.status(404).json({ success: false, error: 'Proposal not found' });
        }
        res.json({ success: true, proposal });
    }
    catch (error) {
        console.error('Failed to get proposal:', error);
        res.status(500).json({ success: false, error: 'Failed to get proposal' });
    }
});
router.post('/onchain/governance/execute', async (req, res) => {
    try {
        const { proposalId } = req.body;
        const result = await governance_1.governanceService.executeProposal(proposalId);
        res.json({ success: result });
    }
    catch (error) {
        console.error('Failed to execute proposal:', error);
        res.status(500).json({ success: false, error: 'Failed to execute proposal' });
    }
});
exports.default = router;
