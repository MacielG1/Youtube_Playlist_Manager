"use client";
import { useState } from "react";
import { get, set, del } from "idb-keyval";
import { QueryClient } from "@tanstack/react-query";
import { PersistedClient, Persister, PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchInterval: 1000 * 60 * 60 * 24, // 24 hours
            retry: 1,
          },
        },
      }),
  );

  const persister = createIDBPersister();

  const options = {
    persister,
  };

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={options}>
      {children}
    </PersistQueryClientProvider>
  );
}

export function createIDBPersister(idbValidKey: IDBValidKey = "reactQuery") {
  return {
    persistClient: async (client: PersistedClient) => {
      set(idbValidKey, client);
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey);
    },
    removeClient: async () => {
      await del(idbValidKey);
    },
  } as Persister;
}
