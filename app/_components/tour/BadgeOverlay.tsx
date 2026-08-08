"use client";

import { useEffect } from "react";
import { BADGES } from "@/app/_lib/rewards-data";
import { useGame } from "@/app/_components/GameStateProvider";

/**
 * The badge sheet. Mutually exclusive with the quiz drawer — only one
 * translucent surface is ever over the live scene at a time.
 */
export function BadgeOverlay({ onClose }: { onClose: () => void }) {
  const { progress } = useGame();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const unlocked = progress.unlockedBadges;

  return (
    <div className="drawer-slot">
      <aside className="drawer on-dark" role="region" aria-label="Vos badges">
        <div className="flex items-start justify-between gap-3 p-5">
          <div className="flex flex-col gap-1.5">
            <span className="eyebrow">Votre collection</span>
            <h2 className="font-display text-[24px] leading-none text-ink">
              Badges
            </h2>
            <span className="text-[11px] text-ink-3 leading-none tabular-nums">
              {unlocked.length} / {BADGES.length} débloqués
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer les badges"
            className="w-8 h-8 rounded-full grid place-items-center text-ink-3 hover:text-brass border border-line hover:border-brass-line transition-colors flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 px-5 pb-5">
          {BADGES.map((badge) => {
            const has = unlocked.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-colors ${
                  has ? "border-brass-line bg-brass-soft" : "border-line opacity-55"
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-xl grid place-items-center text-[19px] flex-shrink-0 ${
                    has ? "bg-brass-soft" : "bg-surface-2 grayscale"
                  }`}
                >
                  {badge.icon}
                </span>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[12.5px] font-semibold text-ink leading-none">
                    {badge.name}
                  </span>
                  <span className="text-[10.5px] text-ink-3 leading-snug">
                    {badge.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-auto border-t border-line p-5 text-[10.5px] leading-snug text-ink-3">
          Certains badges visent la totalité du mall — ils se débloqueront à
          mesure que de nouvelles boutiques seront balisées dans la visite.
        </p>
      </aside>
    </div>
  );
}
