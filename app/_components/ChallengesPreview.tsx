"use client";

import Link from "next/link";
import { useGame } from "./GameStateProvider";
import { QUESTIONS } from "@/app/_lib/questions-data";
import { STORES } from "@/app/_lib/stores-data";
import { SectionTitle } from "./SectionTitle";
import { StoreLogo } from "./StoreLogo";

export function ChallengesPreview() {
  const { progress } = useGame();

  const correctCount = Object.values(progress.answeredQuestions).filter(
    (a) => a.isCorrect
  ).length;
  const answeredCount = Object.keys(progress.answeredQuestions).length;

  const nextStore = STORES.find((store) => {
    const storeQs = QUESTIONS.filter((q) => q.storeSlug === store.slug);
    return storeQs.some((q) => !progress.answeredQuestions[q.id]);
  });

  return (
    <div>
      <SectionTitle className="mb-3">Défis & Questions</SectionTitle>

      <div className="bg-surface-1 border border-line rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brass-soft flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brass">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-ink">{correctCount}/{QUESTIONS.length} réussies</p>
              <p className="text-[9px] text-ink-3">{answeredCount} répondues</p>
            </div>
          </div>
        </div>

        {nextStore && (
          <Link
            href={`/quiz/${nextStore.slug}`}
            className="flex items-center gap-3 bg-surface-2 rounded-lg p-2.5 hover:bg-brass-soft transition-colors group"
          >
            <StoreLogo slug={nextStore.slug} name={nextStore.name} size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-ink truncate">Quiz {nextStore.name}</p>
              <p className="text-[9px] text-ink-3">Testez vos connaissances</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-brass-soft flex items-center justify-center group-hover:bg-brass/20 transition-colors">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-brass">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
