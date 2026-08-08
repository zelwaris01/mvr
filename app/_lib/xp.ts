import { LEVEL_BANDS } from "./constants";

export type Level = { level: number; minXp: number; label: string };

/**
 * Resolves the fractional bands in LEVEL_BANDS against the XP ceiling of the
 * roster actually discovered in the model.
 *
 * `maxXp` of 0 means the roster hasn't arrived yet (or the model has no pins).
 * Falling back to 1 keeps every band at 0, so the user reads as level 1 rather
 * than dividing by zero into NaN.
 */
export function buildLevels(maxXp: number): Level[] {
  const ceiling = Math.max(maxXp, 1);
  return LEVEL_BANDS.map((b) => ({
    level: b.level,
    minXp: Math.round(b.at * ceiling),
    label: b.label,
  }));
}

export function calculateLevel(xp: number, levels: Level[]): Level {
  let current = levels[0];
  for (const level of levels) {
    if (xp >= level.minXp) current = level;
    else break;
  }
  return current;
}

export function getNextLevel(xp: number, levels: Level[]): Level | null {
  const current = calculateLevel(xp, levels);
  const nextIndex = levels.findIndex((l) => l.level === current.level) + 1;
  return nextIndex >= levels.length ? null : levels[nextIndex];
}

export function getLevelProgress(xp: number, levels: Level[]): number {
  const current = calculateLevel(xp, levels);
  const next = getNextLevel(xp, levels);
  if (!next) return 100;
  const range = next.minXp - current.minXp;
  if (range <= 0) return 100;
  return Math.min(100, Math.round(((xp - current.minXp) / range) * 100));
}
