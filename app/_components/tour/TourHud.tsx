"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/app/_components/GameStateProvider";
import { ProgressRing } from "@/app/_components/ProgressRing";
import type { DiscoveredStore } from "@/app/_lib/roster";
import type { MallLevel } from "@/app/_lib/constants";

/* ══════════════════════════════════════════
   Top bar — wordmark and XP
   ══════════════════════════════════════════ */

export function TourTopBar({ markVisible }: { markVisible: boolean }) {
  return (
    <div className="absolute top-0 inset-x-0 p-4 md:p-5">
      {/* Centred on the viewport, not on the space left over beside the XP
          pill — so the wordmark stays optically centred whatever the pill's
          width does as the level label changes. This is also the landing spot
          the veil's wordmark flies to; keep the sizes in sync with .veil-mark
          or the hand-off will visibly jump. */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-4 md:top-5 flex flex-col items-center gap-[5px] select-none pointer-events-none ${
          markVisible ? "mark-shown" : "mark-hidden"
        }`}
      >
        <span className="font-display text-[26px] text-ink tracking-[0.05em] leading-none">
          MVR World
        </span>
        <span className="text-ink-3 text-[9.5px] uppercase tracking-[0.22em] leading-none">
          Anfa Place
        </span>
      </div>

      <div className="flex justify-end">
        <XpPill />
      </div>
    </div>
  );
}

/**
 * Covers the player while it boots.
 *
 * Matterport paints its own loading state, logo and name in there, and none of
 * it can be restyled from outside a cross-origin iframe. Covering the load is
 * the only way to keep the first thing a visitor sees ours.
 */
export function TourVeil({ leaving }: { leaving: boolean }) {
  return (
    <div className={`tour-veil ${leaving ? "tour-veil-out" : ""}`} aria-hidden>
      <div className="veil-mark">
        <span className="font-display text-[34px] text-ink tracking-[0.05em] leading-none">
          MVR World
        </span>
        <span className="text-ink-3 text-[10px] uppercase tracking-[0.22em] leading-none">
          Anfa Place
        </span>
        <span className="veil-bar" />
      </div>
    </div>
  );
}

function XpPill() {
  const { progress, level, levelProgress, isHydrated } = useGame();
  if (!isHydrated) return null;

  return (
    <div className="hud-on flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full pane">
      <ProgressRing pct={levelProgress} size={34} thickness={4} label={`${level.level}`} />
      <div className="flex flex-col gap-1">
        <span className="text-ink text-[13px] font-semibold leading-none tabular-nums">
          {progress.totalXp} XP
        </span>
        <span className="text-brass text-[9px] font-medium uppercase tracking-[0.14em] leading-none">
          {level.label}
        </span>
      </div>
    </div>
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
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "MVR World — Anfa Place", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Cancelled share or denied clipboard — nothing to report.
    }
    setOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      className="hud-on absolute right-4 bottom-4 flex flex-col items-end gap-2 safe-area-pb"
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

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Plus d'options"
        aria-expanded={open}
        className={`w-10 h-10 rounded-full pane flex items-center justify-center transition-colors ${
          open ? "text-brass border-brass-line" : "text-ink-2 hover:text-brass"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>
      </button>
    </div>
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
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3.5 py-2.5 text-left text-ink-2 hover:text-brass hover:bg-brass-soft transition-colors"
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-[11.5px] font-medium whitespace-nowrap">{label}</span>
    </button>
  );
}

/* ══════════════════════════════════════════
   Side rail — MAP / BADGE
   ══════════════════════════════════════════ */

export function SideRail({
  onMap,
  onBadges,
  mapDisabled,
  mapActive,
  levels,
  currentLevel,
  onLevel,
  floorsDisabled,
}: {
  onMap: () => void;
  onBadges: () => void;
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

  return (
    <div className="hud-on absolute left-4 top-1/2 -translate-y-1/2 flex flex-col rounded-2xl pane overflow-hidden">
      <RailButton
        label="Map"
        onClick={onMap}
        disabled={mapDisabled}
        active={mapActive}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21" /><line x1="8" y1="3" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="21" /></svg>
        }
      />
      <RailButton
        label="Badge"
        onClick={onBadges}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 9" /></svg>
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
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-[62px] py-3.5 flex flex-col items-center gap-1.5 transition-colors ${
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
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center p-4 safe-area-pb">
      <div className="hud-on rail flex gap-2 max-w-full overflow-x-auto hide-scrollbar px-1 pb-0.5">
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
