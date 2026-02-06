import type { Plugin } from '@elizaos/core';
import * as actions from './actions/index.ts';

export const solanaPlugin: Plugin = {
  name: 'solana',
  description: 'Solana plugin: transfer SOL, check balance, swap placeholder',
  actions: [actions.solanaBalanceAction, actions.solanaTransferAction, actions.solanaSwapAction],
};

export { solanaBalanceAction, solanaTransferAction, solanaSwapAction } from './actions/index.ts';
export { getSolanaConnection } from './lib/connection.ts';
export default solanaPlugin;
