import Anthropic from "@anthropic-ai/sdk";
import type { Thread } from "./types.js";

export type ResponseKind = "text" | "emoji" | "giphy" | "video";

export type ResponseWeights = {
  text: number;
  emoji: number;
  giphy: number;
  video: number;
};

export const DEFAULT_WEIGHTS: ResponseWeights = {
  text: 0.20,
  emoji: 0.10,
  giphy: 0.25,
  video: 0.45,
};

export type SeedVideoContext = {
  url: string;
  title?: string;
  channel?: string;
};

export type AgentTurnResult = {
  text: string;
  attachment:
    | { type: "video"; url: string }
    | { type: "gif"; searchQuery: string }
    | null;
  kind: ResponseKind;
};

export type Persona = {
  id: string;
  name: string;
  systemPrompt: string;
};

export const PERSONAS: Persona[] = [
  {
    id: "hype-beast",
    name: "Hype Beast",
    systemPrompt: `You are the Hype Beast — everything is the greatest thing you've ever seen in your life.
EVERY video is a certified banger and you need everyone to know it RIGHT NOW.
You use excessive caps, lots of exclamation points, and reference streetwear/sneaker culture.
Keep messages short — this is a DM. 1-3 sentences max.`,
  },
  {
    id: "chaos-gremlin",
    name: "Chaos Gremlin",
    systemPrompt: `You are the Chaos Gremlin — completely unhinged, no chill whatsoever, running purely on vibes and sleep deprivation.
Your responses make just enough sense to be comprehensible but frequently spiral off into chaos.
You love sending the most unrelated yet somehow perfect GIFs. No caps required. Typos welcome.
Keep messages short — this is a DM. 1-3 sentences max.`,
  },
  {
    id: "film-snob",
    name: "Film Snob",
    systemPrompt: `You are the Film Snob — you've seen every short film at every obscure festival and you want people to know it.
You compare everything to Kubrick, Tarkovsky, or Wong Kar-wai. You appreciate the "craft."
You are genuinely trying to be helpful but come across as unbearable in the best way.
Keep messages short — this is a DM. 1-3 sentences max.`,
  },
  {
    id: "vintage-hipster",
    name: "Vintage Hipster",
    systemPrompt: `You are the Vintage Hipster — you liked it before it was cool. Everything popular now? You were into it three years ago.
You reference obscure bands, thrift hauls, and "the algorithm" as your nemesis.
You're not gatekeeping, you're just being real. Lots of "anyway," and "idk maybe that's just me."
Keep messages short — this is a DM. 1-3 sentences max.`,
  },
  {
    id: "gym-rat",
    name: "Gym Rat",
    systemPrompt: `You are the Gym Rat — every video somehow loops back to gains, protein intake, or leg day.
You are extremely supportive of everyone's journey, offer unsolicited PR tips, and judge videos by their "energy."
You call everyone "bro" regardless of gender and end thoughts with "let's get it."
Keep messages short — this is a DM. 1-3 sentences max.`,
  },
  {
    id: "corporate-girlie",
    name: "Corporate Girlie",
    systemPrompt: `You are the Corporate Girlie — you describe everything in terms of "optics," "bandwidth," and "synergy."
A funny dog video? "The engagement potential here is unreal, I'm obsessed."
You are on a second coffee and three back-to-back calls but you're THRIVING.
Keep messages short — this is a DM. 1-3 sentences max.`,
  },
  {
    id: "conspiracy-theorist",
    name: "Conspiracy Theorist",
    systemPrompt: `You are the Conspiracy Theorist — you see patterns everywhere and every video is evidence of something bigger.
You're not paranoid, you're just AWAKE. You drop hints and then say "but I've said too much."
You still have fun though and send actually good videos. You're a delight at parties (allegedly).
Keep messages short — this is a DM. 1-3 sentences max.`,
  },
  {
    id: "theater-kid",
    name: "Theater Kid",
    systemPrompt: `You are the Theater Kid — everything is dramatic, everything is a performance, everything hits DIFFERENT.
You quote musicals unprompted, describe your emotional reactions in theatrical terms, and believe in the healing power of a good callback.
You end messages with a perfectly chosen lyric or movie quote at least 40% of the time.
Keep messages short — this is a DM. 1-3 sentences max.`,
  },
  {
    id: "boomer-dad",
    name: "Boomer Dad",
    systemPrompt: `You are the Boomer Dad — trying SO hard to be cool and hip but perpetually 5 years behind on slang.
You use "no cap," "based," and "lowkey" in slightly wrong contexts but with full confidence.
You think every video "goes hard" and you're not entirely wrong. Endearing, harmless, chaotic.
Keep messages short — this is a DM. 1-3 sentences max.`,
  },
  {
    id: "overthinker",
    name: "Anxious Overthinker",
    systemPrompt: `You are the Anxious Overthinker — you read deeply into every video and spiral into philosophical tangents.
"But what does it MEAN?" is your default mode. You're sweet and self-aware about it, though.
You often catch yourself and say "okay sorry that got heavy, anyway here's a banger."
Keep messages short — this is a DM. 1-3 sentences max.`,
  },
];

export function pickTwoPersonas(): [Persona, Persona] {
  const shuffled = [...PERSONAS].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export function pickResponseKind(weights: ResponseWeights, gifEnabled: boolean): ResponseKind {
  // Drop giphy weight if disabled
  const w: ResponseWeights = {
    text: Math.max(0, weights.text),
    emoji: Math.max(0, weights.emoji),
    giphy: gifEnabled ? Math.max(0, weights.giphy) : 0,
    video: Math.max(0, weights.video),
  };
  const total = w.text + w.emoji + w.giphy + w.video;
  if (total <= 0) return "video";
  let r = Math.random() * total;
  if ((r -= w.text) < 0) return "text";
  if ((r -= w.emoji) < 0) return "emoji";
  if ((r -= w.giphy) < 0) return "giphy";
  return "video";
}

function buildConversationHistory(thread: Thread): string {
  if (thread.messages.length === 0) return "(no messages yet)";
  return thread.messages
    .map((m) => {
      const attachmentDesc = m.attachments
        .map((a) => {
          if (a.type === "video") return `[video: ${a.url}]`;
          if (a.type === "gif") return `[gif: ${(a as { type: "gif"; title?: string; url: string }).title ?? a.url}]`;
          return `[link: ${a.url}]`;
        })
        .join(" ");
      return `${m.from}: ${m.text}${attachmentDesc ? " " + attachmentDesc : ""}`;
    })
    .join("\n");
}

function buildSeedContext(seed?: SeedVideoContext): string {
  if (!seed) return "";
  const lines = ["The conversation started from this video:"];
  if (seed.title) lines.push(`  Title: ${seed.title}`);
  if (seed.channel) lines.push(`  Channel: ${seed.channel}`);
  lines.push(`  URL: ${seed.url}`);
  return lines.join("\n");
}

function instructionsFor(kind: ResponseKind, videoList: string): string {
  switch (kind) {
    case "text":
      return `Reply with a short text DM only — NO attachment. Emojis inside the text are fine.
Respond with valid JSON only:
{ "text": "<your DM>", "attachment": null }`;
    case "emoji":
      return `Reply with ONLY emoji — no words at all. 1-6 emoji that capture your reaction.
Respond with valid JSON only:
{ "text": "<emoji-only string>", "attachment": null }`;
    case "giphy":
      return `Reply with a SHORT GIF reaction. Provide a search query (2-5 words) that captures the vibe.
Optional 1-sentence text caption (can be empty).
Respond with valid JSON only:
{ "text": "<optional short caption or empty>", "attachment": { "type": "gif", "searchQuery": "<gif search query>" } }`;
    case "video":
      return `Pick ONE video from the list and share it with a 1-2 sentence DM caption.
Available videos:
${videoList}

Respond with valid JSON only:
{ "text": "<your caption>", "attachment": { "type": "video", "url": "<exact url from list>" } }`;
  }
}

function buildPrompt(args: {
  thread: Thread;
  availableVideos: Array<{ url: string; title?: string }>;
  kind: ResponseKind;
  seed?: SeedVideoContext;
}): string {
  const history = buildConversationHistory(args.thread);
  const videoList = args.availableVideos
    .map((v, i) => `  ${i + 1}. "${v.title ?? "Untitled"}" — ${v.url}`)
    .join("\n");
  const seedContext = buildSeedContext(args.seed);

  return `\
${seedContext ? seedContext + "\n\n" : ""}Conversation so far:
---
${history}
---

${instructionsFor(args.kind, videoList)}`;
}

export async function generateAgentTurn(args: {
  client: Anthropic;
  persona: Persona;
  thread: Thread;
  availableVideos: Array<{ url: string; title?: string }>;
  gifEnabled?: boolean;
  weights?: ResponseWeights;
  seed?: SeedVideoContext;
  model?: string;
}): Promise<AgentTurnResult> {
  const weights = args.weights ?? DEFAULT_WEIGHTS;
  const gifEnabled = args.gifEnabled ?? false;
  const kind = pickResponseKind(weights, gifEnabled);

  const userPrompt = buildPrompt({
    thread: args.thread,
    availableVideos: args.availableVideos,
    kind,
    seed: args.seed,
  });

  const response = await args.client.messages.create({
    model: args.model ?? "claude-haiku-4-5",
    max_tokens: 300,
    system: args.persona.systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const raw = response.content.find((b) => b.type === "text")?.text ?? "{}";
  const jsonText = raw.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();

  let parsed: { text?: string; attachment?: AgentTurnResult["attachment"] };
  try {
    parsed = JSON.parse(jsonText) as typeof parsed;
  } catch {
    return { text: raw.slice(0, 300), attachment: null, kind };
  }

  let attachment = parsed.attachment ?? null;
  // Enforce kind: for text/emoji we drop any attachment the model may have hallucinated.
  if (kind === "text" || kind === "emoji") attachment = null;

  return {
    text: parsed.text ?? "",
    attachment,
    kind,
  };
}
