"use client";

import { useCallback, useRef, useState } from "react";
import type { UserProgress, Badge } from "./types";
import { STORAGE_KEY, XP_PER_STORE_VISIT } from "./constants";
import { useLocalStorage } from "./useLocalStorage";
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
};

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

  const reset = useCallback(() => {
    removeProgress();
  }, [removeProgress]);

  const levels = buildLevels(maxXp);
  const level = calculateLevel(progress.totalXp, levels);
  const nextLevel = getNextLevel(progress.totalXp, levels);
  const levelProgress = getLevelProgress(progress.totalXp, levels);

  return {
    progress,
    isHydrated,
    exploreStore,
    answerQuestion,
    reset,
    syncRoster,
    level,
    nextLevel,
    levelProgress,
  };
}
