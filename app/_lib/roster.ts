import type { Question, Store } from "./types";
import type { Vec3 } from "./tour-nav";
import { XP_PER_STORE_VISIT } from "./constants";
import type { RosterFacts } from "./useGameState";

/** A pin found in the model, once the SDK has told us where it is. */
export type TagRecord = {
  tagId: string;
  label: string;
  slug: string | null;
  /** The pin's own copy in the model — phone numbers, links, opening hours. */
  description: string;
  /**
   * Every image the pin carries, in the model's own order — logo and product
   * shots alike. Matterport pages through these in its billboard ("4 of 5"),
   * so taking only the first threw most of the shop's photography away.
   */
  media: string[];
  /** Where Matterport's puck floats, out in front of the surface. */
  discPosition: Vec3;
  /**
   * Where the pin's stem meets the shopfront — usually on the signage itself.
   * The disc floats out from here toward the viewer, which is why a marker
   * drawn at `discPosition` can appear beside a shop rather than on it.
   */
  anchorPosition: Vec3;
  /**
   * The direction the pin's stem points, i.e. straight out from the surface
   * it is attached to. Effectively the shopfront's outward normal, which is
   * what tells us where "standing in front of this shop" is.
   */
  stemVector: Vec3;
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
  category: string;
  reward: string;
  /** Logo from the model's pin when it has one, else the catalogue thumbnail. */
  image: string;
  /** True when `image` came from the model rather than the placeholder set. */
  imageFromModel: boolean;
  /** Every photo the pin carries — shown as the shop's gallery. */
  gallery: string[];
  /** The pin's own description text, if it carries one. */
  tagText: string;
  tagId: string;
  sweepId: string | null;
  /** Used for navigation — where to stand and what to face. */
  discPosition: Vec3;
  /** Used for the on-screen marker — sits on the shopfront, not beside it. */
  markerPosition: Vec3;
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
      category: store.category,
      reward: store.reward,
      // The model's own logo wins over our stock placeholder whenever the pin
      // carries one — it is the real brand mark, kept current by whoever
      // maintains the scan.
      image: tag.media[0] ?? store.image,
      imageFromModel: tag.media.length > 0,
      gallery: tag.media,
      tagText: tag.description,
      tagId: tag.tagId,
      sweepId: tag.sweepId,
      discPosition: tag.discPosition,
      markerPosition: tag.anchorPosition,
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
