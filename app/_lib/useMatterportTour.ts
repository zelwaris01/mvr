"use client";

import { useEffect, useRef, useState } from "react";
import type { MpSdk } from "@matterport/sdk";
import { MATTERPORT_SDK_KEY, MATTERPORT_SPACE_ID } from "./constants";
import { resolveStoreByTag } from "./tour-zones";
import { nearestSweep } from "./tour-nav";
import type { TagRecord } from "./roster";

export type TourStatus =
  | "disabled" // no SDK key configured — the tour renders as a plain embed
  | "connecting"
  | "ready"
  | "error";

type Options = {
  /** A pin resolving to a store was clicked in the 3D scene. */
  onTagClick?: (slug: string) => void;
  /** The visitor stopped inside a store's area for `dwellMs`. */
  onStoreEntered?: (slug: string) => void;
  /** How long they must stay put before entering counts. */
  dwellMs?: number;
};

/**
 * The SDK bootstrap, which exports `connect` directly.
 * Verified reachable with `Access-Control-Allow-Origin: http://localhost:3000`.
 */
const SDK_BOOTSTRAP =
  "https://static.matterport.com/showcase-sdk/bootstrap/3.0.0-0-g0517b8d76c/sdk.es6.js";

/**
 * Imports a module from an absolute URL at runtime.
 *
 * `import(someVariable)` written literally gets rewritten by the bundler into
 * its own module registry, which can only resolve things that were bundled —
 * an https URL isn't, so it fails. Building the import inside `new Function`
 * puts it beyond static analysis, so the browser performs a genuine network
 * import. This is exactly the step that fails inside @matterport/sdk's own
 * loader, which is why the fallback below exists.
 */
const importFromUrl = (url: string): Promise<Record<string, unknown>> =>
  (new Function("u", "return import(u)") as (u: string) => Promise<
    Record<string, unknown>
  >)(url);

type ConnectFn = (iframe: HTMLIFrameElement) => Promise<MpSdk>;

/**
 * Connects to the tour iframe, preferring the npm package and falling back to
 * the hosted bootstrap. Both end at the same `MpSdk`; they differ only in how
 * the remote SDK client gets loaded.
 */
async function connectToShowcase(iframe: HTMLIFrameElement): Promise<MpSdk> {
  try {
    const { setupSdk } = await import("@matterport/sdk");
    const sdk = await setupSdk(MATTERPORT_SDK_KEY, {
      iframe,
      space: MATTERPORT_SPACE_ID,
      iframeQueryParams: { play: 1, qs: 1 },
    });
    if (process.env.NODE_ENV !== "production") {
      console.log("[tour] connected via @matterport/sdk");
    }
    return sdk;
  } catch (pkgErr) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[tour] @matterport/sdk loader failed, trying hosted bootstrap:",
        pkgErr
      );
    }
    // The iframe src already carries applicationKey, so connect() can attach.
    const mod = await importFromUrl(
      `${SDK_BOOTSTRAP}?applicationKey=${MATTERPORT_SDK_KEY}`
    );
    const connect = mod.connect as ConnectFn | undefined;
    if (typeof connect !== "function") {
      throw new Error(
        `SDK bootstrap loaded but exported no connect(): ${Object.keys(mod).join(", ")}`
      );
    }
    const sdk = await connect(iframe);
    if (process.env.NODE_ENV !== "production") {
      console.log("[tour] connected via hosted bootstrap");
    }
    return sdk;
  }
}

/**
 * Connects the Showcase SDK to the tour iframe and reports what it finds
 * inside the 3D space in terms this app understands.
 *
 * Without NEXT_PUBLIC_MATTERPORT_SDK_KEY the hook does nothing at all: no
 * script is fetched and the iframe is left as a plain, walkable embed. The
 * visit still works; it just isn't instrumented.
 */
export function useMatterportTour(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  { onTagClick, onStoreEntered, dwellMs = 3500 }: Options = {}
) {
  const [status, setStatus] = useState<TourStatus>(
    MATTERPORT_SDK_KEY ? "connecting" : "disabled"
  );
  const [tags, setTags] = useState<TagRecord[]>([]);

  /**
   * The SDK is exposed twice on purpose:
   *  - `sdkRef` for imperative commands in click handlers, where a stale
   *    closure would be wrong and a re-render would be wasteful;
   *  - `sdk` as state, so effects that must re-run once the connection exists
   *    (the marker overlay) actually get woken. A ref mutation notifies
   *    nobody, and reading `.current` during render is both a lint error and
   *    a real bug waiting for the render that happens not to coincide.
   * It is written once, at connect.
   */
  const sdkRef = useRef<MpSdk | null>(null);
  const [sdk, setSdk] = useState<MpSdk | null>(null);

  // Callbacks live in refs so a re-render never tears down the connection:
  // the effect below must keep `[iframeRef]` as its entire dep array.
  const clickRef = useRef(onTagClick);
  const enteredRef = useRef(onStoreEntered);
  useEffect(() => {
    clickRef.current = onTagClick;
    enteredRef.current = onStoreEntered;
  });

  useEffect(() => {
    if (!MATTERPORT_SDK_KEY) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    let cancelled = false;
    let connected: MpSdk | undefined;
    const subs: Array<{ cancel(): void }> = [];
    let dwellTimer: ReturnType<typeof setTimeout> | undefined;

    const tagsRef = new Map<string, TagRecord>();
    const sweeps = new Map<string, MpSdk.Sweep.ObservableSweepData>();
    /** sweepId -> slug, so standing somewhere counts as being in a store. */
    const sweepIndex = new Map<string, string>();
    /** Pins we've already switched off, so re-notification doesn't loop. */
    const suppressed = new Set<string>();
    const handled = new Set<string>();

    let flushScheduled = false;
    const flushTags = () => {
      if (flushScheduled) return;
      flushScheduled = true;
      // Pins arrive one onAdded at a time. Coalescing into a microtask turns
      // N renders during load into one, right when the user first sees the scene.
      queueMicrotask(() => {
        flushScheduled = false;
        if (!cancelled) setTags(Array.from(tagsRef.values()));
      });
    };

    /**
     * Re-resolves every pin's nearest sweep, and which sweeps count as being
     * "at" a store. Runs on each Sweep.data batch — sweeps stream in, and a
     * pin resolved against a partial set would be wrong.
     */
    const reindex = () => {
      if (sweeps.size === 0) return;
      sweepIndex.clear();
      for (const tag of tagsRef.values()) {
        if (!tag.slug) continue;
        const sweep = nearestSweep(tag.discPosition, sweeps.values());
        tag.sweepId = sweep?.id ?? null;
        if (sweep) sweepIndex.set(sweep.id, tag.slug);
      }
      flushTags();
    };

    (async () => {
      try {
        const mpSdk = await connectToShowcase(iframe);
        if (cancelled) {
          mpSdk.disconnect?.();
          return;
        }
        connected = mpSdk;
        sdkRef.current = mpSdk;

        // Wait for the player to actually be playing. `connect` resolving is
        // earlier than that, and any Sweep.moveTo issued in the gap rejects —
        // so `status === "ready"` has to mean "safe to command", or every
        // rail click becomes a race.
        await mpSdk.App.state.waitUntil(
          (s) => s.phase === mpSdk.App.Phase.PLAYING
        );
        if (cancelled) return;

        // Matterport's own overhead controls duplicate our HUD.
        mpSdk.Settings?.update?.("labels", false).catch(() => {});
        await mpSdk.Tag.toggleNavControls?.(false).catch?.(() => {});

        setStatus("ready");
        setSdk(mpSdk);

        const registerTag = (
          id: string,
          label: string,
          discPosition: MpSdk.Vector3 | undefined
        ) => {
          if (tagsRef.has(id) || !discPosition) return;
          const slug = resolveStoreByTag(id, label);
          tagsRef.set(id, {
            tagId: id,
            label,
            slug,
            discPosition: {
              x: discPosition.x,
              y: discPosition.y,
              z: discPosition.z,
            },
            sweepId: null,
          });
          if (process.env.NODE_ENV !== "production") {
            console.log(`[tour] tag ${id} "${label}" -> ${slug ?? "unmatched"}`);
          }
          flushTags();
        };

        /**
         * Switch off Matterport's own pin. This must be a property assignment
         * — there is no toggle function — and it must not be `editOpacity(0)`,
         * because an invisible tag still accepts clicks and would silently
         * steal them from our gold markers.
         */
        const suppressNative = (tag: MpSdk.Tag.TagData) => {
          if (!tag.enabled) return;
          suppressed.add(tag.id);
          tag.enabled = false;
        };

        subs.push(
          mpSdk.Tag.data.subscribe({
            onAdded(id, tag) {
              registerTag(id, tag.label ?? "", tag.discPosition);
              suppressNative(tag);
            },
            onUpdated(id, tag) {
              // Showcase can re-enable pins after a mode change.
              if (suppressed.has(id)) suppressNative(tag);
            },
            onRemoved(id) {
              tagsRef.delete(id);
              suppressed.delete(id);
              flushTags();
            },
          })
        );

        subs.push(
          mpSdk.Sweep.data.subscribe({
            onCollectionUpdated(collection) {
              sweeps.clear();
              for (const key of Object.keys(collection)) {
                sweeps.set(key, collection[key]);
              }
              reindex();
            },
          })
        );

        // Native pins are off, so this only fires on spaces where suppression
        // failed. Harmless to keep, and it keeps legacy Mattertag spaces working.
        const onLegacyClick = (tagSid: string) => {
          if (handled.has(tagSid)) return;
          handled.add(tagSid);
          queueMicrotask(() => handled.delete(tagSid));
          const slug = tagsRef.get(tagSid)?.slug;
          if (slug) clickRef.current?.(slug);
        };
        mpSdk.on(mpSdk.Mattertag.Event.CLICK, onLegacyClick);
        subs.push({
          cancel: () => mpSdk.off(mpSdk.Mattertag.Event.CLICK, onLegacyClick),
        });

        // Walking in and stopping counts as a visit — but only banks it. It
        // never opens the quiz: an unrequested panel while someone is moving
        // is exactly the interruption this product is trying to avoid.
        subs.push(
          mpSdk.Sweep.current.subscribe((sweep) => {
            if (dwellTimer) clearTimeout(dwellTimer);
            if (!sweep?.id) return;
            const slug = sweepIndex.get(sweep.id);
            if (!slug) return;
            dwellTimer = setTimeout(() => enteredRef.current?.(slug), dwellMs);
          })
        );
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        console.error("[tour] Matterport SDK failed to connect:", err);
      }
    })();

    return () => {
      cancelled = true;
      if (dwellTimer) clearTimeout(dwellTimer);
      for (const sub of subs) sub.cancel();
      sdkRef.current = null;
      setSdk(null);
      // Deliberately not re-enabling the native pins: that would race the
      // disconnect, and the iframe is being torn down anyway.
      connected?.disconnect?.();
    };
  }, [iframeRef, dwellMs]);

  return { status, tags, sdk, sdkRef };
}
