const CHUNK_SIZE = 50;
const MAX_CONCURRENT_REQUESTS = 3;

type MetadataFetchOptions = {
  endpoint: string;
  bodyKey: string;
};

export function dedupeIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export async function fetchMetadata<T extends { id: string }>(ids: string[], { endpoint, bodyKey }: MetadataFetchOptions): Promise<T[]> {
  const uniqueIds = dedupeIds(ids);
  if (uniqueIds.length === 0) return [];

  const chunks: string[][] = [];
  for (let i = 0; i < uniqueIds.length; i += CHUNK_SIZE) {
    chunks.push(uniqueIds.slice(i, i + CHUNK_SIZE));
  }

  const itemsById = new Map<string, T>();
  let nextChunkIndex = 0;
  let failure: unknown = null;

  async function worker() {
    while (failure === null && nextChunkIndex < chunks.length) {
      const chunk = chunks[nextChunkIndex++];

      try {
        const res = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ [bodyKey]: chunk.join(",") }),
        });

        if (!res.ok) {
          if (res.status === 429) {
            throw new Error("Too many requests. Please try again later.");
          } else {
            throw new Error("Something went wrong. Please try again later.");
          }
        }

        const data = await res.json();
        if (!Array.isArray(data?.items)) {
          throw new Error("Something went wrong. Please try again later.");
        }

        for (const item of data.items) {
          if (item && typeof item === "object" && typeof item.id === "string") {
            itemsById.set(item.id, item as T);
          }
        }
      } catch (e) {
        failure = e;
        return;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_REQUESTS, chunks.length) }, () => worker()));

  if (failure !== null) throw failure;

  const ordered: T[] = [];
  for (const id of uniqueIds) {
    const item = itemsById.get(id);
    if (item) ordered.push(item);
  }
  return ordered;
}
