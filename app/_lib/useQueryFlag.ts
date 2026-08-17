"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Is `?name` present in the URL?
 *
 * Looks like a job for `useState(() => location.search.includes(...))`, and
 * that is what the debug tools here used to do. It is wrong: the initialiser
 * runs on the server too, where it returns false, and again on the client
 * during hydration, where it returns true — so React finds markup that does
 * not match and warns. It works, then logs a hydration error on every load
 * with the flag set.
 *
 * `useSyncExternalStore` is the sanctioned answer, and it is the whole reason
 * `getServerSnapshot` exists: it renders false during hydration to match the
 * server, then swaps to the real value immediately afterwards. No mismatch,
 * no effect, no second state.
 *
 * The snapshot is a boolean, so it is referentially stable for free.
 */
export function useQueryFlag(name: string): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    // The flag can only change through history navigation — nothing in this
    // app writes to the URL — but a back button that left a debug panel
    // stranded would be its own small mystery.
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);

  const getSnapshot = useCallback(
    () => new URLSearchParams(window.location.search).has(name),
    [name]
  );

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
