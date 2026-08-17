import type { Badge, Reward } from "./types";
import type { Locale } from "./i18n";
import { BADGE_EN, REWARD_EN } from "./content-en";

export const BADGES: Badge[] = [
  {
    id: "explorer",
    name: "Explorateur",
    description: "Visitez 3 boutiques du mall",
    icon: "🧭",
    condition: { type: "stores_explored", count: 3 },
  },
  {
    id: "grand-explorer",
    name: "Grand Explorateur",
    description: "Visitez toutes les boutiques du mall",
    icon: "🗺️",
    condition: { type: "all_stores_explored" },
  },
  {
    id: "apprentice",
    name: "Apprenti",
    description: "Répondez correctement à 3 questions",
    icon: "📚",
    condition: { type: "questions_correct", count: 3 },
  },
  {
    id: "quizmaster",
    name: "Quiz Master",
    description: "Répondez à toutes les questions",
    icon: "🏆",
    condition: { type: "all_questions_answered" },
  },
  {
    id: "scholar",
    name: "Érudit",
    description: "Répondez correctement à 8 questions",
    icon: "🎓",
    condition: { type: "questions_correct", count: 8 },
  },
  {
    id: "champion",
    name: "Champion du Mall",
    description: "Atteignez 500 XP",
    icon: "👑",
    condition: { type: "xp_reached", amount: 500 },
  },
];


/**
 * XP tiers for the whole visit, shown on the profile page. Unlike a shop
 * reward — earned by finishing that shop's quiz — these are cumulative:
 * they unlock on total XP, whichever shops it came from.
 *
 * ⚠ Placeholder offers, pending the real ones from Smart Mall.
 */
export const REWARDS: Reward[] = [
  {
    id: "r1",
    title: "Bon de réduction",
    description: "Un bon à faire valoir dans les boutiques participantes.",
    discount: "-10%",
    storeName: "Tout le mall",
    requiredXp: 50,
  },
  {
    id: "r2",
    title: "Réduction Mode",
    description: "Sur le prêt-à-porter des enseignes participantes.",
    discount: "-15%",
    storeName: "Boutiques mode",
    requiredXp: 150,
  },
  {
    id: "r3",
    title: "Offre Beauté",
    description: "Sur les soins et la parfumerie.",
    discount: "-20%",
    storeName: "Beauté",
    requiredXp: 300,
  },
  {
    id: "r4",
    title: "Super Réduction",
    description: "La récompense du parcours complet.",
    discount: "-25%",
    storeName: "Tout le mall",
    requiredXp: 500,
  },
];

/**
 * The same badges and rewards, said in the reader's language.
 *
 * The arrays above stay the source of truth for ids, icons, conditions and XP
 * thresholds — only the wording is swapped, and a missing English entry falls
 * back to the French rather than rendering blank. Both are pure and cheap
 * enough to call during render; neither allocates unless the locale is English.
 */
export function badgesFor(locale: Locale): Badge[] {
  if (locale !== "en") return BADGES;
  return BADGES.map((badge) => {
    const copy = BADGE_EN[badge.id];
    return copy ? { ...badge, ...copy } : badge;
  });
}

export function rewardsFor(locale: Locale): Reward[] {
  if (locale !== "en") return REWARDS;
  return REWARDS.map((reward) => {
    const copy = REWARD_EN[reward.id];
    return copy ? { ...reward, ...copy } : reward;
  });
}
