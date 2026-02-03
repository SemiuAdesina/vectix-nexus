import { describe, expect, it } from 'bun:test';
import { solanaPlugin } from '../index.ts';

describe('solanaPlugin', () => {
  it('exports plugin with name and description', () => {
    expect(solanaPlugin.name).toBe('solana');
    expect(solanaPlugin.description).toContain('Solana');
  });

  it('has three actions', () => {
    expect(solanaPlugin.actions).toHaveLength(3);
    const names = solanaPlugin.actions!.map((a) => a.name);
    expect(names).toContain('SOLANA_BALANCE');
    expect(names).toContain('SOLANA_TRANSFER');
    expect(names).toContain('SOLANA_SWAP');
  });
});
