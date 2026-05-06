import Anthropic from "@anthropic-ai/sdk";
import type { Thread } from "./types.js";

export type AgentTurnResult = {
  text: string;
  attachment:
    | { type: "video"; url: string }
    | { type: "gif"; searchQuery: string }
    | null;
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

function buildPrompt(args: {
  thread: Thread;
  availableVideos: Array<{ url: string; title?: string }>;
  gifEnabled: boolean;
}): string {
  const history = buildConversationHistory(args.thread);
  const videoList = args.availableVideos
    .map((v, i) => `  ${i + 1}. "${v.title ?? "Untitled"}" — ${v.url}`)
    .join("\n");

  const attachmentInstructions = args.gifEnabled
    ? `Choose ONE of:
- Pick a video from the list below (use its exact URL)
- React with a GIF instead (provide a short search query like "mind blown" or "same energy")`
    : `Pick ONE video from the list below (use its exact URL).`;

  return `\
Here is the conversation so far:
---
${history}
---

Available videos to share:
${videoList}

${attachmentInstructions}

Respond with ONLY valid JSON in this exact shape (no markdown, no explanation):
{
  "text": "<your DM message>",
  "attachment": { "type": "video", "url": "<exact url from list>" }
}
OR (if reacting with a GIF):
{
  "text": "<your DM message>",
  "attachment": { "type": "gif", "searchQuery": "<short gif search query>" }
}
OR (if no attachment makes sense):
{
  "text": "<your DM message>",
  "attachment": null
}`;
}

export async function generateAgentTurn(args: {
  client: Anthropic;
  persona: Persona;
  thread: Thread;
  availableVideos: Array<{ url: string; title?: string }>;
  gifEnabled?: boolean;
  model?: string;
}): Promise<AgentTurnResult> {
  const userPrompt = buildPrompt({
    thread: args.thread,
    availableVideos: args.availableVideos,
    gifEnabled: args.gifEnabled ?? false,
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
    return { text: raw.slice(0, 300), attachment: null };
  }

  return {
    text: parsed.text ?? "",
    attachment: parsed.attachment ?? null,
  };
}
