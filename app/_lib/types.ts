// ---- Store ----
export interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
}

export interface Store {
  slug: string;
  name: string;
  logo: string;
  description: string;
  category: string;
  products: Product[];
  offers: Offer[];
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

export interface Reward {
  id: string;
  title: string;
  description: string;
  discount: string;
  storeName: string;
  requiredXp: number;
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
  unlockedRewards: string[];
  completedAt: number | null;
}
