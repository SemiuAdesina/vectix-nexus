import { describe, it, expect } from 'vitest';
import { TransactionSimulator } from './transaction-simulator';

describe('transaction-simulator', () => {
  describe('TransactionSimulator', () => {
    it('creates simulator instance', () => {
      const simulator = new TransactionSimulator('https://api.mainnet-beta.solana.com');
      expect(simulator).toBeInstanceOf(TransactionSimulator);
    });

    it('has simulate method', () => {
      const simulator = new TransactionSimulator('https://api.mainnet-beta.solana.com');
      expect(typeof simulator.simulate).toBe('function');
    });
  });
});
