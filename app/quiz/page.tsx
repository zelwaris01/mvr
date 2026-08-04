"use client";

import Link from "next/link";
import { STORES } from "@/app/_lib/stores-data";
import { QUESTIONS } from "@/app/_lib/questions-data";
import { useGame } from "@/app/_components/GameStateProvider";
import { SectionTitle } from "@/app/_components/SectionTitle";
import { StoreLogo } from "@/app/_components/StoreLogo";
import { TOTAL_QUESTIONS } from "@/app/_lib/constants";

export default function QuizHubPage() {
  const { progress, isHydrated } = useGame();

  const totalAnswered = Object.keys(progress.answeredQuestions).length;
  const totalCorrect = Object.values(progress.answeredQuestions).filter(
    (a) => a.isCorrect
  ).length;

  const storeQuizzes = STORES.map((store) => {
    const questions = QUESTIONS.filter((q) => q.storeSlug === store.slug);
    const answered = questions.filter(
      (q) => progress.answeredQuestions[q.id]
    ).length;
    const correct = questions.filter(
      (q) => progress.answeredQuestions[q.id]?.isCorrect
    ).length;
    return { store, questions, answered, correct, total: questions.length, completed: answered === questions.length };
  }).filter((sq) => sq.total > 0);

  if (!isHydrated) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-4">
        <div className="h-6 w-48 bg-surface-1 rounded animate-pulse" />
        <div className="h-28 rounded-2xl bg-surface-1 animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface-1 animate-pulse" />
        ))}
      </div>
    );
  }

  const pct = Math.round((totalAnswered / TOTAL_QUESTIONS) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6 animate-fade-up">
      <SectionTitle>Défis & Questions</SectionTitle>

      {/* Overall progress card */}
      <div className="bg-surface-1 border border-line rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-black tabular-nums">
              {totalAnswered} <span className="text-ink-3 text-base font-medium tabular-nums">/ {TOTAL_QUESTIONS}</span>
            </p>
            <p className="text-[11px] text-ink-2 mt-0.5">
              questions répondues · <span className="text-brass tabular-nums">{totalCorrect} correctes</span>
            </p>
          </div>
          {/* Circular progress */}
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--surface-2)" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.5" fill="none" stroke="var(--brass)" strokeWidth="2.5"
                strokeDasharray={`${pct} 100`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-brass font-black text-sm tabular-nums">{pct}%</span>
            </div>
          </div>
        </div>
        <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-brass rounded-full transition-all duration-700 relative"
            style={{ width: `${pct}%` }}
          >
            <div className="absolute right-0 top-0 w-2 h-full bg-white/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Store quiz list */}
      <div className="space-y-2.5">
        {storeQuizzes.map(({ store, answered, correct, total, completed }) => (
          <Link
            key={store.slug}
            href={`/quiz/${store.slug}`}
            className={`group flex items-center gap-4 bg-surface-1 border border-line rounded-xl p-4 transition-all hover:border-brass/30 ${
              completed ? "border-jade/20" : ""
            }`}
          >
            {/* Store logo */}
            <StoreLogo
              slug={store.slug}
              name={store.name}
              size={48}
              className={completed ? "!border-jade/20 !bg-jade-soft" : ""}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm">{store.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] text-ink-3 tabular-nums">
                  {total} question{total > 1 ? "s" : ""}
                </p>
                <span className="text-ink-3">·</span>
                <p className={`text-[10px] font-medium tabular-nums ${completed ? "text-jade" : answered > 0 ? "text-brass" : "text-ink-3"}`}>
                  {completed
                    ? `${correct}/${total} correctes`
                    : answered > 0
                    ? `${answered}/${total} répondues`
                    : "Non commencé"}
                </p>
              </div>
              {/* Mini progress */}
              {total > 0 && (
                <div className="flex gap-0.5 mt-2">
                  {Array.from({ length: total }).map((_, i) => {
                    const q = QUESTIONS.filter((q) => q.storeSlug === store.slug)[i];
                    const answer = q ? progress.answeredQuestions[q.id] : null;
                    return (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          answer
                            ? answer.isCorrect ? "bg-jade" : "bg-clay"
                            : "bg-surface-2"
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Arrow / check */}
            <div className="flex-shrink-0">
              {completed ? (
                <div className="w-8 h-8 rounded-full bg-jade-soft border border-jade/20 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-jade">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-brass-soft border border-brass/10 flex items-center justify-center group-hover:border-brass/25 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brass group-hover:text-brass transition-colors">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
