"use client";

import { useEffect, useState } from "react";
import type { MallLevel } from "@/app/_lib/constants";
import { shareTour } from "@/app/_lib/share";
import { usePress } from "@/app/_lib/usePress";

/**
 * The phone tools page — everything the desktop side rail and overflow menu
 * hold, on one full-screen page behind a burger button.
 *
 * Why a page and not the rail: floating over the Matterport iframe, our
 * controls could not be tapped on touch. The compositor resolves the touch
 * region to the iframe's layer before the main thread hit-tests our buttons,
 * so links still worked (the browser follows those natively) and buttons did
 * not. `pointer-events: auto` and `touch-action: manipulation` on the overlay
 * were not enough. What does work, reliably, is any surface that *covers* the
 * iframe rather than hovering above it — the profile page, the quiz sheet —
 * so on phones the rail becomes one of those.
 *
 * The rail is unchanged on desktop, where the mouse never had this problem.
 */
export function ToolsMenu({
  onClose,
  onMap,
  mapActive,
  mapBroken,
  mapDisabled,
  onBadges,
  onOffers,
  levels,
  currentLevel,
  onLevel,
  floorsDisabled,
}: {
  onClose: () => void;
  onMap: () => void;
  mapActive: boolean;
  mapBroken: boolean;
  mapDisabled: boolean;
  onBadges: () => void;
  onOffers: () => void;
  levels: MallLevel[];
  currentLevel: number;
  onLevel: (index: number) => void;
  floorsDisabled: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Same wrap-around rule as the rail: one control that always has somewhere
  // to go, rather than a row of buttons where all but one are inert.
  const nextIndex = (currentLevel + 1) % levels.length;
  const next = levels.length > 1 ? levels[nextIndex] : null;
  const goingDown = next !== null && nextIndex < currentLevel;

  const share = () => {
    void shareTour().then((result) => {
      if (result === "copied") {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  const closePress = usePress(onClose);
  const resumePress = usePress(onClose);

  return (
    <div className="profile" role="region" aria-label="Menu de la visite">
      <button
        {...closePress}
        aria-label="Fermer le menu"
        className="fixed right-5 top-5 z-10 w-11 h-11 rounded-full pane grid place-items-center text-ink-2 hover:text-brass transition-colors safe-x"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>

      <div className="profile-sheet">
        <div className="flex items-center gap-2.5 mt-2">
          <span className="w-[3px] h-4 rounded-full bg-brass" />
          <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-2">
            Menu
          </h2>
        </div>

        {/* Dropped, not disabled, once the model has refused both dollhouse
            and floorplan — the rest of the menu still has work to do. */}
        {!mapBroken && (
          <ToolRow
            label="Plan du mall"
            hint={mapActive ? "Revenir à la visite" : "Vue d'ensemble du niveau"}
            active={mapActive}
            disabled={mapDisabled}
            // Each of these closes the page: the result of pressing them is
            // something to look at in the scene, and the page is over it.
            onClick={() => {
              onMap();
              onClose();
            }}
            icon={
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21" /><line x1="8" y1="3" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="21" /></svg>
            }
          />
        )}

        <ToolRow
          label="Mes badges"
          hint="Progression et récompenses débloquées"
          onClick={() => {
            onBadges();
            onClose();
          }}
          icon={
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 9" /></svg>
          }
        />

        <ToolRow
          label="Offres du moment"
          hint="Promotions et boutiques du mall"
          onClick={() => {
            onOffers();
            onClose();
          }}
          icon={
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
          }
        />

        {next && (
          <ToolRow
            label={`Aller au ${next.label.toLowerCase()}`}
            hint={`Niveau ${next.short}`}
            disabled={floorsDisabled}
            onClick={() => {
              onLevel(nextIndex);
              onClose();
            }}
            icon={
              <svg
                width="19"
                height="19"
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

        <ToolRow
          label={copied ? "Lien copié" : "Partager la visite"}
          hint="Envoyer ce lien à quelqu'un"
          onClick={share}
          icon={
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /></svg>
          }
        />

        <button {...resumePress} className="btn btn-ghost self-start mt-2">
          Reprendre la visite
        </button>
      </div>
    </div>
  );
}

function ToolRow({
  label,
  hint,
  icon,
  onClick,
  disabled,
  active,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  const press = usePress(onClick);
  return (
    <button
      {...press}
      disabled={disabled}
      className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors ${
        disabled
          ? "border-line opacity-40 cursor-not-allowed"
          : active
          ? "border-brass-line bg-brass-soft"
          : "border-line bg-surface-1 hover:border-brass-line hover:bg-brass-soft"
      }`}
    >
      <span
        className={`w-11 h-11 rounded-xl grid place-items-center flex-shrink-0 ${
          active ? "bg-brass text-on-brass" : "bg-brass-soft text-brass"
        }`}
      >
        {icon}
      </span>
      <span className="flex flex-col gap-1 min-w-0">
        <span className="text-[14px] font-semibold text-ink leading-none">
          {label}
        </span>
        <span className="text-[11.5px] text-ink-3 leading-snug">{hint}</span>
      </span>
      {!disabled && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-3 flex-shrink-0 ml-auto"><polyline points="9 18 15 12 9 6" /></svg>
      )}
    </button>
  );
}
