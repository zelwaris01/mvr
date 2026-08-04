"use client";

import { useGame } from "./GameStateProvider";

export function LevelBar() {
  const { progress, level, nextLevel, levelProgress } = useGame();

  return (
    <div className="bg-surface-1 border border-line rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-brass flex items-center justify-center">
            <span className="text-white font-display font-extrabold text-2xl tabular-nums">{level.level}</span>
          </div>
          <div>
            <p className="text-[9px] text-ink-3 uppercase tracking-[0.15em]">Niveau</p>
            <p className="text-lg font-display font-bold text-ink">{level.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-brass font-display font-extrabold text-2xl tabular-nums">{progress.totalXp}</p>
          <p className="text-[9px] text-ink-3">
            {nextLevel ? `prochain : ${nextLevel.minXp} XP` : "Niveau max atteint"}
          </p>
        </div>
      </div>
      <div className="w-full h-2.5 bg-surface-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-brass animate-fill-bar"
          style={{ width: `${levelProgress}%` }}
        />
      </div>
    </div>
  );
}
