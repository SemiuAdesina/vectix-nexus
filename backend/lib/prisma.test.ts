import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('prisma', () => {
  beforeEach(() => {
    delete (globalThis as any).prisma;
  });

  afterEach(() => {
    delete (globalThis as any).prisma;
  });

  describe('prisma client', () => {
    it('exports prisma client instance', async () => {
      const { prisma } = await import('./prisma');
      expect(prisma).toBeDefined();
      expect(prisma).toHaveProperty('$connect');
      expect(prisma).toHaveProperty('$disconnect');
    });

    it('reuses same instance in non-production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      delete (globalThis as any).prisma;
      const { prisma: prisma1 } = await import('./prisma');
      const { prisma: prisma2 } = await import('./prisma');
      
      expect(prisma1).toBe(prisma2);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('creates new instance in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      delete (globalThis as any).prisma;
      const { prisma } = await import('./prisma');
      
      expect(prisma).toBeDefined();
      expect((globalThis as any).prisma).toBeUndefined();
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});
