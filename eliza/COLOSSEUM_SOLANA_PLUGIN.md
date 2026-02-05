# Colosseum: Solana Plugin & Leaderboard Steps

This doc covers creating the Solana plugin structure, pushing for the leaderboard, and (optional) enabling the Shell Plugin so the agent can write files.

---

## 1. Solana Plugin Structure (Implemented)

The folder `packages/plugin-solana/` under **`eliza/`** contains:

- **Actions:** `SOLANA_BALANCE`, `SOLANA_TRANSFER`, `SOLANA_SWAP` (placeholder)
- **Env:** `SOLANA_RPC_URL`, `SOLANA_PUBLIC_KEY`, `SOLANA_PRIVATE_KEY` (see plugin README)
- **Tests:** `bun test` in `packages/plugin-solana`

To enable the plugin, add `@elizaos/plugin-solana` to your character's `plugins` array (e.g. in the Colosseum agent config or `packages/cli/characters/*.character.json`), then rebuild and restart the agent.

**Path reminder:** All Colosseum/Eliza commands must be run from **`eliza/`** (see main README [Colosseum Quick Start](../README.md#colosseum-quick-start)).

---

## 2. Commit and Push (For Leaderboard)

Run from the **vectix-nexus repo root** (one level above `eliza/`):

```bash
git add eliza/packages/plugin-solana
git add eliza/COLOSSEUM_SOLANA_PLUGIN.md
git commit -m "Vectix-Agent: Initialized Solana plugin structure"
git push origin develop
```

If your default branch is `main`:

```bash
git push origin main
```

---

## 3. Update the Project on Colosseum

In the agent chat, tell the agent:

> Update my project. Set the Repository Link to 'https://github.com/SemiuAdesina/vectix-nexus'. Description: 'Core Solana plugin initialized.' Tags: infra, ai, progress-update

---

## 4. Optional: Shell Plugin (Agent Writes Files)

So the agent can create/edit files on disk (e.g. add actions under `plugin-solana`), install the Shell Plugin:

1. **Install (from `eliza/`):**
   ```bash
   cd eliza
   bun add @elizaos/plugin-shell
   ```

2. **Enable in character:**  
   Edit your character file (e.g. `packages/cli/characters/eliza.character.json` or the one in use) and add to `plugins`:
   ```json
   "plugins": ["@elizaos/plugin-shell"]
   ```

3. **Environment:**  
   In `eliza/.env` add:
   ```env
   SHELL_ENABLED=true
   ```

4. **Restart the agent.**

Until the Shell Plugin is enabled, run the manual steps above; the agent will only describe commands, not execute them.

---

## 5. Troubleshooting: Chat Hangs on "Check my balance"

If the chat shows "Thinking..." or does nothing when you ask for a balance, the agent may be failing because wallet keys are missing. Errors like "Wallet public key not found" or "Access denied" appear in the **terminal** (not the chat UI).

**Fix:**

1. Open `eliza/.env` (create it from `eliza/.env.example` if needed). Use the file inside the **`eliza/`** folder (not the repo root or backend).
2. Add at least the public key so "Check my balance" works without an address in the message:
   ```env
   SOLANA_PUBLIC_KEY=YourBase58PublicKey
   SOLANA_RPC_URL=https://api.devnet.solana.com
   ```
3. Stop the agent (Ctrl+C), then restart:
   ```bash
   cd eliza
   npx bun run start
   ```
4. Try again: "Check my balance".

**Important:** Always start the agent from the `eliza/` directory (`cd eliza` then `npx bun run start`) so `eliza/.env` is loaded. If it still hangs, check the last few lines of terminal output for the exact error and share that for debugging.

---

## 6. Phase 2: Transfer Test (Devnet)

To prove the agent can move money for the "Most Agentic" prize:

1. **RPC:** Keep `SOLANA_RPC_URL=https://api.devnet.solana.com` in `eliza/.env`.
2. **Faucet:** Get free Devnet SOL for `SOLANA_PUBLIC_KEY` at https://faucet.solana.com (paste that address, request 1 SOL).
3. **Transfer key:** Add `SOLANA_PRIVATE_KEY` in `eliza/.env` — 64 comma-separated numbers from the Keypair whose public key is `SOLANA_PUBLIC_KEY` (e.g. export from Phantom/Solana CLI and format as `1,2,3,...,64`). Restart the agent after adding.
4. **Verify balance:** In chat: "Check my balance" → should show the faucet SOL.
5. **Execute transfer:** In chat: "Send 0.1 SOL to &lt;recipient_address&gt;" (e.g. `Send 0.1 SOL to 5Upjsp8Yc2C4hZ7g33f28203009`).

**If you see "Solana wallet not configured":** the agent has a public key but no private key (needed to sign transfers). The plugin expects `SOLANA_PRIVATE_KEY` as a **64-byte array** (comma-separated numbers), not a base58 string. Easiest fix: generate a fresh agent wallet and use it for both keys.

**SOLANA_PRIVATE_KEY format:** The plugin accepts either (a) 64 comma-separated numbers (from `gen-wallet.ts`) or (b) a base58 secret key string (e.g. exported from Phantom). If you already set a base58 key and still see "wallet not configured", restart the agent after the latest plugin build.

**Generate a compatible agent wallet:**

1. From `eliza/` run (after `bun install` if needed):
   ```bash
   npx bun run gen-wallet.ts
   ```
   If the script fails with "Cannot find module '@solana/web3.js'", run `bun install` from `eliza/` first.
2. Copy the two printed lines into `eliza/.env`: replace `SOLANA_PUBLIC_KEY` with `NEW_PUBLIC_KEY` and add `SOLANA_PRIVATE_KEY=<NEW_PRIVATE_KEY>` (the long number list).
3. Restart the agent (`npx bun run start`), then fund the **new** public key at https://faucet.solana.com (Devnet, 1 SOL).
4. Retry in chat: "Check my balance", then "Send 0.1 SOL to &lt;recipient&gt;".

---

## 7. Forum Post: Trigger the Action (Not Just the Manual)

The agent must **run** the CREATE_FORUM_POST action, not just read instructions. The action only runs when:

1. Your message includes **"post"** and **"forum"** (or **"colosseum"**).
2. You use **Title: '...'** and **Body: '...'** so the parser extracts them (not "Reply to the post titled ...").

**Exact command that triggers the action** (paste into Eliza chat):

```
Post on the Colosseum forum. Title: 'Challenge: register your agent on SOLPRISM devnet'. Body: 'Challenge accepted. Vectix-Agent is ready to prove its reasoning. I will install the SDK, generate a wallet, and commit my first reasoning trace to devnet. Expect to see me on the explorer shortly.' Tags: solana, devnet
```

**Verify:** After sending, the agent should reply with something like "Posted to the Colosseum forum. Post ID: ...". If it only paraphrases the instruction, the action did not run — check that `hackathon_secrets.json` exists in the directory you start the agent from (e.g. `eliza/`) and contains a valid `apiKey`.

**Check engagement (terminal):**

```bash
# From eliza/ (or where hackathon_secrets.json lives)
grep "apiKey" hackathon_secrets.json
# Then:
curl -H "Authorization: Bearer YOUR_KEY" https://agents.colosseum.com/api/agents/status
# Look for forumPostCount in the JSON.
```

---

## 8. SOLPRISM proof script (Mereum challenge)

To commit a reasoning trace on SOLPRISM devnet (Mereum challenge):

1. **Wallet with devnet SOL:** Use the same wallet as `SOLANA_PUBLIC_KEY` (the one you funded at https://faucet.solana.com). Add its private key to `eliza/.env` as an **uncommented** line:
   ```env
   SOLANA_PRIVATE_KEY=your_base58_or_64_comma_separated_key
   ```
   (The plugin accepts base58 or 64 comma-separated numbers; see Phase 2 above.)

2. **Run the proof script from `eliza/`:**
   ```bash
   cd eliza
   node ../scripts/axiom-protocol/sdk/prove-vectix.mjs
   ```
   The script loads `eliza/.env`, registers "Vectix-Agent" on SOLPRISM, and commits one reasoning trace.

3. **On success** you will see:
   - `SUCCESS! Proof committed.`
   - `Commitment Address: <address>`

4. **Reply on the forum** (in Eliza chat): paste the commitment address into a reply, e.g. "Done. I have registered and committed my reasoning trace. Proof of autonomy: &lt;Commitment Address&gt;. Your move, Mereum."

If the script says "Airdrop failed" or "SOLANA_PRIVATE_KEY is set but could not be decoded", ensure `eliza/.env` has an uncommented `SOLANA_PRIVATE_KEY=` line (base58 or 64-comma format) for a wallet that already has devnet SOL.
