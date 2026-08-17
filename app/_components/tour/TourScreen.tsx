"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MATTERPORT_LEVELS,
  tourUrlFor,
  XP_PER_STORE_VISIT,
} from "@/app/_lib/constants";
import { QUESTIONS, QUESTIONS_BY_STORE } from "@/app/_lib/questions-data";
import { STORES } from "@/app/_lib/stores-data";
import { buildRoster, rosterFacts } from "@/app/_lib/roster";
import { aimAt } from "@/app/_lib/tour-nav";
import { useCheckpointOverlay } from "@/app/_lib/useCheckpointOverlay";
import { useWallScreens } from "@/app/_lib/useWallScreens";
import { useQueryFlag } from "@/app/_lib/useQueryFlag";
import { screensFor } from "@/app/_lib/screens-data";
import { placeScreens } from "@/app/_lib/screen-placement";
import { useMatterportTour } from "@/app/_lib/useMatterportTour";
import { useGame } from "@/app/_components/GameStateProvider";
import { useLocale } from "@/app/_lib/i18n";
import {
  startSession,
  trackAnswer,
  trackStoreClick,
} from "@/app/_lib/analytics";
import { CheckpointLayer } from "./CheckpointLayer";
import { QuizDrawer } from "./QuizDrawer";
import { BadgeOverlay } from "./BadgeOverlay";
import { RewardsOverlay } from "./RewardsOverlay";
import { PromoFlyout } from "./PromoFlyout";
import { ToolsMenu } from "./ToolsMenu";
import { TapDebug } from "./TapDebug";
import { WallScreens } from "./WallScreens";
import { ScreenPicker } from "./ScreenPicker";
import { AdIntro } from "./AdIntro";
import { StoresPanel } from "./StoresPanel";
import { SideRail, TourTopBar, TourVeil } from "./TourHud";
import { usePress } from "@/app/_lib/usePress";

const FLIGHT_MS = 1600;
const FLIGHT_MS_REDUCED = 400;
/**
 * How much of the right edge the open panel actually covers.
 *
 * This was a flat 420 while `.drawer` was `min(420px, 92vw)`. On a 360px
 * phone that made the engine's `right = width - 420` negative, so with
 * CULL_MARGIN it hid *every* marker the moment a panel opened. And below
 * 640px the panel is now a bottom sheet, covering nothing on the right at
 * all — hence 0.
 */
function drawerInset(): number {
  if (typeof window === "undefined") return 0;
  if (window.innerWidth < 640) return 0; // bottom sheet
  return Math.min(420, window.innerWidth * 0.92);
}

export function TourScreen() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { progress, exploreStore, syncRoster, answerQuestion } = useGame();
  const { t, locale } = useLocale();

  /**
   * Counts this visit and runs the foreground clock behind the KPIs on /admin.
   * Mounted here rather than in the layout so it only counts sessions that got
   * as far as the tour — /admin itself must not inflate its own numbers.
   */
  useEffect(() => startSession(), []);

  /**
   * A ref, not state: it must flip during the same tick as the first answer,
   * and it must not cause a render. This is what makes "quiz participants"
   * count visits rather than answers.
   */
  const answeredThisSession = useRef(false);

  /**
   * Wraps the game's own recorder so the KPI and the XP are written from the
   * same call. Two separate paths would drift the moment one of them is
   * guarded and the other isn't.
   */
  const recordAnswer = useCallback(
    (questionId: string, index: number) => {
      const question = QUESTIONS.find((q) => q.id === questionId);
      // Already answered — the drawer guards this, but the counter must not
      // rely on a caller's discipline.
      if (!question || progress.answeredQuestions[questionId]) {
        answerQuestion(questionId, index);
        return;
      }
      answerQuestion(questionId, index);
      trackAnswer(index === question.correctIndex, !answeredThisSession.current);
      answeredThisSession.current = true;
    },
    [answerQuestion, progress.answeredQuestions]
  );

  /** Which scan is loaded. Each level of the mall is its own Matterport space. */
  const [levelIndex, setLevelIndex] = useState(0);
  const level = MATTERPORT_LEVELS[levelIndex];

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  /**
   * Offres was open on arrival while it was a small side flyout — the ad
   * inside it is the point. It is now a full-screen page (a floating panel
   * over the iframe could not be tapped on touch), and a full-screen ad wall
   * on arrival would hide the tour instead of sitting beside it. So it opens
   * from the rail rather than on load.
   */
  const [offersOpen, setOffersOpen] = useState(false);
  /**
   * The shop directory, opened from the rail. It stands in for the strip of
   * chips that used to run along the bottom of the screen: the strip could
   * only ever show a few of them at once and sat where the checkpoints' own
   * name plates want to be.
   */
  const [storesOpen, setStoresOpen] = useState(false);
  /** Phones: the burger's tools page, standing in for the side rail. */
  const [toolsOpen, setToolsOpen] = useState(false);
  /** Enlarged shop photo. Lives here so it can sit above the drawer. */
  const [lightbox, setLightbox] = useState<{
    images: string[];
    start: number;
  } | null>(null);
  const openImage = useCallback(
    (images: string[], start: number) => setLightbox({ images, start }),
    []
  );
  const [flyingSlug, setFlyingSlug] = useState<string | null>(null);

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
    setRewardsOpen(false);
    setStoresOpen(false);
    setActiveSlug(slug);
    // Counted here rather than at each call site: this is the one funnel every
    // way of opening a shop passes through — marker, directory, or a flight
    // that skipped straight to the panel.
    trackStoreClick(slug);
  }, []);

  // Declared before the SDK hook so the click handler can reach it; the hook
  // reads its callbacks from refs, so a late binding is fine.
  const flyRef = useRef<(slug: string) => void>(() => {});

  const {
    status,
    phase,
    tags,
    sdk,
    sdkRef,
    currentSweepRef,
  } = useMatterportTour(iframeRef, {
    spaceId: level.id,
    onTagClick: (slug) => flyRef.current(slug),
    // Walking in and stopping banks the visit but never opens a panel;
    // an unrequested drawer mid-stride is the interruption we're avoiding.
    onStoreEntered: exploreStore,
  });

  // Rebuilt on a language switch, which is what re-renders every shop blurb
  // and quiz question in the new language without touching saved progress —
  // ids and correct answers are locale-independent by design.
  const roster = useMemo(
    () => buildRoster(tags, STORES, QUESTIONS_BY_STORE, locale),
    [tags, locale]
  );

  // Badge and level maths follow the model, not the catalogue.
  useEffect(() => {
    syncRoster(rosterFacts(roster));
  }, [roster, syncRoster]);

  const markers = useMemo(
    () => roster.map((s) => ({ id: s.tagId, world: s.markerPosition })),
    [roster]
  );

  const { bind, setDrawerInset } = useCheckpointOverlay(sdk, stageRef, markers);

  /**
   * Screens are authored per scan, so switching level swaps the set — but a
   * tag-anchored one also needs the pins, which arrive over the SDK after the
   * model loads. Hence `tags` in the deps: the screen appears when the pin it
   * hangs on does, and a shop absent from this model drops out rather than
   * hanging a video at the origin.
   */
  const wallScreens = useMemo(
    () => placeScreens(screensFor(level.id), tags),
    [level.id, tags]
  );
  const { bind: bindScreen } = useWallScreens(sdk, stageRef, wallScreens);

  // Markers hidden behind a right-hand panel stop doing per-frame work. The
  // directory occupies the same slot as the quiz drawer, so it counts too.
  useEffect(() => {
    setDrawerInset(activeSlug || badgesOpen || storesOpen ? drawerInset() : 0);
  }, [activeSlug, badgesOpen, storesOpen, setDrawerInset]);

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

  /** XP still unclaimed per store — the number on each checkpoint's plate. */
  const pendingXp = useMemo(() => {
    const map = new Map<string, number>();
    for (const store of roster) {
      const unanswered = store.questions.filter(
        (q) => !progress.answeredQuestions[q.id]
      );
      const visitBonus = progress.exploredStores.includes(store.slug)
        ? 0
        : XP_PER_STORE_VISIT;
      map.set(
        store.slug,
        visitBonus + unanswered.reduce((n, q) => n + q.xpReward, 0)
      );
    }
    return map;
  }, [roster, progress.answeredQuestions, progress.exploredStores]);

  // ── Fly to a storefront, then open its quiz ──
  const flyToStore = useCallback(
    async (slug: string) => {
      if (flyingRef.current) return;
      // Out of the way first. The flight is the answer to the click, and on a
      // phone the directory is a sheet over 78% of the screen — leaving it up
      // would hide the very thing the press asked to see.
      setStoresOpen(false);
      const entry = roster.find((s) => s.slug === slug);
      const sdk = sdkRef.current;

      // No SDK or no reachable sweep: skip the flight, still open the quiz.
      if (!entry || !sdk || !entry.sweepId) {
        openStore(slug);
        exploreStore(slug);
        return;
      }

      // Already standing there: opening a panel is the whole interaction.
      // Flying to the sweep you're on is a jarring no-op.
      if (currentSweepRef.current === entry.sweepId) {
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
        if (process.env.NODE_ENV !== "production") {
          console.log(
            `[tour] flying to ${slug} sweep=${entry.sweepId} from=${currentSweepRef.current}`
          );
        }

        // A moveTo that never settles would leave the rail disabled forever —
        // the worst possible outcome here, so it races a watchdog. The budget
        // is deliberately generous: a fly across the mall runs well past the
        // requested transitionTime, and cutting it short aborts a flight that
        // was about to land.
        // Aim along the ground at the storefront, never at the pin itself.
        // Pins float above head height and `Camera.lookAt` obliges by tilting
        // to centre them, which — combined with the pitch my own trigonometry
        // produced — left arrivals staring at the floor. A shopfront is read
        // at eye level, so the pitch is pinned to the horizon and only the
        // heading is computed.
        // No rotation passed to moveTo: the heading is settled after arrival
        // by measuring where the shopfront actually lands on screen, which
        // needs no assumption about Matterport's yaw convention.
        await Promise.race([
          sdk.Sweep.moveTo(entry.sweepId, {
            transition: reduced
              ? sdk.Sweep.Transition.FADEOUT
              : sdk.Sweep.Transition.FLY,
            transitionTime: ms,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("flight timeout")), ms + 8000)
          ),
        ]);

        try {
          const stage = stageRef.current;
          if (stage) {
            await aimAt(sdk, entry.markerPosition, {
              w: stage.clientWidth,
              h: stage.clientHeight,
            });
          }
        } catch (err) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[tour] could not aim at the storefront:", err);
          }
        }
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
    [roster, sdkRef, currentSweepRef, openStore, exploreStore]
  );

  // Keep the latch the SDK's tag-click handler calls pointed at the live
  // closure, so an in-scene click flies exactly like a rail click.
  useEffect(() => {
    flyRef.current = flyToStore;
  }, [flyToStore]);

  // ── Levels ──
  // Not Floor.moveTo, and not a camera move at all: the levels are separate
  // Matterport scans, so changing level means loading a different model and
  // reconnecting the SDK. The veil covers the reload.
  const goToLevel = useCallback((index: number) => {
    setActiveSlug(null);
    setBadgesOpen(false);
    setLevelIndex(index);
  }, []);

  /** Shared by the desktop rail and the phone tools page. */
  const openBadges = useCallback(() => {
    setActiveSlug(null);
    setRewardsOpen(false);
    setStoresOpen(false);
    setBadgesOpen(true);
  }, []);

  /** Same rule: one translucent surface over the live scene at a time. */
  const toggleStores = useCallback(() => {
    setActiveSlug(null);
    setBadgesOpen(false);
    setRewardsOpen(false);
    setStoresOpen((v) => !v);
  }, []);

  const activeStore = roster.find((s) => s.slug === activeSlug) ?? null;

  /**
   * The veil unmounts a beat after the fade so the transition can actually
   * play — removing it the instant status flips would cut Matterport's loading
   * screen back into view for a frame.
   */
  // The veil owns its own lifetime; this only tracks whether the wordmark has
  // finished flying into the top bar, which happens once.
  const [markVisible, setMarkVisible] = useState(false);
  const handleVeilRetired = useCallback(() => setMarkVisible(true), []);

  // `?tap=1` / `?screen=1` only, so neither workbench costs anything at all on
  // a normal visit. Read through useQueryFlag rather than a useState
  // initialiser: the initialiser ran on the server (false) and again during
  // hydration (true), which is a hydration mismatch on every load with the
  // flag set — see the note in useQueryFlag.
  const tapDebug = useQueryFlag("tap");
  const screenPicker = useQueryFlag("screen");

  return (
    <div ref={stageRef} className="stage">
      {/* key on the space id: switching level must build a fresh iframe, not
          re-point an existing one, so the SDK cannot attach to a stale
          document mid-swap. */}
      <iframe
        key={`frame-${level.id}`}
        ref={iframeRef}
        src={tourUrlFor(level.id)}
        className="stage-frame"
        allow="fullscreen; xr-spatial-tracking"
        allowFullScreen
        title={t("tourFrameTitle")}
      />

      {/* Before the top mask on purpose: a screen is meant to be part of the
          building, so it sits with the scene rather than with the interface,
          and the mask should cover it exactly as it covers the panorama. */}
      <WallScreens screens={wallScreens} bind={bindScreen} />

      {/* Only the top band remains. The bottom one was removed on request —
          it was a 112px dark fade covering Matterport's control bar, so that
          bar may now be visible along the bottom edge. Restore `.chrome-mask`
          if it shows. */}
      <div className="chrome-mask-top" aria-hidden />

      {/* Keyed on the level: switching floor loads a different scan, so the
          veil must come back and cover that load too. */}
      {/* Keys are prefixed because this and the iframe are siblings keyed on
          the same space id — identical keys among siblings is a React error. */}
      <TourVeil
        key={`veil-${level.id}`}
        status={status}
        phase={phase}
        onRetired={handleVeilRetired}
      />

      {flyingSlug && (
        <div
          className="flight-bar"
          style={{ "--flight-ms": `${FLIGHT_MS}ms` } as React.CSSProperties}
        />
      )}

      <div className="hud">
        {/* Held back until the veil's wordmark has flown into this spot. */}
        <TourTopBar
          markVisible={markVisible}
          onOpenRewards={() => {
            // One translucent surface over the live scene at a time.
            setActiveSlug(null);
            setBadgesOpen(false);
            setStoresOpen(false);
            setRewardsOpen(true);
          }}
          onOpenTools={() => {
            setActiveSlug(null);
            setBadgesOpen(false);
            setRewardsOpen(false);
            setStoresOpen(false);
            setToolsOpen(true);
          }}
        />

        {status === "ready" && (
          <SideRail
            onStores={toggleStores}
            storesActive={storesOpen}
            storesDisabled={flyingSlug !== null}
            onBadges={openBadges}
            onOffers={() => setOffersOpen((v) => !v)}
            offersActive={offersOpen}
            levels={MATTERPORT_LEVELS}
            currentLevel={levelIndex}
            onLevel={goToLevel}
            floorsDisabled={flyingSlug !== null}
          />
        )}

        {toolsOpen && status === "ready" && (
          <ToolsMenu
            onClose={() => setToolsOpen(false)}
            onStores={() => setStoresOpen(true)}
            storesActive={storesOpen}
            storesDisabled={flyingSlug !== null}
            storeCount={roster.length}
            onBadges={openBadges}
            onOffers={() => setOffersOpen(true)}
            levels={MATTERPORT_LEVELS}
            currentLevel={levelIndex}
            onLevel={goToLevel}
            floorsDisabled={flyingSlug !== null}
          />
        )}

        {/* Rendered while connecting too, unlike the rail that opens it: the
            burger is reachable from the first frame, and a directory that says
            "chargement" beats one that refuses to open. */}
        {storesOpen && (
          <StoresPanel
            stores={roster}
            doneSlugs={doneSlugs}
            pendingXp={pendingXp}
            connecting={status === "connecting"}
            flyingSlug={flyingSlug}
            onSelect={flyToStore}
            onClose={() => setStoresOpen(false)}
          />
        )}

        {offersOpen && status === "ready" && (
          <PromoFlyout onClose={() => setOffersOpen(false)} />
        )}

        {/* Held until the veil has retired, so the ad lands on the scene
            rather than on Matterport's loading screen. */}
        {status === "ready" && markVisible && <AdIntro />}

        <CheckpointLayer
          stores={roster}
          doneSlugs={doneSlugs}
          pendingXp={pendingXp}
          bind={bind}
          onSelect={flyToStore}
          disabled={flyingSlug !== null}
        />

        {activeStore && (
          // Keyed on the slug so opening a different shop remounts the panel:
          // its tab choice and quiz feedback are initial state, and should
          // start fresh per store rather than be reset from an effect.
          <QuizDrawer
            key={activeStore.slug}
            store={activeStore}
            onAnswer={recordAnswer}
            onClose={() => setActiveSlug(null)}
            onOpenImage={openImage}
          />
        )}

        {badgesOpen && <BadgeOverlay onClose={() => setBadgesOpen(false)} />}

        {rewardsOpen && (
          <RewardsOverlay
            roster={roster}
            onClose={() => setRewardsOpen(false)}
          />
        )}

        {/* The ⋯ overflow menu lived here. Removed on request; its only item,
            "Partager la visite", is a button on the side rail now. */}

        <TourStatusNote status={status} rosterCount={roster.length} />

        {lightbox && (
          <Lightbox
            images={lightbox.images}
            start={lightbox.start}
            onClose={() => setLightbox(null)}
          />
        )}
      </div>

      {tapDebug && <TapDebug />}
      {screenPicker && <ScreenPicker sdk={sdk} spaceId={level.id} />}
    </div>
  );
}

/**
 * The shop's photos at full size, without leaving the visit.
 *
 * A gallery rather than a single image: the pin carries every photo the shop
 * has, so arriving from one thumbnail should not strand you there. Left and
 * right wrap around — from the last photo, right returns to the first.
 */
function Lightbox({
  images,
  start,
  onClose,
}: {
  images: string[];
  start: number;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [index, setIndex] = useState(start);
  const count = images.length;

  // Modulo with a `+ count` so a left arrow off the first photo lands on the
  // last rather than on NaN — a bare `-1 % 3` is -1 in JavaScript.
  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count]
  );

  const prevPress = usePress(() => step(-1));
  const nextPress = usePress(() => step(1));
  const closePress = usePress(onClose);
  const scrimPress = usePress(onClose);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  return (
    <div className="lightbox" role="dialog" aria-label={t("lightboxRegion")}>
      <button
        {...scrimPress}
        aria-label={t("lightboxClose")}
        tabIndex={-1}
        className="lightbox-scrim"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[index]} alt="" />

      {/* Arrow keys are the ask, but a phone has none — the same navigation
          has to be reachable by thumb. */}
      {count > 1 && (
        <>
          <button
            {...prevPress}
            aria-label={t("lightboxPrev")}
            className="lightbox-nav lightbox-nav-prev"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            {...nextPress}
            aria-label={t("lightboxNext")}
            className="lightbox-nav lightbox-nav-next"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <span className="lightbox-count">
            {index + 1} / {count}
          </span>
        </>
      )}

      <button
        {...closePress}
        aria-label={t("lightboxClose")}
        className="absolute top-4 right-4 z-[2] w-10 h-10 rounded-full pane grid place-items-center text-ink-2 hover:text-brass transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
    </div>
  );
}

/**
 * The one place that explains a non-ready visit. Never blanks the screen —
 * the iframe is painting Matterport's own progress behind it, which is the
 * most honest signal available.
 *
 * Pins that match no store are reported to the console only (see the
 * `[tour] tag … -> unmatched` line in useMatterportTour); they used to print
 * on screen, which was useful exactly once and clutter thereafter.
 */
function TourStatusNote({
  status,
  rosterCount,
}: {
  status: string;
  rosterCount: number;
}) {
  const { t } = useLocale();
  if (status === "ready" && rosterCount > 0) return null;

  return (
    // bottom-4 at every width now. The old bottom-28 on phones was clearing
    // the strip of store chips that used to sit along the bottom edge; with the
    // directory moved into a panel there is nothing down there to clear.
    <div className="hud-on absolute left-4 bottom-4 max-w-[320px] flex flex-col gap-1.5 px-4 py-3 rounded-xl pane">
      {status === "connecting" && (
        <span className="text-[11px] text-ink-2 leading-snug">
          {t("statusConnecting")}
        </span>
      )}
      {status === "disabled" && (
        <span className="text-[11px] text-ink-2 leading-snug">
          {t("statusDisabled")}
        </span>
      )}
      {status === "error" && (
        <span className="text-[11px] text-clay leading-snug">
          {t("statusError")}
        </span>
      )}
      {status === "ready" && rosterCount === 0 && (
        <span className="text-[11px] text-ink-2 leading-snug">
          {t("statusNoStores")}
        </span>
      )}
    </div>
  );
}
