import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { getSolanaConnection } from '../connection.ts';

describe('getSolanaConnection', () => {
  const orig = process.env.SOLANA_RPC_URL;

  afterEach(() => {
    if (orig !== undefined) {
      process.env.SOLANA_RPC_URL = orig;
    } else {
      delete process.env.SOLANA_RPC_URL;
    }
  });

  it('returns Connection instance', () => {
    const conn = getSolanaConnection();
    expect(conn).toBeDefined();
    expect(conn.rpcEndpoint).toBeDefined();
  });

  it('uses SOLANA_RPC_URL when set', () => {
    process.env.SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';
    const conn = getSolanaConnection();
    expect(conn.rpcEndpoint).toBe('https://api.mainnet-beta.solana.com');
  });

  it('uses default devnet when SOLANA_RPC_URL not set', () => {
    delete process.env.SOLANA_RPC_URL;
    const conn = getSolanaConnection();
    expect(conn.rpcEndpoint).toContain('devnet');
  });
});
