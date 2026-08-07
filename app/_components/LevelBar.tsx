"use client";

import { useGame } from "./GameStateProvider";
import { ProgressRing } from "./ProgressRing";

/** The membership card — Meridian's tier panel, driven by XP level. */
export function LevelBar() {
  const { progress, level, nextLevel, levelProgress } = useGame();

  return (
    <div className="p-7 rounded-[14px] border border-brass-line bg-[linear-gradient(160deg,var(--brass-soft),transparent)] flex flex-col items-center gap-5">
      <ProgressRing pct={levelProgress} size={132} thickness={10}>
        <div className="w-[74px] h-[74px] rounded-full bg-[linear-gradient(135deg,var(--surface-2),var(--surface-1))] grid place-items-center">
          <span className="font-display text-[34px] leading-none text-brass tabular-nums">
            {level.level}
          </span>
        </div>
      </ProgressRing>

      <div className="flex flex-col items-center gap-2">
        <span className="font-display text-[30px] leading-none text-ink">
          {level.label}
        </span>
        <span className="eyebrow">
          Niveau {level.level} · {progress.totalXp} XP
        </span>
      </div>

      <div className="w-full flex flex-col gap-2">
        <div className="h-1 rounded-full bg-line overflow-hidden">
          <div
            className="h-full bg-brass animate-fill-bar"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] leading-none text-ink-3 tabular-nums">
          <span>{progress.totalXp} XP</span>
          <span>
            {nextLevel
              ? `${nextLevel.label} à ${nextLevel.minXp}`
              : "Niveau maximum"}
          </span>
        </div>
      </div>
    </div>
  );
}
