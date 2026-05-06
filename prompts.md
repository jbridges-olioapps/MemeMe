# Prompts Journal

## P-001 — 2026-05-06

> i have api keys for this repo: Giphy API key &lt;redacted&gt;
>
> anthropic key &lt;redacted&gt;
>
> use playwright-cli to test it out.

**"i have api keys for this repo: Giphy API key... anthropic key..."**

- Wrote both keys to `.env` (already covered by `.gitignore`); also set `RUNNER_TOKEN=dev-secret`, `ALLOWED_ORIGINS=http://localhost:3000`, `PORT=8788`, and `NEXT_PUBLIC_*` matching the runner.
- Flagged that the Anthropic key is now visible in the conversation transcript and should be rotated post-hackathon.

**"use playwright-cli to test it out"**

- `npm install` + `npm run build` (mcp-server, runner, judge-ui all green).
- Started runner via `npm run dev:runner` (tsx watch) and judge UI via `npm run dev:judge` (Next).
- Discovered port 8787 was occupied by an unrelated `olio-hackathon-26` proxy → moved runner to **8788**.
- Discovered `next dev` honors `PORT` from the loaded env, which collided with the runner. Forced `PORT=3000` for the judge UI launch.
- First Anthropic-keyed `/run` returned `400 invalid_request_error: Your credit balance is too low`. Verified Giphy key independently against `api.giphy.com` (200 OK).
- Drove the judge UI with `playwright-cli`: opened `http://localhost:3000/MemeMe`, filled the YouTube Short URL, set turns=2, clicked **Run demo**, waited for the "Open report" link to appear.
- Loaded the resulting report (with `X-Runner-Token` header injected via `run-code`) — saw real Claude-generated, on-persona dialog ("Anxious Overthinker" / "Theater Kid"), YouTube embeds, and emoji reactions.

## P-002 — 2026-05-06

> don't add playwright tests, just validat ethat tit works

**"don't add playwright tests, just validate that it works"**

- Did not write any test files (`*.spec.ts`, playwright config, etc).
- Validation done via direct `playwright-cli` commands and `curl` only; no committed test scaffolding.

## P-003 — 2026-05-06

> since this has API keys now, w edont' need to do any local tunneling right?

**"since this has API keys now, we don't need to do any local tunneling right?"**

- Clarified: tunneling and API keys are unrelated.
  - **API keys** are runner→external-API credentials (Anthropic, Giphy).
  - **Tunneling** is what makes a *local* runner reachable from a *remote* judge browser (e.g. GitHub Pages).
- If both judge UI and runner run on this laptop (`localhost:3000` ↔ `localhost:8788`), no tunnel needed.
- Tunnel is only required when deploying the judge UI publicly while keeping the runner local.

## P-004 — 2026-05-06

> try the claude api key again, it should be good to go now

**"try the claude api key again, it should be good to go now"**

- Restarted runner with `ANTHROPIC_API_KEY` from `.env` reloaded.
- `/run` now returns `ok: true` with Claude-generated dialog (e.g. Gym Rat × Vintage Hipster, then Anxious Overthinker × Theater Kid). Credits confirmed working.
