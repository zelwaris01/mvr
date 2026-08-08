// ---- Store ----
/**
 * A brand in the mall. Deliberately thin: the visit is the product, so a store
 * exists here only to give a Matterport pin a name, a quiz and a reward.
 * Products, offers and logo images were dropped with the catalogue pages —
 * StoreLogo renders initials, so no artwork is needed.
 */
export interface Store {
  slug: string;
  name: string;
  description: string;
  category: string;
  /** Shown in the quiz drawer as "DÉBLOQUE — {reward}". */
  reward: string;
}

// ---- Quiz ----
export interface Question {
  id: string;
  storeSlug: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

// ---- Gamification ----
export type BadgeCondition =
  | { type: "stores_explored"; count: number }
  | { type: "questions_correct"; count: number }
  | { type: "all_stores_explored" }
  | { type: "all_questions_answered" }
  | { type: "xp_reached"; amount: number };

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: BadgeCondition;
}

// ---- User Progress (persisted in LocalStorage) ----
export interface AnswerRecord {
  selectedIndex: number;
  isCorrect: boolean;
  answeredAt: number;
}

export interface UserProgress {
  exploredStores: string[];
  answeredQuestions: Record<string, AnswerRecord>;
  totalXp: number;
  unlockedBadges: string[];
  completedAt: number | null;
}
