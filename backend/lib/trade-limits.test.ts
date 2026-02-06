import { describe, it, expect } from 'vitest';
import { checkTradeAmount } from './trade-limits';

describe('checkTradeAmount', () => {
  it('allows valid paper trade', () => {
    expect(checkTradeAmount(1, 'paper').allowed).toBe(true);
  });

  it('allows valid live trade within limit', () => {
    expect(checkTradeAmount(10, 'live').allowed).toBe(true);
  });

  it('rejects zero amount', () => {
    const r = checkTradeAmount(0, 'paper');
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('positive');
  });

  it('rejects negative amount', () => {
    const r = checkTradeAmount(-1, 'paper');
    expect(r.allowed).toBe(false);
  });

  it('rejects amount below minimum', () => {
    const r = checkTradeAmount(0.0001, 'paper');
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('Minimum');
  });

  it('rejects live trade exceeding max (default 50)', () => {
    const r = checkTradeAmount(100, 'live');
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('Maximum');
  });

  it('allows paper trade exceeding max', () => {
    expect(checkTradeAmount(100, 'paper').allowed).toBe(true);
  });
});
