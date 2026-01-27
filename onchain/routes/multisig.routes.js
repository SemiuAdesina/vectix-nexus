"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multisig_1 = require("../services/multisig");
const router = (0, express_1.Router)();
router.post('/onchain/multisig/create', async (req, res) => {
    try {
        const multisigId = await multisig_1.multiSigService.createMultiSig(req.body);
        res.json({ success: true, multisigId });
    }
    catch (error) {
        console.error('Failed to create multisig:', error);
        res.status(500).json({ success: false, error: 'Failed to create multisig' });
    }
});
router.post('/onchain/multisig/proposal', async (req, res) => {
    try {
        const { multisigId, ...proposal } = req.body;
        const result = await multisig_1.multiSigService.createProposal(multisigId, proposal);
        res.json({ success: true, proposal: result });
    }
    catch (error) {
        console.error('Failed to create proposal:', error);
        res.status(500).json({ success: false, error: 'Failed to create proposal' });
    }
});
exports.default = router;
