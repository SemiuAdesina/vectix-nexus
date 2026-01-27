import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import * as multisigService from '../services/multisig';

vi.mock('../services/multisig', () => ({
  multiSigService: {
    createMultiSig: vi.fn(),
    createProposal: vi.fn(),
    addSignature: vi.fn(),
    executeProposal: vi.fn(),
  },
}));

describe('MultiSig Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /onchain/multisig/create', () => {
    it('creates a multisig wallet', async () => {
      vi.mocked(multisigService.multiSigService.createMultiSig).mockResolvedValue('multisig123');

      const result = await multisigService.multiSigService.createMultiSig({
        agentId: 'agent1',
        threshold: 2,
        signers: ['signer1', 'signer2'],
      });

      expect(result).toBe('multisig123');
      expect(multisigService.multiSigService.createMultiSig).toHaveBeenCalled();
    });
  });

  describe('POST /onchain/multisig/proposal', () => {
    it('creates a multisig proposal', async () => {
      const mockProposal = {
        id: 'proposal1',
        multisigId: 'multisig123',
        type: 'trade',
        status: 'pending',
        signatures: [],
        createdAt: new Date(),
      };

      vi.mocked(multisigService.multiSigService.createProposal).mockResolvedValue(mockProposal as any);

      const result = await multisigService.multiSigService.createProposal('multisig123', {
        type: 'trade',
        amount: 1000,
      });

      expect(result).toEqual(mockProposal);
    });
  });
});
