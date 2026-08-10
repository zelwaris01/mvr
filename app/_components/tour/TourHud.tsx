"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/app/_components/GameStateProvider";
import { ProgressRing } from "@/app/_components/ProgressRing";
import type { DiscoveredStore } from "@/app/_lib/roster";
import type { MallLevel } from "@/app/_lib/constants";
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
      {/* Centred only from `sm` up. Below that the wordmark (~141px at 26px)
          and the XP pill (128–149px) cannot both fit either side of centre —
          they overlap on every phone narrower than ~470px — so the wordmark
          left-aligns and shrinks instead. Keep the sm: sizes in step with
          .veil-mark or the loading hand-off will visibly jump. */}
      <div
        className={`absolute left-4 sm:left-1/2 sm:-translate-x-1/2 top-4 md:top-5 flex flex-col items-start sm:items-center gap-[3px] sm:gap-[5px] select-none pointer-events-none ${
          markVisible ? "mark-shown" : "mark-hidden"
        }`}
      >
        <span className="font-display text-[19px] sm:text-[26px] text-ink tracking-[0.05em] leading-none">
          MVR World
        </span>
        <span className="hidden sm:block text-ink-3 text-[9.5px] uppercase tracking-[0.22em] leading-none">
          Smart Mall
        </span>
      </div>

      {/* The burger is laid out beside the pill rather than positioned over
          it, so no space has to be reserved by hand. It replaces the whole
          side rail and the ⋯ menu on phones — see ToolsMenu. */}
      <div className="flex justify-end items-center gap-2">
        <XpPill onClick={onOpenRewards} />
        <BurgerButton onPress={onOpenTools} />
      </div>
    </div>
  );
}

/** Phones only: opens the tools page. Desktop keeps the rail and the ⋯ menu. */
function BurgerButton({ onPress }: { onPress: () => void }) {
  const press = usePress(onPress);
  return (
    <button
      {...press}
      aria-label="Ouvrir le menu"
      className="hud-on sm:hidden w-10 h-10 rounded-full pane grid place-items-center text-ink-2 hover:text-brass transition-colors flex-shrink-0"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
    </button>
  );
}

/**
 * Covers the player while it boots.
 *
 * Matterport paints its own loading state, logo and name in there, and none of
 * it can be restyled from outside a cross-origin iframe. Covering the load is
 * the only way to keep the first thing a visitor sees ours.
 */
export function TourVeil({
  status,
  onRetired,
}: {
  status: string;
  onRetired: () => void;
}) {
  const [gone, setGone] = useState(false);
  const leaving = status !== "connecting";

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
        <span className="font-display text-[34px] text-ink tracking-[0.05em] leading-none">
          MVR World
        </span>
        <span className="text-ink-3 text-[10px] uppercase tracking-[0.22em] leading-none">
          Smart Mall
        </span>
        <span className="veil-bar" />
      </div>
    </div>
  );
}

function XpPill({ onClick }: { onClick: () => void }) {
  const { progress, level, levelProgress, isHydrated } = useGame();
  const press = usePress(onClick);
  if (!isHydrated) return null;

  return (
    <button
      {...press}
      aria-label="Voir mes récompenses"
      title="Mes récompenses"
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
   Bottom-right menu — share, and anything that shouldn't be in the way

   Matterport's own overflow menu lives inside a cross-origin iframe, so it
   cannot be moved from out here — only hidden. This replaces it: our chrome,
   our position, and the participation form tucked inside instead of floating
   over the storefronts.
   ══════════════════════════════════════════ */

export function TourMenu() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // `true` — capture, so a click landing on the panorama closes the menu
    // before the iframe swallows the event.
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const share = async () => {
    const result = await shareTour();
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      // Desktop only. Bottom-right at chip height — the brand rail's `pr-14`
      // keeps a chip from ever scrolling underneath it. On phones this same
      // control was a floating panel over the iframe, which touch could not
      // reach; its contents live in the burger's tools page instead.
      className="hud-on hidden sm:flex absolute right-4 bottom-5 z-[12] flex-col items-end gap-2 safe-b safe-x"
    >
      {open && (
        <div className="flex flex-col rounded-xl pane overflow-hidden min-w-[190px] animate-scale-in origin-bottom-right">
          <MenuItem
            onClick={share}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /></svg>
            }
            label={copied ? "Lien copié" : "Partager la visite"}
          />
        </div>
      )}

      <MenuTrigger open={open} onPress={() => setOpen((v) => !v)} />
    </div>
  );
}

function MenuTrigger({
  open,
  onPress,
}: {
  open: boolean;
  onPress: () => void;
}) {
  const press = usePress(onPress);
  return (
    <button
      {...press}
      aria-label="Plus d'options"
      aria-expanded={open}
      className={`w-10 h-10 rounded-full pane flex items-center justify-center transition-colors ${
        open ? "text-brass border-brass-line" : "text-ink-2 hover:text-brass"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>
    </button>
  );
}

function MenuItem({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const press = usePress(onClick);
  return (
    <button
      {...press}
      className="flex items-center gap-2.5 px-3.5 py-3 min-h-[44px] text-left text-ink-2 hover:text-brass hover:bg-brass-soft transition-colors"
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-[11.5px] font-medium whitespace-nowrap">{label}</span>
    </button>
  );
}

/* ══════════════════════════════════════════
   Side rail — MAP / BADGE / OFFRES / floor

   Desktop only (`hidden sm:flex`). On phones these same actions are rows in
   the burger's full-screen tools page: floating over the Matterport iframe,
   they could not be tapped on touch. See ToolsMenu for the why.
   ══════════════════════════════════════════ */

export function SideRail({
  onMap,
  onBadges,
  onOffers,
  offersActive,
  mapBroken,
  mapDisabled,
  mapActive,
  levels,
  currentLevel,
  onLevel,
  floorsDisabled,
}: {
  onMap: () => void;
  onBadges: () => void;
  onOffers: () => void;
  offersActive: boolean;
  mapBroken: boolean;
  mapDisabled: boolean;
  mapActive: boolean;
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

  const [collapsed, setCollapsed] = useState(false);

  // z-[12]: the checkpoint layer renders after this in the DOM and both were
  // z-auto, so markers painted straight over the rail — a store plate landing
  // on the buttons made them unreadable and unclickable. Every HUD control
  // now sits above the markers, and all of them stay below the drawer (20).
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        aria-label="Afficher les outils"
        aria-expanded={false}
        className="hud-on hidden sm:grid absolute left-4 top-1/2 -translate-y-1/2 z-[12] w-11 h-11 rounded-full pane place-items-center text-ink-2 hover:text-brass transition-colors safe-x"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    );
  }

  return (
    <div className="hud-on hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-[12] flex-col rounded-2xl pane overflow-hidden safe-x">
      {/* Dropped, not disabled, once the model has refused both dollhouse and
          floorplan — the rest of the rail still has work to do. */}
      {!mapBroken && (
        <RailButton
          label="Map"
          onClick={onMap}
          disabled={mapDisabled}
          active={mapActive}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21" /><line x1="8" y1="3" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="21" /></svg>
          }
        />
      )}
      <RailButton
        label="Badge"
        onClick={onBadges}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 9" /></svg>
        }
      />
      <RailButton
        label="Offres"
        onClick={onOffers}
        active={offersActive}
        title="Offres et récompenses"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
        }
      />

      {next && (
        <RailButton
          label={next.short}
          onClick={() => onLevel(nextIndex)}
          disabled={floorsDisabled}
          title={`Aller au ${next.label}`}
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

      {/* Collapse — the rail is a sizeable slab over the scene, and the visit
          is the thing worth looking at. */}
      <button
        onClick={() => setCollapsed(true)}
        aria-label="Réduire les outils"
        aria-expanded
        className="border-t border-line py-2 grid place-items-center text-ink-3 hover:text-brass hover:bg-brass-soft transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
    </div>
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
      className={`rail-btn w-[62px] flex flex-col items-center gap-1.5 transition-colors ${
        disabled
          ? "text-ink-3 opacity-40 cursor-not-allowed"
          : active
          ? "text-brass bg-brass-soft"
          : "text-ink-2 hover:text-brass hover:bg-brass-soft"
      }`}
    >
      {icon}
      <span className="text-[8.5px] font-semibold uppercase tracking-[0.12em]">
        {label}
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════
   Brand rail — the runtime roster
   ══════════════════════════════════════════ */

export function StoreRail({
  stores,
  activeSlug,
  flyingSlug,
  doneSlugs,
  pendingXp,
  onSelect,
  connecting,
}: {
  stores: DiscoveredStore[];
  activeSlug: string | null;
  flyingSlug: string | null;
  doneSlugs: Set<string>;
  pendingXp: Map<string, number>;
  onSelect: (slug: string) => void;
  connecting: boolean;
}) {
  // The instruction pill that used to sit here is gone: the checkpoints now
  // carry a "?" glyph, the shop's name and the XP on offer, so telling people
  // to click a gold marker was restating what the markers already say.
  return (
    // pb-5, not pb-11. The larger value was set while `.safe-area-pb` was
    // silently overriding it — once the cascade bug was fixed it took effect
    // for the first time and opened a 44px void under the chips.
    <div className="absolute inset-x-0 bottom-0 z-[12] flex flex-col items-center px-4 pt-4 pb-5 safe-b safe-x">
      {/* py-2, not pb-0.5: `overflow-x: auto` forces overflow-y to auto too,
          so the scroller crops the chips' borders and shadows unless there is
          padding inside it to sit in. */}
      <div className="hud-on rail flex gap-2 max-w-full overflow-x-auto hide-scrollbar pl-1 pr-14 py-2">
        {connecting && stores.length === 0
          ? // Skeletons at the real chip size so the rail doesn't jump when
            // the roster lands under a thumb already reaching for it.
            Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="w-[120px] h-[52px] rounded-xl pane opacity-40 flex-shrink-0"
              />
            ))
          : stores.map((store) => {
              const done = doneSlugs.has(store.slug);
              const isFlying = flyingSlug === store.slug;
              const xp = pendingXp.get(store.slug) ?? 0;
              return (
                <button
                  key={store.slug}
                  onClick={() => onSelect(store.slug)}
                  disabled={flyingSlug !== null}
                  aria-busy={isFlying}
                  className={`min-w-[168px] flex-shrink-0 flex items-center gap-2.5 p-2.5 rounded-[10px] pane transition-all duration-200 disabled:cursor-not-allowed ${
                    activeSlug === store.slug
                      ? "border-brass-line bg-brass-soft"
                      : "hover:border-brass-line"
                  } ${flyingSlug !== null && !isFlying ? "opacity-45" : ""}`}
                >
                  <span className="relative w-[38px] h-[38px] rounded-md overflow-hidden bg-surface-2 flex-shrink-0">
                    {store.imageFromModel ? (
                      // Real brand logo from the model's pin. Plain <img>
                      // because the Matterport CDN host isn't in
                      // next.config's remotePatterns; object-contain because
                      // a logo cropped to fill is a mangled logo.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={store.image}
                        alt=""
                        className="w-full h-full object-contain bg-surface-1"
                      />
                    ) : (
                      <Image
                        src={store.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="38px"
                      />
                    )}
                  </span>
                  <span className="flex flex-col gap-1 items-start min-w-0">
                    <span className="text-[12px] font-semibold text-ink leading-none truncate max-w-[104px]">
                      {store.name}
                    </span>
                    <span
                      className={`text-[10px] leading-none tabular-nums ${
                        done ? "text-jade" : "text-ink-3"
                      }`}
                    >
                      {done ? "Terminé" : `+${xp} XP`}
                    </span>
                  </span>
                </button>
              );
            })}
      </div>
    </div>
  );
}
