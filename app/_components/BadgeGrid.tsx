"use client";

import { useGame } from "./GameStateProvider";
import { BADGES } from "@/app/_lib/rewards-data";

const BADGE_EMOJI: Record<string, string> = {
  explorer: "🧭",
  "grand-explorer": "🗺️",
  apprentice: "📖",
  quizmaster: "🏆",
  scholar: "🎓",
  champion: "👑",
};

export function BadgeGrid() {
  const { progress } = useGame();
  const unlockedCount = progress.unlockedBadges.length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-[26px] leading-none text-ink">Badges</h2>
        <span className="text-[11px] text-ink-3 leading-none tabular-nums">
          {unlockedCount} / {BADGES.length} débloqués
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {BADGES.map((badge) => {
          const unlocked = progress.unlockedBadges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`p-[18px] rounded-xl border flex flex-col gap-2.5 transition-colors ${
                unlocked
                  ? "border-brass-line bg-brass-soft"
                  : "border-line bg-card"
              }`}
            >
              <div
                className={`w-[34px] h-[34px] rounded-full grid place-items-center border ${
                  unlocked
                    ? "border-brass-line bg-brass-soft"
                    : "border-line bg-surface-2"
                }`}
              >
                {unlocked ? (
                  <span className="text-[15px] leading-none">
                    {BADGE_EMOJI[badge.id] || badge.icon}
                  </span>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-3">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </div>

              <span
                className={`text-[12.5px] font-semibold leading-[1.2] ${
                  unlocked ? "text-ink" : "text-ink-2"
                }`}
              >
                {badge.name}
              </span>
              <span className="text-[10.5px] leading-[1.4] text-ink-3 text-pretty">
                {badge.description}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
