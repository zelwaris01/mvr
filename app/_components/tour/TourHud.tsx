"use client";

import { useGame } from "@/app/_components/GameStateProvider";
import { ProgressRing } from "@/app/_components/ProgressRing";
import { StoreLogo } from "@/app/_components/StoreLogo";
import { useTheme } from "@/app/_lib/useTheme";
import type { DiscoveredStore } from "@/app/_lib/roster";

/* ══════════════════════════════════════════
   Top bar — wordmark, XP, theme
   ══════════════════════════════════════════ */

export function TourTopBar() {
  const { toggle } = useTheme();

  return (
    <div className="absolute top-0 inset-x-0 flex items-start justify-between gap-4 p-4 md:p-5">
      <div className="hud-on flex items-baseline gap-2.5 select-none">
        <span className="font-display text-2xl text-ink tracking-[0.04em] leading-none">
          Meridian
        </span>
        <span className="hidden sm:inline text-ink-3 text-[10px] uppercase tracking-[0.18em]">
          Anfa Place
        </span>
      </div>

      <div className="flex items-center gap-2">
        <XpPill />
        <button
          onClick={toggle}
          aria-label="Changer le thème"
          className="hud-on w-9 h-9 rounded-full pane flex items-center justify-center text-ink-3 hover:text-brass hover:border-brass-line transition-colors"
        >
          <svg className="theme-icon-sun" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          <svg className="theme-icon-moon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
        </button>
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
   Side rail — MAP / BADGE
   ══════════════════════════════════════════ */

export function SideRail({
  onMap,
  onBadges,
  mapDisabled,
  mapActive,
}: {
  onMap: () => void;
  onBadges: () => void;
  mapDisabled: boolean;
  mapActive: boolean;
}) {
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
    </div>
  );
}

function RailButton({
  label,
  icon,
  onClick,
  disabled,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
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
  onSelect,
  connecting,
}: {
  stores: DiscoveredStore[];
  activeSlug: string | null;
  flyingSlug: string | null;
  doneSlugs: Set<string>;
  onSelect: (slug: string) => void;
  connecting: boolean;
}) {
  const { progress } = useGame();
  const captured = stores.filter((s) =>
    progress.exploredStores.includes(s.slug)
  ).length;

  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2.5 p-4 safe-area-pb">
      <div className="hud-on flex items-center gap-3 px-4 py-2 rounded-full pane">
        <span className="w-1.5 h-1.5 rounded-full bg-brass flex-shrink-0" />
        <span className="text-[11px] text-ink-2 leading-none">
          Cliquez un repère doré dans la visite
        </span>
        {stores.length > 0 && (
          <>
            <span className="w-px h-3 bg-line" />
            <span className="text-[11px] text-ink-3 leading-none tabular-nums">
              {captured}/{stores.length} capturés
            </span>
          </>
        )}
      </div>

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
              const visited = progress.exploredStores.includes(store.slug);
              const done = doneSlugs.has(store.slug);
              const isFlying = flyingSlug === store.slug;
              return (
                <button
                  key={store.slug}
                  onClick={() => onSelect(store.slug)}
                  disabled={flyingSlug !== null}
                  aria-busy={isFlying}
                  className={`flex-shrink-0 flex items-center gap-2.5 pl-2 pr-3.5 py-2 rounded-xl pane transition-all duration-200 disabled:cursor-not-allowed ${
                    activeSlug === store.slug
                      ? "border-brass-line bg-brass-soft"
                      : "hover:border-brass-line"
                  } ${flyingSlug !== null && !isFlying ? "opacity-45" : ""}`}
                >
                  <StoreLogo slug={store.slug} name={store.name} size={34} />
                  <span className="flex flex-col gap-1 items-start min-w-0">
                    <span className="text-[11.5px] font-semibold text-ink leading-none truncate max-w-[110px]">
                      {store.name}
                    </span>
                    <span className="flex items-center gap-1">
                      {store.questions.map((q) => (
                        <span
                          key={q.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            done
                              ? "bg-jade"
                              : visited
                              ? "bg-brass"
                              : "bg-line-strong"
                          }`}
                        />
                      ))}
                    </span>
                  </span>
                </button>
              );
            })}
      </div>
    </div>
  );
}
