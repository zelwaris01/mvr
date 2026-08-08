"use client";

import { useEffect, useRef, useState } from "react";
import type { DiscoveredStore } from "@/app/_lib/roster";
import { useGame } from "@/app/_components/GameStateProvider";
import { StoreLogo } from "@/app/_components/StoreLogo";

const FEEDBACK_MS = 2200;

/**
 * The quiz, as a drawer over the living visit.
 *
 * Intentionally NOT a modal dialog: `role="dialog" aria-modal` would declare
 * the panorama inert to assistive technology, which is the opposite of the
 * promise this panel makes in its own footer. So: a labelled region, focus
 * moved to the heading, Escape to close, and no focus trap — Tab continues
 * past the drawer onto the checkpoint discs, so the visit stays navigable by
 * keyboard too.
 */
export function QuizDrawer({
  store,
  onClose,
}: {
  store: DiscoveredStore;
  onClose: () => void;
}) {
  const { progress, answerQuestion } = useGame();
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const questions = store.questions;
  const current = questions.find((q) => !progress.answeredQuestions[q.id]);
  const answeredCount = questions.filter(
    (q) => progress.answeredQuestions[q.id]
  ).length;

  useEffect(() => {
    headingRef.current?.focus();
  }, [store.slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Reset the reveal when switching store, and never leave a timer running.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleAnswer = (index: number) => {
    if (showFeedback || !current) return;
    setSelected(index);
    setShowFeedback(true);
    answerQuestion(current.id, index);
    timerRef.current = setTimeout(() => {
      setSelected(null);
      setShowFeedback(false);
    }, FEEDBACK_MS);
  };

  const questionIndex = current ? questions.indexOf(current) : questions.length;
  const isCorrect = current ? selected === current.correctIndex : false;

  return (
    <div className="drawer-slot">
      <aside
        className="drawer on-dark"
        role="region"
        aria-label={`Quiz ${store.name}`}
      >
        {/* ── Head ── */}
        <div className="flex items-start justify-between gap-3 p-5 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <StoreLogo slug={store.slug} name={store.name} size={44} />
            <div className="flex flex-col gap-1 min-w-0">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="font-display text-[22px] leading-none text-ink truncate outline-none"
              >
                {store.name}
              </h2>
              <span className="text-[11px] text-ink-3 leading-none truncate">
                {store.description}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le quiz"
            className="w-8 h-8 rounded-full grid place-items-center text-ink-3 hover:text-brass border border-line hover:border-brass-line transition-colors flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* ── Segmented progress ── */}
        <div className="flex gap-1 px-5">
          {questions.map((q, i) => {
            const answer = progress.answeredQuestions[q.id];
            return (
              <div
                key={q.id}
                className={`flex-1 h-[3px] rounded-full transition-colors duration-500 ${
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

        {current ? (
          <div className="flex-1 flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-ink-3 tabular-nums">
              <span>
                {questionIndex + 1} / {questions.length}
              </span>
              <span className="text-brass">+{current.xpReward} XP</span>
            </div>

            <h3 className="font-display text-[24px] leading-[1.2] text-ink text-pretty">
              {current.questionText}
            </h3>

            <div className="flex flex-col gap-2">
              {current.options.map((option, index) => {
                const isAnswer = index === current.correctIndex;
                const isWrongPick = index === selected && !isAnswer;

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
                    className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 ${row}`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg grid place-items-center flex-shrink-0 font-display text-[14px] leading-none transition-colors ${plate}`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-[13px] font-medium text-ink flex-1">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div
                className={`p-3.5 rounded-xl border animate-scale-in flex flex-col gap-1.5 ${
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
                  {isCorrect
                    ? `Bonne réponse · +${current.xpReward} XP`
                    : "Mauvaise réponse"}
                </span>
                <p className="text-[12px] leading-[1.6] text-ink-2 text-pretty">
                  {current.explanation}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ── Finished ── */
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 p-8">
            <span className="eyebrow">Quiz terminé</span>
            <p className="font-display text-[26px] leading-[1.15] text-ink">
              {answeredCount} / {questions.length} répondues
            </p>
            <p className="text-[12px] leading-[1.6] text-ink-2">
              Continuez la visite pour découvrir les autres boutiques.
            </p>
            <button onClick={onClose} className="btn btn-ghost mt-2">
              Reprendre la visite
            </button>
          </div>
        )}

        {/* ── Reward + the promise that the visit is still live ── */}
        <div className="mt-auto border-t border-line p-5 flex flex-col gap-1">
          <span className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-ink-3">
            Débloque
          </span>
          <span className="text-[13px] font-semibold text-brass leading-snug">
            {store.reward}
          </span>
          <span className="text-[10.5px] text-ink-3 leading-snug mt-1.5">
            La visite reste active — déplacez-vous pendant le quiz.
          </span>
        </div>
      </aside>
    </div>
  );
}
