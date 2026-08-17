"use client";

import { useEffect, useRef, useState } from "react";
import type { MpSdk } from "@matterport/sdk";
import { MATTERPORT_SDK_KEY, SDK_BOOTSTRAP_URL } from "./constants";
import { resolveStoreByTag } from "./tour-zones";
import { nearestSweep, viewpointFor } from "./tour-nav";
import type { TagRecord } from "./roster";

export type TourStatus =
  | "disabled" // no SDK key configured — the tour renders as a plain embed
  | "connecting"
  | "ready"
  | "error";

/**
 * How far the player has got, for the loading veil to report.
 *
 * `status` cannot answer this: it stays "connecting" for the whole load, which
 * on a cold cache is ten seconds or more of a screen that looks identical at
 * second one and second nine. These are Matterport's own App.Phase values,
 * narrowed to the three that mean something to a visitor.
 */
export type TourPhase = "connecting" | "loading" | "starting" | "playing";

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
 * Connects to the tour iframe, preferring the hosted bootstrap and falling
 * back to the npm package. Both end at the same `MpSdk`; they differ only in
 * how the remote SDK client gets loaded.
 *
 * The order used to be the other way round, which cost every visitor a failed
 * attempt before the working one: @matterport/sdk's loader performs the same
 * runtime import through a path the bundler rewrites into its own registry, so
 * under Turbopack it cannot resolve an https URL and always throws. Only then
 * did the bootstrap get fetched — after the package chunk had been downloaded
 * and run for nothing. The package stays as the fallback in case a future
 * bundler makes that path work again; it is now behind a dynamic import that
 * a normal load never reaches, so it costs nothing until it is needed.
 */
async function connectToShowcase(
  iframe: HTMLIFrameElement,
  spaceId: string
): Promise<MpSdk> {
  try {
    // Preloaded from the document head, so this normally resolves out of cache.
    // The iframe src already carries applicationKey, so connect() can attach.
    const mod = await importFromUrl(SDK_BOOTSTRAP_URL);
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
  } catch (bootstrapErr) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[tour] hosted bootstrap failed, trying @matterport/sdk:",
        bootstrapErr
      );
    }
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
  const [phase, setPhase] = useState<TourPhase>("connecting");
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
    /**
     * attachmentId -> the pin's own media, with its kind.
     *
     * The kind is carried rather than filtered on arrival, because an
     * attachment's type can be corrected after it lands (see takeAttachment)
     * and because images and videos end up in different fields.
     */
    const media = new Map<string, { src: string; kind: "image" | "video" }>();
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

        // Subscribed before the wait below, not after it — the whole point is
        // to report progress *during* the load, and by the time `waitUntil`
        // resolves there is no progress left to report.
        subs.push(
          mpSdk.App.state.subscribe((appState) => {
            if (cancelled) return;
            switch (appState.phase) {
              case mpSdk.App.Phase.LOADING:
                setPhase("loading");
                break;
              case mpSdk.App.Phase.STARTING:
                setPhase("starting");
                break;
              case mpSdk.App.Phase.PLAYING:
                setPhase("playing");
                break;
              // UNINITIALIZED, WAITING and ERROR say nothing a visitor can act
              // on — the veil stays on "connecting", and a real failure is
              // reported through `status` instead.
              default:
                break;
            }
          })
        );

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
            const images: string[] = [];
            const videos: string[] = [];
            for (const attachmentId of attachmentIds) {
              const item = media.get(attachmentId);
              if (!item) continue;
              // The model's own order is preserved within each kind, which is
              // what keeps the first image being the brand's logo.
              if (item.kind === "video") videos.push(item.src);
              else images.push(item.src);
            }
            if (
              images.length !== tag.media.length ||
              videos.length !== tag.videos.length
            ) {
              tag.media = images;
              tag.videos = videos;
              changed = true;
              if (process.env.NODE_ENV !== "production") {
                console.warn(
                  `[tour] "${tag.label}": ${images.length} image(s), ${videos.length} vidéo(s) du modèle`
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

          const match = resolveStoreByTag(id, label);
          const slug = match?.slug ?? null;
          tagsRef.set(id, {
            tagId: id,
            label,
            slug,
            description,
            media: [],
            videos: [],
            discPosition: {
              x: discPosition.x,
              y: discPosition.y,
              z: discPosition.z,
            },
            anchorPosition: { x: anchor.x, y: anchor.y, z: anchor.z },
            stemVector: { x: stem.x, y: stem.y, z: stem.z },
            sweepId: null,
          });
          // Only pins on the ignore list get here now — see resolveStoreByTag.
          // Those are the promotional billboards and the quiz teaser, which
          // dock themselves open over the storefronts. Everything else is a
          // shop, catalogued or not, and stays.
          if (!slug) removeNative(id);

          if (attachmentIds.length > 0) tagMedia.set(id, attachmentIds);
          resolveMedia();
          if (process.env.NODE_ENV !== "production") {
            // Unmatched pins go through console.warn, not log: Next only
            // forwards warn/error from the browser to the dev server terminal,
            // and a pin the model has but the app can't place is exactly the
            // thing worth seeing without opening devtools.
            if (!match) {
              console.log(`[tour] ignored tag ${id} "${label}"`);
            } else if (match.known) {
              console.log(`[tour] tag ${id} "${label}" -> ${match.slug}`);
            } else {
              // console.warn, so Next forwards it to the dev terminal. Not an
              // error — this pin now works — but it is how you notice a shop
              // that could be given a quiz, or a non-shop pin that belongs on
              // the ignore list in tour-zones.
              console.warn(
                `[tour] AUTO-ADDED "${label}" as "${match.slug}" — ` +
                  `no catalogue entry, so no quiz and no reward. ` +
                  `Add one to stores-data.ts, or to IGNORED_LABEL_KEYS if it is not a shop.`
              );
            }
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

        /**
         * Pin media — the logos, photos and now videos the model already
         * carries. Far better than the stock thumbnails in the catalogue, and
         * maintained by whoever keeps the scan current.
         *
         * Two things this gets right that the previous version did not:
         *
         *  - VIDEO is kept. It used to filter to IMAGE, so a video attached in
         *    Workshop was silently thrown away.
         *  - `onUpdated` is handled. The SDK documents AttachmentType.UNKNOWN
         *    as the placeholder "until oEmbed resolves the actual type", so an
         *    attachment can arrive typeless and be corrected a moment later.
         *    Subscribing to onAdded alone dropped exactly those.
         */
        const takeAttachment = (id: string, attachment: MpSdk.Tag.Attachment) => {
          if (!attachment.src) return;
          const kind =
            attachment.type === mpSdk.Tag.AttachmentType.VIDEO
              ? "video"
              : attachment.type === mpSdk.Tag.AttachmentType.IMAGE
              ? "image"
              : null;
          // Anything else — PDF, rich embeds, sandboxes — has no place to go in
          // this UI yet. Ignored rather than guessed at.
          if (!kind) return;
          const known = media.get(id);
          if (known && known.src === attachment.src && known.kind === kind) {
            return;
          }
          media.set(id, { src: attachment.src, kind });
          resolveMedia();
        };

        try {
          subs.push(
            mpSdk.Tag.attachments.subscribe({
              onAdded: takeAttachment,
              onUpdated: takeAttachment,
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
      setPhase("connecting");
      // Deliberately not re-enabling the native pins: that would race the
      // disconnect, and the iframe is being torn down anyway.
      connected?.disconnect?.();
    };
  }, [iframeRef, spaceId, dwellMs]);

  return { status, phase, tags, sdk, sdkRef, currentSweepRef };
}
