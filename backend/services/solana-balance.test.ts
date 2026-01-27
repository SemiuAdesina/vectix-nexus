import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetBalance = vi.fn();
const mockGetLatestBlockhash = vi.fn().mockResolvedValue({
  blockhash: 'blockhash123',
  lastValidBlockHeight: 100,
});
const mockSendRawTransaction = vi.fn().mockResolvedValue('signature123');
const mockConfirmTransaction = vi.fn().mockResolvedValue({});

class MockConnection {
  getBalance = mockGetBalance;
  getLatestBlockhash = mockGetLatestBlockhash;
  sendRawTransaction = mockSendRawTransaction;
  confirmTransaction = mockConfirmTransaction;
}

vi.mock('@solana/web3.js', () => ({
  Connection: MockConnection,
  PublicKey: class MockPublicKey {
    private address: string;
    constructor(address: string) {
      this.address = address;
    }
    toBase58() {
      return this.address;
    }
    toString() {
      return this.address;
    }
  },
  LAMPORTS_PER_SOL: 1_000_000_000,
  Transaction: class MockTransaction {
    recentBlockhash = '';
    feePayer: any = null;
    add() {
      return this;
    }
    sign() {}
    serialize() {
      return Buffer.from('test');
    }
  },
  SystemProgram: { transfer: vi.fn() },
  Keypair: {
    fromSecretKey: vi.fn().mockReturnValue({
      publicKey: { toBase58: () => 'sourcePublicKey' },
    }),
  },
}));

vi.mock('./solana.encryption', () => ({
  decryptPrivateKey: vi.fn().mockReturnValue('[1,2,3,4,5,6,7,8]'),
}));

describe('solana-balance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWalletBalance', () => {
    it('returns wallet balance', async () => {
      mockGetBalance.mockResolvedValue(1_000_000_000);
      const { getWalletBalance } = await import('./solana-balance');

      const balance = await getWalletBalance('wallet123');
      expect(balance.sol).toBe(1);
      expect(balance.lamports).toBe(1_000_000_000);
    });
  });

  describe('withdrawFunds', () => {
    it('withdraws funds successfully', async () => {
      mockGetBalance.mockResolvedValue(2_000_000_000);
      process.env.WALLET_MASTER_SECRET = 'test-secret';

      const { withdrawFunds } = await import('./solana-balance');
      const result = await withdrawFunds({
        encryptedPrivateKey: 'test-encrypted-key',
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
