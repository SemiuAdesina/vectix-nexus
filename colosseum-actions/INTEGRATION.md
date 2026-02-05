# Colosseum Plugin — Integration (vectix-nexus)

The code lives in **vectix-nexus/colosseum-actions/**. It uses `IAgentRuntime`, `Memory`, `State` from `@elizaos/core`; types resolve once the files are inside your ElizaOS project (where `@elizaos/core` is installed). To use it, move it into your **ElizaOS project** (your `eliza/` clone).

---

## Option B: Fast (drop into existing plugin)

1. **Open your ElizaOS project** (the repo you run with `pnpm start`, e.g. your `eliza/` clone).

2. **Pick an existing plugin** that has `src/actions/` (e.g. `plugin-bootstrap` or your wrapper).

3. **Copy the action files and helper** from vectix-nexus into that plugin:
   - `colosseum-actions/src/actions/registerForHackathon.ts` → `src/actions/`
   - `colosseum-actions/src/actions/checkHeartbeat.ts` → `src/actions/`
   - `colosseum-actions/src/actions/createForumPost.ts` → `src/actions/`
   - `colosseum-actions/src/actions/createProjectDraft.ts` → `src/actions/`
   - `colosseum-actions/src/lib/secrets.ts` → `src/lib/` (create `src/lib/` if needed)

4. **Register the actions** in that plugin’s `src/index.ts`:
   ```ts
   import { registerForHackathon } from './actions/registerForHackathon';
   import { checkHeartbeat } from './actions/checkHeartbeat';
   import { createForumPost } from './actions/createForumPost';
   import { createProjectDraft } from './actions/createProjectDraft';

   actions: [..., registerForHackathon, checkHeartbeat, createForumPost, createProjectDraft],
   ```

5. **Build and run:**
   ```bash
   pnpm build
   pnpm start
   ```

6. **In chat with your agent, say:**
   > Please register for the Colosseum Hackathon now.

   The agent will call the API and write `apiKey` and `claimCode` to `hackathon_secrets.json` in the process cwd.

---

## Option A: New plugin (cleaner)

1. **In your ElizaOS project root:**
   ```bash
   mkdir -p packages/plugin-colosseum/src/actions
   ```

2. **Copy files:**
   - `vectix-nexus/colosseum-actions/src/actions/registerForHackathon.ts` → `packages/plugin-colosseum/src/actions/`
   - `vectix-nexus/colosseum-actions/src/actions/checkHeartbeat.ts` → `packages/plugin-colosseum/src/actions/`
   - `vectix-nexus/colosseum-actions/src/index.ts` → `packages/plugin-colosseum/src/`

3. **Add package.json** in `packages/plugin-colosseum/` (use vectix-nexus/colosseum-actions/package.json as reference; ensure `@elizaos/core` is a dependency or peerDependency).

4. **Register the plugin** in your agent config (e.g. `packages/project-starter/src/index.ts` or wherever your agent is defined):
   ```ts
   import { colosseumPlugin } from '@vectix/plugin-colosseum';  // or path to packages/plugin-colosseum

   plugins: [colosseumPlugin, ...otherPlugins],
   ```

5. **Wire the workspace** if needed (add `"@vectix/plugin-colosseum": "workspace:*"` to the root `package.json` and run `pnpm install`).

6. **Build and run:**
   ```bash
   pnpm build
   pnpm start
   ```

---

## After integration

- **Register:** In chat: *"Please register for the Colosseum Hackathon now."*
- **Heartbeat:** *"Check the hackathon heartbeat."*

`hackathon_secrets.json` is created in the **current working directory** when you start the agent (usually the ElizaOS project root). It is in `.gitignore`; do not commit it.
