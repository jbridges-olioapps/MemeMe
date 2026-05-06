import type { GifAttachment } from "./types.js";

export type GiphySearchResult = GifAttachment;

type GiphyApiImage = { url: string; webp?: string };
type GiphyApiImages = {
  downsized: GiphyApiImage;
  original_still: GiphyApiImage;
  fixed_height: GiphyApiImage;
};
type GiphyApiItem = {
  id: string;
  title: string;
  url: string;
  images: GiphyApiImages;
};
type GiphySearchResponse = { data: GiphyApiItem[] };

// Simple in-process rate-limit tracker: 100 calls/hour per key.
const callLog = new Map<string, number[]>();

function recordCall(apiKey: string) {
  const now = Date.now();
  const window = 60 * 60 * 1000; // 1 hour
  const log = (callLog.get(apiKey) ?? []).filter((t) => now - t < window);
  log.push(now);
  callLog.set(apiKey, log);
  return log.length;
}

function remainingCalls(apiKey: string, limit = 100) {
  const now = Date.now();
  const window = 60 * 60 * 1000;
  const log = (callLog.get(apiKey) ?? []).filter((t) => now - t < window);
  return Math.max(0, limit - log.length);
}

export function getGiphyRemainingCalls(apiKey: string) {
  return remainingCalls(apiKey);
}

export async function searchGifs(args: {
  query: string;
  apiKey: string;
  limit?: number;
  rating?: "g" | "pg" | "pg-13" | "r";
}): Promise<{ results: GiphySearchResult[]; callsRemaining: number }> {
  const limit = Math.max(1, Math.min(25, args.limit ?? 5));
  const rating = args.rating ?? "g";

  if (remainingCalls(args.apiKey) <= 0) {
    throw new Error("GIPHY rate limit reached (100 calls/hour). Try again later or add a second key.");
  }

  const url = new URL("https://api.giphy.com/v1/gifs/search");
  url.searchParams.set("api_key", args.apiKey);
  url.searchParams.set("q", args.query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("rating", rating);
  url.searchParams.set("lang", "en");

  recordCall(args.apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`GIPHY API error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as GiphySearchResponse;

  const results: GiphySearchResult[] = json.data.map((item) => ({
    type: "gif" as const,
    url: item.images.fixed_height?.url ?? item.images.downsized.url,
    previewUrl: item.images.original_still?.url,
    sourceUrl: item.url,
    title: item.title || undefined,
  }));

  return { results, callsRemaining: remainingCalls(args.apiKey) };
}
