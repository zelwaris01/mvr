"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Where the rewards card and the ad both send people. */
export const STORES_URL = "https://mvr-eight-cyan.vercel.app/stores";

/**
 * Dismissal lives in a module variable, not in storage.
 *
 * It was in `sessionStorage`, which survives a reload for the life of the tab
 * — so dismissing the ad once meant it never appeared again, reload after
 * reload, and the interstitial looked broken. An ad that opens on load has to
 * forget on load.
 *
 * A module variable and not component state because the ad is unmounted and
 * remounted by every floor switch (those reconnect the SDK and take `status`
 * back to "connecting"). Component state would reset there and show the ad
 * again mid-visit; this survives the remount and dies with the page.
 */
let dismissed = false;
const listeners = new Set<() => void>();

/**
 * The placeholder campaign. Swap the whole object for a real one — nothing
 * else reads its fields.
 */
export const AD = {
  brand: "ZARA",
  headline: "Nouvelle collection",
  body: "Soldes jusqu'à -50% dans la galerie du rez-de-chaussée.",
  href: STORES_URL,
  image:
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=960&h=540&fit=crop",
};

/* Read through useSyncExternalStore because the two obvious alternatives are
   both wrong: reading a mutable module variable during render is impure and
   gives React no reason to re-render, and pushing it into state from an effect
   is the cascading-render pattern this codebase's lint rules reject. */
function subscribeDismissed(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function readDismissed(): boolean {
  return dismissed;
}

/**
 * Whether the ad has been put away for this page view, and the way to do it.
 * Shared by the interstitial on arrival and the copy inside the offers page,
 * so dismissing either puts the ad away in both.
 */
export function useAdDismissed(): [boolean, () => void] {
  const value = useSyncExternalStore(
    subscribeDismissed,
    readDismissed,
    // Server snapshot. The interstitial therefore never appears in the HTML —
    // right, since it is gated on the tour being connected anyway.
    () => false
  );

  const dismiss = useCallback(() => {
    if (dismissed) return;
    dismissed = true;
    listeners.forEach((fn) => fn());
  }, []);

  return [value, dismiss];
}
