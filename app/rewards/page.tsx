"use client";

import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/app/_components/GameStateProvider";
import { LevelBar } from "@/app/_components/LevelBar";
import { BadgeGrid } from "@/app/_components/BadgeGrid";
import { RewardList } from "@/app/_components/RewardList";
import { QUESTIONS } from "@/app/_lib/questions-data";
import { STORES } from "@/app/_lib/stores-data";
import { BADGES } from "@/app/_lib/rewards-data";
import { TOTAL_QUESTIONS, TOTAL_STORES } from "@/app/_lib/constants";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function RewardsPage() {
  const { progress, isHydrated, reset } = useGame();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isHydrated) {
    return (
      <div className="max-w-[1240px] mx-auto px-5 md:px-[34px] pt-10 md:pt-14 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-9">
        <div className="h-[380px] rounded-[14px] bg-surface-1 animate-pulse" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-40 bg-surface-1 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-surface-1 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const answeredEntries = Object.entries(progress.answeredQuestions)
    .map(([id, record]) => {
      const question = QUESTIONS.find((q) => q.id === id);
      const store = STORES.find((s) => s.slug === question?.storeSlug);
      return { id, record, question, store };
    })
    .filter((e) => e.question)
    .sort((a, b) => b.record.answeredAt - a.record.answeredAt)
    .slice(0, 6);

  const seasonStats = [
    { k: "Boutiques visitées", v: `${progress.exploredStores.length} / ${TOTAL_STORES}` },
    {
      k: "Questions répondues",
      v: `${Object.keys(progress.answeredQuestions).length} / ${TOTAL_QUESTIONS}`,
    },
    {
      k: "Bonnes réponses",
      v: String(
        Object.values(progress.answeredQuestions).filter((a) => a.isCorrect).length
      ),
    },
    { k: "Badges débloqués", v: `${progress.unlockedBadges.length} / ${BADGES.length}` },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-5 md:px-[34px] pt-10 md:pt-14 pb-16 md:pb-24 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 lg:gap-[38px] items-start">
        {/* ════ Membership column ════ */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <LevelBar />

          <div className="card p-5 flex flex-col gap-3.5">
            <span className="eyebrow eyebrow-muted">Cette saison</span>
            {seasonStats.map((row) => (
              <div key={row.k} className="flex justify-between text-[12.5px]">
                <span className="text-ink-3">{row.k}</span>
                <span className="text-ink tabular-nums">{row.v}</span>
              </div>
            ))}
          </div>

          {progress.completedAt && (
            <div className="p-5 rounded-xl border border-brass-line bg-[linear-gradient(150deg,var(--brass-soft),transparent)] flex flex-col gap-2">
              <span className="eyebrow">Parcours terminé</span>
              <span className="font-display text-[21px] leading-[1.2] text-ink">
                Vous avez répondu aux douze questions du mall
              </span>
              <span className="text-[11px] leading-[1.5] text-ink-3">
                Terminé le {dateFmt.format(new Date(progress.completedAt))}
              </span>
            </div>
          )}
        </aside>

        {/* ════ Content column ════ */}
        <div className="flex flex-col gap-9 md:gap-[34px]">
          <BadgeGrid />
          <RewardList />

          {/* ── Activity ── */}
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-[26px] leading-none text-ink">Activité</h2>

            {answeredEntries.length === 0 ? (
              <div className="card p-8 flex flex-col items-center gap-4 text-center">
                <p className="text-[12.5px] leading-[1.7] text-ink-2 max-w-sm text-pretty">
                  Rien à afficher pour l&apos;instant. Visitez une boutique ou
                  répondez à une question pour lancer votre parcours.
                </p>
                <div className="flex flex-wrap gap-2.5 justify-center">
                  <Link href="/quiz" className="btn btn-fill">
                    Commencer un défi
                  </Link>
                  <Link href="/stores" className="btn btn-ghost">
                    Voir les boutiques
                  </Link>
                </div>
              </div>
            ) : (
              <div className="border border-line rounded-xl overflow-hidden">
                {answeredEntries.map(({ id, record, question, store }) => (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-4 px-5 py-4 border-b border-line last:border-b-0"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[12.5px] font-semibold text-ink leading-none truncate">
                        {store?.name ?? "Mall"} — {question?.questionText}
                      </span>
                      <span className="text-[10.5px] text-ink-3 leading-none">
                        {dateFmt.format(new Date(record.answeredAt))}
                      </span>
                    </div>
                    <span
                      className={`text-[12.5px] font-semibold leading-none tabular-nums flex-shrink-0 ${
                        record.isCorrect ? "text-brass" : "text-ink-3"
                      }`}
                    >
                      {record.isCorrect ? "+50 XP" : "0 XP"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Reset ── */}
          <section className="border-t border-line pt-7">
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-3 hover:text-clay transition-colors"
              >
                Réinitialiser ma progression
              </button>
            ) : (
              <div className="card p-6 flex flex-wrap items-center justify-between gap-5 !border-clay/30">
                <div className="flex flex-col gap-1.5">
                  <span className="font-display text-[19px] leading-none text-ink">
                    Effacer toute votre progression ?
                  </span>
                  <span className="text-[11.5px] text-ink-3">
                    XP, badges, récompenses et boutiques visitées. Irréversible.
                  </span>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="btn btn-ghost"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      reset();
                      setShowConfirm(false);
                    }}
                    className="btn bg-clay text-white hover:opacity-90"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
