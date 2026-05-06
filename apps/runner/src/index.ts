import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { ThreadStore, generateThreadReport, searchShorts, validateYouTubeShortUrl, searchGifs, getGiphyRemainingCalls, generateAgentTurn, pickTwoPersonas, getPersonaById } from "@mememe/mcp-server";

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
  personaA: z.string().optional(),
  personaB: z.string().optional(),
});

app.post("/run", async (req, res) => {
  try {
    requireToken(req);
    const input = RunInput.parse(req.body);

    const validated = validateYouTubeShortUrl(input.shortUrl);
    if (!validated.ok) return res.status(400).json(validated);

    const [defaultA, defaultB] = pickTwoPersonas();
    const chosenA = (input.personaA ? getPersonaById(input.personaA) : null) ?? defaultA;
    const chosenB = (input.personaB ? getPersonaById(input.personaB) : null) ?? defaultB;

    const { threadId } = await store.createThread(["Judge", chosenA.name, chosenB.name]);
    const { messageId: seedMessageId } = await store.postMessage({
      threadId,
      from: "Judge",
      text: input.judgeMessage,
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
    const maxTurns = input.turns ?? 8;
    for (let i = 0; i < maxTurns; i++) {
      const currentPersona = i % 2 === 0 ? chosenA : chosenB;
      const from = currentPersona.name;

      for (const reaction of pickReactions()) {
        await store.react({
          threadId,
          messageId: lastMessageId,
          from,
          reaction: reaction as Parameters<typeof store.react>[0]["reaction"],
        });
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
          } catch { /* no gif */ }
        }
      } else {
        const chosen = pick(availableVideos);
        text = i % 2 === 0 ? "bro you NEED to see this" : "ok ok ok but THIS though";
        attachments = [{ type: "video", url: chosen.url }];
      }

      const { messageId } = await store.postMessage({ threadId, from, text, attachments });
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
      personas: {
        A: { id: chosenA.id, name: chosenA.name },
        B: { id: chosenB.id, name: chosenB.name },
      },
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

