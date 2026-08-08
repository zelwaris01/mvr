import type { Question, Store } from "./types";
import type { Vec3 } from "./tour-nav";
import { XP_PER_STORE_VISIT } from "./constants";
import type { RosterFacts } from "./useGameState";

/** A pin found in the model, once the SDK has told us where it is. */
export type TagRecord = {
  tagId: string;
  label: string;
  slug: string | null;
  /** Where the visible puck floats — the anchor point for our marker. */
  discPosition: Vec3;
  /** Floor the pin sits on, so we don't fly to the level below. */
  floorSequence?: number;
  /** Nearest walkable sweep, resolved once Sweep.data arrives. Null = no flight. */
  sweepId: string | null;
};

/** A pin that resolved to a store: what the rail and the quiz drawer render. */
export type DiscoveredStore = {
  slug: string;
  name: string;
  description: string;
  reward: string;
  tagId: string;
  sweepId: string | null;
  discPosition: Vec3;
  questions: Question[];
};

/**
 * Joins discovered pins to the catalogue.
 *
 * This is the whole "roster follows the model" rule in one function: a store
 * exists for the user only if the scan contains a pin naming it. Pure, so it
 * can be reasoned about without an SDK connection.
 */
export function buildRoster(
  tags: TagRecord[],
  stores: Store[],
  questionsByStore: Record<string, Question[]>
): DiscoveredStore[] {
  const bySlug = new Map(stores.map((s) => [s.slug, s]));
  const seen = new Set<string>();
  const out: DiscoveredStore[] = [];

  for (const tag of tags) {
    if (!tag.slug || seen.has(tag.slug)) continue;
    const store = bySlug.get(tag.slug);
    if (!store) continue;

    seen.add(tag.slug);
    out.push({
      slug: store.slug,
      name: store.name,
      description: store.description,
      reward: store.reward,
      tagId: tag.tagId,
      sweepId: tag.sweepId,
      discPosition: tag.discPosition,
      questions: questionsByStore[store.slug] ?? [],
    });
  }

  // Stable order: pins stream in one at a time, and an unsorted rail would
  // reshuffle under a thumb already reaching for a chip.
  return out.sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

/** Collapses the roster into what badge and level maths need. */
export function rosterFacts(roster: DiscoveredStore[]): RosterFacts {
  const questionIds = roster.flatMap((s) => s.questions.map((q) => q.id));
  const questionXp = roster.reduce(
    (sum, s) => sum + s.questions.reduce((n, q) => n + q.xpReward, 0),
    0
  );
  return {
    slugs: roster.map((s) => s.slug),
    questionIds,
    maxXp: roster.length * XP_PER_STORE_VISIT + questionXp,
  };
}
