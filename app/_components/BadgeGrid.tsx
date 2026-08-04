"use client";

import { useGame } from "./GameStateProvider";
import { BADGES } from "@/app/_lib/rewards-data";
import { SectionTitle } from "./SectionTitle";

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

  return (
    <div>
      <SectionTitle className="mb-3">Vos Badges</SectionTitle>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {BADGES.map((badge) => {
          const unlocked = progress.unlockedBadges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`relative rounded-xl p-3 flex flex-col items-center gap-2 border-2 transition-all ${
                unlocked
                  ? "border-brass bg-brass-soft"
                  : "border-line bg-surface-1"
              }`}
            >
              {/* Icon circle */}
              <div className={`w-11 h-11 rounded-full flex items-center justify-center border ${
                unlocked
                  ? "bg-brass/10 border-brass/30"
                  : "bg-surface-2 border-line-strong"
              }`}>
                <span className="text-xl">{BADGE_EMOJI[badge.id] || badge.icon}</span>
              </div>

              {/* Lock for locked badges — visible, not hidden */}
              {!unlocked && (
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-surface-2 border border-line-strong flex items-center justify-center">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ink-3">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              )}

              {/* Label — always readable */}
              <div className="text-center">
                <span className={`text-[8px] font-bold leading-tight block ${
                  unlocked ? "text-brass" : "text-ink-2"
                }`}>
                  {badge.name}
                </span>
                <span className="text-[7px] text-ink-3 leading-tight block mt-0.5">
                  {badge.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
