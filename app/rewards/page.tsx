"use client";

import { useGame } from "@/app/_components/GameStateProvider";
import { LevelBar } from "@/app/_components/LevelBar";
import { BadgeGrid } from "@/app/_components/BadgeGrid";
import { RewardList } from "@/app/_components/RewardList";
import { SectionTitle } from "@/app/_components/SectionTitle";
import { TOTAL_QUESTIONS, TOTAL_STORES } from "@/app/_lib/constants";
import { useState } from "react";

export default function RewardsPage() {
  const { progress, isHydrated, reset } = useGame();
  const [showConfirm, setShowConfirm] = useState(false);

  const storesExplored = progress.exploredStores.length;
  const totalAnswered = Object.keys(progress.answeredQuestions).length;
  const totalCorrect = Object.values(progress.answeredQuestions).filter(
    (a) => a.isCorrect
  ).length;

  if (!isHydrated) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-4">
        <div className="h-6 w-32 bg-surface-1 rounded animate-pulse" />
        <div className="h-32 rounded-2xl bg-surface-1 animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-surface-1 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { value: storesExplored, total: TOTAL_STORES, label: "Boutiques visitées", color: "brass" as const },
    { value: totalAnswered, total: TOTAL_QUESTIONS, label: "Questions répondues", color: "ink" as const },
    { value: totalCorrect, total: totalAnswered || 1, label: "Bonnes réponses", color: "jade" as const },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-7 animate-fade-up">
      <SectionTitle>Mon Profil</SectionTitle>

      <LevelBar />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-1 border border-line rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold tabular-nums ${
              stat.color === "brass" ? "text-brass" : stat.color === "jade" ? "text-jade" : "text-ink"
            }`}>
              {stat.value}
              <span className="text-ink-3 text-sm font-medium tabular-nums">/{stat.total}</span>
            </p>
            <p className="text-[8px] text-ink-3 uppercase tracking-wider mt-1.5">{stat.label}</p>
            <div className="w-full h-1 bg-surface-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  stat.color === "brass" ? "bg-brass" : stat.color === "jade" ? "bg-jade" : "bg-ink-3"
                }`}
                style={{ width: `${(stat.value / stat.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Completion banner */}
      {progress.completedAt && (
        <div className="bg-brass rounded-2xl p-6 md:p-8 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-white font-bold text-xl md:text-2xl mb-1">
            Parcours terminé !
          </p>
          <p className="text-white/70 text-sm">
            Félicitations, vous avez complété toutes les questions du Mall Quest !
          </p>
        </div>
      )}

      <BadgeGrid />
      <RewardList />

      {/* Reset */}
      <div className="border-t border-line pt-8 pb-4">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-3 rounded-xl border border-line text-ink-3 text-xs uppercase tracking-wider hover:border-clay/30 hover:text-clay transition-colors"
          >
            Réinitialiser la progression
          </button>
        ) : (
          <div className="bg-surface-1 border border-line rounded-xl p-6 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-clay-soft border border-clay/20 flex items-center justify-center mx-auto">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-clay">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
              </svg>
            </div>
            <p className="text-sm font-medium text-ink">Êtes-vous sûr ? Toute votre progression sera effacée.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2.5 rounded-full bg-surface-2 border border-line text-sm font-medium hover:border-line-strong transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => { reset(); setShowConfirm(false); }}
                className="px-6 py-2.5 rounded-full bg-clay text-white font-bold text-sm hover:bg-clay/90 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
