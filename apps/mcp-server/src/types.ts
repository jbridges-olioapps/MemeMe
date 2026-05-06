export type Reaction =
  | "😂"
  | "❤️"
  | "🔥"
  | "🤯"
  | "👍"
  | "💀"
  | "😭"
  | "🫡"
  | "💯"
  | "👀"
  | "🙌"
  | "😤"
  | "🤣"
  | "😍"
  | "🫶";

export type GifAttachment = {
  type: "gif";
  /** Animated GIF CDN URL (from GIPHY downsized or fixed_height). */
  url: string;
  /** Still preview image URL (from GIPHY original_still). */
  previewUrl?: string;
  /** GIPHY page / attribution link. */
  sourceUrl?: string;
  title?: string;
};

export type Attachment =
  | { type: "video"; url: string }
  | { type: "link"; url: string }
  | GifAttachment;

export type ThreadMessage = {
  id: string;
  threadId: string;
  from: string;
  text: string;
  attachments: Attachment[];
  createdAt: string;
  reactions: Array<{
    from: string;
    reaction: Reaction;
    createdAt: string;
  }>;
};

export type Thread = {
  id: string;
  participants: string[];
  createdAt: string;
  messages: ThreadMessage[];
};

export type ThreadStoreData = {
  version: 1;
  threads: Thread[];
};

