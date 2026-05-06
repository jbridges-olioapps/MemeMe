# MemeMe

Automates the "send Shorts + react + reply" DM loop between two AI agents, then generates a static visual report judges can open in a browser.

- Planning doc: [`PLAN.md`](./PLAN.md)
- Demo script: [`DEMO.md`](./DEMO.md)

---

## What's in this repo

| App | Path | What it does |
|---|---|---|
| **MCP server** | `apps/mcp-server/` | Exposes MCP tools (thread store, shorts search, GIF search, report generator). Used directly by Cursor agents via stdio. |
| **Runner** | `apps/runner/` | Local HTTP API that wraps the MCP server logic. Your laptop runs this; a tunnel exposes it to the judge UI. |
| **Judge UI** | `apps/judge-ui/` | Static Next.js form deployed to GitHub Project Pages. Judges paste a YouTube Short URL + prompt, hit Run, and get a report link back. |

---

## Quickstart

**Prereqs:** Node.js 20+

```bash
npm install
```

Copy and fill in your environment variables:

```bash
cp .env.example .env
# edit .env with your keys
```

Then build everything:

```bash
npm run build
```

---

## Running the pieces

### 1. MCP server (for use inside Cursor)

The MCP server speaks stdio and is picked up automatically by Cursor once configured. You don't run it manually — Cursor starts it for you. But you can build it any time:

```bash
npm run build --workspace apps/mcp-server
```

Or run in dev/watch mode for local testing:

```bash
npm run dev:mcp
```

**Available MCP tools:**
- `thread_create` / `thread_list` / `thread_get` / `thread_post_message` / `thread_react` — manage conversation threads
- `shorts_search` / `shorts_validate_url` — find and validate YouTube Shorts
- `gif_search` / `giphy_quota` — search GIPHY for GIFs (requires `GIPHY_API_KEY`)
- `run_from_judge_prompt` — one-shot: create thread → simulate agent loop → return thread ID
- `report_generate` — generate a static HTML report from a stored thread

---

### 2. Runner (local HTTP API)

The runner is what the judge UI actually talks to. It runs on your laptop and is exposed to the public internet via a tunnel.

**Environment variables:**

| Variable | Required | Description |
|---|---|---|
| `RUNNER_TOKEN` | Recommended | Shared secret judges must send as `X-Runner-Token` header |
| `ALLOWED_ORIGINS` | Recommended | Comma-separated list of allowed CORS origins (e.g. your GitHub Pages URL) |
| `ANTHROPIC_API_KEY` | Strongly recommended | Enables real Claude-powered agent turns. Without it, agents use hardcoded fallback text. |
| `GIPHY_API_KEY` | Optional | Enables GIF replies in agent runs. Without it, agents only use YouTube videos. |
| `PORT` | Optional | Port to listen on (default: `8787`) |

**Start the runner:**

As long as your `.env` file is filled in, just run:

```bash
npm run dev:runner
```

The runner loads `.env` from the repo root automatically on startup and prints a status block confirming which keys were found.

**Expose it via tunnel** (pick one):

```bash
# Cloudflare Tunnel (recommended — free, stable URL per session)
cloudflared tunnel --url http://localhost:8787

# ngrok
ngrok http 8787
```

Copy the public HTTPS tunnel URL that appears in the output — you'll need it as `NEXT_PUBLIC_RUNNER_URL` in GitHub repo variables and in the judge UI form.

> The tunnel URL changes each time you restart it. When it changes, update `NEXT_PUBLIC_RUNNER_URL` in GitHub → Settings → Secrets and variables → Actions → Variables, then re-run the Pages workflow (or just enter the new URL directly in the judge UI form).

**Runner endpoints:**

```
POST /run
  Body: { shortUrl, judgeMessage, turns? }
  Headers: X-Runner-Token: <your-secret>
  Returns: { ok, runId, reportUrl }

GET /runs/:runId
  Returns: { ok, runId, reportUrl }

GET /runs/:runId/report/
  Serves the static HTML report directly.

GET /health
  Returns: { ok: true }
```

**Test it locally:**

```bash
curl -X POST "http://localhost:8787/run" \
  -H "content-type: application/json" \
  -H "X-Runner-Token: your-secret" \
  -d '{
    "shortUrl": "https://www.youtube.com/shorts/GVMFbFAsdwE",
    "judgeMessage": "Start a fun DM thread",
    "turns": 8
  }'
```

---

### 3. Judge UI (GitHub Project Pages)

The judge UI is a fully static Next.js export — no server required. It's designed to be deployed to GitHub Project Pages at `https://<user>.github.io/MemeMe/`.

**Run locally:**

```bash
npm run dev:judge
```

Then open `http://localhost:3000` (or `http://localhost:3000/MemeMe` if `NEXT_PUBLIC_BASE_PATH=/MemeMe` is set in `.env`).

The UI reads `NEXT_PUBLIC_RUNNER_URL` and `NEXT_PUBLIC_RUNNER_TOKEN` from `.env` automatically. Judges just paste a YouTube Short URL, pick two personas, set the number of turns, and hit **Run demo**.

> Note: `NEXT_PUBLIC_*` values are baked into the static bundle and visible in the browser source. For a hackathon demo that's fine — just use a throwaway token.

**Deploy to GitHub Pages (automated via GitHub Actions):**

Every push to `main` triggers `.github/workflows/deploy-pages.yml`, which builds the static export and deploys it automatically.

One-time setup in your GitHub repo settings:

1. **Enable Pages**: Settings → Pages → Source → **GitHub Actions**

2. **Set the runner URL + token as repository variables** (not secrets — they get baked into the static bundle):
   Settings → Secrets and variables → Actions → **Variables** tab → New repository variable
   - `NEXT_PUBLIC_RUNNER_URL` → your tunnel URL (e.g. `https://abc123.trycloudflare.com`)
   - `NEXT_PUBLIC_RUNNER_TOKEN` → your runner token

3. Push to `main` (or trigger manually via Actions → Deploy Judge UI → Run workflow).

Your site will be live at `https://<youruser>.github.io/MemeMe/`.

> **Heads up:** the runner URL changes every time you restart the tunnel. Re-set `NEXT_PUBLIC_RUNNER_URL` in repo variables and re-run the workflow whenever your tunnel URL changes.

---

### 4. Example report (requires runner)

Generate a real live report and save it to `demo/example-reports/run-NNN/`. The runner must already be running.

```bash
export RUNNER_TOKEN="your-secret"   # must match what the runner was started with
npm run demo:example-report

# Override the seed video or prompt:
npm run demo:example-report -- --url "https://www.youtube.com/shorts/GVMFbFAsdwE" --prompt "Start a chaotic thread"
```

The command prints the exact `open` command to view the report and shows a history of all previous runs.

---

## GIPHY integration

GIF replies are opt-in. Set `GIPHY_API_KEY` in the runner (and/or when running the MCP server) and agents will reply with GIFs ~35% of the time instead of videos.

**Rate limit:** 100 calls/hour per key. Each run uses roughly 0–3 GIPHY calls depending on how many GIF turns occur. You can check remaining quota via the `giphy_quota` MCP tool or add a second key if needed.

**Without a key:** agents fall back to YouTube Shorts only — nothing breaks.

---

## Project structure

```
apps/
  mcp-server/         Node/TS MCP server (thread store, tools, report generator)
    src/
      index.ts        MCP tool registration + run loop
      threadStore.ts  JSON-backed thread persistence
      shorts.ts       YouTube Shorts seed list + URL validation
      giphy.ts        GIPHY API client + rate-limit tracker
      report.ts       Static HTML report generator
      types.ts        Shared types
  runner/             Express HTTP API wrapping MCP server logic
  judge-ui/           Static Next.js judge form (GitHub Pages-compatible)
demo/
  example-report/     Pre-generated offline demo report
scripts/
  generate-example-report.mjs
```
