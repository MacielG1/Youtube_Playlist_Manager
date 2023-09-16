// "use client";
// import { useState } from "react";

// import { QueryClient } from "@tanstack/react-query";
// import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
// import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// export default function QueryProvider({ children }: { children: React.ReactNode }) {
//   const [queryClient] = useState(() => new QueryClient({}));

//   const persister = createSyncStoragePersister({
//     storage: typeof window !== "undefined" ? window.localStorage : undefined,
//     throttleTime: 100,
//   });

//   return (
//     <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
//       {children}
//     </PersistQueryClientProvider>
//   );
// }

"use client";
import { useState } from "react";
import { get, set, del } from "idb-keyval";
import { QueryClient } from "@tanstack/react-query";
import { PersistedClient, Persister, PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({}));

  const persister = createIDBPersister();

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
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
