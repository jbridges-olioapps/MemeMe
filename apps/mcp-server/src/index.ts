import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { ThreadStore } from "./threadStore.js";
import { searchShorts, validateYouTubeShortUrl } from "./shorts.js";
import { generateThreadReport } from "./report.js";
import { searchGifs, getGiphyRemainingCalls } from "./giphy.js";
import { generateAgentTurn, pickTwoPersonas, getPersonaById, PERSONAS } from "./agents.js";

const server = new McpServer({
  name: "mememe-mcp-server",
  version: "0.0.0",
});

const store = new ThreadStore(new URL("../data/threadStore.json", import.meta.url).pathname);

server.tool(
  "ping",
  "Health check tool.",
  { message: z.string().optional() },
  async ({ message }) => {
    return {
      content: [
        {
          type: "text",
          text: `pong${message ? `: ${message}` : ""}`,
        },
      ],
    };
  },
);

server.tool(
  "thread_create",
  "Create a new DM thread with participants.",
  {
    participants: z.array(z.string()).min(1),
  },
  async ({ participants }) => {
    const { threadId } = await store.createThread(participants);
    return { content: [{ type: "text", text: JSON.stringify({ threadId }, null, 2) }] };
  },
);

server.tool("thread_list", "List threads (summary only).", {}, async () => {
  const threads = await store.listThreads();
  return { content: [{ type: "text", text: JSON.stringify({ threads }, null, 2) }] };
});

server.tool(
  "thread_get",
  "Get a thread with full message history.",
  { threadId: z.string() },
  async ({ threadId }) => {
    const thread = await store.getThread(threadId);
    if (!thread) throw new Error(`Unknown threadId: ${threadId}`);
    return { content: [{ type: "text", text: JSON.stringify({ thread }, null, 2) }] };
  },
);

server.tool(
  "thread_post_message",
  "Post a message to a thread.",
  {
    threadId: z.string(),
    from: z.string(),
    text: z.string(),
    attachments: z
      .array(
        z.discriminatedUnion("type", [
          z.object({ type: z.literal("video"), url: z.string().url() }),
          z.object({ type: z.literal("link"), url: z.string().url() }),
        ]),
      )
      .optional(),
  },
  async ({ threadId, from, text, attachments }) => {
    const { messageId } = await store.postMessage({
      threadId,
      from,
      text,
      attachments,
    });
    return { content: [{ type: "text", text: JSON.stringify({ messageId }, null, 2) }] };
  },
);

server.tool(
  "thread_react",
  "React to a message in a thread.",
  {
    threadId: z.string(),
    messageId: z.string(),
    from: z.string(),
    reaction: z.enum(["😂", "❤️", "🔥", "🤯", "👍", "💀", "😭", "🫡", "💯", "👀", "🙌", "😤", "🤣", "😍", "🫶"]),
  },
  async ({ threadId, messageId, from, reaction }) => {
    const res = await store.react({ threadId, messageId, from, reaction });
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  },
);

server.tool(
  "shorts_validate_url",
  "Validate and normalize a YouTube Shorts URL (YouTube-only).",
  { url: z.string() },
  async ({ url }) => {
    const res = validateYouTubeShortUrl(url);
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  },
);

server.tool(
  "shorts_search",
  "Return candidate Shorts (seed list; optionally filter by query).",
  { query: z.string().optional(), limit: z.number().int().min(1).max(50).optional() },
  async ({ query, limit }) => {
    const results = searchShorts({ query, limit });
    return { content: [{ type: "text", text: JSON.stringify({ results }, null, 2) }] };
  },
);

server.tool(
  "gif_search",
  "Search GIPHY for GIFs. Requires GIPHY_API_KEY env var. Rate limited to 100 calls/hour.",
  {
    query: z.string(),
    limit: z.number().int().min(1).max(25).optional(),
    rating: z.enum(["g", "pg", "pg-13", "r"]).optional(),
  },
  async ({ query, limit, rating }) => {
    const apiKey = process.env.GIPHY_API_KEY ?? "";
    if (!apiKey) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "GIPHY_API_KEY env var is not set." }, null, 2) }],
      };
    }
    const { results, callsRemaining } = await searchGifs({ query, apiKey, limit, rating });
    return {
      content: [{ type: "text", text: JSON.stringify({ results, callsRemaining }, null, 2) }],
    };
  },
);

server.tool(
  "giphy_quota",
  "Check how many GIPHY API calls remain in the current hour window.",
  {},
  async () => {
    const apiKey = process.env.GIPHY_API_KEY ?? "";
    if (!apiKey) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "GIPHY_API_KEY not set." }) }] };
    }
    return {
      content: [{ type: "text", text: JSON.stringify({ callsRemaining: getGiphyRemainingCalls(apiKey) }) }],
    };
  },
);

server.tool(
  "list_personas",
  "List all available agent personas.",
  {},
  async () => {
    const list = PERSONAS.map((p) => ({ id: p.id, name: p.name }));
    return { content: [{ type: "text", text: JSON.stringify({ personas: list }, null, 2) }] };
  },
);

server.tool(
  "run_from_judge_prompt",
  "Convenience tool: create a thread, seed a judge message, simulate a bounded turn-taking loop, and generate a report.",
  {
    shortUrl: z.string(),
    judgeMessage: z.string(),
    turns: z.number().int().min(2).max(20).optional(),
    personaA: z.string().optional(),
    personaB: z.string().optional(),
  },
  async ({ shortUrl, judgeMessage, turns, personaA, personaB }) => {
    const validated = validateYouTubeShortUrl(shortUrl);
    if (!validated.ok) {
      return { content: [{ type: "text", text: JSON.stringify(validated, null, 2) }] };
    }

    const [defaultA, defaultB] = pickTwoPersonas();
    const chosenA = (personaA ? getPersonaById(personaA) : null) ?? defaultA;
    const chosenB = (personaB ? getPersonaById(personaB) : null) ?? defaultB;

    const maxTurns = turns ?? 8;
    const participants = [chosenA.name, chosenB.name];
    const { threadId } = await store.createThread(participants);

    const { messageId: seedMessageId } = await store.postMessage({
      threadId,
      from: "Seed",
      text: judgeMessage,
      attachments: [{ type: "video", url: validated.normalizedUrl }],
    });

    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const reactionPool = [
      "😂", "😂", "😂", "🔥", "🔥", "💀", "💀", "😭", "😭", "🤣", "🤣",
      "👍", "❤️", "🤯", "💯", "👀", "🙌", "😤", "😍", "🫶", "🫡",
    ] as const;

    function pickReactions(): string[] {
      const first = pick([...reactionPool]);
      if (Math.random() < 0.25) {
        let second = pick([...reactionPool]);
        while (second === first) second = pick([...reactionPool]);
        return [first, second];
      }
      return [first];
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY ?? "";
    const giphyKey = process.env.GIPHY_API_KEY ?? "";
    const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;
    const availableVideos = searchShorts({ limit: 25 });

    let lastMessageId = seedMessageId;
    for (let i = 0; i < maxTurns; i++) {
      const currentPersona = i % 2 === 0 ? chosenA : chosenB;
      const from = currentPersona.name;

      for (const reaction of pickReactions()) {
        await store.react({ threadId, messageId: lastMessageId, from, reaction: reaction as Parameters<typeof store.react>[0]["reaction"] });
      }

      let text: string;
      let attachments: Parameters<typeof store.postMessage>[0]["attachments"] = [];

      if (anthropic) {
        const currentThread = await store.getThread(threadId);
        const turn = await generateAgentTurn({
          client: anthropic,
          persona: currentPersona,
          thread: currentThread!,
          availableVideos,
          gifEnabled: Boolean(giphyKey && getGiphyRemainingCalls(giphyKey) > 0),
        });
        text = turn.text;
        if (turn.attachment?.type === "video") {
          attachments = [{ type: "video", url: turn.attachment.url }];
        } else if (turn.attachment?.type === "gif" && giphyKey) {
          try {
            const { results } = await searchGifs({ query: turn.attachment.searchQuery, apiKey: giphyKey, limit: 10 });
            if (results.length > 0) attachments = [pick(results)];
          } catch { /* fall through — no gif */ }
        }
      } else {
        const chosen = pick(availableVideos);
        text = i % 2 === 0 ? "bro you NEED to see this" : "ok ok ok but THIS though";
        attachments = [{ type: "video", url: chosen.url }];
      }

      const res = await store.postMessage({ threadId, from, text, attachments });
      lastMessageId = res.messageId;
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              ok: true,
              threadId,
              personas: { A: { id: chosenA.id, name: chosenA.name }, B: { id: chosenB.id, name: chosenB.name } },
              reportPath: null,
              note: "Use report_generate to produce a static HTML report.",
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.tool(
  "report_generate",
  "Generate a static HTML report for a thread.",
  { threadId: z.string() },
  async ({ threadId }) => {
    const thread = await store.getThread(threadId);
    if (!thread) throw new Error(`Unknown threadId: ${threadId}`);
    const outDir = new URL("../reports", import.meta.url).pathname;
    const { indexPath } = await generateThreadReport({ outDir, thread });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ reportPath: indexPath }, null, 2),
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

