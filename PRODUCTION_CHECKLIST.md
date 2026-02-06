# Production Readiness Checklist

## Completed

- [x] Health check endpoints (`/health`, `/ready`)
- [x] Production env validation (fails fast on mock flags, test keys, public RPC)
- [x] Preflight API (`POST /api/preflight/evaluate`) for transaction simulation before signing
- [x] Trade position limits (min/max per trade, `MAX_TRADE_AMOUNT_SOL`)
- [x] Withdrawal whitelist enforcement
- [x] Withdrawal caps (`MAX_WITHDRAWAL_PER_TX_SOL`)
- [x] AML checks on withdrawal
- [x] Withdrawal audit logging (blocked, AML blocked, complete, error)
- [x] Bug report rate limit (5/hour per IP)
- [x] Risk disclaimer on dashboard and advanced pages
- [x] Shadow mode: minimum 10 trades before GO_LIVE recommendation
- [x] Circuit breaker persists to Redis when `REDIS_URL` is set
- [x] Supervisor rules persisted to DB; rule changes delayed (`RULE_CHANGE_DELAY_MS`)
- [x] Deploy pipeline: `NEXT_PUBLIC_API_URL` from secrets

## Before Going Live

### Environment

1. Set `NODE_ENV=production`
2. Use live Stripe keys (`sk_live_*`)
3. Use production Clerk secret key
4. Use paid Solana RPC (Helius, Alchemy)
5. Set `SECRETS_ENCRYPTION_KEY` (32+ chars)
6. Set `TREASURY_WALLET_ADDRESS` for token launch
7. Unset: `ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION`, `MOCK_FLY_DEPLOY`

### Eliza Agent Integration

Wire Preflight into your Eliza Solana plugin or executor:

1. Build transaction (unsigned)
2. Serialize to base64: `Buffer.from(tx.serialize()).toString('base64')`
3. Call `POST /api/preflight/evaluate` with `{ serializedTransaction, walletAddress, expectedBalanceChange, agentId, action }`
4. If `approved === true`, sign and send; else abort

### Withdrawals

- Users must set a whitelisted wallet before withdrawing
- Whitelist is locked for 24h after changes

### Suggested Rollout

1. Devnet first: agents, deposits, withdrawals, token launch
2. Shadow mode: require min 10 trades before GO_LIVE
3. Limited beta: whitelisted users, small position limits
4. Gradual relaxation: increase limits as validated
