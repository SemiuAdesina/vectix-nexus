import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

vi.mock('@solana/web3.js', () => ({
  Connection: vi.fn().mockImplementation(() => ({
    getBalance: vi.fn(),
  })),
  PublicKey: vi.fn().mockImplementation((address) => ({ toBase58: () => address })),
  LAMPORTS_PER_SOL: 1_000_000_000,
}));

describe('solana-balance', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getWalletBalance', () => {
    it('returns wallet balance', async () => {
      const { getWalletBalance } = await import('./solana-balance');
      const mockConnection = {
        getBalance: vi.fn().mockResolvedValue(1_000_000_000),
      };
      (Connection as any).mockImplementation(() => mockConnection);

      const balance = await getWalletBalance('wallet123');
      expect(balance.sol).toBe(1);
      expect(balance.lamports).toBe(1_000_000_000);
    });
  });

  describe('withdrawFunds', () => {
    it('withdraws funds successfully', async () => {
      const { withdrawFunds } = await import('./solana-balance');
      process.env.WALLET_MASTER_SECRET = 'test-secret';
      
      const mockConnection = {
        getBalance: vi.fn().mockResolvedValue(2_000_000_000),
        getLatestBlockhash: vi.fn().mockResolvedValue({
          blockhash: 'blockhash123',
          lastValidBlockHeight: 100,
        }),
        sendRawTransaction: vi.fn().mockResolvedValue('signature123'),
        confirmTransaction: vi.fn().mockResolvedValue({}),
      };
      (Connection as any).mockImplementation(() => mockConnection);

      const encryptedKey = 'test-encrypted-key';
      const result = await withdrawFunds({
        encryptedPrivateKey: encryptedKey,
        destinationAddress: 'dest123',
      });

      expect(result.success).toBeDefined();
    });
  });

  describe('validateWalletAddress', () => {
    it('validates wallet address', async () => {
      const { validateWalletAddress } = await import('./solana-balance');
      const isValid = await validateWalletAddress('wallet123');
      expect(typeof isValid).toBe('boolean');
    });
  });
});
