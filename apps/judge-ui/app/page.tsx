"use client";

import { useEffect, useMemo, useState } from "react";

const PERSONAS = [
  { id: "random", name: "🎲 Random" },
  { id: "hype-beast", name: "Hype Beast" },
  { id: "chaos-gremlin", name: "Chaos Gremlin" },
  { id: "film-snob", name: "Film Snob" },
  { id: "vintage-hipster", name: "Vintage Hipster" },
  { id: "gym-rat", name: "Gym Rat" },
  { id: "corporate-girlie", name: "Corporate Girlie" },
  { id: "conspiracy-theorist", name: "Conspiracy Theorist" },
  { id: "theater-kid", name: "Theater Kid" },
  { id: "boomer-dad", name: "Boomer Dad" },
  { id: "overthinker", name: "Anxious Overthinker" },
];

type RunResponse =
  | {
      ok: true;
      runId: string;
      reportUrl: string;
      personas?: { A: { name: string }; B: { name: string } };
    }
  | { ok: false; error: string };

export default function Page() {
  const [runnerUrl, setRunnerUrl] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    setRunnerUrl((prev) => prev || process.env.NEXT_PUBLIC_RUNNER_URL || "");
    setToken((prev) => prev || process.env.NEXT_PUBLIC_RUNNER_TOKEN || "");
  }, []);

  const [shortUrl, setShortUrl] = useState("");
  const [personaA, setPersonaA] = useState("random");
  const [personaB, setPersonaB] = useState("random");
  const [turns, setTurns] = useState(8);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RunResponse | null>(null);

  const canSubmit = useMemo(
    () => runnerUrl.trim().length > 0 && shortUrl.trim().length > 0,
    [runnerUrl, shortUrl],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const body: Record<string, unknown> = { shortUrl, turns };
      if (personaA !== "random") body.personaA = personaA;
      if (personaB !== "random") body.personaB = personaB;

      const res = await fetch(`${runnerUrl.replace(/\/+$/, "")}/run`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { "X-Runner-Token": token } : {}),
        },
        body: JSON.stringify(body),
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
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 16px 60px" }}>
      <header style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
          MemeMe
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Run a demo</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>
          Paste a YouTube Short, pick two personas, and watch them go.
        </p>
      </header>

      <section style={cardStyle}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>

          <label style={{ display: "grid", gap: 6 }}>
            <div style={labelStyle}>YouTube Short URL</div>
            <input
              value={shortUrl}
              onChange={(e) => setShortUrl(e.target.value)}
              placeholder="https://www.youtube.com/shorts/..."
              style={inputStyle}
              autoFocus
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={labelStyle}>Agent A</div>
              <select value={personaA} onChange={(e) => setPersonaA(e.target.value)} style={inputStyle}>
                {PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={labelStyle}>Agent B</div>
              <select value={personaB} onChange={(e) => setPersonaB(e.target.value)} style={inputStyle}>
                {PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
          </div>

          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ ...labelStyle, display: "flex", justifyContent: "space-between" }}>
              <span>Turns</span>
              <span style={{ opacity: 0.75 }}>{turns} messages</span>
            </div>
            <input
              type="range"
              min={2}
              max={16}
              step={2}
              value={turns}
              onChange={(e) => setTurns(Number(e.target.value))}
              style={{ width: "100%", accentColor: "rgba(99,102,241,1)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.5 }}>
              <span>2</span><span>16</span>
            </div>
          </label>

          <button type="submit" disabled={!canSubmit || loading} style={buttonStyle(!canSubmit || loading)}>
            {loading ? "Running…" : "▶ Run demo"}
          </button>

        </form>
      </section>

      {result?.ok && (
        <section style={{ ...cardStyle, marginTop: 14, borderColor: "rgba(16,185,129,.3)", background: "rgba(16,185,129,.07)" }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Done!</div>
          {result.personas && (
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 10 }}>
              {result.personas.A.name} vs {result.personas.B.name}
            </div>
          )}
          <a
            href={`${runnerUrl.replace(/\/+$/, "")}${result.reportUrl}`}
            target="_blank"
            rel="noreferrer"
            style={linkButtonStyle}
          >
            Open report →
          </a>
        </section>
      )}

      {result && !result.ok && (
        <section style={{ ...cardStyle, marginTop: 14, borderColor: "rgba(239,68,68,.35)", background: "rgba(239,68,68,.08)" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Run failed</div>
          <div style={{ fontSize: 13, opacity: 0.85, fontFamily: "monospace", wordBreak: "break-all" }}>{result.error}</div>
        </section>
      )}
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  padding: "18px 16px",
  border: "1px solid rgba(255,255,255,.10)",
  borderRadius: 18,
  background: "rgba(255,255,255,.05)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  opacity: 0.85,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(0,0,0,.22)",
  color: "inherit",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: disabled ? "rgba(255,255,255,.08)" : "rgba(99,102,241,.9)",
  color: "inherit",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 700,
  fontSize: 15,
  letterSpacing: 0.3,
  transition: "background .15s",
});

const linkButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.16)",
  background: "rgba(255,255,255,.09)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
};
