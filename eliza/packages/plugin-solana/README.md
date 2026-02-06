# Vectix Solana Plugin

ElizaOS plugin for Solana: transfer SOL, check balance, and a swap placeholder.

## Actions

- **SOLANA_BALANCE** — Query SOL balance for an address (from message or `SOLANA_PUBLIC_KEY`).
- **SOLANA_TRANSFER** — Send SOL to an address (requires `SOLANA_PRIVATE_KEY`).
- **SOLANA_SWAP** — Placeholder; returns a message that swap is not implemented.

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `SOLANA_RPC_URL` | No | RPC endpoint (default: devnet). |
| `SOLANA_PUBLIC_KEY` | For "my balance" | Wallet public key when user says "check my balance". |
| `SOLANA_PRIVATE_KEY` | For transfer | Sender key: either 64 comma-separated numbers (from `gen-wallet.ts`) or a base58 string (e.g. Phantom export). |

Run the agent from the `eliza/` directory of vectix-nexus. Add `@elizaos/plugin-solana` to your agent's plugins in the project config.

**If chat hangs on "Check my balance":** set `SOLANA_PUBLIC_KEY` (and optionally `SOLANA_RPC_URL`) in `eliza/.env`, then restart the agent.
