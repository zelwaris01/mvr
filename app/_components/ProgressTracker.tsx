"use client";

import { useGame } from "./GameStateProvider";
import { SectionTitle } from "./SectionTitle";
import { TOTAL_QUESTIONS, TOTAL_STORES } from "@/app/_lib/constants";

export function ProgressTracker() {
  const { progress, level, levelProgress, nextLevel } = useGame();

  const storesExplored = progress.exploredStores.length;
  const correctAnswers = Object.values(progress.answeredQuestions).filter(
    (a) => a.isCorrect
  ).length;

  return (
    <div className="space-y-4">
      <SectionTitle>Votre Parcours</SectionTitle>

      {/* Level card */}
      <div className="bg-surface-1 border border-line rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brass flex items-center justify-center">
              <span className="text-white font-bold text-lg tabular-nums">{level.level}</span>
            </div>
            <div>
              <p className="text-ink-3 text-[10px] uppercase tracking-wider">Niveau</p>
              <p className="text-sm font-bold text-ink">{level.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-brass font-display font-extrabold text-xl tabular-nums">{progress.totalXp}</p>
            <p className="text-ink-3 text-[10px]">
              {nextLevel ? `${nextLevel.minXp} XP prochain` : "Niveau max"}
            </p>
          </div>
        </div>
        <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-brass animate-fill-bar"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: progress.totalXp, label: "Points XP", accent: true },
          { value: `${storesExplored}/${TOTAL_STORES}`, label: "Boutiques", accent: false },
          { value: `${correctAnswers}/${TOTAL_QUESTIONS}`, label: "Bonnes rép.", accent: false },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-1 border border-line rounded-xl p-3 text-center"
          >
            <p className={`text-lg font-display font-extrabold tabular-nums ${stat.accent ? "text-brass" : "text-ink"}`}>
              {stat.value}
            </p>
            <p className="text-[8px] text-ink-3 uppercase tracking-wider mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
