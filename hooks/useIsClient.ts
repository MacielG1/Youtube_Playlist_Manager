import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export default function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
