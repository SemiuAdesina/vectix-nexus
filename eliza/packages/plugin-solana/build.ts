#!/usr/bin/env bun

import { createBuildRunner } from '../../build-utils';

const run = createBuildRunner({
  packageName: '@elizaos/plugin-solana',
  buildOptions: {
    entrypoints: ['src/index.ts'],
    outdir: 'dist',
    target: 'node',
    format: 'esm',
    external: ['@elizaos/core', '@solana/web3.js', 'fs', 'path'],
    sourcemap: true,
    minify: false,
    generateDts: true,
  },
});

run().catch((err) => {
  console.error('Build error:', err);
  process.exit(1);
});
