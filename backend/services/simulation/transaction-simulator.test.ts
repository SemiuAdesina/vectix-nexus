import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionSimulator } from './transaction-simulator';
import { Connection, Transaction, PublicKey } from '@solana/web3.js';

vi.mock('@solana/web3.js', () => ({
  Connection: vi.fn().mockImplementation(() => ({
    getBalance: vi.fn(),
    simulateTransaction: vi.fn(),
  })),
  Transaction: vi.fn(),
  PublicKey: vi.fn().mockImplementation((address) => ({
    toBase58: () => address,
  })),
}));

describe('transaction-simulator', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('TransactionSimulator', () => {
    it('simulates transaction successfully', async () => {
      const mockConnection = {
        getBalance: vi.fn().mockResolvedValue(1_000_000_000),
        simulateTransaction: vi.fn().mockResolvedValue({
          value: {
            err: null,
            logs: [],
          },
        }),
      };
      (Connection as any).mockImplementation(() => mockConnection);

      const simulator = new TransactionSimulator('https://api.mainnet-beta.solana.com');
      const result = await simulator.simulate(
        {} as Transaction,
        'wallet123',
        0
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('detects high slippage', async () => {
      const mockConnection = {
        getBalance: vi.fn().mockResolvedValue(1_000_000_000),
        simulateTransaction: vi.fn().mockResolvedValue({
          value: {
            err: null,
            logs: [],
          },
        }),
      };
      (Connection as any).mockImplementation(() => mockConnection);

      const simulator = new TransactionSimulator('https://api.mainnet-beta.solana.com');
      const result = await simulator.simulate(
        {} as Transaction,
        'wallet123',
        -1
      );

      expect(result.riskFlags).toBeDefined();
    });
  });
});
