"use client";

import { useCallback } from "react";
import type { UserProgress, Badge } from "./types";
import { STORAGE_KEY, XP_PER_STORE_VISIT } from "./constants";
import { useLocalStorage } from "./useLocalStorage";
import { calculateLevel, getNextLevel, getLevelProgress } from "./xp";
import { BADGES } from "./rewards-data";
import { QUESTIONS } from "./questions-data";

const DEFAULT_PROGRESS: UserProgress = {
  exploredStores: [],
  answeredQuestions: {},
  totalXp: 0,
  unlockedBadges: [],
  unlockedRewards: [],
  completedAt: null,
};

function evaluateBadge(badge: Badge, progress: UserProgress): boolean {
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
    case "all_stores_explored":
      return progress.exploredStores.length >= 8;
    case "all_questions_answered":
      return Object.keys(progress.answeredQuestions).length >= 12;
    case "xp_reached":
      return progress.totalXp >= condition.amount;
    default:
      return false;
  }
}

export function useGameState() {
  const [progress, setProgress, isHydrated, removeProgress] =
    useLocalStorage<UserProgress>(STORAGE_KEY, DEFAULT_PROGRESS);

  const checkBadges = useCallback(
    (currentProgress: UserProgress): string[] => {
      const newBadges: string[] = [];
      for (const badge of BADGES) {
        if (
          !currentProgress.unlockedBadges.includes(badge.id) &&
          evaluateBadge(badge, currentProgress)
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

        // Check if all questions answered
        if (Object.keys(updated.answeredQuestions).length >= 12) {
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

  const level = calculateLevel(progress.totalXp);
  const nextLevel = getNextLevel(progress.totalXp);
  const levelProgress = getLevelProgress(progress.totalXp);

  return {
    progress,
    isHydrated,
    exploreStore,
    answerQuestion,
    reset,
    level,
    nextLevel,
    levelProgress,
  };
}
