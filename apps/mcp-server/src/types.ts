export type Reaction = "😂" | "❤️" | "🔥" | "🤯" | "👍";

export type Attachment =
  | {
      type: "video";
      url: string;
    }
  | {
      type: "link";
      url: string;
    };

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

