"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-ink-3">Quiz introuvable</p>
        <Link href="/quiz" className="text-brass text-sm mt-4 inline-block">← Retour</Link>
      </div>
    );
  }

  // ─── Quiz completed for this store ───
  if (!currentQuestion) {
    const answered = storeQuestions.map((q) => progress.answeredQuestions[q.id]);
    const correctCount = answered.filter((a) => a?.isCorrect).length;
    const isPerfect = correctCount === storeQuestions.length;

    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6 animate-fade-up">
        <Link href="/quiz" className="text-ink-3 hover:text-brass text-xs transition-colors inline-flex items-center gap-1 uppercase tracking-wider">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Quiz
        </Link>

        <div className="bg-surface-1 border border-line rounded-2xl p-8 md:p-10 text-center">
          <div className="mx-auto mb-5">
            <StoreLogo slug={store.slug} name={store.name} size={80} className={isPerfect ? "!border-jade/40 !bg-jade-soft" : ""} />
          </div>

          <h2 className="text-2xl font-black mb-2 text-ink">
            Quiz {store.name} terminé !
          </h2>
          <p className="text-ink-2 text-sm mb-8">
            Vous avez obtenu <span className="text-brass font-bold tabular-nums">{correctCount}</span> / {storeQuestions.length} bonnes réponses
            {isPerfect && <span className="text-jade ml-1">— Parfait !</span>}
          </p>

          {/* Score circles */}
          <div className="flex justify-center gap-2.5 mb-8">
            {storeQuestions.map((q) => {
              const answer = progress.answeredQuestions[q.id];
              return (
                <div
                  key={q.id}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    answer?.isCorrect
                      ? "bg-jade-soft text-jade border border-jade/30"
                      : "bg-clay-soft text-clay border border-clay/30"
                  }`}
                >
                  {answer?.isCorrect ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  )}
                </div>
              );
            })}
          </div>

          {/* XP earned */}
          <div className="inline-flex items-center gap-2 bg-brass-soft border border-brass/20 rounded-full px-5 py-2 mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brass">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-brass font-bold text-sm tabular-nums">+{correctCount * 50} XP gagnés</span>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/quiz" className="px-6 py-2.5 rounded-full bg-surface-2 border border-line text-sm font-medium hover:border-line-strong transition-colors">
              Autres quiz
            </Link>
            <Link href="/rewards" className="px-6 py-2.5 rounded-full bg-brass text-white font-bold text-sm transition-colors hover:bg-brass/90">
              Voir récompenses
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
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5 animate-fade-up">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link href="/quiz" className="text-ink-3 hover:text-brass text-xs transition-colors inline-flex items-center gap-1 uppercase tracking-wider">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Quiz
        </Link>
        <div className="flex items-center gap-2 bg-surface-1 border border-line rounded-full px-1.5 py-1">
          <StoreLogo slug={store.slug} name={store.name} size={28} className="!rounded-md" />
          <span className="text-xs font-bold text-ink pr-2">{store.name}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-[10px] text-ink-3 mb-2 uppercase tracking-wider tabular-nums">
          <span>Question {questionIndex + 1} / {storeQuestions.length}</span>
          <span>Global : {totalAnswered} / {QUESTIONS.length}</span>
        </div>
        <div className="flex gap-1">
          {storeQuestions.map((q, i) => {
            const answer = progress.answeredQuestions[q.id];
            return (
              <div
                key={q.id}
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                  answer ? (answer.isCorrect ? "bg-jade" : "bg-clay")
                    : i === questionIndex ? "bg-brass" : "bg-surface-2"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Question card */}
      <div className="bg-surface-1 border border-line rounded-2xl p-6 md:p-8">
        <h2 className="text-lg md:text-xl font-bold mb-7 leading-relaxed text-ink">
          {currentQuestion.questionText}
        </h2>

        <div className="space-y-2.5">
          {currentQuestion.options.map((option, index) => {
            let base = "bg-surface-1 border-line hover:border-brass/30 hover:bg-brass-soft cursor-pointer";

            if (showFeedback) {
              if (index === currentQuestion.correctIndex) {
                base = "bg-jade-soft border-jade/40";
              } else if (index === selectedOption && index !== currentQuestion.correctIndex) {
                base = "bg-clay-soft border-clay/40";
              } else {
                base = "bg-surface-2 border-line text-ink-3";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-3.5 ${base}`}
              >
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                  showFeedback && index === currentQuestion.correctIndex
                    ? "bg-jade/20 text-jade"
                    : showFeedback && index === selectedOption && index !== currentQuestion.correctIndex
                    ? "bg-clay/20 text-clay"
                    : "bg-surface-2 text-ink-3"
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-sm font-medium flex-1">{option}</span>
                {showFeedback && index === currentQuestion.correctIndex && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-jade ml-auto flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                )}
                {showFeedback && index === selectedOption && index !== currentQuestion.correctIndex && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-clay ml-auto flex-shrink-0"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`mt-5 p-4 rounded-xl animate-scale-in ${
            isCorrect ? "bg-jade-soft border border-jade/20" : "bg-clay-soft border border-clay/20"
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {isCorrect ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-jade"><polyline points="20 6 9 17 4 12" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-clay"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              )}
              <p className={`text-sm font-bold ${isCorrect ? "text-jade" : "text-clay"}`}>
                {isCorrect ? "Bonne réponse ! +50 XP" : "Mauvaise réponse"}
              </p>
            </div>
            <p className="text-xs text-ink-2 leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
