"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A `localStorage` / `sessionStorage` key, read the way React sanctions.
 *
 * The obvious version — `useState` plus an effect that reads storage on mount
 * — is the cascading-render pattern the lint rule flags, and it is flagged for
 * a reason: it renders once with a value nobody asked for, then again with the
 * real one. `useSyncExternalStore` is the supported way to read a mutable
 * value that lives outside React.
 *
 * The snapshot is the RAW STRING, deliberately. A snapshot has to be
 * referentially stable between calls or React re-renders forever chasing it,
 * and `JSON.parse` hands back a fresh object every time. Callers parse the
 * string themselves, memoised on it.
 *
 * Writes go through `set` so the same tab is notified: the native `storage`
 * event only fires in *other* tabs, so a component that wrote its own value
 * would never see it.
 */
type Kind = "local" | "session";

function store(kind: Kind): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    // Private mode, or storage disabled by policy.
    return null;
  }
}

/** Per-key listeners, so a write here wakes every reader here. */
const listeners = new Map<string, Set<() => void>>();

function notify(key: string): void {
  listeners.get(key)?.forEach((fn) => fn());
}

export function writeStored(
  key: string,
  value: string | null,
  kind: Kind = "local"
): void {
  const s = store(kind);
  try {
    if (value === null) s?.removeItem(key);
    else s?.setItem(key, value);
  } catch {
    // Quota or policy. The in-memory notify still runs, so the UI stays
    // consistent for this session even when nothing was persisted.
  }
  notify(key);
}

export function useStoredString(
  key: string,
  kind: Kind = "local"
): [string | null, (value: string | null) => void] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(onChange);
      // Other tabs. Same-tab writes come through `writeStored` instead.
      const onStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) onChange();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(onChange);
        if (set.size === 0) listeners.delete(key);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key]
  );

  const getSnapshot = useCallback(() => {
    try {
      return store(kind)?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }, [key, kind]);

  // Server render: nothing is stored, so the markup matches what the client
  // paints on its first frame before it has consulted storage.
  const getServerSnapshot = useCallback(() => null, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const set = useCallback(
    (next: string | null) => writeStored(key, next, kind),
    [key, kind]
  );

  return [value, set];
}
