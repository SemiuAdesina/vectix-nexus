import { describe, it, expect } from 'vitest';
import { PRICING_PLANS, isStripeConfigured } from './stripe.config';

describe('PRICING_PLANS', () => {
  it('has hobby plan configuration', () => {
    expect(PRICING_PLANS.hobby).toBeDefined();
    expect(PRICING_PLANS.hobby.name).toBe('Hobby Agent');
    expect(PRICING_PLANS.hobby.price).toBe(2900);
    expect(PRICING_PLANS.hobby.features).toContain('1 Agent');
  });

  it('has pro plan configuration', () => {
    expect(PRICING_PLANS.pro).toBeDefined();
    expect(PRICING_PLANS.pro.name).toBe('Pro Agent');
    expect(PRICING_PLANS.pro.price).toBe(9900);
    expect(PRICING_PLANS.pro.features).toContain('5 Agents');
  });
});

describe('isStripeConfigured', () => {
  it('is a boolean', () => {
    expect(typeof isStripeConfigured).toBe('boolean');
  });
});
