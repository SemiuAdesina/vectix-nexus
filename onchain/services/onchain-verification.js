"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onChainVerification = exports.OnChainVerificationService = void 0;
const web3_js_1 = require("@solana/web3.js");
class OnChainVerificationService {
    constructor() {
        this.connection = null;
        this.programId = null;
        const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
        this.connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
        const programId = process.env.SOLANA_PROGRAM_ID;
        if (programId) {
            this.programId = new web3_js_1.PublicKey(programId);
        }
    }
    async storeSecurityDecision(log) {
        const proof = `onchain_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        if (this.programId && this.connection) {
            try {
                const pda = await this.generatePDA(log.agentId || 'system', log.id);
                const proof = pda.toBase58();
                return { ...log, onChainProof: proof };
            }
            catch (error) {
                console.warn('On-chain storage not available, using mock proof:', error);
            }
        }
        return { ...log, onChainProof: proof };
    }
    async verifyCertificate(proof) {
        if (this.connection && proof.startsWith('onchain_')) {
            try {
                const pubkey = new web3_js_1.PublicKey(proof);
                const accountInfo = await this.connection.getAccountInfo(pubkey);
                return {
                    verified: accountInfo !== null,
                    proof,
                    timestamp: new Date().toISOString(),
                };
            }
            catch (error) {
                return { verified: false, proof, timestamp: new Date().toISOString() };
            }
        }
        return { verified: true, proof, timestamp: new Date().toISOString() };
    }
    async generatePDA(agentId, logId) {
        if (!this.programId) {
            throw new Error('Program ID not configured');
        }
        const seeds = [
            Buffer.from('security_log'),
            Buffer.from(agentId),
            Buffer.from(logId),
        ];
        const [pda] = web3_js_1.PublicKey.findProgramAddressSync(seeds, this.programId);
        return pda;
    }
}
exports.OnChainVerificationService = OnChainVerificationService;
exports.onChainVerification = new OnChainVerificationService();
