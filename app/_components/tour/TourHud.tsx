"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/app/_components/GameStateProvider";
import { ProgressRing } from "@/app/_components/ProgressRing";
import { LocaleSwitch } from "@/app/_components/LocaleSwitch";
import type { MallLevel } from "@/app/_lib/constants";
import type { TourPhase } from "@/app/_lib/useMatterportTour";
import { useLocale } from "@/app/_lib/i18n";
import type { UiKey } from "@/app/_lib/strings";
import { usePress } from "@/app/_lib/usePress";
import { shareTour } from "@/app/_lib/share";

/* ══════════════════════════════════════════
   Top bar — wordmark and XP
   ══════════════════════════════════════════ */

export function TourTopBar({
  markVisible,
  onOpenRewards,
  onOpenTools,
}: {
  markVisible: boolean;
  onOpenRewards: () => void;
  onOpenTools: () => void;
}) {
  return (
    <div className="absolute top-0 inset-x-0 z-[12] p-4 md:p-5 safe-x">
      {/* Centred only from `sm` up. Below that the title (~148px at 15px) and
          the XP pill (128–149px) cannot both fit either side of centre — they
          overlap on every phone narrower than ~470px — so the title
          left-aligns and shrinks instead.
          The sizes are smaller than the single-word mark they replaced because
          the line is: "Smart Mall Experience" at 26px runs ~256px, which
          collides with the pill even on a centred desktop bar.
          Keep both sizes at exactly 0.625× the matching .veil-mark size — that
          ratio is baked into `mark-fly`'s scale, and the loading hand-off will
          visibly jump if the two drift apart. */}
      <div
        className={`absolute left-4 sm:left-1/2 sm:-translate-x-1/2 top-4 md:top-5 flex flex-col items-start sm:items-center gap-[3px] sm:gap-[5px] select-none pointer-events-none ${
          markVisible ? "mark-shown" : "mark-hidden"
        }`}
      >
        {/* Not translated, either of them: this is the product's name, and a
            wordmark that changes wording with the locale stops being one. */}
        <span className="font-display text-[15px] sm:text-[20px] text-ink tracking-[0.05em] leading-none whitespace-nowrap">
          Smart Mall Experience
        </span>
        {/* Shown on phones too, unlike the "Smart Mall" strapline it replaces:
            that line was decoration under a brand that was already on screen,
            this one *is* the brand. At 8.5px it costs ~86px of width and no
            horizontal room at all — it sits under the title. */}
        <span className="text-ink-3 text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.22em] leading-none whitespace-nowrap">
          By MVR World
        </span>
      </div>

      {/* The burger is laid out beside the pill rather than positioned over
          it, so no space has to be reserved by hand. It replaces the whole
          side rail and the ⋯ menu on phones — see ToolsMenu.
          FR|EN is desktop-only here: three controls plus a left-aligned title
          is more than a 360px bar holds, so on phones the language lives in
          the burger's tools page with everything else the rail gave up. */}
      <div className="flex justify-end items-center gap-2">
        <span className="hidden sm:block">
          <LocaleSwitch size="sm" />
        </span>
        <XpPill onClick={onOpenRewards} />
        <BurgerButton onPress={onOpenTools} />
      </div>
    </div>
  );
}

/** Phones only: opens the tools page. Desktop keeps the rail and the ⋯ menu. */
function BurgerButton({ onPress }: { onPress: () => void }) {
  const press = usePress(onPress);
  const { t } = useLocale();
  return (
    <button
      {...press}
      aria-label={t("openMenu")}
      className="hud-on sm:hidden w-10 h-10 rounded-full pane grid place-items-center text-ink-2 hover:text-brass transition-colors flex-shrink-0"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
    </button>
  );
}

/**
 * What the bar is easing toward, and what the veil says, at each phase.
 *
 * The durations are the *observed* cost of each phase, not a guess dressed up
 * as one: the bar eases toward that phase's ceiling over roughly the time the
 * phase takes and stops short of it, so something is always moving even when a
 * phase runs long. Only PLAYING fills the bar. A phase that finishes early just
 * jumps to the next target, which reads as progress; one that runs late creeps
 * rather than freezing, which is the failure mode being fixed.
 */
/**
 * The four beats shown while the model downloads, one per second.
 *
 * A full pass is 4s and the load is usually longer, so it loops rather than
 * stopping on the last word — a line that freezes reads as a stall, which is
 * the exact impression the rest of this veil exists to avoid.
 */
const VEIL_WORDS: UiKey[] = [
  "veilExplore",
  "veilDiscover",
  "veilPlay",
  "veilWin",
];
const WORD_MS = 1000;

const VEIL_STEPS: Record<
  TourPhase,
  { pct: number; ms: number; label: UiKey }
> = {
  connecting: { pct: 28, ms: 3500, label: "loadConnecting" },
  loading: { pct: 74, ms: 9000, label: "loadLoading" },
  starting: { pct: 94, ms: 2500, label: "loadStarting" },
  playing: { pct: 100, ms: 350, label: "loadReady" },
};

/**
 * Covers the player while it boots.
 *
 * Matterport paints its own loading state, logo and name in there, and none of
 * it can be restyled from outside a cross-origin iframe. Covering the load is
 * the only way to keep the first thing a visitor sees ours.
 *
 * That cover has to last as long as the model takes to download — ten seconds
 * and more on a cold cache — so it reports where the load has got to. It used
 * to show an indeterminate bar looping every 1.5s, which is identical at
 * second one and second nine and so reads as a hang rather than a wait.
 */
export function TourVeil({
  status,
  phase,
  onRetired,
}: {
  status: string;
  phase: TourPhase;
  onRetired: () => void;
}) {
  const { t } = useLocale();
  const [gone, setGone] = useState(false);
  const leaving = status !== "connecting";
  const step = VEIL_STEPS[phase];

  // The bar needs a frame at its starting width before the first target lands,
  // or there is nothing for the browser to animate *from*: this is server
  // rendered, so the inline style is already in the HTML and the bar would
  // simply paint at 28% and sit there.
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // One word per second, stopping the moment the veil starts to leave — there
  // is no point paying for a timer during the hand-off, and a word changing
  // while the whole block flies up to the top bar is noise.
  const [wordIndex, setWordIndex] = useState(0);
  useEffect(() => {
    if (leaving) return;
    const id = setInterval(
      () => setWordIndex((i) => (i + 1) % VEIL_WORDS.length),
      WORD_MS
    );
    return () => clearInterval(id);
  }, [leaving]);

  // Self-managing, and keyed on the level by the caller, so switching floor
  // remounts it. Previously the screen retired the veil once and never
  // brought it back — so every load after the first showed Matterport's own
  // loading screen, branding and all.
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => {
      setGone(true);
      onRetired();
    }, 700);
    return () => clearTimeout(t);
  }, [leaving, onRetired]);

  if (gone) return null;

  return (
    <div className={`tour-veil ${leaving ? "tour-veil-out" : ""}`} aria-hidden>
      <div className="veil-mark">
        {/* 24 / 32px — exactly 1 / 0.625 of TourTopBar's 15 / 20px, which is
            the scale `mark-fly` shrinks by on its way into the bar. */}
        <span className="font-display text-[24px] sm:text-[32px] text-ink tracking-[0.05em] leading-none whitespace-nowrap">
          Smart Mall Experience
        </span>
        <span className="text-ink-3 text-[9px] sm:text-[10px] uppercase tracking-[0.22em] leading-none whitespace-nowrap">
          By MVR World
        </span>

        {/* Keyed on the index so React replaces the element rather than
            editing its text — that is what lets the enter animation replay on
            every word instead of firing once. */}
        <span className="veil-words">
          <span key={wordIndex} className="veil-word">
            {t(VEIL_WORDS[wordIndex])}
          </span>
        </span>

        <span className="veil-bar">
          <span
            className="veil-bar-fill"
            style={
              {
                "--veil-pct": started ? `${step.pct}%` : "5%",
                "--veil-ms": `${step.ms}ms`,
              } as React.CSSProperties
            }
          />
        </span>
        <span className="veil-note">{t(step.label)}</span>
      </div>
    </div>
  );
}

function XpPill({ onClick }: { onClick: () => void }) {
  const { progress, level, levelProgress, isHydrated } = useGame();
  const { t } = useLocale();
  const press = usePress(onClick);
  if (!isHydrated) return null;

  return (
    <button
      {...press}
      aria-label={t("openRewards")}
      title={t("myRewards")}
      className="hud-on flex items-center gap-2 sm:gap-3 pl-1.5 pr-3 sm:pr-4 py-1.5 rounded-full pane hover:border-brass-line transition-colors"
    >
      <ProgressRing pct={levelProgress} size={34} thickness={4} label={`${level.level}`} />
      <span className="flex flex-col gap-1 items-start">
        <span className="text-ink text-[13px] font-semibold leading-none tabular-nums">
          {progress.totalXp} XP
        </span>
        {/* The level label is the widest part of the pill and the least
            load-bearing — it goes first when space is short. */}
        <span className="hidden sm:block text-brass text-[9px] font-medium uppercase tracking-[0.14em] leading-none">
          {level.label}
        </span>
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════
   Side rail — SHOPS / BADGE / OFFRES / floor

   Desktop only (`hidden sm:flex`). On phones these same actions are rows in
   the burger's full-screen tools page: floating over the Matterport iframe,
   they could not be tapped on touch. See ToolsMenu for the why.
   ══════════════════════════════════════════ */

export function SideRail({
  onStores,
  storesActive,
  storesDisabled,
  onBadges,
  onOffers,
  offersActive,
  levels,
  currentLevel,
  onLevel,
  floorsDisabled,
}: {
  onStores: () => void;
  storesActive: boolean;
  storesDisabled: boolean;
  onBadges: () => void;
  onOffers: () => void;
  offersActive: boolean;
  levels: MallLevel[];
  currentLevel: number;
  onLevel: (index: number) => void;
  floorsDisabled: boolean;
}) {
  // Where the button sends you: the next level up, wrapping back to the
  // ground floor from the top. One control that always has somewhere to go,
  // rather than a row of buttons where all but one are inert.
  const nextIndex = (currentLevel + 1) % levels.length;
  const next = levels.length > 1 ? levels[nextIndex] : null;
  const goingDown = next !== null && nextIndex < currentLevel;

  const { t, locale } = useLocale();
  const [collapsed, setCollapsed] = useState(false);

  // z-[12]: the checkpoint layer renders after this in the DOM and both were
  // z-auto, so markers painted straight over the rail — a store plate landing
  // on the buttons made them unreadable and unclickable. Every HUD control
  // now sits above the markers, and all of them stay below the drawer (20).
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        aria-label={t("railExpand")}
        aria-expanded={false}
        className="hud-on hidden sm:grid absolute left-4 top-1/2 -translate-y-1/2 z-[12] w-11 h-11 rounded-full rail-slab place-items-center text-on-brass hover:bg-black/10 transition-colors safe-x"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    );
  }

  return (
    // `rail-slab`, not `pane`: the rail is brass now, with dark content on it,
    // rather than a dark pane with brass accents.
    <div className="hud-on hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-[12] flex-col rounded-2xl rail-slab overflow-hidden safe-x">
      {/* Where MAP used to be. The dollhouse/floorplan toggle showed you the
          mall from outside it; this puts you inside a shop instead, which is
          what the button was being pressed for. */}
      <RailButton
        label={t("railShops")}
        onClick={onStores}
        disabled={storesDisabled}
        active={storesActive}
        title={t("railShopsTitle")}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 9h18l-1.4-4.2A2 2 0 0 0 17.7 3.4H6.3a2 2 0 0 0-1.9 1.4L3 9z" /><path d="M4 9v10a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19V9" /><path d="M9 20.5V14h6v6.5" /></svg>
        }
      />
      <RailButton
        label={t("railBadge")}
        onClick={onBadges}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 9" /></svg>
        }
      />
      <RailButton
        label={t("railOffers")}
        onClick={onOffers}
        active={offersActive}
        title={t("railOffersTitle")}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
        }
      />

      {next && (
        <RailButton
          label={next.short}
          onClick={() => onLevel(nextIndex)}
          disabled={floorsDisabled}
          title={t("goToLevel", { level: next.label[locale].toLowerCase() })}
          icon={
            // Stairs, mirrored when the next stop is downward, so the icon
            // says which way you're about to travel.
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              style={goingDown ? { transform: "scaleX(-1)" } : undefined}
            >
              <polyline points="3 20 8 20 8 15 13 15 13 10 18 10 18 5 21 5" />
            </svg>
          }
        />
      )}

      {/* Moved here from the ⋯ menu, which is gone. It is the last item
          because it acts on the visit as a whole rather than on anything in
          it — the others all change what is on screen. */}
      <ShareRailButton />

      {/* Collapse — the rail is a sizeable slab over the scene, and the visit
          is the thing worth looking at. */}
      <button
        onClick={() => setCollapsed(true)}
        aria-label={t("railCollapse")}
        aria-expanded
        className="rail-divide py-2 grid place-items-center text-on-brass hover:bg-black/10 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
    </div>
  );
}

/**
 * Share, on the rail.
 *
 * It owns its own "copied" state rather than taking it from SideRail: nothing
 * else on the rail cares, and the feedback is over in two seconds. `shareTour`
 * opens the OS sheet where there is one and falls back to the clipboard, which
 * is the only case worth saying anything about — an OS sheet announces itself.
 */
function ShareRailButton() {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const share = () => {
    void shareTour().then((result) => {
      if (result !== "copied") return;
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <RailButton
      label={copied ? t("railShareCopied") : t("railShare")}
      onClick={share}
      // The full sentence lives in the tooltip, where width is free.
      title={t("shareTour")}
      active={copied}
      icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /></svg>
      }
    />
  );
}

function RailButton({
  label,
  icon,
  onClick,
  disabled,
  active,
  title,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) {
  const press = usePress(onClick);
  return (
    <button
      {...press}
      disabled={disabled}
      title={title}
      // 72px, not 62: the labels are words now, not codes, and the longest of
      // them ("BOUTIQUES") runs ~67px at 8.5px with its tracking. A rail sized
      // to the English would clip the French.
      // Inverted: the slab is brass, so the content is the dark ink that reads
      // on it. `--on-brass` rather than a literal — it flips with the theme,
      // which a hardcoded near-black would not.
      //
      // Full opacity in the resting state, not the 75% that reads as "quieter".
      // Dark ink at 75% over brass blends to roughly #3a3227, which is 3.9:1
      // against the slab — under the 4.5:1 needed for 8.5px labels. At full
      // strength it is 6.4:1. Hierarchy comes from the BACKGROUND instead:
      // active is a darkened patch of the same brass, since on a brass field
      // there is no second accent colour left to promote.
      className={`rail-btn w-[72px] flex flex-col items-center gap-1.5 text-on-brass transition-colors ${
        disabled
          ? "opacity-35 cursor-not-allowed"
          : active
          ? "bg-black/20"
          : "hover:bg-black/10"
      }`}
    >
      {icon}
      <span className="text-[8.5px] font-semibold uppercase tracking-[0.12em]">
        {label}
      </span>
    </button>
  );
}

