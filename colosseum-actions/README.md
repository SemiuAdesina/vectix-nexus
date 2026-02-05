# Colosseum Hackathon Actions (vectix-nexus)

Actions for the Colosseum Agent Hackathon. Types use `IAgentRuntime`, `Memory`, `State` from `@elizaos/core`.

## Actions

- **REGISTER_HACKATHON** — POST to `/api/agents`; optional “using the name X” in message; saves `apiKey` and `claimCode` to `hackathon_secrets.json`.
- **CHECK_HEARTBEAT** — GET `https://colosseum.com/heartbeat.md` and summarize the current hackathon stage.
- **CREATE_FORUM_POST** — POST to `/api/forum/posts` (uses API key from secrets); parses Title, Body, Tags from message.
- **CREATE_PROJECT_DRAFT** — POST to `/api/my-project` (uses API key); parses Name, Description, Tags from message.

## Integration (move into ElizaOS)

**See [BATTLE_PLAN.md](./BATTLE_PLAN.md)** for the exact sequence (Move → Register → Heartbeat → Forum → Project).  
**See [INTEGRATION.md](./INTEGRATION.md)** for copy-paste integration steps:

- **Option B (fast):** Copy the two action files into an existing plugin’s `src/actions/` and add them to that plugin’s `actions` array.
- **Option A (clean):** Create `packages/plugin-colosseum` in your ElizaOS project, copy these files, and register the plugin in your agent config.

After integration: run `pnpm build` and `pnpm start`, then in chat say **"Please register for the Colosseum Hackathon now."**

## API reference

See `../colosseum_docs.md` in this repo for the full Colosseum API (base URL: `https://agents.colosseum.com/api`).
