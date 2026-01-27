"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const multisig_1 = require("./multisig");
(0, vitest_1.describe)('MultiSigService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        service = new multisig_1.MultiSigService();
    });
    (0, vitest_1.describe)('createMultiSig', () => {
        (0, vitest_1.it)('creates a multisig wallet with unique ID', async () => {
            const config = {
                agentId: 'agent1',
                threshold: 2,
                signers: ['signer1', 'signer2', 'signer3'],
            };
            const multisigId = await service.createMultiSig(config);
            (0, vitest_1.expect)(multisigId).toBeDefined();
            (0, vitest_1.expect)(typeof multisigId).toBe('string');
        });
        (0, vitest_1.it)('generates unique IDs for different multisigs', async () => {
            const config1 = {
                agentId: 'agent1',
                threshold: 2,
                signers: ['signer1', 'signer2'],
            };
            const config2 = {
                agentId: 'agent2',
                threshold: 3,
                signers: ['signer1', 'signer2', 'signer3'],
            };
            const id1 = await service.createMultiSig(config1);
            const id2 = await service.createMultiSig(config2);
            (0, vitest_1.expect)(id1).not.toBe(id2);
        });
    });
    (0, vitest_1.describe)('createProposal', () => {
        (0, vitest_1.it)('creates a proposal with correct defaults', async () => {
            const config = {
                agentId: 'agent1',
                threshold: 2,
                signers: ['signer1', 'signer2'],
            };
            const multisigId = await service.createMultiSig(config);
            const proposal = await service.createProposal(multisigId, {
                type: 'trade',
                amount: 1000,
                tokenAddress: 'token123',
            });
            (0, vitest_1.expect)(proposal.id).toBeDefined();
            (0, vitest_1.expect)(proposal.multisigId).toBe(multisigId);
            (0, vitest_1.expect)(proposal.type).toBe('trade');
            (0, vitest_1.expect)(proposal.amount).toBe(1000);
            (0, vitest_1.expect)(proposal.tokenAddress).toBe('token123');
            (0, vitest_1.expect)(proposal.status).toBe('pending');
            (0, vitest_1.expect)(proposal.signatures).toEqual([]);
            (0, vitest_1.expect)(proposal.createdAt).toBeInstanceOf(Date);
        });
    });
    (0, vitest_1.describe)('addSignature', () => {
        (0, vitest_1.it)('adds signature to proposal', async () => {
            const config = {
                agentId: 'agent1',
                threshold: 2,
                signers: ['signer1', 'signer2'],
            };
            const multisigId = await service.createMultiSig(config);
            const proposal = await service.createProposal(multisigId, {
                type: 'trade',
                amount: 1000,
            });
            const result = await service.addSignature(proposal.id, {
                signer: 'signer1',
                signature: 'sig123',
                timestamp: new Date(),
            });
            (0, vitest_1.expect)(result).toBe(true);
        });
    });
    (0, vitest_1.describe)('executeProposal', () => {
        (0, vitest_1.it)('executes a proposal', async () => {
            const config = {
                agentId: 'agent1',
                threshold: 2,
                signers: ['signer1', 'signer2'],
            };
            const multisigId = await service.createMultiSig(config);
            const proposal = await service.createProposal(multisigId, {
                type: 'trade',
                amount: 1000,
            });
            const result = await service.executeProposal(proposal.id);
            (0, vitest_1.expect)(result).toBe(true);
        });
    });
    (0, vitest_1.describe)('getProposalStatus', () => {
        (0, vitest_1.it)('throws error for not implemented', async () => {
            await (0, vitest_1.expect)(service.getProposalStatus('proposal1')).rejects.toThrow('Not implemented');
        });
    });
});
