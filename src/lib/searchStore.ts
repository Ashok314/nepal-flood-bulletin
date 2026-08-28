"use client";

import { useSyncExternalStore } from "react";

// Tiny cross-island store for the search query. The hero search box and the
// results list are separate client islands on the page; sharing this one
// module lets the hero drive the list without a server round-trip.

let query = "";
const listeners = new Set<() => void>();

export const searchStore = {
  get: () => query,
  set: (q: string) => {
    if (q === query) return;
    query = q;
    listeners.forEach((l) => l());
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useSearchQuery(): [string, (q: string) => void] {
  const q = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.get,
    () => "", // server snapshot
  );
  return [q, searchStore.set];
}
