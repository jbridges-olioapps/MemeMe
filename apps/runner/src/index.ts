import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { z } from "zod";
import { ThreadStore, generateThreadReport, searchShorts, validateYouTubeShortUrl } from "@mememe/mcp-server";
import { searchGifs, getGiphyRemainingCalls } from "@mememe/mcp-server";

const PORT = Number(process.env.PORT ?? "8787");
const RUNNER_TOKEN = process.env.RUNNER_TOKEN ?? "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const store = new ThreadStore(new URL("../data/threadStore.json", import.meta.url).pathname);
const reportsDir = new URL("../reports", import.meta.url).pathname;

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server / curl (no origin), and optionally restrict browsers.
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.length === 0) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked"), false);
    },
  }),
);

app.use(express.json({ limit: "50kb" }));

app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 6,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);

function requireToken(req: express.Request) {
  if (!RUNNER_TOKEN) return;
  const token = req.header("X-Runner-Token") ?? "";
  if (token !== RUNNER_TOKEN) {
    const err = new Error("Unauthorized");
    // @ts-expect-error attach status
    err.statusCode = 401;
    throw err;
  }
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const RunInput = z.object({
  shortUrl: z.string(),
  judgeMessage: z.string().min(1).max(1000),
  turns: z.number().int().min(2).max(20).optional(),
});

app.post("/run", async (req, res) => {
  try {
    requireToken(req);
    const input = RunInput.parse(req.body);

    const validated = validateYouTubeShortUrl(input.shortUrl);
    if (!validated.ok) return res.status(400).json(validated);

    const { threadId } = await store.createThread(["Judge", "AgentA", "AgentB"]);
    const { messageId: seedMessageId } = await store.postMessage({
      threadId,
      from: "Judge",
      text: input.judgeMessage,
      attachments: [{ type: "video", url: validated.normalizedUrl }],
    });

    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const reactionPool = [
      "😂", "😂", "😂",
      "🔥", "🔥",
      "💀", "💀",
      "😭", "😭",
      "🤣", "🤣",
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

    const giphyKey = process.env.GIPHY_API_KEY ?? "";
    const gifQueries = ["reaction", "lol", "omg", "fire", "this is fine", "mind blown", "no way", "same", "vibe"];
    const videoTextsA = [
      "Ok this one reminded me of your whole personality",
      "bro you NEED to see this",
      "this was literally made for you",
      "why does this feel like us",
    ];
    const videoTextsB = [
      "ok I FELT that. counter-pick:",
      "lmaooo ok but have you seen this one",
      "same energy honestly",
      "ok ok ok but THIS though",
    ];
    const gifTextsA = [
      "me watching your last video",
      "this is my reaction rn",
      "no words needed",
      "literally me every time",
    ];
    const gifTextsB = [
      "responding in gif form because words aren't enough",
      "this is how I feel about what you just sent",
      "^^ that's all I have to say",
      "okay but this is my actual face rn",
    ];

    let lastMessageId = seedMessageId;
    const maxTurns = input.turns ?? 8;
    for (let i = 0; i < maxTurns; i++) {
      const from = i % 2 === 0 ? "AgentA" : "AgentB";

      for (const reaction of pickReactions()) {
        await store.react({
          threadId,
          messageId: lastMessageId,
          from,
          reaction: reaction as Parameters<typeof store.react>[0]["reaction"],
        });
      }

      const useGif = giphyKey && getGiphyRemainingCalls(giphyKey) > 0 && Math.random() < 0.35;
      if (useGif) {
        try {
          const { results } = await searchGifs({ query: pick(gifQueries), apiKey: giphyKey, limit: 10 });
          if (results.length > 0) {
            const gif = pick(results);
            const text = pick(from === "AgentA" ? gifTextsA : gifTextsB);
            const res = await store.postMessage({ threadId, from, text, attachments: [gif] });
            lastMessageId = res.messageId;
            continue;
          }
        } catch { /* fall through */ }
      }

      const chosen = pick(searchShorts({ limit: 25 }));
      const text = pick(from === "AgentA" ? videoTextsA : videoTextsB);

      const { messageId } = await store.postMessage({
        threadId,
        from,
        text,
        attachments: [{ type: "video", url: chosen.url }],
      });
      lastMessageId = messageId;
    }

    const thread = await store.getThread(threadId);
    if (!thread) throw new Error("Thread unexpectedly missing after run");

    const { indexPath } = await generateThreadReport({ outDir: reportsDir, thread });
    const reportUrl = `/runs/${encodeURIComponent(threadId)}/report/`;

    res.json({
      ok: true,
      runId: threadId,
      reportUrl,
      reportPath: indexPath,
    });
  } catch (err) {
    const anyErr = err as any;
    const status = typeof anyErr?.statusCode === "number" ? anyErr.statusCode : 500;
    res.status(status).json({ ok: false, error: anyErr?.message ?? "Unknown error" });
  }
});

app.get("/runs/:runId", async (req, res) => {
  try {
    requireToken(req);
    const thread = await store.getThread(req.params.runId);
    if (!thread) return res.status(404).json({ ok: false, error: "Unknown runId" });
    res.json({
      ok: true,
      runId: thread.id,
      reportUrl: `/runs/${encodeURIComponent(thread.id)}/report/`,
    });
  } catch (err) {
    const anyErr = err as any;
    const status = typeof anyErr?.statusCode === "number" ? anyErr.statusCode : 500;
    res.status(status).json({ ok: false, error: anyErr?.message ?? "Unknown error" });
  }
});

app.use("/runs/:runId/report", async (req, res, next) => {
  try {
    requireToken(req);
    const runId = req.params.runId;
    const thread = await store.getThread(runId);
    if (!thread) return res.status(404).json({ ok: false, error: "Unknown runId" });

    // Serve static files from the report directory for this run.
    const reportDir = new URL(`../reports/${encodeURIComponent(runId)}/`, import.meta.url).pathname;
    return express.static(reportDir)(req, res, next);
  } catch (err) {
    const anyErr = err as any;
    const status = typeof anyErr?.statusCode === "number" ? anyErr.statusCode : 500;
    res.status(status).json({ ok: false, error: anyErr?.message ?? "Unknown error" });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Runner listening on http://localhost:${PORT}`);
});

