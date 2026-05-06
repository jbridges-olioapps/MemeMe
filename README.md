# MemeMe

Hackathon repo.

- Planning doc: [`PLAN.md`](./PLAN.md)

## Quickstart

Prereqs: Node.js 20+.

Install dependencies:

```bash
npm install
```

### MCP server (stdio)

Build:

```bash
npm run build --workspace apps/mcp-server
```

Run (for MCP clients):

```bash
npm run dev:mcp
```

### Runner HTTP API (local)

The runner provides:

- `POST /run` → creates a thread, simulates a run, generates a report
- `GET /runs/:runId/report/` → serves the static report

Start the runner:

```bash
export RUNNER_TOKEN="dev-secret"
export ALLOWED_ORIGINS="http://localhost:3000,https://<user>.github.io"
npm run dev:runner
```

Then call it:

```bash
curl -X POST "http://localhost:8787/run" \
  -H "content-type: application/json" \
  -H "X-Runner-Token: dev-secret" \
  -d '{"shortUrl":"https://www.youtube.com/shorts/aqz-KE-bpKQ","judgeMessage":"Start a fun DM thread","turns":8}'
```

### Judge UI (GitHub Project Pages-friendly)

The judge UI is a static Next.js export. Configure the base path to your repo name:

```bash
export NEXT_PUBLIC_BASE_PATH="/MemeMe"
export NEXT_PUBLIC_RUNNER_URL="http://localhost:8787"
export NEXT_PUBLIC_RUNNER_TOKEN="dev-secret"
npm run dev:judge
```

Note: embedding a token in a static site means it’s visible to users; for a hackathon demo this is usually acceptable.
