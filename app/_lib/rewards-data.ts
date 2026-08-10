import type { Badge, Reward } from "./types";

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
