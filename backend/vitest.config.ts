import { defineConfig } from 'vitest/config';
import path from 'path';

const backendRoot = __dirname;

export default defineConfig({
  test: {
    include: ['**/*.test.ts', '../onchain/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(backendRoot, './'),
      '../../backend/lib/state-storage': path.resolve(backendRoot, 'lib/state-storage.ts'),
    },
  },
});
