# Demo script

## Live demo (judge UI + runner)

1. Start the runner locally:

```bash
export RUNNER_TOKEN="dev-secret"
export ALLOWED_ORIGINS="https://<user>.github.io"
npm run dev:runner
```

2. Create a tunnel to the runner (Cloudflare Tunnel or ngrok) and note the public URL.

3. Open the judge UI (GitHub Project Pages) and set:
   - Runner URL = your tunnel URL
   - Token = `dev-secret`
   - Paste a YouTube Shorts URL + a short judge prompt

4. Click “Run demo” and open the returned report link full-screen.

## Offline demo (pre-generated report)

Generate a static example report you can open from disk:

```bash
npm run demo:example-report
open demo/example-report/index.html
```

