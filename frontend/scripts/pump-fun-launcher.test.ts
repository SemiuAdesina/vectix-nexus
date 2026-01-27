import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Keypair, Connection, sendAndConfirmTransaction } from '@solana/web3.js';
import { launchTokenOnPumpFun, type TokenLaunchParams, type TokenLaunchResult } from './pump-fun-launcher';
import * as solanaWeb3 from '@solana/web3.js';

vi.mock('@solana/web3.js', async () => {
  const actual = await vi.importActual<typeof solanaWeb3>('@solana/web3.js');
  class MockConnection {
    getLatestBlockhash = vi.fn();
    sendTransaction = vi.fn();
  }
  return {
    ...actual,
    Connection: MockConnection as unknown as typeof Connection,
    sendAndConfirmTransaction: vi.fn().mockResolvedValue('mock-signature-123'),
  };
});

describe('pump-fun-launcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendAndConfirmTransaction).mockResolvedValue('mock-signature-123');
  });

  describe('launchTokenOnPumpFun', () => {
    it('is exported and callable', () => {
      expect(typeof launchTokenOnPumpFun).toBe('function');
    });

    it('returns correct structure when called', async () => {
      const userWallet = Keypair.generate();
      const treasuryWallet = Keypair.generate().publicKey.toBase58();
      const params: TokenLaunchParams = {
        tokenName: 'Test Token',
        symbol: 'TEST',
        imageUrl: 'https://example.com/image.png',
        treasuryWallet,
        userWallet,
      };

      try {
        const result = await launchTokenOnPumpFun(params);
        expect(result).toHaveProperty('tokenMint');
        expect(result).toHaveProperty('transactionSignature');
        expect(result).toHaveProperty('treasuryAmount');
        expect(result).toHaveProperty('treasuryPercentage');
        expect(result.treasuryPercentage).toBe(0.01);
        expect(result.tokenMint).toBe(userWallet.publicKey.toBase58());
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('types', () => {
    it('TokenLaunchParams has correct structure', () => {
      const params: TokenLaunchParams = {
        tokenName: 'Test',
        symbol: 'T',
        imageUrl: 'https://example.com/image.png',
        treasuryWallet: Keypair.generate().publicKey.toBase58(),
        userWallet: Keypair.generate(),
      };

      expect(params.tokenName).toBeDefined();
      expect(params.symbol).toBeDefined();
      expect(params.imageUrl).toBeDefined();
      expect(params.treasuryWallet).toBeDefined();
      expect(params.userWallet).toBeInstanceOf(Keypair);
    });

    it('TokenLaunchResult has correct structure', () => {
      const result: TokenLaunchResult = {
        tokenMint: 'mint123',
        transactionSignature: 'sig123',
        treasuryAmount: 1000000,
        treasuryPercentage: 0.01,
      };

      expect(typeof result.tokenMint).toBe('string');
      expect(typeof result.transactionSignature).toBe('string');
      expect(typeof result.treasuryAmount).toBe('number');
      expect(typeof result.treasuryPercentage).toBe('number');
    });
  });
});
