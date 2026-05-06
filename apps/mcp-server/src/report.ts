import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Thread, GifAttachment } from "./types.js";

export type ReportSeed = {
  url: string;
  title?: string;
  channel?: string;
};

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

  // If the runner didn't pass seed metadata explicitly but we have the seed message,
  // synthesize a minimal ReportSeed from the attachment URL.
  const seedFromMessage: ReportSeed | undefined = (() => {
    if (!seedMessage) return undefined;
    const att = seedMessage.attachments.find((a) => a.type === "video");
    if (!att || att.type !== "video") return undefined;
    return { url: att.url };
  })();
  const seed = args.seed ?? seedFromMessage;
  const seedText = seedMessage?.text ?? "";

  // Sides: alternate left/right for the two non-Seed participants.
  const speakers = Array.from(new Set(conversation.map((m) => m.from)));
  const sideFor = (from: string): "left" | "right" => (from === speakers[0] ? "left" : "right");

  const messagesHtml = conversation
    .map((m) => {
      const embeds = m.attachments
        .map((a) => {
          if (a.type === "video") return youtubeVideoCard(a.url);
          if (a.type === "gif") return gifCard(a);
          return null;
        })
        .filter((x): x is string => Boolean(x))
        .join("\n");

      const reactions = m.reactions.length
        ? `<div class="reactions">${m.reactions
            .map((r) => `<span class="reaction" title="${escapeHtml(r.from)}">${escapeHtml(r.reaction)}</span>`)
            .join(" ")}</div>`
        : "";

      const side = sideFor(m.from);
      return `
        <div class="msg ${side}">
          <div class="meta">
            <span class="from">${escapeHtml(m.from)}</span>
            <span class="time">${escapeHtml(new Date(m.createdAt).toLocaleString())}</span>
          </div>
          <div class="bubble">
            <div class="text">${escapeHtml(m.text)}</div>
            ${embeds}
            ${reactions}
          </div>
        </div>
      `;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MemeMe Report — ${escapeHtml(args.thread.id)}</title>
    <style>
      :root { color-scheme: light dark; }
      body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background: #0b0c10; color: #e7e7e7; }
      header { padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,.08); position: sticky; top: 0; background: rgba(11,12,16,.92); backdrop-filter: blur(8px); }
      h1 { font-size: 16px; margin: 0 0 6px; font-weight: 600; }
      .sub { font-size: 12px; opacity: .85; }
      main { max-width: 920px; margin: 0 auto; padding: 18px 14px 40px; }

      .seed-panel { margin: 6px 0 22px; padding: 16px 16px 18px; border-radius: 16px;
        background: linear-gradient(180deg, rgba(99,102,241,.18) 0%, rgba(99,102,241,.06) 100%);
        border: 1px solid rgba(99,102,241,.32);
      }
      .seed-eyebrow { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
        opacity: .85; font-weight: 700; margin-bottom: 10px; color: #b4b8ff; }
      .seed-body { display: grid; gap: 14px; grid-template-columns: 1fr; }
      @media (min-width: 640px) { .seed-body { grid-template-columns: 1.1fr .9fr; align-items: start; } }
      .seed-title { font-size: 17px; font-weight: 700; line-height: 1.3; margin-bottom: 4px; }
      .seed-channel { font-size: 13px; opacity: .8; margin-bottom: 8px; }
      .seed-note { margin-top: 8px; font-size: 13px; line-height: 1.45; opacity: .9;
        padding: 8px 10px; border-left: 2px solid rgba(255,255,255,.18); background: rgba(255,255,255,.04);
        border-radius: 0 6px 6px 0; white-space: pre-wrap; }

      .msg { display: flex; margin: 14px 0; }
      .msg.left { justify-content: flex-start; }
      .msg.right { justify-content: flex-end; }
      .bubble { max-width: 640px; width: 100%; padding: 12px 12px 10px; border-radius: 14px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08); }
      .msg.right .bubble { background: rgba(99,102,241,.14); border-color: rgba(99,102,241,.25); }
      .meta { display: flex; gap: 10px; font-size: 12px; opacity: .85; margin-bottom: 8px; align-items: baseline; }
      .from { font-weight: 600; }
      .time { opacity: .8; }
      .text { white-space: pre-wrap; line-height: 1.3; }
      .video-card { margin-top: 10px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,.08); background: rgba(0,0,0,.25); }
      .thumb-link { display: block; position: relative; text-decoration: none; }
      .thumb { display: block; width: 100%; aspect-ratio: 16/9; object-fit: cover; }
      .play-badge { position: absolute; bottom: 0; left: 0; right: 0; padding: 8px 10px; background: linear-gradient(transparent, rgba(0,0,0,.75)); color: #fff; font-size: 13px; font-weight: 600; }
      .embed-toggle { padding: 8px 10px; font-size: 12px; opacity: .85; }
      .embed-toggle summary { cursor: pointer; user-select: none; }
      .embed { border-top: 1px solid rgba(255,255,255,.08); }
      iframe { width: 100%; aspect-ratio: 9/16; border: 0; background: #000; }
      .gif-card { margin-top: 10px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,.08); background: rgba(0,0,0,.20); display: inline-flex; flex-direction: column; max-width: 320px; }
      .gif-img { display: block; width: 100%; max-width: 320px; height: auto; }
      .gif-footer { padding: 5px 8px; display: flex; gap: 8px; align-items: center; font-size: 11px; opacity: .8; }
      .giphy-attr { color: inherit; text-decoration: none; font-weight: 600; }
      .giphy-attr:hover { text-decoration: underline; }
      .gif-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: .75; }
      .reactions { margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap; }
      .reaction { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.10); border-radius: 999px; padding: 2px 8px; font-size: 12px; }
      footer { margin-top: 22px; font-size: 12px; opacity: .75; }
      a { color: inherit; }
    </style>
  </head>
  <body>
    <header>
      <h1>MemeMe — Conversation Report</h1>
      <div class="sub">
        Thread: <code>${escapeHtml(args.thread.id)}</code> · Participants: ${escapeHtml(speakers.join(", "))} · Messages: ${conversation.length}
      </div>
    </header>
    <main>
      ${seedPanel(seed, seedText)}
      ${messagesHtml || "<p>No messages yet.</p>"}
      <footer>
        Generated at ${escapeHtml(new Date().toLocaleString())}.
      </footer>
    </main>
  </body>
</html>`;

  const indexPath = join(reportDir, "index.html");
  await writeFile(indexPath, html, "utf8");
  return { reportDir, indexPath };
}
