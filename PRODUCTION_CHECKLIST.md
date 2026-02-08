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
7. Unset: `ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION`, `ENABLE_NARRATIVE_DEMO`. For VPS: set `MOCK_FLY_DEPLOY=true` (no Fly); for Fly.io: unset `MOCK_FLY_DEPLOY`

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

---

## Enabling Real (Live) Trading

To allow users to trade real SOL on mainnet instead of paper/shadow only, change the following.

### 1. Subscription and API tier

- **Pro tier required for live:** The public API forces `mode: 'paper'` for free-tier API keys. Live trades are only accepted when the key’s tier is `pro`.
- **Set:** User must have an **active Stripe subscription** (Pro plan). API keys created while the user has an active subscription get `tier: 'pro'` (see `backend/services/api-keys/api-key.service.ts`: subscription lookup → tier).
- **Do not set:** `ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION` (or set to `false`). Deploy should require an active subscription so only paying users can deploy agents.

### 2. Environment (root `.env`)

- **Stripe:** Live keys `STRIPE_SECRET_KEY=sk_live_...`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`, live webhook secret, and live price IDs for your Pro plan.
- **Clerk:** Production secret key (no test key in production).
- **Solana:** Paid RPC (e.g. Helius mainnet). `SOLANA_RPC_URL` must not be the public `https://api.mainnet-beta.solana.com` (env validation blocks it in production).
- **Secrets:** `SECRETS_ENCRYPTION_KEY` at least 32 characters (for agent wallet encryption).
- **Unset in production:** `ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION`, `ENABLE_NARRATIVE_DEMO`, `ALLOW_TEST_KEYS_IN_PRODUCTION` (unless you explicitly allow test keys for a short period).
- **VPS:** Keep `MOCK_FLY_DEPLOY=true` if you run agents in Docker on the VPS; no `FLY_*` needed.

### 3. Trade execution path

- The route `POST /v1/agents/:id/trade` with `mode: 'live'` runs security checks (circuit breaker, threat intel, supervisor, audit) and returns success when approved. It does **not** send a Solana transaction itself.
- **You must wire real execution** in the component that holds the agent’s wallet (e.g. Eliza Solana plugin or your executor):
  1. Build the unsigned transaction.
  2. Call `POST /api/preflight/evaluate` with serialized transaction, wallet, expected balance change, agentId, action.
  3. If `approved === true`, sign and send the transaction; otherwise abort.
- Ensure the agent’s wallet is funded on mainnet and that you use the same paid RPC and mainnet config for execution.

### 4. Limits and safety (already in code)

- **Trade limits:** `MAX_TRADE_AMOUNT_SOL` caps live trade size; `checkTradeAmount()` in `backend/lib/trade-limits.ts` enforces it.
- **Withdrawals:** Whitelist and caps apply; set `MAX_WITHDRAWAL_PER_TX_SOL` / `MAX_WITHDRAWAL_PER_DAY_SOL` if used.
- **Circuit breaker / Redis:** Set `REDIS_URL` so circuit breaker state persists across restarts.

### 5. Checklist summary

| Item | Action |
|------|--------|
| Stripe | Live keys + live Pro price ID + live webhook |
| Clerk | Production secret key |
| Solana RPC | Paid mainnet RPC (e.g. Helius) |
| SECRETS_ENCRYPTION_KEY | ≥ 32 chars |
| ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION | Unset or false |
| ENABLE_NARRATIVE_DEMO | Unset or false |
| User subscription | User on Pro so API key tier is `pro` |
| Trade body | Send `mode: 'live'` when calling `POST /v1/agents/:id/trade` |
| Executor | Preflight → sign & send on approval |
