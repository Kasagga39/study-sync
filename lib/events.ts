type Handler = (data: string) => void;

const channels = new Map<string, Set<Handler>>();

export interface ChannelEvent {
  channel: string;
  data: unknown;
}

export function subscribe(channel: string, handler: Handler): () => void {
  let set = channels.get(channel);
  if (!set) {
    set = new Set();
    channels.set(channel, set);
  }
  set.add(handler);

  return () => {
    set?.delete(handler);
    if (set?.size === 0) channels.delete(channel);
  };
}

export function publish(channel: string, data: unknown): number {
  const set = channels.get(channel);
  if (!set) return 0;
  const message = JSON.stringify(data);
  for (const handler of set) {
    try {
      handler(message);
    } catch {
      // Ignore a single faulty subscriber.
    }
  }
  return set.size;
}
