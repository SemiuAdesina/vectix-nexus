import { describe, it, expect, beforeEach } from 'vitest';
import { MultiSigService } from './multisig';
import type { MultiSigConfig } from './onchain-types';

describe('MultiSigService', () => {
  let service: MultiSigService;

  beforeEach(() => {
    service = new MultiSigService();
  });

  describe('createMultiSig', () => {
    it('creates a multisig wallet with unique ID', async () => {
      const config: MultiSigConfig = {
        agentId: 'agent1',
        threshold: 2,
        signers: ['signer1', 'signer2', 'signer3'],
      };

      const multisigId = await service.createMultiSig(config);
      expect(multisigId).toBeDefined();
      expect(typeof multisigId).toBe('string');
    });

    it('generates unique IDs for different multisigs', async () => {
      const config1: MultiSigConfig = {
        agentId: 'agent1',
        threshold: 2,
        signers: ['signer1', 'signer2'],
      };
      const config2: MultiSigConfig = {
        agentId: 'agent2',
        threshold: 3,
        signers: ['signer1', 'signer2', 'signer3'],
      };

      const id1 = await service.createMultiSig(config1);
      const id2 = await service.createMultiSig(config2);

      expect(id1).not.toBe(id2);
    });
  });

  describe('createProposal', () => {
    it('creates a proposal with correct defaults', async () => {
      const config: MultiSigConfig = {
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

      expect(proposal.id).toBeDefined();
      expect(proposal.multisigId).toBe(multisigId);
      expect(proposal.type).toBe('trade');
      expect(proposal.amount).toBe(1000);
      expect(proposal.tokenAddress).toBe('token123');
      expect(proposal.status).toBe('pending');
      expect(proposal.signatures).toEqual([]);
      expect(proposal.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('addSignature', () => {
    it('adds signature to proposal', async () => {
      const config: MultiSigConfig = {
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

      expect(result).toBe(true);
    });
  });

  describe('executeProposal', () => {
    it('executes a proposal', async () => {
      const config: MultiSigConfig = {
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
      expect(result).toBe(true);
    });
  });

  describe('getProposalStatus', () => {
    it('throws error for not implemented', async () => {
      await expect(service.getProposalStatus('proposal1')).rejects.toThrow('Not implemented');
    });
  });
});
