import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Thread, GifAttachment } from "./types.js";

export type ReportSeed = {
  url: string;
  title?: string;
  channel?: string;
};

// Map persona display names → avatar emoji
const PERSONA_EMOJI: Record<string, string> = {
  "Hype Beast": "🔥",
  "Chaos Gremlin": "😈",
  "Film Snob": "🎬",
  "Vintage Hipster": "🎸",
  "Gym Rat": "💪",
  "Corporate Girlie": "💼",
  "Conspiracy Theorist": "🔭",
  "Theater Kid": "🎭",
  "Boomer Dad": "📻",
  "Anxious Overthinker": "😰",
};

function personaEmoji(name: string): string {
  return PERSONA_EMOJI[name] ?? name.charAt(0);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return u.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    if (host !== "youtube.com" && host !== "m.youtube.com") return null;
    if (u.pathname.startsWith("/shorts/")) {
      return u.pathname.replace("/shorts/", "").split("/")[0] ?? null;
    }
    if (u.pathname === "/watch") {
      return u.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

function youtubeVideoCard(originalUrl: string): string | null {
  const id = youtubeVideoId(originalUrl);
  if (!id) return null;
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const watchUrl = escapeHtml(originalUrl);
  const embedUrl = escapeHtml(`https://www.youtube-nocookie.com/embed/${id}?rel=0`);
  const thumbEsc = escapeHtml(thumb);
  return `
    <div class="video-card">
      <a class="thumb-link" href="${watchUrl}" target="_blank" rel="noreferrer">
        <img class="thumb" src="${thumbEsc}" alt="Video thumbnail" loading="lazy" />
        <div class="play-badge">▶ Watch on YouTube</div>
      </a>
      <details class="embed-toggle">
        <summary>Embed in page</summary>
        <div class="embed">
          <iframe
            src="${embedUrl}"
            title="YouTube embed"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      </details>
    </div>
  `;
}

function gifCard(gif: GifAttachment): string {
  const gifUrl = escapeHtml(gif.url);
  const sourceUrl = gif.sourceUrl ? escapeHtml(gif.sourceUrl) : null;
  const title = escapeHtml(gif.title ?? "GIF");
  const img = `<img class="gif-img" src="${gifUrl}" alt="${title}" loading="lazy" />`;
  return `
    <div class="gif-card">
      ${sourceUrl ? `<a href="${sourceUrl}" target="_blank" rel="noreferrer" title="View on GIPHY">${img}</a>` : img}
      <div class="gif-footer">
        ${sourceUrl ? `<a class="giphy-attr" href="${sourceUrl}" target="_blank" rel="noreferrer">via GIPHY</a>` : "GIF"}
        ${gif.title ? `<span class="gif-title">${title}</span>` : ""}
      </div>
    </div>
  `;
}

function seedPanel(seed: ReportSeed | undefined, seedMessageText: string): string {
  if (!seed) return "";
  const card = youtubeVideoCard(seed.url);
  const title = seed.title ? `<div class="seed-title">${escapeHtml(seed.title)}</div>` : "";
  const channel = seed.channel
    ? `<div class="seed-channel">${escapeHtml(seed.channel)}</div>`
    : "";
  const note = seedMessageText
    ? `<div class="seed-note">${escapeHtml(seedMessageText)}</div>`
    : "";
  return `
    <section class="seed-panel">
      <div class="seed-eyebrow">▶ Starting Short</div>
      <div class="seed-body">
        <div class="seed-meta">
          ${title}
          ${channel}
          ${note}
        </div>
        ${card ?? ""}
      </div>
    </section>
  `;
}

export async function generateThreadReport(args: {
  outDir: string;
  thread: Thread;
  seed?: ReportSeed;
}): Promise<{ reportDir: string; indexPath: string }> {
  const reportDir = join(args.outDir, args.thread.id);
  await mkdir(reportDir, { recursive: true });

  // The "Seed" message holds the starting prompt + initial video. Pull it out
  // of the message stream so it renders as a distinct intro panel instead of a chat bubble.
  const messages = args.thread.messages;
  const seedIndex = messages.findIndex((m) => m.from === "Seed");
  const seedMessage = seedIndex >= 0 ? messages[seedIndex] : null;
  const conversation = seedIndex >= 0 ? messages.slice(seedIndex + 1) : messages;

  // Synthesize a minimal ReportSeed from the seed message attachment if not passed explicitly.
  const seedFromMessage: ReportSeed | undefined = (() => {
    if (!seedMessage) return undefined;
    const att = seedMessage.attachments.find((a) => a.type === "video");
    if (!att || att.type !== "video") return undefined;
    return { url: att.url };
  })();
  const seed = args.seed ?? seedFromMessage;
  const seedText = seedMessage?.text ?? "";

  // Determine left/right from the order speakers appear in conversation.
  const speakers = Array.from(new Set(conversation.map((m) => m.from)));
  const sideFor = (from: string): "left" | "right" | "center" =>
    from === speakers[0] ? "left" : from === speakers[1] ? "right" : "center";

  const messagesHtml = conversation
    .map((m, i) => {
      const side = sideFor(m.from);
      const displayName = escapeHtml(m.from);
      const emoji = personaEmoji(m.from);
      const delay = (i * 0.55).toFixed(2);
      const time = formatTime(m.createdAt);

      const embeds = m.attachments
        .map((a) => {
          if (a.type === "video") return youtubeVideoCard(a.url);
          if (a.type === "gif") return gifCard(a);
          return null;
        })
        .filter((x): x is string => Boolean(x))
        .join("\n");

      const reactionsHtml = m.reactions.length
        ? `<div class="reactions">${m.reactions
            .map((r) => `<span class="reaction" title="${escapeHtml(r.from)}">${escapeHtml(r.reaction)}</span>`)
            .join("")}</div>`
        : "";

      const senderLabel = `<div class="sender-label">${emoji} ${displayName}</div>`;

      if (side === "center") {
        return `
        <div class="msg center" style="animation-delay:${delay}s">
          <div class="msg-body">
            ${senderLabel}
            <div class="bubble">
              <div class="text">${escapeHtml(m.text)}</div>
              ${embeds}
              <div class="timestamp">${time}</div>
            </div>
            ${reactionsHtml}
          </div>
        </div>`;
      }

      if (side === "right") {
        return `
        <div class="msg right" style="animation-delay:${delay}s">
          <div class="msg-body">
            ${senderLabel}
            <div class="bubble">
              <div class="text">${escapeHtml(m.text)}</div>
              ${embeds}
              <div class="timestamp">${time}</div>
            </div>
            ${reactionsHtml}
          </div>
        </div>`;
      }

      // left
      return `
        <div class="msg left" style="animation-delay:${delay}s">
          <div class="msg-body">
            ${senderLabel}
            <div class="bubble">
              <div class="text">${escapeHtml(m.text)}</div>
              ${embeds}
              <div class="timestamp">${time}</div>
            </div>
            ${reactionsHtml}
          </div>
        </div>`;
    })
    .join("\n");

  const css = `
    :root {
      --bg: #0b0c10;
      --surface: rgba(255,255,255,.06);
      --border: rgba(255,255,255,.09);
      --accent-a: rgba(99,102,241,.18);
      --accent-a-border: rgba(99,102,241,.30);
      --accent-b: rgba(16,185,129,.14);
      --accent-b-border: rgba(16,185,129,.28);
      --accent-you: rgba(245,158,11,.12);
      --accent-you-border: rgba(245,158,11,.28);
      --text: #e7e7e7;
      --muted: rgba(255,255,255,.45);
      --radius-bubble: 18px;
      --radius-sm: 10px;
      color-scheme: light dark;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      font-size: 15px;
      line-height: 1.45;
    }
    a { color: inherit; }

    /* ── Header ─────────────────────────────────────────────── */
    header {
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      background: rgba(11,12,16,.92);
      backdrop-filter: blur(10px);
      z-index: 10;
    }
    .header-brand {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0 0 4px;
      background: linear-gradient(135deg, #fff 40%, rgba(99,102,241,.85));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .header-meta { font-size: 12px; color: var(--muted); }
    .header-meta code {
      font-family: ui-monospace, monospace;
      font-size: 11px;
      background: rgba(255,255,255,.07);
      border-radius: 4px;
      padding: 1px 5px;
    }

    /* ── Layout ─────────────────────────────────────────────── */
    main { max-width: 760px; margin: 0 auto; padding: 20px 14px 60px; }

    /* ── Seed panel ─────────────────────────────────────────── */
    .seed-panel {
      margin: 6px 0 28px;
      padding: 16px 16px 18px;
      border-radius: 16px;
      background: linear-gradient(180deg, rgba(99,102,241,.18) 0%, rgba(99,102,241,.06) 100%);
      border: 1px solid rgba(99,102,241,.32);
    }
    .seed-eyebrow {
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 10px;
      color: #b4b8ff;
    }
    .seed-body {
      display: grid;
      gap: 14px;
      grid-template-columns: 1fr;
    }
    @media (min-width: 600px) {
      .seed-body { grid-template-columns: 1.1fr .9fr; align-items: start; }
    }
    .seed-title { font-size: 17px; font-weight: 700; line-height: 1.3; margin-bottom: 4px; }
    .seed-channel { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
    .seed-note {
      margin-top: 8px;
      font-size: 13px;
      line-height: 1.45;
      padding: 8px 10px;
      border-left: 2px solid rgba(255,255,255,.18);
      background: rgba(255,255,255,.04);
      border-radius: 0 6px 6px 0;
      white-space: pre-wrap;
    }

    /* ── Message row ────────────────────────────────────────── */
    @keyframes msgIn {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes msgInCenter {
      from { opacity: 0; transform: scale(0.94); }
      to   { opacity: 1; transform: scale(1); }
    }

    .msg {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      margin: 8px 0 22px;
      opacity: 0;
      animation: msgIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .msg.center {
      justify-content: center;
      animation-name: msgInCenter;
    }
    .msg.right { flex-direction: row-reverse; }
    .msg.left  { flex-direction: row; }

    /* ── Bubble wrapper (holds sender label + bubble + reactions) */
    .msg-body {
      position: relative;
      max-width: 580px;
      padding-bottom: 18px;
    }
    .msg.center .msg-body { max-width: 480px; }

    /* ── Sender label (above bubble) ────────────────────────── */
    .sender-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 5px;
      padding: 0 4px;
    }
    .msg.right .sender-label { text-align: right; }
    .msg.center .sender-label { text-align: center; }

    /* ── Bubble ─────────────────────────────────────────────── */
    .bubble {
      padding: 10px 13px 8px;
      border-radius: var(--radius-bubble);
      border: 1px solid var(--border);
      background: var(--surface);
    }
    .msg.left  .bubble {
      border-bottom-left-radius: 4px;
      background: var(--accent-a);
      border-color: var(--accent-a-border);
    }
    .msg.right .bubble {
      border-bottom-right-radius: 4px;
      background: var(--accent-b);
      border-color: var(--accent-b-border);
    }
    .msg.center .bubble {
      background: var(--accent-you);
      border-color: var(--accent-you-border);
      border-radius: var(--radius-bubble);
      text-align: center;
    }

    .text { white-space: pre-wrap; }
    .timestamp {
      font-size: 11px;
      color: var(--muted);
      text-align: right;
      margin-top: 6px;
    }
    .msg.center .timestamp { text-align: center; }

    /* ── Reaction badges ────────────────────────────────────── */
    .reactions {
      position: absolute;
      bottom: 0;
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    .msg.left  .reactions { left: 10px; }
    .msg.right .reactions { right: 10px; }
    .msg.center .reactions { left: 50%; transform: translateX(-50%); }

    .reaction {
      font-size: 17px;
      line-height: 1;
      background: rgba(30,30,45,.97);
      border: 1px solid rgba(255,255,255,.22);
      border-radius: 999px;
      padding: 3px 7px;
      box-shadow: 0 2px 10px rgba(0,0,0,.7);
      cursor: default;
    }

    /* ── Video card ─────────────────────────────────────────── */
    .video-card {
      margin-top: 10px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border);
      background: rgba(0,0,0,.30);
    }
    .thumb-link { display: block; position: relative; text-decoration: none; }
    .thumb { display: block; width: 100%; aspect-ratio: 16/9; object-fit: cover; }
    .play-badge {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 8px 10px;
      background: linear-gradient(transparent, rgba(0,0,0,.75));
      color: #fff;
      font-size: 13px;
      font-weight: 600;
    }
    .embed-toggle { padding: 8px 10px; font-size: 12px; color: var(--muted); }
    .embed-toggle summary { cursor: pointer; user-select: none; }
    .embed { border-top: 1px solid var(--border); }
    iframe { width: 100%; aspect-ratio: 9/16; border: 0; background: #000; }

    /* ── GIF card ───────────────────────────────────────────── */
    .gif-card {
      margin-top: 10px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border);
      background: rgba(0,0,0,.20);
      display: inline-flex;
      flex-direction: column;
      max-width: 300px;
    }
    .gif-img { display: block; width: 100%; max-width: 300px; height: auto; }
    .gif-footer {
      padding: 5px 8px;
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 11px;
      color: var(--muted);
    }
    .giphy-attr { text-decoration: none; font-weight: 600; }
    .giphy-attr:hover { text-decoration: underline; }
    .gif-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: .75; }

    /* ── Footer ─────────────────────────────────────────────── */
    .report-footer { margin-top: 40px; font-size: 12px; color: var(--muted); text-align: center; }
  `;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MemeMe™ — Conversation Report</title>
    <style>${css}</style>
  </head>
  <body>
    <header>
      <div class="header-brand">MemeMe™</div>
      <div class="header-meta">
        ${escapeHtml(speakers.join(" vs "))}
        &nbsp;·&nbsp;
        ${conversation.length} messages
        &nbsp;·&nbsp;
        <code>${escapeHtml(args.thread.id)}</code>
      </div>
    </header>
    <main>
      ${seedPanel(seed, seedText)}
      ${messagesHtml || "<p>No messages yet.</p>"}
      <div class="report-footer">
        Generated at ${escapeHtml(new Date().toLocaleString())}
      </div>
    </main>
  </body>
</html>`;

  const indexPath = join(reportDir, "index.html");
  await writeFile(indexPath, html, "utf8");
  return { reportDir, indexPath };
}
