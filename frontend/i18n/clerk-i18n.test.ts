import { describe, it, expect } from 'vitest';
import { routing } from './routing';

describe('Clerk + i18n', () => {
  it('uses single locale and no locale prefix so paths are /sign-in not /en/sign-in', () => {
    expect(routing.localePrefix).toBe('never');
    expect(routing.locales).toEqual(['en']);
  });

  it('exposes default locale for Clerk redirect fallback', () => {
    expect(routing.defaultLocale).toBe('en');
  });

  it('public routes are sign-in and sign-up without locale segment', () => {
    expect('/sign-in').toMatch(/sign-in/);
    expect('/sign-up').toMatch(/sign-up/);
  });
});
