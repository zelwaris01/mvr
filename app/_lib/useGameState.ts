"use client";

import { useCallback, useRef, useState } from "react";
import type { UserProgress, Badge } from "./types";
import {
  RETRY_LIMIT,
  RETRY_WINDOW_MS,
  STORAGE_KEY,
  XP_PER_STORE_VISIT,
} from "./constants";
import { useLocalStorage } from "./useLocalStorage";
import { useLocale } from "./i18n";
import {
  buildLevels,
  calculateLevel,
  getNextLevel,
  getLevelProgress,
} from "./xp";
import { BADGES } from "./rewards-data";
import { QUESTIONS } from "./questions-data";

const DEFAULT_PROGRESS: UserProgress = {
  exploredStores: [],
  answeredQuestions: {},
  totalXp: 0,
  unlockedBadges: [],
  completedAt: null,
  retries: [],
};

/** Retries still available, and when the next one frees up. */
export type RetryState = {
  left: number;
  /** Epoch ms when a retry returns, or null while some remain. */
  nextAt: number | null;
};

function retryStateAt(progress: UserProgress, now: number): RetryState {
  const recent = (progress.retries ?? []).filter(
    (t) => now - t < RETRY_WINDOW_MS
  );
  const left = Math.max(0, RETRY_LIMIT - recent.length);
  if (left > 0) return { left, nextAt: null };
  // The oldest retry in the window is the one that expires first.
  const oldest = Math.min(...recent);
  return { left: 0, nextAt: oldest + RETRY_WINDOW_MS };
}

/**
 * What the model actually offers, pushed in by the tour once its pins resolve.
 * Badge and level maths are relative to this, not to the full catalogue —
 * a store nobody can reach must not count against completion.
 */
export type RosterFacts = {
  slugs: string[];
  questionIds: string[];
  /** Ceiling: every store visited and every question answered correctly. */
  maxXp: number;
};

const EMPTY_ROSTER: RosterFacts = { slugs: [], questionIds: [], maxXp: 0 };

function evaluateBadge(
  badge: Badge,
  progress: UserProgress,
  roster: RosterFacts
): boolean {
  const { condition } = badge;
  switch (condition.type) {
    case "stores_explored":
      return progress.exploredStores.length >= condition.count;
    case "questions_correct": {
      const correctCount = Object.values(progress.answeredQuestions).filter(
        (a) => a.isCorrect
      ).length;
      return correctCount >= condition.count;
    }
    // The `length > 0` guards matter: without them an empty roster (SDK never
    // connected) satisfies `every()` vacuously and awards "you visited
    // everything" for visiting nothing.
    case "all_stores_explored":
      return (
        roster.slugs.length > 0 &&
        roster.slugs.every((s) => progress.exploredStores.includes(s))
      );
    case "all_questions_answered":
      return (
        roster.questionIds.length > 0 &&
        roster.questionIds.every((id) => progress.answeredQuestions[id])
      );
    case "xp_reached":
      return progress.totalXp >= condition.amount;
    default:
      return false;
  }
}

export function useGameState() {
  const [progress, setProgress, isHydrated, removeProgress] =
    useLocalStorage<UserProgress>(STORAGE_KEY, DEFAULT_PROGRESS);
  // Only the rank names are language-dependent; the thresholds are not, so a
  // switch renames the level without moving anybody up or down it.
  const { locale } = useLocale();

  // Read inside setProgress updaters, where a state value would be stale.
  const rosterRef = useRef<RosterFacts>(EMPTY_ROSTER);
  // The level bands need to re-render when the ceiling moves, so this one
  // half is state. Tags arrive in a single batched flush, so it costs one
  // extra render at load and nothing thereafter.
  const [maxXp, setMaxXp] = useState(0);

  const syncRoster = useCallback((facts: RosterFacts) => {
    rosterRef.current = facts;
    setMaxXp(facts.maxXp);
  }, []);

  const checkBadges = useCallback(
    (currentProgress: UserProgress): string[] => {
      const newBadges: string[] = [];
      for (const badge of BADGES) {
        if (
          !currentProgress.unlockedBadges.includes(badge.id) &&
          evaluateBadge(badge, currentProgress, rosterRef.current)
        ) {
          newBadges.push(badge.id);
        }
      }
      return newBadges;
    },
    []
  );

  const exploreStore = useCallback(
    (slug: string) => {
      setProgress((prev) => {
        if (prev.exploredStores.includes(slug)) return prev;
        const updated: UserProgress = {
          ...prev,
          exploredStores: [...prev.exploredStores, slug],
          totalXp: prev.totalXp + XP_PER_STORE_VISIT,
        };
        const newBadges = checkBadges(updated);
        if (newBadges.length > 0) {
          updated.unlockedBadges = [...updated.unlockedBadges, ...newBadges];
        }
        return updated;
      });
    },
    [setProgress, checkBadges]
  );

  const answerQuestion = useCallback(
    (questionId: string, selectedIndex: number) => {
      setProgress((prev) => {
        if (prev.answeredQuestions[questionId]) return prev;

        const question = QUESTIONS.find((q) => q.id === questionId);
        if (!question) return prev;

        const isCorrect = selectedIndex === question.correctIndex;
        const xpGain = isCorrect ? question.xpReward : 0;

        const updated: UserProgress = {
          ...prev,
          answeredQuestions: {
            ...prev.answeredQuestions,
            [questionId]: {
              selectedIndex,
              isCorrect,
              answeredAt: Date.now(),
            },
          },
          totalXp: prev.totalXp + xpGain,
        };

        // "Finished" means every question the model actually offers, not the
        // whole catalogue — untagged stores are unreachable by design.
        const reachable = rosterRef.current.questionIds;
        if (
          reachable.length > 0 &&
          reachable.every((id) => updated.answeredQuestions[id])
        ) {
          updated.completedAt = Date.now();
        }

        const newBadges = checkBadges(updated);
        if (newBadges.length > 0) {
          updated.unlockedBadges = [...updated.unlockedBadges, ...newBadges];
        }

        return updated;
      });
    },
    [setProgress, checkBadges]
  );

  /**
   * Clears one store's answers so its quiz can be taken again.
   *
   * The XP those answers earned is handed back at the same time. Without that
   * a retry would be an XP printing press: answer three correctly, retry,
   * answer them again, keep the lot. Refunding makes a retry a genuine second
   * attempt rather than a bonus round — you can only ever bank each question
   * once.
   *
   * Badges already unlocked are left alone. Taking one back would feel like a
   * punishment for practising, and they're recomputed on the next answer
   * anyway.
   */
  const retryStore = useCallback(
    (slug: string) => {
      setProgress((prev) => {
        const now = Date.now();
        const recent = (prev.retries ?? []).filter(
          (t) => now - t < RETRY_WINDOW_MS
        );
        if (recent.length >= RETRY_LIMIT) return prev;

        const storeQuestions = QUESTIONS.filter((q) => q.storeSlug === slug);
        const answers = { ...prev.answeredQuestions };
        let refund = 0;

        for (const question of storeQuestions) {
          const answer = answers[question.id];
          if (!answer) continue;
          if (answer.isCorrect) refund += question.xpReward;
          delete answers[question.id];
        }
        if (refund === 0 && storeQuestions.every((q) => !prev.answeredQuestions[q.id])) {
          return prev; // nothing to retry — don't spend a life
        }

        return {
          ...prev,
          answeredQuestions: answers,
          totalXp: Math.max(0, prev.totalXp - refund),
          retries: [...recent, now],
        };
      });
    },
    [setProgress]
  );

  const reset = useCallback(() => {
    removeProgress();
  }, [removeProgress]);

  /**
   * Takes `now` from the caller rather than reading the clock itself: the
   * quota is a rolling window, so a retry becomes available with no state
   * change to react to, and a component that wants a live countdown has to
   * own the ticking anyway.
   */
  const retryState = useCallback(
    (now: number) => retryStateAt(progress, now),
    [progress]
  );

  const levels = buildLevels(maxXp, locale);
  const level = calculateLevel(progress.totalXp, levels);
  const nextLevel = getNextLevel(progress.totalXp, levels);
  const levelProgress = getLevelProgress(progress.totalXp, levels);

  return {
    progress,
    isHydrated,
    exploreStore,
    answerQuestion,
    retryStore,
    retryState,
    reset,
    syncRoster,
    level,
    nextLevel,
    levelProgress,
  };
}
