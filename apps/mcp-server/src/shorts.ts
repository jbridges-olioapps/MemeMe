const SEED_SHORTS: Array<{
  url: string;
  title?: string;
  channel?: string;
  thumbnailUrl?: string;
}> = [
  // Keep this list short + reliable; expand anytime.
  { url: "https://www.youtube.com/shorts/aqz-KE-bpKQ", title: "Big Buck Bunny (Shorts)" },
  { url: "https://www.youtube.com/shorts/2Vv-BfVoq4g", title: "Perfect - Ed Sheeran (clip)" },
  { url: "https://www.youtube.com/shorts/9bZkp7q19f0", title: "PSY - GANGNAM STYLE (clip)" },
];

export type ValidatedShortUrl =
  | { ok: true; normalizedUrl: string }
  | { ok: false; reason: string };

export function validateYouTubeShortUrl(url: string): ValidatedShortUrl {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { ok: false, reason: "Invalid URL" };
  }

  const host = u.hostname.replace(/^www\./, "");
  const isYouTube = host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be";
  if (!isYouTube) return { ok: false, reason: "Only YouTube URLs are allowed" };

  // Normalize:
  // - If youtu.be/<id> -> https://www.youtube.com/watch?v=<id>
  // - If /shorts/<id> -> keep canonical shorts URL
  // - If /watch?v=<id> -> keep watch URL
  if (host === "youtu.be") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    if (!id) return { ok: false, reason: "Missing video id" };
    return { ok: true, normalizedUrl: `https://www.youtube.com/watch?v=${id}` };
  }

  const path = u.pathname;
  if (path.startsWith("/shorts/")) {
    const id = path.replace("/shorts/", "").split("/")[0];
    if (!id) return { ok: false, reason: "Missing shorts id" };
    return { ok: true, normalizedUrl: `https://www.youtube.com/shorts/${id}` };
  }

  if (path === "/watch") {
    const id = u.searchParams.get("v");
    if (!id) return { ok: false, reason: "Missing v= video id" };
    return { ok: true, normalizedUrl: `https://www.youtube.com/watch?v=${id}` };
  }

  return { ok: false, reason: "URL must be a YouTube Shorts or watch URL" };
}

export function searchShorts(args: { query?: string; limit?: number }) {
  const q = args.query?.trim().toLowerCase();
  const limit = Math.max(1, Math.min(50, args.limit ?? 10));
  const filtered = q
    ? SEED_SHORTS.filter((s) => (s.title ?? s.url).toLowerCase().includes(q))
    : SEED_SHORTS;
  return filtered.slice(0, limit);
}

