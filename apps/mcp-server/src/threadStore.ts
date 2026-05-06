import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import crypto from "node:crypto";
import type { Thread, ThreadMessage, ThreadStoreData } from "./types.js";

const DEFAULT_DATA: ThreadStoreData = { version: 1, threads: [] };

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

async function atomicWriteJson(path: string, data: unknown) {
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.tmp_${crypto.randomUUID()}`;
  await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await rename(tmp, path);
}

export class ThreadStore {
  constructor(private readonly path: string) {}

  private async read(): Promise<ThreadStoreData> {
    try {
      const raw = await readFile(this.path, "utf8");
      const parsed = JSON.parse(raw) as ThreadStoreData;
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.threads)) {
        return DEFAULT_DATA;
      }
      return parsed;
    } catch {
      return DEFAULT_DATA;
    }
  }

  private async write(data: ThreadStoreData): Promise<void> {
    await atomicWriteJson(this.path, data);
  }

  async listThreads(): Promise<Array<Pick<Thread, "id" | "participants" | "createdAt">>> {
    const data = await this.read();
    return data.threads.map((t) => ({
      id: t.id,
      participants: t.participants,
      createdAt: t.createdAt,
    }));
  }

  async getThread(threadId: string): Promise<Thread | null> {
    const data = await this.read();
    return data.threads.find((t) => t.id === threadId) ?? null;
  }

  async createThread(participants: string[]): Promise<{ threadId: string }> {
    const data = await this.read();
    const threadId = newId("thread");
    const thread: Thread = {
      id: threadId,
      participants: [...new Set(participants)].filter(Boolean),
      createdAt: nowIso(),
      messages: [],
    };
    data.threads.unshift(thread);
    await this.write(data);
    return { threadId };
  }

  async postMessage(args: {
    threadId: string;
    from: string;
    text: string;
    attachments?: ThreadMessage["attachments"];
  }): Promise<{ messageId: string }> {
    const data = await this.read();
    const thread = data.threads.find((t) => t.id === args.threadId);
    if (!thread) throw new Error(`Unknown threadId: ${args.threadId}`);

    const messageId = newId("msg");
    const msg: ThreadMessage = {
      id: messageId,
      threadId: thread.id,
      from: args.from,
      text: args.text,
      attachments: args.attachments ?? [],
      createdAt: nowIso(),
      reactions: [],
    };
    thread.messages.push(msg);
    await this.write(data);
    return { messageId };
  }

  async react(args: {
    threadId: string;
    messageId: string;
    from: string;
    reaction: ThreadMessage["reactions"][number]["reaction"];
  }): Promise<{ ok: true }> {
    const data = await this.read();
    const thread = data.threads.find((t) => t.id === args.threadId);
    if (!thread) throw new Error(`Unknown threadId: ${args.threadId}`);
    const msg = thread.messages.find((m) => m.id === args.messageId);
    if (!msg) throw new Error(`Unknown messageId: ${args.messageId}`);

    msg.reactions.push({ from: args.from, reaction: args.reaction, createdAt: nowIso() });
    await this.write(data);
    return { ok: true };
  }
}

