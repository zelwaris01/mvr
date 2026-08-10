"use client";

import { useEffect, useRef, useState } from "react";
import type { MpSdk } from "@matterport/sdk";
import { MATTERPORT_SDK_KEY } from "./constants";
import { resolveStoreByTag } from "./tour-zones";
import { nearestSweep, viewpointFor } from "./tour-nav";
import type { TagRecord } from "./roster";

export type TourStatus =
  | "disabled" // no SDK key configured — the tour renders as a plain embed
  | "connecting"
  | "ready"
  | "error";

type Options = {
  /** Which level's scan to connect to. Changing it reconnects. */
  spaceId: string;
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
async function connectToShowcase(
  iframe: HTMLIFrameElement,
  spaceId: string
): Promise<MpSdk> {
  try {
    const { setupSdk } = await import("@matterport/sdk");
    // No iframeQueryParams here: the iframe's src already carries them (see
    // tourUrlFor), which is the only place that works on both the setupSdk
    // and the bootstrap-connect path.
    const sdk = await setupSdk(MATTERPORT_SDK_KEY, {
      iframe,
      space: spaceId,
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
  { spaceId, onTagClick, onStoreEntered, dwellMs = 3500 }: Options
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

  /** Where the visitor is standing, so callers can tell "here" from "there". */
  const currentSweepRef = useRef<string | null>(null);

  
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
    /** attachmentId -> image url, from the pin's own media. */
    const media = new Map<string, string>();
    /** tagId -> its attachment ids, so late-arriving media can be matched up. */
    const tagMedia = new Map<string, string[]>();
    const handled = new Set<string>();

    let flushScheduled = false;
    const flushTags = () => {
      if (flushScheduled) return;
      flushScheduled = true;
      // Pins arrive one onAdded at a time. Coalescing into a microtask turns
      // N renders during load into one, right when the user first sees the scene.
      queueMicrotask(() => {
        flushScheduled = false;
        if (cancelled) return;
        const all = Array.from(tagsRef.values());
        if (process.env.NODE_ENV !== "production") {
          // console.warn, not log: Next forwards warn/error from the browser
          // to the dev terminal, which is the only way to see what the model
          // actually contains without opening devtools.
          console.warn(
            `[tour] ${all.length} pins:`,
            all.map((t) => `${t.label || "(sans nom)"}→${t.slug ?? "?"}`).join(" | ")
          );
        }
        setTags(all);
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
        // Aim for a spot out in front of the shopfront rather than the shop
        // itself — see viewpointFor. Standing square to the window is what
        // makes the arrival frame the shop instead of glancing along it.
        const sweep = nearestSweep(
          viewpointFor(tag.anchorPosition, tag.stemVector),
          sweeps.values()
        );
        if (!sweep && process.env.NODE_ENV !== "production") {
          // Worth shouting about: this pin will render as a checkpoint and
          // then refuse to travel when clicked, with nothing on screen to
          // explain why.
          console.warn(
            `[tour] "${tag.label}" has no reachable sweep — clicking it will not fly`
          );
        }
        tag.sweepId = sweep?.id ?? null;
        if (sweep) sweepIndex.set(sweep.id, tag.slug);
      }
      flushTags();
    };

    (async () => {
      try {
        const mpSdk = await connectToShowcase(iframe, spaceId);
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

        // Belt and braces on top of SHOWCASE_PARAMS: the URL params are
        // applied at boot, these survive later mode changes that can bring
        // chrome back. Each is optional-chained and swallowed — an SDK build
        // without one of them must not take down the connection.
        try {
          mpSdk.Settings?.update?.("labels", false);
        } catch {}
        try {
          await mpSdk.Tag.toggleNavControls?.(false);
        } catch {}
        try {
          await mpSdk.Tag.toggleDocking?.(false);
        } catch {}

        // Multi-floor models only surface the floor you're standing on.
        // Without this, pins and sweeps upstairs may never reach the app —
        // and the roster would silently be missing every shop on level 2.
        try {
          await mpSdk.Floor.showAll?.();
        } catch (err) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[tour] Floor.showAll failed:", err);
          }
        }


        setStatus("ready");
        setSdk(mpSdk);

        /**
         * Fills in pin media once both the pin and its attachments exist.
         *
         * Runs repeatedly as attachments stream in, keeping the model's own
         * ordering, and re-runs cheaply because it compares counts rather
         * than assuming a single pass sees everything.
         */
        const resolveMedia = () => {
          let changed = false;
          for (const [tagId, attachmentIds] of tagMedia) {
            const tag = tagsRef.get(tagId);
            if (!tag) continue;
            const srcs: string[] = [];
            for (const attachmentId of attachmentIds) {
              const src = media.get(attachmentId);
              if (src) srcs.push(src);
            }
            if (srcs.length !== tag.media.length) {
              tag.media = srcs;
              changed = true;
              if (process.env.NODE_ENV !== "production") {
                console.warn(
                  `[tour] "${tag.label}": ${srcs.length} image(s) du modèle`
                );
              }
            }
          }
          if (changed) flushTags();
        };

        const registerTag = (
          id: string,
          label: string,
          discPosition: MpSdk.Vector3 | undefined,
          anchorPosition: MpSdk.Vector3 | undefined,
          stemVector: MpSdk.Vector3 | undefined,
          description = "",
          attachmentIds: string[] = []
        ) => {
          if (!discPosition) return;
          const anchor = anchorPosition ?? discPosition;
          // No stem on legacy pins: derive one from anchor -> disc, which
          // points the same way by construction.
          const stem = stemVector ?? {
            x: discPosition.x - anchor.x,
            y: discPosition.y - anchor.y,
            z: discPosition.z - anchor.z,
          };

          // Already known: enrich rather than discard. The legacy Mattertag
          // collection reports only a label and a position, while Tag.data
          // carries the description and the brand's logo. Whichever arrives
          // first used to win outright, so on loads where the legacy path
          // raced ahead the shop tab came up empty — no logo, no info.
          const known = tagsRef.get(id);
          if (known) {
            if (!known.description && description) {
              known.description = description;
              flushTags();
            }
            if (attachmentIds.length > 0 && !tagMedia.has(id)) {
              tagMedia.set(id, attachmentIds);
              resolveMedia();
            }
            return;
          }

          const slug = resolveStoreByTag(id, label);
          tagsRef.set(id, {
            tagId: id,
            label,
            slug,
            description,
            media: [],
            discPosition: {
              x: discPosition.x,
              y: discPosition.y,
              z: discPosition.z,
            },
            anchorPosition: { x: anchor.x, y: anchor.y, z: anchor.z },
            stemVector: { x: stem.x, y: stem.y, z: stem.z },
            sweepId: null,
          });
          // A pin that names no shop is dead weight in this app, and is what
          // the promotional billboards hang off. Take it out of the scene.
          if (!slug) removeNative(id);

          if (attachmentIds.length > 0) tagMedia.set(id, attachmentIds);
          resolveMedia();
          if (process.env.NODE_ENV !== "production") {
            // Unmatched pins go through console.warn, not log: Next only
            // forwards warn/error from the browser to the dev server terminal,
            // and a pin the model has but the app can't place is exactly the
            // thing worth seeing without opening devtools.
            if (slug) console.log(`[tour] tag ${id} "${label}" -> ${slug}`);
            else console.warn(`[tour] UNMATCHED tag ${id} "${label}"`);
          }

          // Resolve this pin's sweep now, if the sweeps are already in.
          // Pins and sweeps stream in independently and in no fixed order:
          // reindexing only when sweeps arrive leaves every pin that lands
          // afterwards without a sweepId, so it renders as a checkpoint and
          // then refuses to travel. That is exactly how Chocorico and Summer
          // Market ended up unreachable while the earlier pins worked.
          reindex();
          flushTags();
        };

        /**
         * Switch off Matterport's own pin. This must be a property assignment
         * — there is no toggle function — and it must not be `editOpacity(0)`,
         * because an invisible tag still accepts clicks and would silently
         * steal them from our gold markers.
         */
        /**
         * Deletes a pin from the running scene.
         *
         * Reserved for pins that match no shop. Those have no function here,
         * and they are the ones carrying Matterport's promotional billboards —
         * the "Débloquer mes Récompenses" and "Formulaire de participation"
         * panels that dock themselves open over the storefronts. Disabling and
         * closing them was not enough: a docked billboard is not "open" in the
         * sense `allowAction` governs, and it re-docks. Removing the pin
         * removes anything attached to it.
         *
         * Session-only — it does not touch the model on Matterport's side.
         */
        const removeNative = (id: string) => {
          try {
            mpSdk.Tag.remove?.(id)?.catch?.(() => {});
          } catch {}
          try {
            mpSdk.Mattertag.remove?.(id)?.catch?.(() => {});
          } catch {}
        };

        const suppressNative = (tag: MpSdk.Tag.TagData) => {
          if (suppressed.has(tag.id) && !tag.enabled) return;
          suppressed.add(tag.id);
          // An empty actions object denies every action — opening on hover,
          // navigating on click, docking, sharing. Without this a billboard
          // can still pop open on its own and land behind the quiz drawer.
          mpSdk.Tag.allowAction?.(tag.id, {})?.catch?.(() => {});
          mpSdk.Tag.close?.(tag.id)?.catch?.(() => {});
          if (tag.enabled) tag.enabled = false;
        };

        subs.push(
          mpSdk.Tag.data.subscribe({
            onAdded(id, tag) {
              registerTag(
                id,
                tag.label ?? "",
                tag.discPosition,
                tag.anchorPosition,
                tag.stemVector,
                tag.description ?? "",
                tag.attachments ?? []
              );
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

        // Nothing may open a billboard over the scene.
        //
        // Disabling a pin and denying its actions stops it being *opened*, but
        // Showcase can dock one on load — which is how the "Débloquer mes
        // Récompenses" and "Formulaire de participation" panels kept appearing
        // over the storefronts. `openTags` reports anything hovered, selected
        // or docked; closing it immediately is the only reliable way to keep
        // the scene clear, since none of this can be reached with CSS from
        // outside the iframe.
        subs.push(
          mpSdk.Tag.openTags.subscribe((open) => {
            const ids = new Set<string>();
            if (open?.docked) ids.add(open.docked);
            if (open?.hovered) ids.add(open.hovered);
            for (const id of open?.selected ?? []) ids.add(id);
            for (const id of ids) {
              try {
                mpSdk.Tag.close?.(id)?.catch?.(() => {});
              } catch {}
            }
          })
        );

        // Pin media — the brand logos the model already carries. Far better
        // than the stock thumbnails in the catalogue, and maintained by
        // whoever keeps the scan current.
        try {
          subs.push(
            mpSdk.Tag.attachments.subscribe({
              onAdded(id, attachment) {
                if (
                  attachment.src &&
                  attachment.type === mpSdk.Tag.AttachmentType.IMAGE
                ) {
                  media.set(id, attachment.src);
                  resolveMedia();
                }
              },
            })
          );
        } catch (err) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[tour] no tag attachments collection:", err);
          }
        }

        // Legacy Mattertags. Spaces authored before the Tag namespace expose
        // their pins here and may not surface them through Tag.data at all.
        // registerTag dedupes, so a pin present in both is counted once.
        try {
          subs.push(
            mpSdk.Mattertag.data.subscribe({
              onAdded(id, tag) {
                // Legacy pins: the anchor doubles as the disc, and they do
                // carry a stem vector of their own.
                registerTag(
                  id,
                  tag.label ?? "",
                  tag.anchorPosition,
                  tag.anchorPosition,
                  tag.stemVector
                );
              },
            })
          );
        } catch (err) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[tour] no legacy Mattertag collection:", err);
          }
        }

        subs.push(
          mpSdk.Sweep.data.subscribe({
            onCollectionUpdated(collection) {
              sweeps.clear();
              for (const key of Object.keys(collection)) {
                sweeps.set(key, collection[key]);
              }
              if (process.env.NODE_ENV !== "production") {
                const byFloor = new Map<string, number>();
                for (const s of sweeps.values()) {
                  const seq =
                    s.floorInfo && "sequence" in s.floorInfo
                      ? String(s.floorInfo.sequence)
                      : "?";
                  byFloor.set(seq, (byFloor.get(seq) ?? 0) + 1);
                }
                // Height histogram: if the mall really has two levels, the
                // sweeps cluster into two bands of Y even when Matterport has
                // labelled them all as one floor.
                const bands = new Map<number, number>();
                for (const s of sweeps.values()) {
                  const y = Math.round((s.position?.y ?? 0) / 2) * 2;
                  bands.set(y, (bands.get(y) ?? 0) + 1);
                }
                console.warn(
                  `[tour] ${sweeps.size} sweeps par étage:`,
                  [...byFloor.entries()].map(([f, n]) => `${f}=${n}`).join(" "),
                  "| hauteurs:",
                  [...bands.entries()]
                    .sort((a, b) => a[0] - b[0])
                    .map(([y, n]) => `${y}m=${n}`)
                    .join(" ")
                );
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
            // During a transition the id is '' — don't record that as a place.
            if (sweep?.id) {
              currentSweepRef.current = sweep.id;
            }
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
      // Switching level loads a different scan: its pins, sweeps and levels
      // are all different, so none of the previous space's state may survive
      // into the next one.
      setTags([]);
      currentSweepRef.current = null;
      setStatus(MATTERPORT_SDK_KEY ? "connecting" : "disabled");
      // Deliberately not re-enabling the native pins: that would race the
      // disconnect, and the iframe is being torn down anyway.
      connected?.disconnect?.();
    };
  }, [iframeRef, spaceId, dwellMs]);

  return { status, tags, sdk, sdkRef, currentSweepRef };
}
