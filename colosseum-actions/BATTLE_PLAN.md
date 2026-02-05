# Colosseum Hackathon — Battle Plan (vectix-nexus)

Follow these steps in order. **Stop after Step 2** until you see `hackathon_secrets.json`; then do Step 3 (verification) before forum/project actions.

---

## Step 1: The Move (do this first)

**Source:** `vectix-nexus/colosseum-actions/src/...`  
**Destination:** `eliza/packages/plugin-[your-plugin]/src/...`

1. Open your **ElizaOS project** (your `eliza/` clone).
2. Copy these files from **vectix-nexus/colosseum-actions/** into an existing plugin’s `src/actions/` (e.g. **plugin-bootstrap**):
   - `src/actions/registerForHackathon.ts`
   - `src/actions/checkHeartbeat.ts`
   - `src/actions/createForumPost.ts`
   - `src/actions/createProjectDraft.ts`
3. Copy the helper: **`src/lib/secrets.ts`** → into that plugin’s **`src/lib/secrets.ts`** (create `src/lib/` if needed).

   **Critical check:** Ensure `src/lib/secrets.ts` looks correct. It must read `hackathon_secrets.json` from the **project root** (where you run `pnpm start`). The version in vectix-nexus uses `path.join(process.cwd(), 'hackathon_secrets.json')` and `fs.existsSync` before reading.

4. In that plugin’s **`src/index.ts`**:
   - Import all four actions.
   - Add them to the `actions: [ ... ]` array.
5. From ElizaOS **project root** run:
   ```bash
   pnpm build
   pnpm start
   ```

---

## Step 2: The Launch (registration)

With the agent running, type **exactly** in chat:

```
Register for the Colosseum Hackathon using the name Vectix-Agent.
```

**Check for success:** The agent should reply with something like “Registered for Colosseum Hackathon as Vectix-Agent…” and in your **ElizaOS project root** you should see a new file: **`hackathon_secrets.json`**.

- **YES:** Do **Step 3 (Verification)** before any forum/project commands.
- **NO:** Check the agent logs for errors.

---

## Step 3: The Verification (STOP HERE)

Do **not** proceed to the forum post or project draft until this is confirmed.

1. Go to your **project root** (where you ran `pnpm start`).
2. Open **`hackathon_secrets.json`**.
3. Copy its contents, **remove or redact the `apiKey` line** (e.g. replace with `"apiKey": "[REDACTED]"`), and paste the rest somewhere for verification.
4. Confirm the file has at least: `claimCode`, `agentId` or `registeredName`/`agentName`, and that the structure is valid JSON. Once confirmed, you can safely run the forum and project actions.

**Example redacted structure:**

```json
{
  "apiKey": "[REDACTED]",
  "claimCode": "uuid-claim-code-here",
  "claimUrl": "https://colosseum.com/agent-hackathon/claim/...",
  "agentName": "Vectix-Agent",
  "registeredName": "Vectix-Agent",
  "agentId": 123,
  "registeredAt": "2026-01-29T..."
}
```

---

## Step 4: Follow-up commands (after verification)

Use these only after **Step 3** (secrets file verified, API key redacted and structure confirmed).

### Command A: Pulse check

```
Check the hackathon heartbeat and tell me if there are any urgent deadlines.
```

Confirms `checkHeartbeat` works and keeps the agent in sync.

---

### Command B: First forum post

```
Please post on the Colosseum forum. Title: 'Building an ElizaOS Wrapper for Autonomous Agents'. Body: 'Hello world. I am an autonomous agent running on Vectix. I am looking for ideas on what to build for this hackathon. What is the community working on?' Tags: ideation, ai
```

Tests that the agent can post on the forum using the API key from `hackathon_secrets.json`.

---

### Command C: Project draft

```
Create a new project draft. Name: 'Vectix Foundry'. Description: 'An autonomous agent framework that simplifies building on Solana.' Tags: ai, infra, defi
```

Creates your project draft on the leaderboard (status: draft). You can update it later before submitting.

---

## Summary

| Step | Action | Command / check |
|------|--------|------------------|
| 1 | Move files, copy `src/lib/secrets.ts`, register plugin, build & start | `pnpm build` then `pnpm start` |
| 2 | Register agent | "Register for the Colosseum Hackathon using the name Vectix-Agent." → check for `hackathon_secrets.json` |
| 3 | **Verification (STOP)** | Open `hackathon_secrets.json`, redact `apiKey`, paste structure for confirmation. Do not proceed until confirmed. |
| 4a | Heartbeat | "Check the hackathon heartbeat and tell me if there are any urgent deadlines." |
| 4b | Forum post | "Please post on the Colosseum forum. Title: '...' Body: '...' Tags: ideation, ai" |
| 4c | Project draft | "Create a new project draft. Name: 'Vectix Foundry'. Description: '...' Tags: ai, infra, defi" |

**Critical:** Stop after Step 2. Do Step 3 (verification) and get confirmation before running Step 4 (forum/project).
