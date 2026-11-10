"use client";
import { useState } from "react";
import { get, set, del } from "idb-keyval";
import { QueryClient } from "@tanstack/react-query";
import { PersistedClient, Persister, PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

const DAY_MS = 1000 * 60 * 60 * 24;

function createIDBPersister(idbValidKey: IDBValidKey = "reactQuery") {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        await set(idbValidKey, client);
      } catch (error) {
        console.warn("Query cache persist failed:", error);
      }
    },
    restoreClient: async () => {
      try {
        return await get<PersistedClient>(idbValidKey);
      } catch {
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await del(idbValidKey);
      } catch (error) {
        console.warn("Query cache remove failed:", error);
      }
    },
  } as Persister;
}

const persister = createIDBPersister();

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchInterval: DAY_MS, // 24 hours
            retry: 1,
            gcTime: DAY_MS,
            staleTime: 1000 * 60 * 5,
          },
        },
      }),
  );

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: DAY_MS }}>
      {children}
    </PersistQueryClientProvider>
  );
}
