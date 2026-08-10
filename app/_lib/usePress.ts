"use client";

import { useCallback, useEffect, useRef } from "react";
import { registerTap, tapJustFired } from "./tap";

/**
 * Activation that works on touch over a cross-origin iframe.
 *
 * `onClick` alone is not enough here, and neither was React's `onPointerUp`:
 * over the Matterport iframe the button's own handlers do not run on touch,
 * even though a capture-phase listener on `document` sees the pointer at the
 * right coordinates with `elementFromPoint` returning the button. The symptom
 * is exact — links work (the browser navigates those natively), buttons do
 * nothing, and z-index makes no difference.
 *
 * So touch is handled by the document-level router in `tap.ts`, which resolves
 * the target by hit-testing rather than by bubbling, and `onClick` is left to
 * mouse and keyboard. `tapJustFired` swallows the synthesized click that
 * follows a touch so a tap cannot fire twice.
 */
export function usePress(onPress: () => void) {
  // The router holds one stable callback for the life of the element, so the
  // current handler has to be reachable through a ref — re-registering on
  // every render would churn the registry for every inline arrow prop.
  const latest = useRef(onPress);
  useEffect(() => {
    latest.current = onPress;
  });

  const unregister = useRef<(() => void) | null>(null);
  const ref = useCallback((el: HTMLElement | null) => {
    unregister.current?.();
    unregister.current = el ? registerTap(el, () => latest.current()) : null;
  }, []);

  const onClick = useCallback((e: React.MouseEvent) => {
    if (tapJustFired(e.timeStamp)) return; // the echo of a routed tap
    latest.current();
  }, []);

  return { ref, onClick };
}
