"use client";

import { use, useState } from "react";
import Link from "next/link";
import { STORES } from "@/app/_lib/stores-data";
import { QUESTIONS } from "@/app/_lib/questions-data";
import { useGame } from "@/app/_components/GameStateProvider";
import { StoreLogo } from "@/app/_components/StoreLogo";

export default function ActiveQuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { progress, answerQuestion } = useGame();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const store = STORES.find((s) => s.slug === slug);
  const storeQuestions = QUESTIONS.filter((q) => q.storeSlug === slug);
  const currentQuestion = storeQuestions.find(
    (q) => !progress.answeredQuestions[q.id]
  );
  const totalAnswered = Object.keys(progress.answeredQuestions).length;

  const handleAnswer = (optionIndex: number) => {
    if (showFeedback || !currentQuestion) return;
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    answerQuestion(currentQuestion.id, optionIndex);
    setTimeout(() => {
      setSelectedOption(null);
      setShowFeedback(false);
    }, 2200);
  };

  if (!store) {
    return (
      <div className="max-w-[760px] mx-auto px-5 py-32 text-center">
        <p className="font-display text-[28px] text-ink-2">Quiz introuvable</p>
        <Link href="/quiz" className="btn btn-ghost mt-7">
          Retour aux défis
        </Link>
      </div>
    );
  }

  // ─── Quiz completed for this store ───
  if (!currentQuestion) {
    const answered = storeQuestions.map((q) => progress.answeredQuestions[q.id]);
    const correctCount = answered.filter((a) => a?.isCorrect).length;
    const isPerfect = correctCount === storeQuestions.length;

    return (
      <div className="max-w-[760px] mx-auto px-5 md:px-[34px] pt-8 md:pt-10 pb-16 md:pb-24 animate-fade-up">
        <Link href="/quiz" className="backlink mb-6 md:mb-[26px]">
          ← Retour aux défis
        </Link>

        <div className="card p-8 md:p-12 flex flex-col items-center text-center gap-6">
          <StoreLogo slug={store.slug} name={store.name} size={72} />

          <div className="flex flex-col gap-2.5">
            <span className="eyebrow">
              {isPerfect ? "Sans faute" : "Parcours terminé"}
            </span>
            <h1 className="font-display text-[32px] md:text-[40px] leading-[1.05] text-ink">
              Quiz {store.name} terminé
            </h1>
            <p className="text-[12.5px] leading-[1.7] text-ink-2">
              <span className="text-brass font-semibold tabular-nums">
                {correctCount}
              </span>{" "}
              bonne{correctCount > 1 ? "s" : ""} réponse
              {correctCount > 1 ? "s" : ""} sur {storeQuestions.length}
              {isPerfect && " — parfait."}
            </p>
          </div>

          {/* Score marks */}
          <div className="flex justify-center gap-2.5">
            {storeQuestions.map((q) => {
              const answer = progress.answeredQuestions[q.id];
              return (
                <div
                  key={q.id}
                  className={`w-10 h-10 rounded-full grid place-items-center border ${
                    answer?.isCorrect
                      ? "bg-jade-soft border-jade/40 text-jade"
                      : "bg-clay-soft border-clay/40 text-clay"
                  }`}
                >
                  {answer?.isCorrect ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  )}
                </div>
              );
            })}
          </div>

          {/* XP earned */}
          <div className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl border border-brass-line bg-brass-soft">
            <span className="w-6 h-6 rounded-full border border-brass grid place-items-center text-[11px] font-semibold text-brass">
              +
            </span>
            <span className="text-[12px] text-ink-2">
              <span className="text-brass font-semibold tabular-nums">
                {correctCount * 50} XP
              </span>{" "}
              ajoutés à votre compte
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center">
            <Link href="/quiz" className="btn btn-fill">
              Autres défis
            </Link>
            <Link href="/rewards" className="btn btn-ghost">
              Voir mes récompenses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active quiz ───
  const questionIndex = storeQuestions.indexOf(currentQuestion);
  const isCorrect = selectedOption === currentQuestion.correctIndex;

  return (
    <div className="max-w-[760px] mx-auto px-5 md:px-[34px] pt-8 md:pt-10 pb-16 md:pb-24 flex flex-col gap-6 animate-fade-up">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/quiz" className="backlink">
          ← Défis
        </Link>
        <div className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-line">
          <StoreLogo slug={store.slug} name={store.name} size={26} />
          <span className="text-[12px] font-semibold text-ink leading-none">
            {store.name}
          </span>
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-ink-3 tabular-nums">
          <span>
            Question {questionIndex + 1} / {storeQuestions.length}
          </span>
          <span>
            Global {totalAnswered} / {QUESTIONS.length}
          </span>
        </div>
        <div className="flex gap-1">
          {storeQuestions.map((q, i) => {
            const answer = progress.answeredQuestions[q.id];
            return (
              <div
                key={q.id}
                className={`flex-1 h-1 rounded-full transition-colors duration-500 ${
                  answer
                    ? answer.isCorrect
                      ? "bg-jade"
                      : "bg-clay"
                    : i === questionIndex
                    ? "bg-brass"
                    : "bg-surface-2"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* ── Question ── */}
      <div className="card p-6 md:p-9 flex flex-col gap-7">
        <h1 className="font-display text-[24px] md:text-[30px] leading-[1.2] text-ink text-pretty">
          {currentQuestion.questionText}
        </h1>

        <div className="flex flex-col gap-2.5">
          {currentQuestion.options.map((option, index) => {
            const isAnswer = index === currentQuestion.correctIndex;
            const isWrongPick = index === selectedOption && !isAnswer;

            let row = "border-line hover:border-brass-line hover:bg-brass-soft";
            let plate = "bg-surface-2 text-ink-3";

            if (showFeedback) {
              if (isAnswer) {
                row = "border-jade/40 bg-jade-soft";
                plate = "bg-jade/20 text-jade";
              } else if (isWrongPick) {
                row = "border-clay/40 bg-clay-soft";
                plate = "bg-clay/20 text-clay";
              } else {
                row = "border-line opacity-45";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showFeedback}
                className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3.5 transition-all duration-300 ${row}`}
              >
                <span
                  className={`w-9 h-9 rounded-lg grid place-items-center flex-shrink-0 font-display text-[15px] leading-none transition-colors ${plate}`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-[13.5px] font-medium text-ink flex-1">
                  {option}
                </span>
                {showFeedback && isAnswer && (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-jade flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                )}
                {showFeedback && isWrongPick && (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-clay flex-shrink-0"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Feedback ── */}
        {showFeedback && (
          <div
            className={`p-4 rounded-xl border animate-scale-in flex flex-col gap-2 ${
              isCorrect
                ? "border-jade/30 bg-jade-soft"
                : "border-clay/30 bg-clay-soft"
            }`}
          >
            <span
              className={`text-[9.5px] font-medium uppercase tracking-[0.18em] ${
                isCorrect ? "text-jade" : "text-clay"
              }`}
            >
              {isCorrect ? "Bonne réponse · +50 XP" : "Mauvaise réponse"}
            </span>
            <p className="text-[12px] leading-[1.65] text-ink-2 text-pretty">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
