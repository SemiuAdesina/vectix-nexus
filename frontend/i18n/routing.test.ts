import { describe, it, expect } from 'vitest';
import { routing } from './routing';

describe('i18n routing', () => {
  it('defines single supported locale', () => {
    expect(routing.locales).toEqual(['en']);
  });

  it('uses en as default locale', () => {
    expect(routing.defaultLocale).toBe('en');
  });

  it('uses never prefix so URLs have no locale segment', () => {
    expect(routing.localePrefix).toBe('never');
  });
});
