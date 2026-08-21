// ---- Store ----

/**
 * A call to action carried by the shop's own Matterport pin — "Acheter en
 * ligne", "Offrez un Chèque Cadeau", an Instagram page. Kept verbatim: these
 * are the mall's links, not ours.
 */
export interface StoreLink {
  label: string;
  href: string;
}

/**
 * Which scan a shop sits in. Smart Mall is not one multi-storey model but two
 * separate ones, so the level is a property of the shop, not of a floor index.
 */
export type MallLevel = "N0" | "N1";

export interface Store {
  slug: string;
  name: string;
  /** The Matterport pin this entry came from. The model is the source of truth. */
  tagId: string;
  level: MallLevel;
  description: string;
  category: string;
  /**
   * The photos the pin carries, in the model's own order — the first is
   * usually the brand's logo. Two pins carry none, so this can be empty.
   */
  gallery: string[];
  links: StoreLink[];
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
