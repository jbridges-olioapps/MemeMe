import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ThreadStore } from "./threadStore.js";
import { searchShorts, validateYouTubeShortUrl } from "./shorts.js";
import { generateThreadReport } from "./report.js";

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
    reaction: z.enum(["😂", "❤️", "🔥", "🤯", "👍"]),
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
  "run_from_judge_prompt",
  "Convenience tool: create a thread, seed a judge message, simulate a bounded turn-taking loop, and (later) generate a report.",
  {
    shortUrl: z.string(),
    judgeMessage: z.string(),
    turns: z.number().int().min(2).max(20).optional(),
  },
  async ({ shortUrl, judgeMessage, turns }) => {
    const validated = validateYouTubeShortUrl(shortUrl);
    if (!validated.ok) {
      return { content: [{ type: "text", text: JSON.stringify(validated, null, 2) }] };
    }

    const maxTurns = turns ?? 8;
    const participants = ["Judge", "AgentA", "AgentB"];
    const { threadId } = await store.createThread(participants);

    const { messageId: seedMessageId } = await store.postMessage({
      threadId,
      from: "Judge",
      text: judgeMessage,
      attachments: [{ type: "video", url: validated.normalizedUrl }],
    });

    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const reactions = ["😂", "❤️", "🔥", "🤯", "👍"] as const;

    let lastMessageId = seedMessageId;
    for (let i = 0; i < maxTurns; i++) {
      const from = i % 2 === 0 ? "AgentA" : "AgentB";
      const other = from === "AgentA" ? "AgentB" : "AgentA";

      await store.react({
        threadId,
        messageId: lastMessageId,
        from,
        reaction: pick([...reactions]),
      });

      const candidates = searchShorts({ limit: 25 });
      const chosen = pick(candidates);

      const text =
        from === "AgentA"
          ? `Ok ${other}, this one reminded me of your vibe. What do you think?`
          : `Haha yes. This is my counter-pick — same energy.`;

      const res = await store.postMessage({
        threadId,
        from,
        text,
        attachments: [{ type: "video", url: chosen.url }],
      });
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

