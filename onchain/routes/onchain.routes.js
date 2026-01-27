"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const onchain_verification_1 = require("../services/onchain-verification");
const circuit_breaker_routes_1 = __importDefault(require("./circuit-breaker.routes"));
const governance_routes_1 = __importDefault(require("./governance.routes"));
const multisig_routes_1 = __importDefault(require("./multisig.routes"));
const audit_trail_routes_1 = __importDefault(require("./audit-trail.routes"));
const timelock_routes_1 = __importDefault(require("./timelock.routes"));
const security_scanning_routes_1 = __importDefault(require("./security-scanning.routes"));
const threat_intelligence_routes_1 = __importDefault(require("./threat-intelligence.routes"));
const router = (0, express_1.Router)();
router.get('/onchain/status', (_req, res) => {
    const programId = process.env.SOLANA_PROGRAM_ID || null;
    res.json({
        success: true,
        enabled: true,
        message: 'On-chain verification is active',
        programId,
    });
});
router.post('/onchain/log', async (req, res) => {
    try {
        const logData = req.body;
        const log = await onchain_verification_1.onChainVerification.storeSecurityDecision(logData);
        res.json({
            success: true,
            log,
        });
    }
    catch (error) {
        console.error('Failed to store on-chain log:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to store on-chain log',
        });
    }
});
router.get('/onchain/verify/:proof', async (req, res) => {
    try {
        const { proof } = req.params;
        const result = await onchain_verification_1.onChainVerification.verifyCertificate(proof);
        res.json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        console.error('Failed to verify proof:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify proof',
        });
    }
});
router.use(circuit_breaker_routes_1.default);
router.use(governance_routes_1.default);
router.use(multisig_routes_1.default);
router.use(audit_trail_routes_1.default);
router.use(timelock_routes_1.default);
router.use(security_scanning_routes_1.default);
router.use(threat_intelligence_routes_1.default);
exports.default = router;
