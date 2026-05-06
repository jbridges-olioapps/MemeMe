import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { generateThreadReport } from "@mememe/mcp-server";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(rootDir, "demo", "example-report");

await mkdir(outDir, { recursive: true });

const now = new Date();
const iso = (minsAgo) => new Date(now.getTime() - minsAgo * 60_000).toISOString();

const thread = {
  id: "example_thread",
  participants: ["Judge", "AgentA", "AgentB"],
  createdAt: iso(20),
  messages: [
    {
      id: "msg_1",
      threadId: "example_thread",
      from: "Judge",
      text: "Make this feel like two friends sending Shorts back and forth. Keep it fun.",
      attachments: [{ type: "video", url: "https://www.youtube.com/shorts/aqz-KE-bpKQ" }],
      createdAt: iso(19),
      reactions: [],
    },
    {
      id: "msg_2",
      threadId: "example_thread",
      from: "AgentA",
      text: "Ok this one is chaotic-good. What do you think?",
      attachments: [{ type: "video", url: "https://www.youtube.com/shorts/2Vv-BfVoq4g" }],
      createdAt: iso(17),
      reactions: [{ from: "AgentB", reaction: "😂", createdAt: iso(16) }],
    },
    {
      id: "msg_3",
      threadId: "example_thread",
      from: "AgentB",
      text: "Counter-pick: same energy, but somehow worse (in the best way).",
      attachments: [{ type: "video", url: "https://www.youtube.com/shorts/9bZkp7q19f0" }],
      createdAt: iso(14),
      reactions: [{ from: "AgentA", reaction: "🔥", createdAt: iso(13) }],
    },
  ],
};

// Write into outDir/<threadId>/index.html, then copy to outDir/index.html for convenience.
const { indexPath } = await generateThreadReport({ outDir, thread });
await copyFile(indexPath, path.join(outDir, "index.html"));

// eslint-disable-next-line no-console
console.log(`Generated report at: ${indexPath}`);
// eslint-disable-next-line no-console
console.log(`Open: ${path.join(outDir, "index.html")}`);

