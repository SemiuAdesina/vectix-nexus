"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const governance_1 = require("./governance");
(0, vitest_1.describe)('GovernanceService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        service = new governance_1.GovernanceService();
    });
    (0, vitest_1.describe)('createProposal', () => {
        (0, vitest_1.it)('creates a new proposal with correct defaults', async () => {
            const proposal = await service.createProposal({
                title: 'Test Proposal',
                description: 'Test description',
                type: 'security_rule',
                quorum: 10,
            });
            (0, vitest_1.expect)(proposal.id).toBeDefined();
            (0, vitest_1.expect)(proposal.title).toBe('Test Proposal');
            (0, vitest_1.expect)(proposal.status).toBe('active');
            (0, vitest_1.expect)(proposal.votesFor).toBe(0);
            (0, vitest_1.expect)(proposal.votesAgainst).toBe(0);
            (0, vitest_1.expect)(proposal.createdAt).toBeInstanceOf(Date);
        });
        (0, vitest_1.it)('generates unique proposal IDs', async () => {
            const proposal1 = await service.createProposal({
                title: 'Proposal 1',
                description: 'Desc 1',
                type: 'security_rule',
                quorum: 10,
            });
            const proposal2 = await service.createProposal({
                title: 'Proposal 2',
                description: 'Desc 2',
                type: 'security_rule',
                quorum: 10,
            });
            (0, vitest_1.expect)(proposal1.id).not.toBe(proposal2.id);
        });
    });
    (0, vitest_1.describe)('vote', () => {
        (0, vitest_1.it)('allows voting on active proposals', async () => {
            const proposal = await service.createProposal({
                title: 'Vote Test',
                description: 'Test',
                type: 'security_rule',
                quorum: 10,
            });
            const result = await service.vote(proposal.id, {
                proposalId: proposal.id,
                voter: 'voter1',
                support: true,
                weight: 5,
            });
            (0, vitest_1.expect)(result).toBe(true);
            const updated = await service.getProposal(proposal.id);
            (0, vitest_1.expect)(updated.votesFor).toBe(5);
            (0, vitest_1.expect)(updated.votesAgainst).toBe(0);
        });
        (0, vitest_1.it)('prevents duplicate votes from same voter', async () => {
            const proposal = await service.createProposal({
                title: 'Duplicate Vote Test',
                description: 'Test',
                type: 'security_rule',
                quorum: 10,
            });
            await service.vote(proposal.id, {
                proposalId: proposal.id,
                voter: 'voter1',
                support: true,
                weight: 5,
            });
            const result = await service.vote(proposal.id, {
                proposalId: proposal.id,
                voter: 'voter1',
                support: false,
                weight: 3,
            });
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('rejects votes on non-existent proposals', async () => {
            const result = await service.vote('non-existent', {
                proposalId: 'non-existent',
                voter: 'voter1',
                support: true,
                weight: 5,
            });
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('updates proposal status when quorum is reached', async () => {
            const proposal = await service.createProposal({
                title: 'Quorum Test',
                description: 'Test',
                type: 'security_rule',
                quorum: 10,
            });
            await service.vote(proposal.id, {
                proposalId: proposal.id,
                voter: 'voter1',
                support: true,
                weight: 10,
            });
            const updated = await service.getProposal(proposal.id);
            (0, vitest_1.expect)(updated.status).toBe('passed');
        });
    });
    (0, vitest_1.describe)('getProposal', () => {
        (0, vitest_1.it)('returns proposal by id', async () => {
            const created = await service.createProposal({
                title: 'Get Test',
                description: 'Test',
                type: 'security_rule',
                quorum: 10,
            });
            const retrieved = await service.getProposal(created.id);
            (0, vitest_1.expect)(retrieved).toEqual(created);
        });
        (0, vitest_1.it)('returns null for non-existent proposal', async () => {
            const result = await service.getProposal('non-existent');
            (0, vitest_1.expect)(result).toBeNull();
        });
    });
    (0, vitest_1.describe)('getActiveProposals', () => {
        (0, vitest_1.it)('returns all active proposals', async () => {
            await service.createProposal({
                title: 'Proposal 1',
                description: 'Test',
                type: 'security_rule',
                quorum: 10,
            });
            await service.createProposal({
                title: 'Proposal 2',
                description: 'Test',
                type: 'parameter_update',
                quorum: 5,
            });
            const proposals = await service.getActiveProposals();
            (0, vitest_1.expect)(proposals.length).toBeGreaterThanOrEqual(2);
            (0, vitest_1.expect)(proposals.every(p => p.status === 'active')).toBe(true);
        });
    });
});
