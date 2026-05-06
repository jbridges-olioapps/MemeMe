"use client";

import { useEffect, useMemo, useState } from "react";

const PERSONAS = [
  { id: "random", name: "🎲 Random" },
  { id: "hype-beast", name: "🔥 Hype Beast" },
  { id: "chaos-gremlin", name: "😈 Chaos Gremlin" },
  { id: "film-snob", name: "🎬 Film Snob" },
  { id: "vintage-hipster", name: "🎸 Vintage Hipster" },
  { id: "gym-rat", name: "💪 Gym Rat" },
  { id: "corporate-girlie", name: "💼 Corporate Girlie" },
  { id: "conspiracy-theorist", name: "🔭 Conspiracy Theorist" },
  { id: "theater-kid", name: "🎭 Theater Kid" },
  { id: "boomer-dad", name: "📻 Boomer Dad" },
  { id: "overthinker", name: "😰 Anxious Overthinker" },
];

const SEED_SHORT_URLS = [
  // Keep in sync with the seed list used by the runner (`apps/mcp-server/src/shorts.ts`).
  "https://www.youtube.com/shorts/fO0AwNEnN3I",
  "https://www.youtube.com/shorts/mCRGP2D6x-s",
  "https://www.youtube.com/shorts/UhpfNjijCds",
  "https://www.youtube.com/shorts/wBVfUF3mhIM",
  "https://www.youtube.com/shorts/F0wK4izLJ3M",
  "https://www.youtube.com/shorts/ik5PYr1MjBY",
  "https://www.youtube.com/shorts/LgkHkyY-bco",
  "https://www.youtube.com/shorts/PAA4PvUCpHw",
  "https://www.youtube.com/shorts/hprQ1h5c5go",
  "https://www.youtube.com/shorts/dn30PLjSndM",
] as const;

const DEFAULT_WEIGHTS = { text: 20, emoji: 10, giphy: 25, video: 45 };

type Weights = typeof DEFAULT_WEIGHTS;

type RunResponse =
  | {
      ok: true;
      runId: string;
      reportUrl: string;
      personas?: { A: { name: string }; B: { name: string } };
      seed?: { url: string; title?: string; channel?: string };
    }
  | { ok: false; error: string };

type StoredRun = {
  runId: string;
  reportUrl: string;
  personasLabel?: string;
  seedTitle?: string;
  shortUrlSnippet?: string;
  createdAtIso: string;
};

const HISTORY_VERSION = "v1";
const MAX_STORED_RUNS = 25;

function runHistoryStorageKey(runnerBase: string) {
  return `mememe.runHistory.${HISTORY_VERSION}:${runnerBase}`;
}

function readStoredRuns(runnerBase: string): StoredRun[] {
  if (typeof window === "undefined" || !runnerBase) return [];
  try {
    const raw = window.localStorage.getItem(runHistoryStorageKey(runnerBase));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredRun[]) : [];
  } catch {
    return [];
  }
}

function writeStoredRuns(runnerBase: string, runs: StoredRun[]) {
  if (typeof window === "undefined" || !runnerBase) return;
  try {
    window.localStorage.setItem(runHistoryStorageKey(runnerBase), JSON.stringify(runs));
  } catch {
    /* ignore quota / privacy mode */
  }
}

function shortenUrl(u: string, max = 42) {
  const t = u.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export default function Page() {
  const [runnerUrl, setRunnerUrl] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const envUrl = process.env.NEXT_PUBLIC_RUNNER_URL || "";
    const isLocalhost =
      typeof window !== "undefined" &&
      /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    const fallbackUrl = isLocalhost ? "http://localhost:8788" : "";
    setRunnerUrl((prev) => prev || envUrl || fallbackUrl);
    setToken((prev) => prev || process.env.NEXT_PUBLIC_RUNNER_TOKEN || "");
  }, []);

  const [shortUrl, setShortUrl] = useState("");
  const [personaA, setPersonaA] = useState("random");
  const [personaB, setPersonaB] = useState("random");
  const [turns, setTurns] = useState(8);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RunResponse | null>(null);
  const [reviewerModalOpen, setReviewerModalOpen] = useState(false);
  const [runHistory, setRunHistory] = useState<StoredRun[]>([]);
  const [seedPreview, setSeedPreview] = useState<{
    url: string;
    title?: string;
    channel?: string;
    thumbnailUrl?: string;
  } | null>(null);
  const [seedPreviewStatus, setSeedPreviewStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const runnerBase = useMemo(() => runnerUrl.trim().replace(/\/+$/, ""), [runnerUrl]);

  useEffect(() => {
    setRunHistory(readStoredRuns(runnerBase));
  }, [runnerBase]);

  const totalWeight = weights.text + weights.emoji + weights.giphy + weights.video;
  const canSubmit = useMemo(
    () => runnerUrl.trim().length > 0 && shortUrl.trim().length > 0 && totalWeight > 0,
    [runnerUrl, shortUrl, totalWeight],
  );

  function setW(key: keyof Weights, value: number) {
    setWeights((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const body: Record<string, unknown> = {
        shortUrl,
        turns,
        weights: {
          text: weights.text / 100,
          emoji: weights.emoji / 100,
          giphy: weights.giphy / 100,
          video: weights.video / 100,
        },
      };
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
      if (data.ok) {
        const base = runnerUrl.trim().replace(/\/+$/, "");
        const personasLabel =
          data.personas &&
          `You (as ${data.personas.A.name}) · ${data.personas.B.name}`;
        const entry: StoredRun = {
          runId: data.runId,
          reportUrl: data.reportUrl,
          personasLabel: personasLabel ?? undefined,
          seedTitle: data.seed?.title,
          shortUrlSnippet: shortenUrl(shortUrl),
          createdAtIso: new Date().toISOString(),
        };
        setRunHistory((prev) => {
          const withoutDup = prev.filter((r) => r.runId !== entry.runId);
          const next = [entry, ...withoutDup].slice(0, MAX_STORED_RUNS);
          writeStoredRuns(base, next);
          return next;
        });
      }
    } catch (err) {
      setResult({ ok: false, error: (err as Error).message || "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  function fillRandomSeed() {
    const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
    setShortUrl(pick(SEED_SHORT_URLS));
  }

  useEffect(() => {
    if (!reviewerModalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setReviewerModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reviewerModalOpen]);

  useEffect(() => {
    const url = shortUrl.trim();
    if (!url) {
      setSeedPreview(null);
      setSeedPreviewStatus("idle");
      return;
    }

    const t = window.setTimeout(() => {
      let watchUrl = url;
      try {
        const u = new URL(url);
        if (u.pathname.startsWith("/shorts/")) {
          const id = u.pathname.replace("/shorts/", "").split("/")[0];
          if (id) watchUrl = `https://www.youtube.com/watch?v=${id}`;
        }
      } catch {
        setSeedPreview(null);
        setSeedPreviewStatus("error");
        return;
      }

      const controller = new AbortController();
      setSeedPreviewStatus("loading");
      fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`, {
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("oEmbed failed");
          const j = (await res.json()) as { title?: string; author_name?: string; thumbnail_url?: string };
          setSeedPreview({ url, title: j.title, channel: j.author_name, thumbnailUrl: j.thumbnail_url });
          setSeedPreviewStatus("ready");
        })
        .catch(() => {
          setSeedPreview({ url });
          setSeedPreviewStatus("error");
        });

      return () => controller.abort();
    }, 450);

    return () => window.clearTimeout(t);
  }, [shortUrl]);

  return (
    <main style={{ position: "relative", maxWidth: 680, margin: "0 auto", padding: "40px 16px 60px" }}>
      <div className="meme-emoji-backdrop" aria-hidden="true">
        <span className="meme-emoji-float meme-emoji-float--1">🔥</span>
        <span className="meme-emoji-float meme-emoji-float--2">😈</span>
        <span className="meme-emoji-float meme-emoji-float--3">🎬</span>
      </div>
      <div className="page-content-shell">
      <header style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: -0.5,
            margin: "0 0 8px",
            background: "linear-gradient(135deg, rgba(236,72,153,.95) 0%, rgba(249,115,22,.92) 60%, rgba(255,255,255,.85) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          MemeMe™
        </div>
        <div style={{ fontSize: 14, opacity: 0.75, lineHeight: 1.55 }}>
          <p style={{ margin: 0 }}>
            Save <em>hours</em> of sending reels back and forth.
          </p>
          <p style={{ margin: "8px 0 0" }}>
            Drop a Short, pick your vibe and a friend&apos;s, and let MemeMe do the replying.
          </p>
        </div>
      </header>

      <section style={cardStyle}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <div style={labelStyle}>YouTube Short URL</div>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline", justifyContent: "space-between" }}>
              <a
                href="https://www.youtube.com/shorts/"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, opacity: 0.75, textDecoration: "none", lineHeight: "20px" }}
              >
                Open YouTube Shorts →
              </a>
              <button
                type="button"
                onClick={fillRandomSeed}
                style={{
                  fontSize: 12,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,.16)",
                  background: "rgba(255,255,255,.07)",
                  color: "inherit",
                  cursor: "pointer",
                  lineHeight: "20px",
                }}
              >
                Random seed
              </button>
            </div>
            <input
              value={shortUrl}
              onChange={(e) => setShortUrl(e.target.value)}
              placeholder="https://www.youtube.com/shorts/..."
              style={inputStyle}
              autoFocus
            />
          </label>

          {(seedPreviewStatus === "loading" || seedPreview) && (
            <div
              style={{
                marginTop: -6,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(0,0,0,.18)",
                display: "flex",
                gap: 10,
                alignItems: "center",
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 40,
                  borderRadius: 8,
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(255,255,255,.10)",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {seedPreview?.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={seedPreview.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {seedPreviewStatus === "loading" ? "Fetching metadata…" : seedPreview?.title || "Video"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.65, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {seedPreviewStatus === "ready"
                    ? seedPreview?.channel || ""
                    : seedPreviewStatus === "error"
                      ? "Metadata unavailable (still works)"
                      : ""}
                </div>
              </div>
              <a
                href={shortUrl.trim()}
                target="_blank"
                rel="noreferrer"
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  opacity: 0.8,
                  textDecoration: "none",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                Open →
              </a>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={labelStyle}>Your vibe</div>
              <select value={personaA} onChange={(e) => setPersonaA(e.target.value)} style={inputStyle}>
                {PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <div style={labelStyle}>Your friend's vibe</div>
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

          <details
            open={showAdvanced}
            onToggle={(e) => setShowAdvanced((e.target as HTMLDetailsElement).open)}
            style={{ marginTop: 4 }}
          >
            <summary style={{ ...labelStyle, cursor: "pointer", userSelect: "none" }}>
              Response mix
            </summary>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>
                How often each reply type shows up. The runner picks a type per turn weighted by these.
              </p>
              <WeightSlider label="Text" hint="words only" value={weights.text} onChange={(v) => setW("text", v)} />
              <WeightSlider label="Emoji" hint="emoji-only reply" value={weights.emoji} onChange={(v) => setW("emoji", v)} />
              <WeightSlider label="GIF" hint="GIPHY reaction" value={weights.giphy} onChange={(v) => setW("giphy", v)} />
              <WeightSlider label="Video" hint="share a Short" value={weights.video} onChange={(v) => setW("video", v)} />
              <div style={{ fontSize: 11, opacity: 0.6, display: "flex", justifyContent: "space-between" }}>
                <span>Total: {totalWeight}</span>
                <button
                  type="button"
                  onClick={() => setWeights(DEFAULT_WEIGHTS)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,.16)",
                    color: "inherit",
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  reset
                </button>
              </div>
              {totalWeight === 0 && (
                <div style={{ fontSize: 12, color: "rgba(239,68,68,.95)" }}>
                  Set at least one weight above 0.
                </div>
              )}
            </div>
          </details>

          <button type="submit" disabled={!canSubmit || loading} style={buttonStyle(!canSubmit || loading)}>
            {loading ? "Running…" : "▶ Run demo"}
          </button>
        </form>
      </section>

      <div style={{ marginTop: 14, textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setReviewerModalOpen(true)}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            fontSize: 12,
            opacity: 0.55,
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          Technical note for judges
        </button>
      </div>

      {reviewerModalOpen && (
        <div
          role="presentation"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#07070a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setReviewerModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reviewer-modal-title"
            style={{
              ...cardStyle,
              maxWidth: 440,
              width: "100%",
              maxHeight: "85vh",
              overflow: "auto",
              padding: "20px 18px",
              position: "relative",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setReviewerModalOpen(false)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                border: "none",
                background: "rgba(255,255,255,.08)",
                color: "inherit",
                width: 32,
                height: 32,
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
            <div id="reviewer-modal-title" style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, paddingRight: 36 }}>
              How this demo works
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.88 }}>
              <p style={{ margin: "0 0 12px" }}>
                This UI is a <strong>Next.js static export</strong> (plain HTML/JS/CSS) on GitHub Pages. When you run a demo,
                your browser sends one POST to our <strong>Node/Express runner</strong>, which we usually expose to the web with a
                tunnel (e.g. Cloudflare). The pages host does not execute your thread — that all happens on the runner.
              </p>
              <p style={{ margin: "0 0 12px" }}>
                Message text and attachment choices are produced by <strong>Anthropic Claude</strong> on the runner when{" "}
                <code style={{ fontSize: 12, opacity: 0.9 }}>ANTHROPIC_API_KEY</code> is set: the model sees persona prompts,
                conversation history, and a curated Shorts list, and returns structured JSON for each turn. If the key is
                missing, the runner uses a simple scripted fallback so the UI still works. Usage is subject to Anthropic&apos;s
                terms and your billing.
              </p>
              <p style={{ margin: 0 }}>
                Threads and HTML reports are stored <strong>locally</strong> on the machine running the runner. Optional GIFs may
                call GIPHY; the small preview above the URL field uses <strong>YouTube oEmbed</strong> from your browser only.
              </p>
            </div>
          </div>
        </div>
      )}

      {result?.ok && (
        <section style={{ ...cardStyle, marginTop: 14, borderColor: "rgba(16,185,129,.3)", background: "rgba(16,185,129,.07)" }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Thread ready</div>
          {result.personas && (
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 10 }}>
              You (as {result.personas.A.name}) · {result.personas.B.name}
            </div>
          )}
          {result.seed?.title && (
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 10 }}>
              Starting Short: <strong>{result.seed.title}</strong>
              {result.seed.channel ? ` — ${result.seed.channel}` : ""}
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

      <section
        style={{
          ...cardStyle,
          marginTop: result?.ok || (result && !result.ok) ? 12 : 16,
          padding: "12px 14px",
          opacity: runHistory.length ? 0.95 : 0.65,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: runHistory.length ? 10 : 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Past threads</div>
          {runHistory.length > 0 && (
            <button
              type="button"
              onClick={() => {
                writeStoredRuns(runnerBase, []);
                setRunHistory([]);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                fontSize: 11,
                opacity: 0.5,
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Clear
            </button>
          )}
        </div>
        {runHistory.length === 0 ? (
          <div style={{ fontSize: 12, opacity: 0.55, lineHeight: 1.45 }}>
            Completed runs appear here — stored only in this browser for this runner URL.
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {runHistory.map((r) => (
              <li
                key={r.runId}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  gap: "6px 10px",
                  padding: "8px 10px",
                  borderRadius: 12,
                  background: "rgba(0,0,0,.2)",
                  border: "1px solid rgba(255,255,255,.08)",
                }}
              >
                <div style={{ flex: "1 1 180px", minWidth: 0 }}>
                  <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>
                    {new Date(r.createdAtIso).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.seedTitle || r.shortUrlSnippet || r.runId}
                  </div>
                  {r.personasLabel ? (
                    <div style={{ fontSize: 11, opacity: 0.62, marginTop: 3 }}>{r.personasLabel}</div>
                  ) : null}
                </div>
                {runnerBase ? (
                  <a
                    href={`${runnerBase}${r.reportUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      opacity: 0.85,
                      textDecoration: "none",
                      padding: "4px 0",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    Open →
                  </a>
                ) : (
                  <span style={{ fontSize: 11, opacity: 0.45 }}>Set runner URL</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>
    </main>
  );
}

function WeightSlider(props: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, alignItems: "baseline" }}>
        <span>
          <strong>{props.label}</strong>
          <span style={{ opacity: 0.55, marginLeft: 6 }}>· {props.hint}</span>
        </span>
        <span style={{ opacity: 0.85, fontVariantNumeric: "tabular-nums" }}>{props.value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "rgba(99,102,241,1)" }}
      />
    </label>
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
