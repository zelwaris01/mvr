import type { Badge } from "./types";

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

