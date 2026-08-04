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

export const REWARDS: Reward[] = [
  {
    id: "r1",
    title: "Bon de réduction",
    description: "Valable sur votre prochain achat dans le mall",
    discount: "-10%",
    storeName: "Mall Quest",
    requiredXp: 50,
  },
  {
    id: "r2",
    title: "Réduction Mode",
    description: "Applicable dans les boutiques de mode du mall",
    discount: "-15%",
    storeName: "Boutiques Mode",
    requiredXp: 150,
  },
  {
    id: "r3",
    title: "Offre Beauté",
    description: "Réduction exclusive beauté et cosmétiques",
    discount: "-20%",
    storeName: "SEPHORA",
    requiredXp: 300,
  },
  {
    id: "r4",
    title: "Super Réduction",
    description: "La récompense ultime pour les champions du mall",
    discount: "-25%",
    storeName: "Tout le Mall",
    requiredXp: 500,
  },
];
