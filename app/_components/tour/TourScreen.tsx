"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MATTERPORT_TOUR_URL } from "@/app/_lib/constants";
import { QUESTIONS_BY_STORE } from "@/app/_lib/questions-data";
import { STORES } from "@/app/_lib/stores-data";
import { buildRoster, rosterFacts } from "@/app/_lib/roster";
import { lookAtRotation } from "@/app/_lib/tour-nav";
import { useCheckpointOverlay } from "@/app/_lib/useCheckpointOverlay";
import { useMatterportTour } from "@/app/_lib/useMatterportTour";
import { useGame } from "@/app/_components/GameStateProvider";
import { CheckpointLayer } from "./CheckpointLayer";
import { QuizDrawer } from "./QuizDrawer";
import { BadgeOverlay } from "./BadgeOverlay";
import { SideRail, StoreRail, TourTopBar } from "./TourHud";

const FLIGHT_MS = 1600;
const FLIGHT_MS_REDUCED = 400;
/** Must match `.drawer { width }` closely enough to cull markers behind it. */
const DRAWER_W = 420;

export function TourScreen() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { progress, exploreStore, syncRoster } = useGame();

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [flyingSlug, setFlyingSlug] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState(false);
  const [mapBroken, setMapBroken] = useState(false);

  /**
   * Set synchronously before any await. A React state flag cannot guard this:
   * two clicks in the same tick would both read the stale `false` and both
   * start a flight.
   */
  const flyingRef = useRef(false);
  const flightSeq = useRef(0);

  // ── The visit ──
  const openStore = useCallback((slug: string) => {
    setBadgesOpen(false);
    setActiveSlug(slug);
  }, []);

  const { status, tags, sdk, sdkRef } = useMatterportTour(iframeRef, {
    // Clicking a disc in the scene: the visitor is already looking at it, so
    // no flight — just open.
    onTagClick: openStore,
    // Walking in and stopping banks the visit but never opens a panel;
    // an unrequested drawer mid-stride is the interruption we're avoiding.
    onStoreEntered: exploreStore,
  });

  const roster = useMemo(
    () => buildRoster(tags, STORES, QUESTIONS_BY_STORE),
    [tags]
  );

  // Badge and level maths follow the model, not the catalogue.
  useEffect(() => {
    syncRoster(rosterFacts(roster));
  }, [roster, syncRoster]);

  const markers = useMemo(
    () => roster.map((s) => ({ id: s.tagId, world: s.discPosition })),
    [roster]
  );

  const { bind, setDrawerInset } = useCheckpointOverlay(sdk, stageRef, markers);

  // Markers hidden behind the drawer stop doing per-frame work.
  useEffect(() => {
    setDrawerInset(activeSlug || badgesOpen ? DRAWER_W : 0);
  }, [activeSlug, badgesOpen, setDrawerInset]);

  const doneSlugs = useMemo(() => {
    const done = new Set<string>();
    for (const store of roster) {
      if (
        store.questions.length > 0 &&
        store.questions.every((q) => progress.answeredQuestions[q.id])
      ) {
        done.add(store.slug);
      }
    }
    return done;
  }, [roster, progress.answeredQuestions]);

  // ── Fly to a storefront, then open its quiz ──
  const flyToStore = useCallback(
    async (slug: string) => {
      if (flyingRef.current) return;
      const entry = roster.find((s) => s.slug === slug);
      const sdk = sdkRef.current;

      // No SDK or no reachable sweep: skip the flight, still open the quiz.
      if (!entry || !sdk || !entry.sweepId) {
        openStore(slug);
        exploreStore(slug);
        return;
      }

      const mine = ++flightSeq.current;
      flyingRef.current = true;
      setFlyingSlug(slug);

      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const ms = reduced ? FLIGHT_MS_REDUCED : FLIGHT_MS;

      try {
        if (mapMode) {
          await sdk.Mode.moveTo(sdk.Mode.Mode.INSIDE);
          setMapMode(false);
        }

        const sweeps = await sdk.Sweep.data.waitUntil(() => true);
        const from = sweeps[entry.sweepId]?.position;

        // A moveTo that never settles would leave the rail disabled forever —
        // the worst possible outcome here, so it races a watchdog.
        await Promise.race([
          sdk.Sweep.moveTo(entry.sweepId, {
            rotation: from
              ? lookAtRotation(from, entry.discPosition)
              : undefined,
            transition: reduced
              ? sdk.Sweep.Transition.FADEOUT
              : sdk.Sweep.Transition.FLY,
            transitionTime: ms,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("flight timeout")), ms + 2000)
          ),
        ]);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[tour] flight failed:", err);
        }
      } finally {
        // A newer flight owns the UI now — don't stomp its state.
        if (flightSeq.current === mine) {
          flyingRef.current = false;
          setFlyingSlug(null);
          openStore(slug);
          // Deferred: the localStorage write and badge walk are synchronous,
          // and landing them in the arrival frame costs visible frames.
          setTimeout(() => exploreStore(slug), 0);
        }
      }
    },
    [roster, sdkRef, mapMode, openStore, exploreStore]
  );

  // ── Map view ──
  const toggleMap = useCallback(async () => {
    const sdk = sdkRef.current;
    if (!sdk) return;
    try {
      if (mapMode) {
        await sdk.Mode.moveTo(sdk.Mode.Mode.INSIDE);
        setMapMode(false);
      } else {
        try {
          await sdk.Mode.moveTo(sdk.Mode.Mode.DOLLHOUSE);
        } catch {
          // Unaligned or 360-only scans reject dollhouse; floorplan often works.
          await sdk.Mode.moveTo(sdk.Mode.Mode.FLOORPLAN);
        }
        setMapMode(true);
      }
    } catch {
      // Neither view is available in this model — stop offering the button
      // rather than looking broken on every press.
      setMapBroken(true);
      setMapMode(false);
    }
  }, [mapMode, sdkRef]);

  const activeStore = roster.find((s) => s.slug === activeSlug) ?? null;
  const unmatched = tags.filter((t) => !t.slug);

  return (
    <div ref={stageRef} className="stage">
      <iframe
        ref={iframeRef}
        src={MATTERPORT_TOUR_URL}
        className="stage-frame"
        allow="fullscreen; xr-spatial-tracking"
        allowFullScreen
        title="Visite virtuelle du mall"
      />

      {flyingSlug && (
        <div
          className="flight-bar"
          style={{ "--flight-ms": `${FLIGHT_MS}ms` } as React.CSSProperties}
        />
      )}

      <div className="hud">
        <TourTopBar />

        {status === "ready" && !mapBroken && (
          <SideRail
            onMap={toggleMap}
            onBadges={() => {
              setActiveSlug(null);
              setBadgesOpen(true);
            }}
            mapDisabled={flyingSlug !== null}
            mapActive={mapMode}
          />
        )}

        <CheckpointLayer
          stores={roster}
          doneSlugs={doneSlugs}
          bind={bind}
          onSelect={openStore}
          disabled={flyingSlug !== null}
        />

        <StoreRail
          stores={roster}
          activeSlug={activeSlug}
          flyingSlug={flyingSlug}
          doneSlugs={doneSlugs}
          onSelect={flyToStore}
          connecting={status === "connecting"}
        />

        {activeStore && (
          <QuizDrawer
            store={activeStore}
            onClose={() => setActiveSlug(null)}
          />
        )}

        {badgesOpen && <BadgeOverlay onClose={() => setBadgesOpen(false)} />}

        <TourStatusNote
          status={status}
          rosterCount={roster.length}
          unmatched={unmatched}
        />
      </div>
    </div>
  );
}

/**
 * The one place that explains a non-ready visit. Never blanks the screen —
 * the iframe is painting Matterport's own progress behind it, which is the
 * most honest signal available.
 */
function TourStatusNote({
  status,
  rosterCount,
  unmatched,
}: {
  status: string;
  rosterCount: number;
  unmatched: Array<{ tagId: string; label: string }>;
}) {
  if (status === "ready" && rosterCount > 0 && unmatched.length === 0) {
    return null;
  }

  return (
    <div className="hud-on absolute left-4 bottom-28 md:bottom-4 max-w-[320px] flex flex-col gap-1.5 px-4 py-3 rounded-xl pane">
      {status === "connecting" && (
        <span className="text-[11px] text-ink-2 leading-snug">
          Connexion à la visite…
        </span>
      )}
      {status === "disabled" && (
        <span className="text-[11px] text-ink-2 leading-snug">
          Visite non interactive — aucune clé SDK configurée.
        </span>
      )}
      {status === "error" && (
        <span className="text-[11px] text-clay leading-snug">
          La visite est chargée mais non instrumentée. Vérifiez la clé SDK et
          son allowlist de domaines.
        </span>
      )}
      {status === "ready" && rosterCount === 0 && (
        <span className="text-[11px] text-ink-2 leading-snug">
          Aucune boutique balisée dans ce modèle.
        </span>
      )}

      {/* The single most useful debugging affordance in the app: the labels
          that failed to match, ready to paste into TAG_OVERRIDES. */}
      {process.env.NODE_ENV !== "production" && unmatched.length > 0 && (
        <>
          <span className="text-[10px] text-ink-3 leading-snug">
            {unmatched.length} pastille{unmatched.length > 1 ? "s" : ""} non
            reconnue{unmatched.length > 1 ? "s" : ""} — TAG_OVERRIDES :
          </span>
          <pre className="text-[9.5px] leading-[1.6] text-ink-3 overflow-x-auto">
            {unmatched.map((t) => `"${t.tagId}": "", // ${t.label}`).join("\n")}
          </pre>
        </>
      )}
    </div>
  );
}
