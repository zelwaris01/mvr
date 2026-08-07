"use client";

import Link from "next/link";
import { STORES } from "@/app/_lib/stores-data";
import { QUESTIONS } from "@/app/_lib/questions-data";
import { useGame } from "@/app/_components/GameStateProvider";
import { SectionTitle } from "@/app/_components/SectionTitle";
import { StoreLogo } from "@/app/_components/StoreLogo";
import { ProgressRing } from "@/app/_components/ProgressRing";
import { TOTAL_QUESTIONS } from "@/app/_lib/constants";

export default function QuizHubPage() {
  const { progress, isHydrated, level } = useGame();

  const totalAnswered = Object.keys(progress.answeredQuestions).length;
  const totalCorrect = Object.values(progress.answeredQuestions).filter(
    (a) => a.isCorrect
  ).length;

  const storeQuizzes = STORES.map((store) => {
    const questions = QUESTIONS.filter((q) => q.storeSlug === store.slug);
    const answered = questions.filter((q) => progress.answeredQuestions[q.id]).length;
    const correct = questions.filter(
      (q) => progress.answeredQuestions[q.id]?.isCorrect
    ).length;
    return {
      store,
      questions,
      answered,
      correct,
      total: questions.length,
      completed: questions.length > 0 && answered === questions.length,
    };
  }).filter((sq) => sq.total > 0);

  if (!isHydrated) {
    return (
      <div className="max-w-[1100px] mx-auto px-5 md:px-[34px] pt-10 md:pt-14 space-y-5">
        <div className="h-10 w-72 bg-surface-1 rounded animate-pulse" />
        <div className="h-28 rounded-xl bg-surface-1 animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[72px] rounded-xl bg-surface-1 animate-pulse" />
        ))}
      </div>
    );
  }

  const pct = Math.round((totalAnswered / TOTAL_QUESTIONS) * 100);

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-[34px] pt-10 md:pt-14 pb-16 md:pb-24 flex flex-col gap-7 md:gap-[30px] animate-fade-up">
      <SectionTitle
        eyebrow={`Saison 1 · ${TOTAL_QUESTIONS} questions`}
        action={
          <div className="flex items-center gap-4">
            <ProgressRing pct={pct} size={54} thickness={6} />
            <div className="flex flex-col gap-1.5">
              <span className="font-display text-[24px] leading-none text-ink tabular-nums">
                {totalAnswered}
                <span className="text-ink-3">/{TOTAL_QUESTIONS}</span>
              </span>
              <span className="text-[10.5px] text-ink-3 leading-none">
                {totalCorrect} bonnes réponses · {level.label}
              </span>
            </div>
          </div>
        }
      >
        Les défis du mall
      </SectionTitle>

      {/* ── Quiz list — the Meridian leaderboard table ── */}
      <div className="border border-line rounded-xl overflow-hidden">
        {storeQuizzes.map(({ store, answered, correct, total, completed }, i) => (
          <Link
            key={store.slug}
            href={`/quiz/${store.slug}`}
            className="group grid grid-cols-[28px_40px_1fr_auto] md:grid-cols-[40px_44px_1fr_150px_110px_36px] items-center gap-3 md:gap-4 px-4 md:px-[22px] py-4 border-b border-line last:border-b-0 hover:bg-brass-soft transition-colors"
          >
            <span className="font-display text-[17px] leading-none text-ink-3 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>

            <StoreLogo
              slug={store.slug}
              name={store.name}
              size={40}
              variant={completed ? "outline" : "fill"}
            />

            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="text-[13px] font-semibold text-ink leading-none truncate">
                {store.name}
              </span>
              <span className="text-[10.5px] text-ink-3 leading-none truncate">
                {store.category} · {total} question{total > 1 ? "s" : ""}
              </span>
            </div>

            {/* Per-question ticks */}
            <div className="hidden md:flex gap-1">
              {Array.from({ length: total }).map((_, qi) => {
                const q = QUESTIONS.filter((q) => q.storeSlug === store.slug)[qi];
                const answer = q ? progress.answeredQuestions[q.id] : null;
                return (
                  <div
                    key={qi}
                    className={`h-1 flex-1 rounded-full ${
                      answer
                        ? answer.isCorrect
                          ? "bg-jade"
                          : "bg-clay"
                        : "bg-surface-2"
                    }`}
                  />
                );
              })}
            </div>

            <span
              className={`hidden md:block text-[11.5px] font-medium uppercase tracking-[0.08em] text-right tabular-nums ${
                completed ? "text-jade" : answered > 0 ? "text-brass" : "text-ink-3"
              }`}
            >
              {completed
                ? `${correct}/${total} justes`
                : answered > 0
                ? `${answered}/${total} faites`
                : `+${total * 50} XP`}
            </span>

            <span className="hidden md:grid w-[30px] h-[30px] rounded-full border border-line place-items-center text-[12px] text-ink-3 group-hover:border-brass group-hover:text-brass transition-colors">
              →
            </span>
          </Link>
        ))}
      </div>

      {/* ── Footer note ── */}
      <div className="flex flex-wrap items-center justify-between gap-5 pt-1">
        <p className="text-[11.5px] leading-[1.6] text-ink-2 max-w-md text-pretty">
          Chaque bonne réponse vaut 50 XP. Répondez aux douze questions pour
          débloquer le badge Quiz Master et le bon de réduction −25 %.
        </p>
        <Link href="/rewards" className="btn btn-ghost">
          Voir mes récompenses
        </Link>
      </div>
    </div>
  );
}
