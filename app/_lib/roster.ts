import type { Question, Store } from "./types";
import type { Vec3 } from "./tour-nav";
import { XP_PER_STORE_VISIT } from "./constants";
import type { RosterFacts } from "./useGameState";
import type { Locale } from "./i18n";
import { QUESTION_EN, STORE_EN } from "./content-en";
import { shopVideosFor, type ShopVideo } from "./shop-media";

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
  /**
   * Every video the pin carries, in the model's own order.
   *
   * Separate from `media` rather than a tagged union, because the two are used
   * for different things: the first image is the shop's logo everywhere in the
   * app, and a video is never that. Videos attached in Workshop used to be
   * discarded outright — the attachments subscription filtered to IMAGE.
   */
  videos: string[];
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
  /**
   * Everything to play in this shop's panel: curated entries from
   * `shop-media.ts` first, then whatever the pin itself carries.
   */
  videos: ShopVideo[];
  /** The pin's own description text, if it carries one. */
  tagText: string;
  /**
   * False when nothing in the catalogue matched this pin, so everything above
   * came from the model itself. The panel says so rather than presenting an
   * empty blurb as if copy were missing — and it is the signal that somebody
   * could add an entry to `stores-data` to give this shop a quiz.
   */
  fromCatalogue: boolean;
  tagId: string;
  sweepId: string | null;
  /** Used for navigation — where to stand and what to face. */
  discPosition: Vec3;
  /** Used for the on-screen marker — sits on the shopfront, not beside it. */
  markerPosition: Vec3;
  questions: Question[];
};

/**
 * The blurb shown for a shop the catalogue has never heard of.
 *
 * The pin's own description is preferred when it has one — whoever tags a shop
 * in Workshop usually writes something. This is only for when it is blank, and
 * it deliberately says where the entry came from rather than inventing a
 * sentence about a brand nobody here has checked.
 */
const AUTO_DESCRIPTION: Record<Locale, string> = {
  fr: "Enseigne relevée dans le modèle. Description à compléter.",
  en: "Shop found in the model. Description to be added.",
};

const AUTO_CATEGORY: Record<Locale, string> = {
  fr: "Boutique",
  en: "Shop",
};

/**
 * Joins discovered pins to the catalogue.
 *
 * This is the whole "roster follows the model" rule in one function — and it
 * now means what it says. A pin IS a shop: if the catalogue has an entry, its
 * blurb, category, reward and quiz are layered on; if it does not, the shop is
 * built from what the pin itself carries. It used to be dropped, which meant
 * tagging a shop in Workshop did nothing until somebody edited code and
 * redeployed.
 *
 * A catalogue entry with no matching pin still contributes nothing — that
 * direction of the rule is unchanged, and is why a shop the scan does not
 * contain can never appear.
 *
 * It is also the single place language is resolved. Everything downstream —
 * the directory, the quiz drawer, the checkpoints, the profile page — receives
 * plain strings already in the right language and never has to know a second
 * one exists. Brand names are not translated: ZARA is ZARA in both.
 */
export function buildRoster(
  tags: TagRecord[],
  stores: Store[],
  questionsByStore: Record<string, Question[]>,
  locale: Locale = "fr"
): DiscoveredStore[] {
  const bySlug = new Map(stores.map((s) => [s.slug, s]));
  const seen = new Set<string>();
  const out: DiscoveredStore[] = [];

  for (const tag of tags) {
    if (!tag.slug || seen.has(tag.slug)) continue;
    const store = bySlug.get(tag.slug);

    // A shop with no English entry keeps its French copy rather than
    // disappearing: an untranslated blurb is a smaller failure than a blank one.
    const copy = store && locale === "en" ? STORE_EN[store.slug] : undefined;

    seen.add(tag.slug);
    out.push({
      slug: tag.slug,
      // The pin's label is the brand's name as the mall itself writes it, so
      // it wins for an auto-added shop. The catalogue's spelling wins when
      // there is one, because it has been checked.
      name: store?.name ?? tag.label,
      // `||` on the last two, not `??`: an empty pin description is a string,
      // so `??` would never fall through and an auto-added shop with a blank
      // pin would show nothing at all.
      description:
        copy?.description ??
        store?.description ??
        (tag.description.trim() || AUTO_DESCRIPTION[locale]),
      category: copy?.category ?? store?.category ?? AUTO_CATEGORY[locale],
      // No invented offer for a shop nobody has agreed one with.
      reward: copy?.reward ?? store?.reward ?? "",
      // The model's own logo wins over our stock placeholder whenever the pin
      // carries one — it is the real brand mark, kept current by whoever
      // maintains the scan. An auto-added shop has nothing else, so the empty
      // string falls through to StoreLogo's initial plate.
      image: tag.media[0] ?? store?.image ?? "",
      imageFromModel: tag.media.length > 0,
      gallery: tag.media,
      // Curated first, the model's own after: a clip chosen for this shop is
      // the one worth leading with, and the pin's attachments are whatever
      // happens to be on it.
      videos: [
        ...shopVideosFor(tag.slug),
        ...tag.videos.map((src): ShopVideo => ({ kind: "file", src })),
      ],
      tagText: tag.description,
      fromCatalogue: store !== undefined,
      tagId: tag.tagId,
      sweepId: tag.sweepId,
      discPosition: tag.discPosition,
      markerPosition: tag.anchorPosition,
      questions: localizeQuestions(questionsByStore[tag.slug] ?? [], locale),
    });
  }

  // Stable order: pins stream in one at a time, and an unsorted list would
  // reshuffle under a thumb already reaching for a row.
  return out.sort((a, b) =>
    a.name.localeCompare(b.name, locale === "en" ? "en" : "fr")
  );
}

/**
 * Swaps a question's wording for its English, leaving everything the game
 * reasons about alone.
 *
 * `correctIndex` indexes into `options`, and the English options are written
 * in the same order for exactly that reason — so the index stays valid without
 * being restated. `id`, `storeSlug` and `xpReward` are untouched, which is what
 * lets a saved answer survive a language switch mid-visit.
 */
function localizeQuestions(questions: Question[], locale: Locale): Question[] {
  if (locale !== "en") return questions;
  return questions.map((q) => {
    const copy = QUESTION_EN[q.id];
    if (!copy) return q;
    return {
      ...q,
      questionText: copy.questionText,
      // Guard the length: a translation that dropped an option would leave
      // correctIndex pointing past the end, and the quiz would become
      // unanswerable rather than merely untranslated.
      options:
        copy.options.length === q.options.length ? copy.options : q.options,
      explanation: copy.explanation,
    };
  });
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
