import { STORES } from "./stores-data";
import { QUESTIONS } from "./questions-data";

/**
 * The mall's two scans.
 *
 * Smart Mall is not one multi-storey Matterport model — it is two separate
 * spaces, one per level, each with its own sweeps and its own pins. Nine shops
 * plus the carousel are pinned in N0; five more are pinned in N1, and from
 * inside either space the other level does not exist.
 *
 * The tour below still embeds N0 only, which is why five of the fifteen shops
 * in the directory cannot yet be walked to. Switching level means loading the
 * other space, not moving a floor.
 */
export const MATTERPORT_SPACES = {
  N0: "iGiPWMPBMdw",
  N1: "UjnosRzGqQH",
} as const;

export const LEVEL_LABELS = {
  N0: "Rez-de-chaussée",
  N1: "Premier étage",
} as const;

export const MATTERPORT_URL =
  `https://my.matterport.com/show/?m=${MATTERPORT_SPACES.N0}&play=1`;

export const STORAGE_KEY = "mallquest_progress";

export const XP_PER_STORE_VISIT = 10;

/**
 * Derived, not typed by hand.
 *
 * These were hardcoded to 8 and 12 — the counts of a catalogue that no longer
 * exists — and every progress readout in the app divides by them. The roster
 * now follows the model, so a shop tagged in Workshop must not be able to
 * leave "3/8" on screen.
 */
export const TOTAL_STORES = STORES.length;
export const TOTAL_QUESTIONS = QUESTIONS.length;

/**
 * The ceiling a visitor can actually reach: 10 XP per shop visited, 50 per
 * correct answer. Nine shops carry no quiz, so it is lower than the old
 * catalogue's — the thresholds below have to fit inside it or the top level
 * becomes unreachable.
 */
export const MAX_XP =
  TOTAL_STORES * XP_PER_STORE_VISIT +
  QUESTIONS.reduce((sum, q) => sum + q.xpReward, 0);

export const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, label: "Visiteur" },
  { level: 2, minXp: 75, label: "Explorateur" },
  { level: 3, minXp: 175, label: "Connaisseur" },
  { level: 4, minXp: 300, label: "Expert" },
  { level: 5, minXp: 450, label: "Champion" },
];
