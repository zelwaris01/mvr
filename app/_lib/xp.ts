import { LEVEL_THRESHOLDS } from "./constants";

export function calculateLevel(xp: number) {
  let current = LEVEL_THRESHOLDS[0];
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.minXp) {
      current = threshold;
    } else {
      break;
    }
  }
  return current;
}

export function getNextLevel(xp: number) {
  const currentLevel = calculateLevel(xp);
  const nextIndex = LEVEL_THRESHOLDS.findIndex(
    (t) => t.level === currentLevel.level
  ) + 1;
  if (nextIndex >= LEVEL_THRESHOLDS.length) return null;
  return LEVEL_THRESHOLDS[nextIndex];
}

export function getLevelProgress(xp: number): number {
  const current = calculateLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.minXp - current.minXp;
  const progress = xp - current.minXp;
  return Math.min(100, Math.round((progress / range) * 100));
}
