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
