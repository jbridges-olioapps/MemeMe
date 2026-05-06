"use client";

import { useMemo, useState } from "react";

type RunResponse =
  | {
      ok: true;
      runId: string;
      reportUrl: string;
      reportPath: string;
    }
  | { ok: false; error: string };

const DEFAULT_RUNNER_URL = process.env.NEXT_PUBLIC_RUNNER_URL || "";

export default function Page() {
  const [runnerUrl, setRunnerUrl] = useState(DEFAULT_RUNNER_URL);
  const [token, setToken] = useState(process.env.NEXT_PUBLIC_RUNNER_TOKEN || "");
  const [shortUrl, setShortUrl] = useState("");
  const [judgeMessage, setJudgeMessage] = useState("Send something funny and then respond like two friends DMing.");
  const [turns, setTurns] = useState(8);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RunResponse | null>(null);

  const canSubmit = useMemo(() => runnerUrl.trim().length > 0 && shortUrl.trim().length > 0 && judgeMessage.trim().length > 0, [
    runnerUrl,
    shortUrl,
    judgeMessage,
  ]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${runnerUrl.replace(/\/+$/, "")}/run`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { "X-Runner-Token": token } : {}),
        },
        body: JSON.stringify({ shortUrl, judgeMessage, turns }),
      });
      const data = (await res.json()) as RunResponse;
      setResult(data);
    } catch (err) {
      setResult({ ok: false, error: (err as Error).message || "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "28px 14px 44px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8, letterSpacing: 0.6 }}>MemeMe</div>
          <h1 style={{ margin: "6px 0 0", fontSize: 22 }}>Judge UI (GitHub Pages)</h1>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>Static frontend · Runner does the work</div>
      </header>

      <section
        style={{
          marginTop: 18,
          padding: 14,
          border: "1px solid rgba(255,255,255,.10)",
          borderRadius: 16,
          background: "rgba(255,255,255,.06)",
        }}
      >
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Runner URL</div>
            <input
              value={runnerUrl}
              onChange={(e) => setRunnerUrl(e.target.value)}
              placeholder="https://<your-tunnel-domain>"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>X-Runner-Token (optional)</div>
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="shared secret" style={inputStyle} />
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Note: any token embedded in a static site is visible to users. For hackathon demos this is usually fine.
            </div>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>YouTube Short URL</div>
            <input
              value={shortUrl}
              onChange={(e) => setShortUrl(e.target.value)}
              placeholder="https://www.youtube.com/shorts/..."
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Judge prompt</div>
            <textarea value={judgeMessage} onChange={(e) => setJudgeMessage(e.target.value)} rows={4} style={inputStyle} />
          </label>

          <label style={{ display: "grid", gap: 6, maxWidth: 220 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Turns</div>
            <input
              type="number"
              min={2}
              max={20}
              value={turns}
              onChange={(e) => setTurns(Number(e.target.value))}
              style={inputStyle}
            />
          </label>

          <button type="submit" disabled={!canSubmit || loading} style={buttonStyle(!canSubmit || loading)}>
            {loading ? "Running…" : "Run demo"}
          </button>
        </form>
      </section>

      <section style={{ marginTop: 14 }}>
        {result?.ok && (
          <div style={resultBoxStyle}>
            <div style={{ fontWeight: 600 }}>Run created</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Run ID: <code>{result.runId}</code>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={`${runnerUrl.replace(/\/+$/, "")}${result.reportUrl}`}
                target="_blank"
                rel="noreferrer"
                style={linkButtonStyle}
              >
                Open report
              </a>
            </div>
          </div>
        )}

        {result && !result.ok && (
          <div style={{ ...resultBoxStyle, borderColor: "rgba(239,68,68,.35)", background: "rgba(239,68,68,.08)" }}>
            <div style={{ fontWeight: 600 }}>Run failed</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{result.error}</div>
          </div>
        )}
      </section>

      <footer style={{ marginTop: 22, fontSize: 12, opacity: 0.75 }}>
        If you’re using GitHub Project Pages, this UI is exported under a repo base path. The runner must allow CORS for your Pages
        origin.
      </footer>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(0,0,0,.18)",
  color: "inherit",
  outline: "none",
};

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.16)",
  background: disabled ? "rgba(255,255,255,.08)" : "rgba(99,102,241,.85)",
  color: "inherit",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 600,
});

const resultBoxStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(255,255,255,.06)",
};

const linkButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.16)",
  background: "rgba(255,255,255,.10)",
  textDecoration: "none",
  fontWeight: 600,
};

