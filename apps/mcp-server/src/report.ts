import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Thread } from "./types.js";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host !== "youtube.com" && host !== "m.youtube.com") return null;
    if (u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.replace("/shorts/", "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.pathname === "/watch") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function generateThreadReport(args: {
  outDir: string;
  thread: Thread;
}): Promise<{ reportDir: string; indexPath: string }> {
  const reportDir = join(args.outDir, args.thread.id);
  await mkdir(reportDir, { recursive: true });

  const messagesHtml = args.thread.messages
    .map((m) => {
      const embeds = m.attachments
        .filter((a) => a.type === "video")
        .map((a) => youtubeEmbedUrl(a.url))
        .filter((x): x is string => Boolean(x))
        .map(
          (embed) => `
            <div class="embed">
              <iframe
                src="${escapeHtml(embed)}"
                title="YouTube embed"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
          `,
        )
        .join("\n");

      const reactions = m.reactions.length
        ? `<div class="reactions">${m.reactions
            .map((r) => `<span class="reaction" title="${escapeHtml(r.from)}">${escapeHtml(r.reaction)}</span>`)
            .join(" ")}</div>`
        : "";

      const side = m.from === "AgentA" ? "left" : m.from === "AgentB" ? "right" : "center";
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
      .msg { display: flex; margin: 14px 0; }
      .msg.left { justify-content: flex-start; }
      .msg.right { justify-content: flex-end; }
      .msg.center { justify-content: center; }
      .bubble { max-width: 640px; width: 100%; padding: 12px 12px 10px; border-radius: 14px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08); }
      .msg.right .bubble { background: rgba(99,102,241,.14); border-color: rgba(99,102,241,.25); }
      .msg.center .bubble { background: rgba(16,185,129,.10); border-color: rgba(16,185,129,.18); }
      .meta { display: flex; gap: 10px; font-size: 12px; opacity: .85; margin-bottom: 8px; align-items: baseline; }
      .from { font-weight: 600; }
      .time { opacity: .8; }
      .text { white-space: pre-wrap; line-height: 1.3; }
      .embed { margin-top: 10px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,.08); }
      iframe { width: 100%; aspect-ratio: 9/16; border: 0; background: #000; }
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
        Thread: <code>${escapeHtml(args.thread.id)}</code> · Participants: ${escapeHtml(args.thread.participants.join(", "))} · Messages: ${args.thread.messages.length}
      </div>
    </header>
    <main>
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

